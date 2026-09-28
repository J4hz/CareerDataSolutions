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
// ── Paystack ─────────────────────────────────────────────────
//
// Paystack does echo our reference ("CDS-XXXXXX-…"), so its email names the
// order directly. It still goes to you only, not the customer: the browser poll
// has usually already receipted them, and with no store there is nothing to
// stop a second receipt. Register https://<domain>/api/pay-callback as the
// webhook URL under Paystack Settings > API Keys & Webhooks.
//
// ── Authenticating the callback ──────────────────────────────
//
// Daraja does not sign callbacks — there is no HMAC to check, so the URL itself
// is the credential. Set MPESA_CALLBACK_SECRET and register the callback as
//   https://<domain>/api/pay-callback?k=<that secret>
// The secret never appears in the page, only in Safaricom's config and yours.
// Safaricom also publishes IP ranges you can allowlist upstream for a second
// layer. Paystack signs its webhooks: an HMAC-SHA512 of the raw body, keyed
// with PAYSTACK_SECRET_KEY, in the x-paystack-signature header.
//
// Body parsing is off because an HMAC has to be computed over the raw bytes —
// re-serializing parsed JSON does not reliably reproduce them. Same shape as
// api/cal-webhook.js.

import crypto from 'node:crypto';
import { notifyUnmatchedPayment } from './_lib/orders.js';
import { activeProviderName } from './_lib/payments.js';

export const config = {
  api: { bodyParser: false },
};

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

function hasValidPaystackSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  return safeEqual(signature, expected);
}

/** Pull the fields out of a Paystack charge.success event. */
function parsePaystack(event) {
  if (event?.event !== 'charge.success' || event.data?.status !== 'success') return null;
  const d = event.data;
  return {
    orderId: d.metadata?.orderId ?? null,
    providerRef: d.reference,
    receipt: d.authorization?.receipt_number || d.reference,
    // Paystack reports subunits.
    amount: Number.isFinite(Number(d.amount)) ? Number(d.amount) / 100 : null,
    phone: d.authorization?.mobile_money_number || d.customer?.phone || null,
    email: d.customer?.email ?? null,
  };
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

  // Stub has no callbacks, so anything but these two is refused.
  const authorized = isDaraja
    ? safeEqual(req.query?.k, process.env.MPESA_CALLBACK_SECRET)
    : provider === 'paystack' &&
      hasValidPaystackSignature(
        rawBody,
        req.headers['x-paystack-signature'],
        process.env.PAYSTACK_SECRET_KEY
      );

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

    // Paystack. Every other event type (transfers, failed charges) is
    // acknowledged and ignored — a non-200 would only make Paystack retry it.
    const result = parsePaystack(event);
    if (!result) return res.status(200).json(ack);

    await notifyUnmatchedPayment(result);
    return res.status(200).json(ack);
  } catch (err) {
    console.error('Pay callback error:', err);
    // A 500 asks most providers to retry, which is what we want if the email
    // failed to send.
    return res.status(500).json({ error: 'Failed to record payment' });
  }
}
