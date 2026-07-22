// ─────────────────────────────────────────────────────────────
// Payment rail for M-Pesa STK push.
//
// THIS IS THE ONLY FILE THAT KNOWS WHO PROCESSES A PAYMENT. Everything
// upstream (api/order.js, api/order-status.js) talks to the exported functions
// at the bottom and never names a provider.
//
// PAYMENT_PROVIDER picks the rail:
//   stub    — default. Simulates a payment settling after a few seconds so the
//             checkout can be exercised with no credentials and no real money.
//   daraja  — Safaricom's own API. Sandbox or production, see below.
//
// ── How a payment is confirmed ───────────────────────────────
//
// Providers differ in who is allowed to declare an order paid, which is why
// each one carries a `settlesOnStatusCheck` flag:
//
//   true  — checkStatus() asks the provider directly, server to server, so its
//           answer is authoritative and api/order-status.js may act on it.
//           Both stub and Daraja work this way (Daraja has an STK Query API).
//   false — the provider only tells you asynchronously, by signed webhook. The
//           browser poll then reports status but must never settle the order;
//           only api/pay-callback.js may, after verifying the signature.
//           Aggregators like IntaSend and Paystack belong here.
//
// Getting this wrong in the "false" direction would let a client talk itself
// into a paid order, so the flag defaults to false for anything new.
//
// ── Daraja setup ─────────────────────────────────────────────
//
//   MPESA_ENV            sandbox | production   (default sandbox)
//   MPESA_CONSUMER_KEY   from the app on developer.safaricom.co.ke
//   MPESA_CONSUMER_SECRET
//   MPESA_SHORTCODE      174379 on sandbox; your Paybill/Till in production
//   MPESA_PASSKEY        the Lipa na M-Pesa Online passkey
//   MPESA_TILL           set to "1" only if the shortcode is a Buy Goods till
//   MPESA_CALLBACK_URL   absolute https URL of /api/pay-callback, including
//                        the ?k= secret (see api/pay-callback.js)
//
// Sandbox test values: shortcode 174379, phone 254708374149. The prompt appears
// and the callback fires, but no money moves — production needs your own
// shortcode and Safaricom's go-live review.
//
// Field limits Safaricom enforces and will reject on: AccountReference is 12
// characters, TransactionDesc is 13. Order refs are "CDS-XXXXXX" (10), so they
// fit as-is; the description is truncated below.
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

  let national = digits;
  if (national.startsWith('254')) national = national.slice(3);
  else if (national.startsWith('0')) national = national.slice(1);

  // Safaricom, Airtel and Telkom mobiles are all 7xxxxxxxx or 1xxxxxxxx.
  if (!/^[71][0-9]{8}$/.test(national)) return null;

  return `254${national}`;
}

// ── Stub provider ────────────────────────────────────────────

/**
 * Stateless on purpose: there is no order store, so it encodes the request time
 * into the reference it hands back and decides "has this settled?" from the
 * clock. A forged reference only ever fools the stub, which never handles real
 * money.
 */
const stub = {
  settlesOnStatusCheck: true,

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
    if (Date.now() - startedAt < STUB_SETTLE_MS) return { status: 'pending' };
    return { status: 'paid', receipt: `STUB${String(startedAt).slice(-8)}` };
  },
};

// ── Safaricom Daraja ─────────────────────────────────────────

const DARAJA_HOSTS = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
};

function darajaConfig() {
  const env = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox';
  const cfg = {
    host: DARAJA_HOSTS[env],
    key: process.env.MPESA_CONSUMER_KEY,
    secret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.MPESA_CALLBACK_URL,
    // Paybill and Buy Goods use different transaction types and Safaricom
    // rejects the wrong one.
    transactionType:
      process.env.MPESA_TILL === '1' ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline',
  };

  // Spelled out rather than derived from the key names, so the message always
  // names a variable that actually exists.
  const ENV_NAMES = {
    key: 'MPESA_CONSUMER_KEY',
    secret: 'MPESA_CONSUMER_SECRET',
    shortcode: 'MPESA_SHORTCODE',
    passkey: 'MPESA_PASSKEY',
    callbackUrl: 'MPESA_CALLBACK_URL',
  };
  const missing = Object.keys(ENV_NAMES).filter((k) => !cfg[k]);
  if (missing.length) {
    throw new Error(
      `Daraja is not configured. Missing: ${missing.map((k) => ENV_NAMES[k]).join(', ')}`
    );
  }
  return cfg;
}

/** Daraja wants the timestamp in East Africa Time, and the same value must go
 *  into both the Password hash and the Timestamp field or the call is rejected. */
