// Checks a promo code so the checkout page can show the discounted total
// before the visitor pays.
//
// This endpoint is for DISPLAY ONLY. api/order.js re-runs resolveAmount() at
// charge time and prices from that, so a forged "valid" response here cannot
// change what is actually billed.

import { packages } from '../src/data/packages.js';
import { resolveAmount } from './_lib/promo.js';
import { limited } from './_lib/rate-limit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Looser than the others because a shopper may try a few codes, but a
  // limit belongs here specifically: this endpoint answers "is this code
  // real?", so without one it is an oracle for guessing promo codes at
  // whatever rate the network allows.
  if (await limited(req, res, 'promo', { limit: 20, windowSeconds: 600 })) return;

  const { code, packageId } = req.body ?? {};

  const pkg = packages.find((p) => p.id === packageId && p.track === 'career');
  if (!pkg) {
    return res.status(400).json({ error: 'That package is not available.' });
  }

  const { amountKES, promoApplied } = resolveAmount(pkg, code);

  // One answer shape either way: a wrong code and an unconfigured promo are
  // indistinguishable from out here.
  return res.status(200).json({
    valid: promoApplied,
    amountKES,
    originalKES: pkg.amountKES,
  });
}
