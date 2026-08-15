// Polled by the checkout page while the M-Pesa prompt is on the customer's
// phone. Takes the signed token issued by api/order.js, asks the payment rail
// what happened, and reports back.
//
// ── Who is allowed to declare an order paid ──────────────────
//
// It depends on the rail, so the decision lives with the provider as
// settlesOnStatusCheck (see api/_lib/payments.js).
//
// Stub and Daraja set it: checkStatus() asks the provider server-to-server —
// Daraja via its STK Query API — so the answer is authoritative and this
// endpoint may settle the order and send the emails.
//
// Signature-callback providers do not: this endpoint reports status only, and
// api/pay-callback.js settles after verifying the signature.
//
// What is never authoritative is the request itself. The token below is held by
// the client, so it is only trusted to say *which* order is being asked about;
// whether it was paid always comes from the provider.

import { verifyOrderToken, markPaid } from './_lib/orders.js';
import { checkStatus, settlesOnStatusCheck } from './_lib/payments.js';
import { limited } from './_lib/rate-limit.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Unlike the other routes this one is *meant* to be hammered: the checkout
  // polls every 3s for up to 120s, so one honest payment is ~40 calls, and
  // api/order.js already allows five payments per ten minutes — 200. The cap
  // is set above that rather than near it, because every call it accepts is a
  // server-to-server STK Query on our Daraja credentials.
  //
  // The client treats a 429 as "keep waiting", not as a failed payment (see
  // CareerOrder.jsx). It must stay that way: telling someone their payment
  // failed while the prompt is still live on their phone is worse than the
  // extra polls.
  if (await limited(req, res, 'order-status', { limit: 240, windowSeconds: 600 })) return;

  const order = verifyOrderToken(req.query?.token);
  if (!order) {
    // Covers tampered, malformed and expired tokens alike — the client gets no
    // signal about which, because that difference is only useful to an attacker.
    return res.status(400).json({ error: 'This checkout session is no longer valid.' });
  }

  try {
    const result = await checkStatus({ providerRef: order.providerRef });

    if (result.status === 'paid' && settlesOnStatusCheck()) {
      await markPaid({ order, receipt: result.receipt });
    }

    return res.status(200).json({
      orderId: order.id,
      status: result.status,
      receipt: result.status === 'paid' ? result.receipt : undefined,
      error: result.error,
    });
  } catch (err) {
    console.error('Order status error:', err);
    return res.status(500).json({ error: 'Could not check the payment status.' });
  }
}
