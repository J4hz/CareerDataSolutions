// ─────────────────────────────────────────────────────────────
// Payment rail for M-Pesa STK push.
//
// THIS IS THE ONLY FILE THAT KNOWS WHO PROCESSES A PAYMENT. Everything
// upstream (api/order.js, api/order-status.js) talks to the two functions at
// the bottom and never names a provider.
//
// No real rail is wired yet — PAYMENT_PROVIDER defaults to "stub", which
// simulates a customer accepting the prompt after a few seconds so the whole
// checkout can be exercised end to end without credentials or real money.
//
// ── Adding a real provider ───────────────────────────────────
//
// Write two functions matching the stub's shape, add them to PROVIDERS below,
// and set PAYMENT_PROVIDER in Vercel. Nothing else changes.
//
//   IntaSend / Paystack — one authenticated POST triggers the prompt; they
//   POST back to /api/pay-callback when it settles.
//
//   Safaricom Daraja — OAuth for a token, then POST to
//   /mpesa/stkpush/v1/processrequest with shortcode + passkey + timestamp.
//   Needs a registered Paybill/Till and Safaricom's go-live review.
//
// A real provider MUST verify the callback signature in api/pay-callback.js
// before trusting a "paid" result. See the HMAC check in api/cal-webhook.js.
// ─────────────────────────────────────────────────────────────

/** How long the stub pretends the customer takes to enter their PIN. */
const STUB_SETTLE_MS = 6000;

/**
 * Normalize a Kenyan mobile number to the 2547XXXXXXXX / 2541XXXXXXXX form
 * every M-Pesa API expects.
 *
 * Accepts the shapes people actually type: 07xx, 7xx, +2547xx, 2547xx, with or
 * without spaces or hyphens. Returns null if it is not a plausible Kenyan
 * mobile — the caller turns that into a field error rather than sending a
 * prompt into the void.
 */
export function normalizeMsisdn(input) {
  const digits = String(input ?? '').replace(/[^0-9]/g, '');
  if (!digits) return null;

  // 07xxxxxxxx / 01xxxxxxxx → drop the national trunk 0
  let national = digits;
  if (national.startsWith('254')) national = national.slice(3);
  else if (national.startsWith('0')) national = national.slice(1);

  // Safaricom, Airtel and Telkom mobiles are all 7xxxxxxxx or 1xxxxxxxx.
  if (!/^[71][0-9]{8}$/.test(national)) return null;

  return `254${national}`;
}

// ── Stub provider ────────────────────────────────────────────

/**
 * The stub is stateless on purpose: there is no order store yet, so it encodes
 * the request time into the reference it hands back and decides "has this
 * settled?" from the clock. A forged reference only ever fools the stub, which
 * is dev-only — a real provider answers from its own records.
 */
const stub = {
  async requestStkPush({ amount, phone }) {
    if (!amount || !phone) {
      return { ok: false, status: 'failed', error: 'Missing amount or phone number.' };
    }
    return {
      ok: true,
      status: 'pending',
      providerRef: `stub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    };
  },

  async checkStatus({ providerRef }) {
    const startedAt = Number(String(providerRef ?? '').split('_')[1]);
    if (!Number.isFinite(startedAt)) {
      return { status: 'failed', error: 'Unknown payment reference.' };
    }
    if (Date.now() - startedAt < STUB_SETTLE_MS) {
      return { status: 'pending' };
    }
    return { status: 'paid', receipt: `STUB${String(startedAt).slice(-8)}` };
  },
};

const PROVIDERS = { stub };

function activeProvider() {
  const name = process.env.PAYMENT_PROVIDER || 'stub';
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(
      `Unknown PAYMENT_PROVIDER "${name}". Known: ${Object.keys(PROVIDERS).join(', ')}.`
    );
  }
  return provider;
}

/** True when no real money can move. Callers use this to decide whether the
 *  status poll is allowed to settle an order on its own — in production only a
 *  signature-verified callback may do that. */
export function isStubProvider() {
  return (process.env.PAYMENT_PROVIDER || 'stub') === 'stub';
}

/**
 * Ask the rail to ring the customer's phone.
 * → { ok, status: 'pending' | 'failed', providerRef?, error? }
 */
export function requestStkPush(args) {
  return activeProvider().requestStkPush(args);
}

/**
 * Ask the rail what happened to a push.
 * → { status: 'pending' | 'paid' | 'failed', receipt?, error? }
 */
export function checkStatus(args) {
  return activeProvider().checkStatus(args);
}
