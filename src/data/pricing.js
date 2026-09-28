// ─────────────────────────────────────────────────────────────
// What a package costs right now, list price and founding rate.
//
// THE ONE RULE THIS FILE EXISTS FOR
// The price a card shows and the price api/order.js bills have to be the
// same number, and the only way to guarantee that is for both to come out
// of the same function. So this module is imported by the React components
// AND by the Vercel functions in /api — keep it free of browser- and
// React-specific code, exactly like src/config.js, and keep the .js on its
// imports so Node can resolve them.
//
// WHERE EACH NUMBER COMES FROM
// Career tiers carry `amountKES`, the authoritative integer. Data tiers
// carry null there on purpose — they are quoted after a discovery call, not
// sold off the page — so their figure is read back out of the display string
// the card itself shows. Money that is actually charged is therefore never
// parsed out of a string: api/order.js only ever prices career packages, and
// those have the integer.
//
// ROUNDING
// applyFoundingDiscount() rounds, and every caller goes through it. That is
// the whole reason it is a function rather than a multiplication written out
// in a few places: a card rounding one way and the charge rounding the other
// is a customer seeing 4,950 and their phone asking for 4,951.
//
// FORMATTING
// The thousands separator is applied by hand rather than with
// toLocaleString(), because these strings are rendered during the prerender
// in Node and again in the browser during hydration. Two ICU builds that
// disagree about en-KE would be a hydration mismatch on the price — the most
// expensive possible place to have one.
// ─────────────────────────────────────────────────────────────

import {
  foundingClientsConfig,
  isFoundingClientsActive,
  isFoundingRateHonoured,
} from '../content/foundingClients.js';

/** 90000 → "90,000" */
function group(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatKES(n) {
  return `KES ${group(n)}`;
}

export function formatUSD(n) {
  return `$${group(n)} USD`;
}

/** "KES 90,000" → 90000, "$1,250 USD" → 1250, anything else → null. */
function parseAmount(str) {
  const digits = String(str ?? '').replace(/[^0-9]/g, '');
  return digits ? Number(digits) : null;
}

/**
 * Take the founding percentage off an amount. Rounds to a whole unit: M-Pesa
 * cannot be asked for a fraction of a shilling, and a card must not show one.
 */
export function applyFoundingDiscount(amount, config = foundingClientsConfig) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return amount;
  return Math.round((amount * (100 - config.discountPercent)) / 100);
}

/**
 * Everything a card needs to render one package's price.
 *
 * → { discounted, percent, kesLabel, usdLabel, wasKESLabel, wasUSDLabel, ... }
 *
 * When the offer is not running, or the package publishes no figure at all,
 * `discounted` is false and the labels are the package's own strings
 * untouched — so a caller can render the result unconditionally.
 *
 * The USD figure is discounted exactly rather than re-rounded to the nearest
 * $50 that src/data/packages.js quotes list prices on. Re-rounding $630 up to
 * $650 would advertise 10% off and hand over 7%.
 */
export function packagePricing(pkg, now = new Date()) {
  const listKES = typeof pkg.amountKES === 'number' ? pkg.amountKES : parseAmount(pkg.priceKES);
  const listUSD = parseAmount(pkg.priceUSD);

  const base = {
    discounted: false,
    percent: 0,
    kes: listKES,
    usd: listUSD,
    listKES,
    listUSD,
    kesLabel: pkg.priceKES,
    usdLabel: pkg.priceUSD,
    wasKESLabel: null,
    wasUSDLabel: null,
  };

  if (listKES === null || !isFoundingClientsActive(now)) return base;

  const kes = applyFoundingDiscount(listKES);
  const usd = listUSD === null ? null : applyFoundingDiscount(listUSD);

  return {
    ...base,
    discounted: true,
    percent: foundingClientsConfig.discountPercent,
    kes,
    usd,
    kesLabel: formatKES(kes),
    usdLabel: usd === null ? pkg.priceUSD : formatUSD(usd),
    wasKESLabel: pkg.priceKES,
    wasUSDLabel: pkg.priceUSD,
  };
}

/**
 * Service charge per payment method: Paystack Kenya's fee on each rail,
 * passed on to the customer. Set a rate to 0 to absorb that fee instead.
 *
 * Cards use the international rate (3.8%) rather than the local one (2.9%)
 * because the card is entered on Paystack's page, after the price is fixed —
 * there is no knowing beforehand whether it is Kenyan. Paystack's
 * international rate already covers currency conversion.
 */
export const SERVICE_CHARGE_RATES = { mpesa: 0.015, card: 0.038 };

/**
 * Add the payment method's service charge to a price.
 *
 * → { totalKES, serviceChargeKES }
 *
 * Grossed up, not added on: Paystack takes its percentage of the TOTAL, so
 * the total is price ÷ (1 − rate). Adding 3.8% of the price would leave you
 * 3.8% of the service charge short. Rounded UP to a whole shilling, so the
 * rounding never lands below the price either.
 */
export function withServiceCharge(kes, method) {
  const rate = SERVICE_CHARGE_RATES[method] ?? 0;
  if (typeof kes !== 'number' || !Number.isFinite(kes) || rate <= 0) {
    return { totalKES: kes, serviceChargeKES: 0 };
  }
  const totalKES = Math.ceil(kes / (1 - rate));
  return { totalKES, serviceChargeKES: totalKES - kes };
}

/**
 * The integer KES to actually bill for a package, before any promo code.
 * Null for anything not sold off the page.
 *
 * This is the server's entry point and the only one that uses the grace
 * period — see isFoundingRateHonoured() for why it is not the same rule the
 * cards render from.
 */
export function chargeableKES(pkg, now = new Date()) {
  if (typeof pkg?.amountKES !== 'number') return null;
  return isFoundingRateHonoured(now) ? applyFoundingDiscount(pkg.amountKES) : pkg.amountKES;
}