function darajaTimestamp() {
  const d = new Date(Date.now() + 3 * 60 * 60 * 1000); // UTC+3, no DST in EAT
  const p = (n) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`
  );
}

// Access tokens last an hour. Cached in module scope so a warm function reuses
// one instead of paying an extra round trip per checkout; a cold start just
// fetches again. Deliberately not shared across instances — the OAuth call is
// cheap and a stale token only costs one retry.
let tokenCache = { value: null, expiresAt: 0 };

async function darajaToken(cfg) {
  if (tokenCache.value && Date.now() < tokenCache.expiresAt) return tokenCache.value;

  const basic = Buffer.from(`${cfg.key}:${cfg.secret}`).toString('base64');
  const res = await fetch(`${cfg.host}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${basic}` },
  });
  const body = await res.json().catch(() => ({}));

  if (!res.ok || !body.access_token) {
    throw new Error(`Daraja auth failed (${res.status}): ${body.errorMessage || 'no access token'}`);
  }

  // Expire a minute early so a token cannot lapse mid-request.
  const ttl = (Number(body.expires_in) || 3599) * 1000;
  tokenCache = { value: body.access_token, expiresAt: Date.now() + ttl - 60_000 };
  return tokenCache.value;
}

function darajaPassword(cfg, timestamp) {
  return Buffer.from(`${cfg.shortcode}${cfg.passkey}${timestamp}`).toString('base64');
}

/** Map an STK ResultCode to our three states. 0 is success; the rest are
 *  terminal failures with a message worth showing the customer. */
const RESULT_MESSAGES = {
  1: 'Not enough M-Pesa balance to complete the payment.',
  1032: 'The payment prompt was cancelled.',
  1037: 'The prompt timed out with no response from the phone.',
  2001: 'The M-Pesa PIN entered was wrong.',
};

const daraja = {
  settlesOnStatusCheck: true, // STK Query is server-to-server and authoritative

  async requestStkPush({ amount, phone, reference, description }) {
    const cfg = darajaConfig();
    const timestamp = darajaTimestamp();
    const token = await darajaToken(cfg);

    const res = await fetch(`${cfg.host}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: cfg.shortcode,
        Password: darajaPassword(cfg, timestamp),
        Timestamp: timestamp,
        TransactionType: cfg.transactionType,
        // Daraja takes whole shillings only and rejects decimals.
        Amount: Math.round(Number(amount)),
        PartyA: phone,
        PartyB: cfg.shortcode,
        PhoneNumber: phone,
        CallBackURL: cfg.callbackUrl,
        AccountReference: String(reference).slice(0, 12),
        TransactionDesc: String(description || 'Payment').slice(0, 13),
      }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok || String(body.ResponseCode) !== '0') {
      console.error('Daraja STK push rejected:', res.status, body);
      return {
        ok: false,
        status: 'failed',
        error: body.errorMessage || body.ResponseDescription || 'M-Pesa rejected the request.',
      };
    }

    // CheckoutRequestID is the handle for everything afterwards: the status
    // query takes it, and it is the only field the callback echoes back.
    return { ok: true, status: 'pending', providerRef: body.CheckoutRequestID };
  },

  async checkStatus({ providerRef }) {
    if (!providerRef) return { status: 'failed', error: 'Unknown payment reference.' };

    const cfg = darajaConfig();
    const timestamp = darajaTimestamp();
    const token = await darajaToken(cfg);

    const res = await fetch(`${cfg.host}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: cfg.shortcode,
        Password: darajaPassword(cfg, timestamp),
        Timestamp: timestamp,
        CheckoutRequestID: providerRef,
      }),
    });
    const body = await res.json().catch(() => ({}));

    // While the customer is still staring at the prompt, Daraja answers with an
    // HTTP error and errorCode 500.001.1001 rather than a "pending" result.
    // That is normal, not a failure — keep polling.
    if (!res.ok) {
      if (String(body.errorCode) === '500.001.1001') return { status: 'pending' };
      console.error('Daraja STK query failed:', res.status, body);
      return { status: 'pending' };
    }

    const code = Number(body.ResultCode);
    if (!Number.isFinite(code)) return { status: 'pending' };
    if (code === 0) {
      // The query confirms payment but does not return the receipt number —
      // only the callback carries it. Absence here is expected, not an error.
      return { status: 'paid', receipt: body.MpesaReceiptNumber ?? null };
    }
    return {
      status: 'failed',
      error: RESULT_MESSAGES[code] || body.ResultDesc || 'The payment did not go through.',
    };
  },
};

// ── Dispatch ─────────────────────────────────────────────────

const PROVIDERS = { stub, daraja };

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

/** Whether checkStatus() is authoritative enough to settle an order. See the
 *  note at the top of this file. */
export function settlesOnStatusCheck() {
  return activeProvider().settlesOnStatusCheck === true;
}

export function activeProviderName() {
  return process.env.PAYMENT_PROVIDER || 'stub';
}

/**
 * Ask the rail to ring the customer's phone.
 * → { ok, status: 'pending' | 'failed', providerRef?, error? }
 */
export async function requestStkPush(args) {
  try {
    return await activeProvider().requestStkPush(args);
  } catch (err) {
    // A misconfiguration must not read as "your card was declined".
    console.error('STK push error:', err);
    return { ok: false, status: 'failed', error: 'We could not reach M-Pesa. Please try again.' };
  }
}

/**
 * Ask the rail what happened to a push.
 * → { status: 'pending' | 'paid' | 'failed', receipt?, error? }
 */
export async function checkStatus(args) {
  try {
    return await activeProvider().checkStatus(args);
  } catch (err) {
    // Treated as pending, not failed: a transient error on our side says
    // nothing about whether the customer paid, and the caller has its own
    // timeout to end the wait.
    console.error('Status check error:', err);
    return { status: 'pending' };
  }
}
