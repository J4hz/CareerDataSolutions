// ─────────────────────────────────────────────────────────────
// Promo codes.
//
// ── The code never reaches the browser ───────────────────────
//
// It lives only in TEST_PROMO_CODE on the server. The client sends whatever
// the visitor typed and the server says yes or no; the valid code is never
// shipped in the bundle, because anything in the bundle can be read by anyone
// and every package would be purchasable for ten shillings.
//
// For the same reason resolveAmount() is called again inside api/order.js at
// charge time. api/promo.js exists only to give the visitor feedback before
// they pay, and its answer is never trusted as an input to the charge.
//
//   TEST_PROMO_CODE    the code itself. Unset disables promos entirely.
//   TEST_PROMO_AMOUNT  what the order costs when it applies (default 10).
//
// This is a testing mechanism, not a marketing one: one code, flat price, no
// expiry and no usage limit. Delete both variables to turn it off.
// ─────────────────────────────────────────────────────────────

import crypto from 'node:crypto';
import { chargeableKES } from '../../src/data/pricing.js';

/** Constant-time string compare, so a wrong code cannot be narrowed down by
 *  timing how long the rejection took. */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a ?? ''), 'utf8');
  const bufB = Buffer.from(String(b ?? ''), 'utf8');
  if (bufA.length === 0 || bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Price an order, applying the promo code if it is the configured one.
 *
 * → { amountKES, promoApplied }
 *
 * amountKES always comes from the server: either the package's own price from
 * src/data/packages.js less the founding rate if that offer is running, or
 * the configured test amount. Nothing the client sends is used as a number.
 */
export function resolveAmount(pkg, submittedCode) {
  const configured = process.env.TEST_PROMO_CODE;

  // The founding rate, if the offer is still running, comes off before any
  // code is considered — chargeableKES() is the same function the cards price
  // themselves with, so this is the figure the visitor was shown. The two
  // discounts do not stack: the promo below is a flat test amount that
  // replaces the price outright rather than reducing it.
  const founding = chargeableKES(pkg);
  const listed = founding ?? pkg.amountKES;
  const foundingApplied = typeof founding === 'number' && founding !== pkg.amountKES;

  // Strings only. Coercing with String() would let an object carrying a
  // toString() match the code. JSON cannot express that, so it is not
  // reachable over HTTP today, but the check costs nothing and stops the
  // function surprising a future caller.
  if (typeof submittedCode !== 'string') {
    return { amountKES: listed, promoApplied: false, foundingApplied };
  }

  if (configured && submittedCode && safeEqual(submittedCode.trim(), configured)) {
    const amount = Number(process.env.TEST_PROMO_AMOUNT || 10);
    // A broken TEST_PROMO_AMOUNT must not become a free order.
    const safeAmount = Number.isFinite(amount) && amount >= 1 ? Math.round(amount) : 10;
    return { amountKES: safeAmount, promoApplied: true, foundingApplied: false };
  }

  return { amountKES: listed, promoApplied: false, foundingApplied };
}
