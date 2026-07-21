// Polled by the checkout page while the M-Pesa prompt is on the customer's
// phone. Takes the signed token issued by api/order.js, asks the payment rail
// what happened, and reports back.
//
// ── Who is allowed to declare an order paid ──────────────────
//
// With the stub provider this endpoint settles the order itself, so the whole
// flow can be exercised without a real rail.
//
// With a real provider it does NOT. It reports status only, and the emails are
// sent from api/pay-callback.js, which verifies the provider's signature first.
// The difference matters: this endpoint's input is a token the client holds,
// and a client must never be able to talk itself into a paid order.

import { verifyOrderToken, markPaid } from './_lib/orders.js';
import { checkStatus, isStubProvider } from './_lib/payments.js';

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

    if (result.status === 'paid' && isStubProvider()) {
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
