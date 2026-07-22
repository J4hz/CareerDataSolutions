// Webhook the payment provider POSTs to when an STK push settles.
//
// ── What this is for with Daraja ─────────────────────────────
//
// It is the safety net, not the main path. The customer's browser confirms
// payment by polling api/order-status.js, which asks Daraja's STK Query API
// directly — that is authoritative and it sends both emails.
//
// This endpoint matters when the browser is gone: the tab was closed, the phone
// died, the customer walked away mid-PIN. Without it a completed payment would
// leave no trace beyond the earlier "awaiting payment" email.
//
// ── Why it cannot settle the order by itself ─────────────────
//
// Daraja's callback echoes CheckoutRequestID, the amount, the payer's phone and
// the receipt — but NOT the AccountReference, and it has no metadata field big
// enough for our signed order token. So there is no way to map a callback back
// to an order without storing the CheckoutRequestID when the push goes out.
//
// Rather than guess (matching on phone and amount would eventually pair the
// wrong two orders), this emails you everything Daraja provided, to reconcile
// against the "AWAITING PAYMENT" email carrying the same phone number. At this
// volume that is a handful of seconds. Adding the KV store described in
// api/_lib/orders.js is what removes the manual step — the callback would then
// look up the order and send the customer their receipt automatically.
//
// Providers that DO round-trip metadata (IntaSend, Paystack) return the token,
// and the branch below settles the order in full.
//
// ── Authenticating the callback ──────────────────────────────
//
// Daraja does not sign callbacks — there is no HMAC to check, so the URL itself
// is the credential. Set MPESA_CALLBACK_SECRET and register the callback as
//   https://<domain>/api/pay-callback?k=<that secret>
// The secret never appears in the page, only in Safaricom's config and yours.
// Safaricom also publishes IP ranges you can allowlist upstream for a second
// layer. Signed providers use PAY_WEBHOOK_SECRET and the HMAC path instead.
//
// Body parsing is off because an HMAC has to be computed over the raw bytes —
// re-serializing parsed JSON does not reliably reproduce them. Same shape as
// api/cal-webhook.js.

import crypto from 'node:crypto';
import { verifyOrderToken, markPaid, notifyUnmatchedPayment } from './_lib/orders.js';
import { activeProviderName } from './_lib/payments.js';

export const config = {
  api: { bodyParser: false },
};

/** Header a signing provider puts its HMAC in. Unused by Daraja. */
const SIGNATURE_HEADER = 'x-payment-signature';

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/** Constant-time compare of two strings of any length. */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a ?? ''), 'utf8');
  const bufB = Buffer.from(String(b ?? ''), 'utf8');
  // Length check first: timingSafeEqual throws when the buffers differ in size.
  if (bufA.length === 0 || bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function hasValidHmac(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqual(signature, expected);
}

/** Pull the fields out of Daraja's stkCallback envelope. */
function parseDaraja(event) {
  const cb = event?.Body?.stkCallback;
  if (!cb) return null;

  // CallbackMetadata is present only on success, as a list of {Name, Value}.
  const items = cb.CallbackMetadata?.Item ?? [];
  const value = (name) => items.find((i) => i.Name === name)?.Value ?? null;

  return {
    paid: Number(cb.ResultCode) === 0,
    resultDesc: cb.ResultDesc,
    providerRef: cb.CheckoutRequestID,
    receipt: value('MpesaReceiptNumber'),
    amount: value('Amount'),
    phone: value('PhoneNumber'),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const provider = activeProviderName();
  const isDaraja = provider === 'daraja';
  const rawBody = await readRawBody(req);

  const authorized = isDaraja
    ? safeEqual(req.query?.k, process.env.MPESA_CALLBACK_SECRET)
    : hasValidHmac(rawBody, req.headers[SIGNATURE_HEADER], process.env.PAY_WEBHOOK_SECRET);

  if (!authorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // Daraja expects this exact acknowledgement shape, and retries without it.
  const ack = isDaraja ? { ResultCode: 0, ResultDesc: 'Accepted' } : { ok: true };

  try {
    if (isDaraja) {
      const result = parseDaraja(event);
      if (!result) return res.status(400).json({ error: 'Unrecognized callback' });

      // Cancellations and timeouts arrive here too. They are already reflected
      // in the customer's browser by the status poll, so acknowledge and stop.
      if (!result.paid) {
        console.log(`M-Pesa push not completed (${result.providerRef}): ${result.resultDesc}`);
        return res.status(200).json(ack);
      }

      await notifyUnmatchedPayment(result);
      return res.status(200).json(ack);
    }

    // Signed providers: the token round-trips, so the order can be settled here.
    const token = event?.metadata?.token ?? event?.token;
    const paid = event?.status === 'paid';
    if (!paid) return res.status(200).json(ack);

    const order = verifyOrderToken(token);
    if (!order) {
      console.error('Pay callback carried no verifiable order token.');
      return res.status(200).json(ack);
    }

    await markPaid({ order, receipt: event?.receipt ?? null });
    return res.status(200).json(ack);
  } catch (err) {
    console.error('Pay callback error:', err);
    // A 500 asks most providers to retry, which is what we want if the email
    // failed to send.
    return res.status(500).json({ error: 'Failed to record payment' });
  }
}
