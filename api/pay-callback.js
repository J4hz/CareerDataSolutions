// Webhook the payment provider POSTs to when an STK push settles.
//
// This is the ONLY place a real payment may be declared paid — the browser's
// status poll reports, it does not decide (see api/order-status.js).
//
// ── Not wired up yet ─────────────────────────────────────────
//
// PAYMENT_PROVIDER defaults to "stub", which has no callback; this endpoint
// exists so the real rail is a matter of filling in two marked spots rather
// than designing the flow under time pressure. Until then it verifies the
// signature and returns 200 without doing anything.
//
// ── Wiring a real provider ───────────────────────────────────
//
// 1. Set PAY_WEBHOOK_SECRET in Vercel to the signing secret the provider gives
//    you, and point their webhook at https://<domain>/api/pay-callback.
// 2. Fill in SIGNATURE_HEADER and parseCallback() below for that provider's
//    payload shape.
// 3. The order token has to reach the callback: send it as the provider's
//    metadata / account-reference field in api/_lib/payments.js so it comes
//    back here. Providers that only echo a short reference need the KV store
//    described in api/_lib/orders.js instead.
//
// Body parsing is off because the signature is computed over the raw bytes —
// re-serializing parsed JSON does not reliably reproduce them. Same reason and
// same shape as api/cal-webhook.js.

import crypto from 'node:crypto';
import { verifyOrderToken, markPaid } from './_lib/orders.js';

export const config = {
  api: { bodyParser: false },
};

/** Header the provider signs the body with. Set per provider. */
const SIGNATURE_HEADER = 'x-payment-signature';

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function isValidSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const signatureBuf = Buffer.from(signature, 'utf8');
  // Length first: timingSafeEqual throws rather than returning false when the
  // two buffers differ in size.
  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

/**
 * Reduce a provider payload to { paid, token, receipt }.
 *
 * Left generic on purpose — fill this in for the chosen provider. Daraja nests
 * the result under Body.stkCallback with ResultCode 0 for success and the
 * receipt inside CallbackMetadata.Item; IntaSend and Paystack send a flat
 * object with a state/status string.
 */
function parseCallback(event) {
  return {
    paid: event?.status === 'paid' || event?.ResultCode === 0,
    token: event?.metadata?.token ?? event?.token,
    receipt: event?.receipt ?? event?.mpesa_receipt ?? null,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await readRawBody(req);

  if (!isValidSignature(rawBody, req.headers[SIGNATURE_HEADER], process.env.PAY_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { paid, token, receipt } = parseCallback(event);

  // Anything that is not a settled payment is acknowledged and dropped —
  // returning an error would make the provider retry a callback that is not
  // going to become interesting.
  if (!paid) return res.status(200).json({ ok: true, skipped: true });

  const order = verifyOrderToken(token);
  if (!order) {
    console.error('Pay callback carried no verifiable order token.');
    return res.status(200).json({ ok: true, skipped: true });
  }

  try {
    await markPaid({ order, receipt });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Pay callback error:', err);
    // A 500 asks most providers to retry, which is what we want if the emails
    // failed to send.
    return res.status(500).json({ error: 'Failed to record payment' });
  }
}
