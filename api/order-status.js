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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
