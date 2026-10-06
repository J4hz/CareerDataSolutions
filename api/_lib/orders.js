// ─────────────────────────────────────────────────────────────
// Order records for the career checkout.
//
// THIS IS THE ONLY FILE THAT KNOWS WHERE AN ORDER LIVES. api/order.js,
// api/order-status.js and api/pay-callback.js call the functions below and
// never touch storage directly.
//
// ── Where an order lives ─────────────────────────────────────
//
// An STK push is asynchronous: one request asks the rail to ring the phone,
// and a *separate* request minutes later says whether it was paid. Serverless
// functions share no memory between the two, so something has to remember what
// order #abc was.
//
// Two things do, for different readers:
//
//   The signed token (sign/verify below) is the CLIENT's handle. The browser
//   holds it as an opaque string and posts it back when polling; the HMAC
//   proves the contents are the ones this server issued, so the amount,
//   package and customer cannot be edited in the round trip.
//
//   KV (saveOrder/getOrder below, over api/_lib/kv.js) is the RECORD. It is
//   what lets the payment webhook find an order with no browser involved —
//   the customer who closed the tab mid-PIN still gets their receipt — and
//   it is what makes settling a payment idempotent.
//
// The CV is emailed at creation and is never stored in either.
//
// ── Without KV ───────────────────────────────────────────────
//
// KV is optional. With no KV_REST_API_* or UPSTASH_REDIS_REST_* configured,
// or with KV down, everything here falls back to the token alone, which is
// how checkout worked before KV existed: orders still go through and still
// get confirmed, the webhook just cannot find them and emails you the
// payment unmatched instead. Each fallback is logged. The rule throughout is
// to fail towards a possible duplicate email, never towards sending nothing.
// ─────────────────────────────────────────────────────────────

import crypto from 'node:crypto';
import { Resend } from 'resend';
import { CONTACT_EMAIL, NOTIFY_FROM, SITE_DOMAIN, WHATSAPP_URL } from '../../src/config.js';
import { cleanHeader } from './sanitize.js';
import * as kv from './kv.js';

/** Tokens stop verifying after this long, so an abandoned checkout tab cannot
 *  be replayed days later. Comfortably longer than any STK prompt. */
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

/**
 * How long a stored order (and every key derived from it) stays in KV.
 *
 * The record holds the customer's name, email and phone, so this is a
 * privacy decision as much as a technical one: it should match whatever the
 * privacy policy says about how long order details are kept. 90 days covers
 * a late webhook retry, a refund or chargeback query, and the first month's
 * reconciliation with room to spare. Change it here and nowhere else.
 */
const ORDER_TTL_SECONDS = 90 * 24 * 60 * 60;

// ── KV record ────────────────────────────────────────────────

let warnedNoKv = false;

/** Whether KV can be used, warning once per instance when it cannot. */
function kvAvailable() {
  if (kv.isConfigured()) return true;
  if (!warnedNoKv) {
    warnedNoKv = true;
    console.warn(
      '[orders] No KV_REST_API_* or UPSTASH_REDIS_REST_* configured. Orders are ' +
        'not stored: payments cannot be de-duplicated, and a webhook for a closed ' +
        'tab is emailed as unmatched instead of receipting the customer.'
    );
  }
  return false;
}

/**
 * Store an order once the payment rail has given it a reference.
 *
 * Writes two keys, both with ORDER_TTL_SECONDS:
 *   order:<orderId>         the order itself, the same fields the token carries
 *   order-ref:<providerRef> the order id, so a webhook (which knows only the
 *                           provider's reference) can find it
 *
 * Never throws and never blocks the checkout: a KV failure is logged and the
 * order carries on through the token, exactly as it would with no KV at all.
 * → true if both keys were written.
 */
export async function saveOrder(order) {
  if (!kvAvailable()) return false;

  const record = { ...order, createdAt: new Date().toISOString() };
  try {
    await Promise.all([
      kv.set(`order:${order.id}`, record, { ttlSeconds: ORDER_TTL_SECONDS }),
      order.providerRef
        ? kv.set(`order-ref:${order.providerRef}`, order.id, { ttlSeconds: ORDER_TTL_SECONDS })
        : null,
    ]);
    return true;
  } catch (err) {
    console.error(`[orders] Could not store order ${order.id}; continuing without it:`, err.message);
    return false;
  }
}

/**
 * Read a stored order back, by our id or by the provider's reference.
 *
 * The provider reference is preferred when both are given: it is unique per
 * payment attempt, whereas order ids are only 3 random bytes. For the same
 * reason a lookup by reference checks the order it lands on really carries
 * that reference — if two orders ever drew the same id, the later one would
 * have overwritten the earlier, and confirming the wrong customer's order is
 * worse than not finding one.
 *
 * → the order, or null when KV is not configured, unreachable, or has nothing.
 */
export async function getOrder({ orderId, providerRef } = {}) {
  if (!kvAvailable()) return null;

  try {
    const id = providerRef ? await kv.get(`order-ref:${providerRef}`) : orderId;
    if (!id) return null;

    const order = await kv.get(`order:${id}`);
    if (!order || typeof order !== 'object') return null;
    if (providerRef && order.providerRef !== providerRef) {
      console.warn(`[orders] order-ref:${providerRef} points at ${id}, which has a different ref.`);
      return null;
    }
    return order;
  } catch (err) {
    console.error('[orders] Could not read order from KV:', err.message);
    return null;
  }
}

// ── Token ────────────────────────────────────────────────────

/**
 * Key for the order HMAC.
 *
 * ORDER_SECRET is the right thing to set (any long random string). Without it
 * we derive a key from RESEND_API_KEY rather than fail — checkout keeps working
 * on a fresh clone with no extra config. The derivation means the raw API key
 * is never itself the signing key.
 */
function signingKey() {
  const explicit = process.env.ORDER_SECRET;
  if (explicit) return Buffer.from(explicit, 'utf8');

  const fallback = process.env.RESEND_API_KEY;
  if (!fallback) throw new Error('Neither ORDER_SECRET nor RESEND_API_KEY is configured.');
  return crypto.createHash('sha256').update(`cds-order-signing:${fallback}`).digest();
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');

/** Sign an order into an opaque string the browser can hold. */
export function signOrder(order) {
  const payload = b64url(JSON.stringify({ ...order, iat: Date.now() }));
  const sig = b64url(crypto.createHmac('sha256', signingKey()).update(payload).digest());
  return `${payload}.${sig}`;
}

/**
 * Verify and decode a token from the client.
 * → the order object, or null if it was tampered with, malformed or expired.
 */
export function verifyOrderToken(token) {
  const [payload, sig] = String(token ?? '').split('.');
  if (!payload || !sig) return null;

  const expected = b64url(crypto.createHmac('sha256', signingKey()).update(payload).digest());
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  // Length check first: timingSafeEqual throws on a mismatch rather than
  // returning false.
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let order;
  try {
    order = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!order?.iat || Date.now() - order.iat > TOKEN_TTL_MS) return null;
  return order;
}

/** Short, human-quotable reference. Shown to the customer and used as the
 *  payment reference, so it needs to survive being read down a phone line. */
export function newOrderId() {
  return `CDS-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

const money = (n) => `KES ${Number(n).toLocaleString('en-KE')}`;

function resendClient() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');
  return new Resend(process.env.RESEND_API_KEY);
}

const row = (label, value) => `
  <tr>
    <td style="padding:8px 0;color:#6B7280;font-size:14px;width:150px;">${label}</td>
    <td style="padding:8px 0;color:#0F172A;font-size:14px;font-weight:600;">${value}</td>
  </tr>`;

/** For provider-supplied text (references, receipts, phone numbers). It
 *  arrives authenticated, but it is still not ours, so it is escaped before it
 *  goes into an HTML email. */
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Record a new order: emails you the details with the CV attached, marked as
 * awaiting payment.
 *
 * The CV goes out now rather than after payment so nothing has to hold the file
 * between the two requests. An abandoned checkout therefore still reaches your
 * inbox — which is useful, but means "awaiting payment" in the subject is load
 * bearing. The confirmation of payment is a separate email from markPaid().
 *
 * `safe` values are already escaped by the caller (api/order.js).
 */
export async function createOrder({
  id, pkg, safe, cv, amountKES, baseKES = amountKES, serviceChargeKES = 0,
  promoApplied, foundingApplied, method = 'mpesa',
}) {
  const card = method === 'card';
  const resend = resendClient();
  const configuredFrom = process.env.NOTIFY_FROM || NOTIFY_FROM;

  const options = {
    from: configuredFrom,
    to: process.env.NOTIFY_EMAIL || CONTACT_EMAIL,
    replyTo: safe.email,
    subject: cleanHeader(
      `Order ${id} · AWAITING PAYMENT · ${pkg.name}${promoApplied ? ' · PROMO' : ''} · ${safe.name}`
    ),
    attachments: cv ? [{ filename: cv.filename, content: cv.buffer.toString('base64') }] : [],
    html: `
      <div style="font-family:sans-serif;max-width:560px;">
        <div style="background:#FEF3C7;border-left:4px solid #F4A833;padding:12px 16px;margin-bottom:24px;">
          <strong style="color:#92400E;font-size:14px;">Awaiting payment</strong>
          <div style="color:#92400E;font-size:13px;margin-top:2px;">
            ${card
              ? 'The customer was sent to the Paystack card page.'
              : 'An M-Pesa prompt has been sent.'} You will get a second email if it is paid.
          </div>
        </div>
        <h2 style="color:#0B1F3A;margin:0 0 16px;">New order · ${pkg.name}</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${row('Order ref', id)}
          ${row('Package', `${pkg.name} (${pkg.tier})`)}
          ${row(
            serviceChargeKES ? 'Package price' : 'Amount',
            // Anything other than the list price is called out with what the
            // list price was, so a figure in your inbox is never just lower
            // than expected with no explanation attached to it.
            promoApplied
              ? `${money(baseKES)} <span style="color:#B45309;font-weight:600;">(PROMO CODE · list price ${money(pkg.amountKES)})</span>`
              : foundingApplied
                ? `${money(baseKES)} <span style="color:#B45309;font-weight:600;">(FOUNDING RATE · list price ${money(pkg.amountKES)})</span>`
                : money(baseKES)
          )}
          ${serviceChargeKES ? row('Service charge', `${money(serviceChargeKES)} (covers Paystack's fee)`) : ''}
          ${serviceChargeKES ? row('Total billed', money(amountKES)) : ''}
          ${row('Name', safe.name)}
          ${row('Email', safe.email)}
          ${row('Paying by', card ? 'Card' : 'M-Pesa')}
          ${card ? (safe.phone ? row('Phone', safe.phone) : '') : row('M-Pesa phone', safe.phone)}
          ${row('Timeline', pkg.timeline)}
          ${safe.message ? row('Notes', safe.message) : ''}
        </table>
        <p style="margin-top:24px;font-size:13px;color:#6B7280;">
          ${cv ? `Attached: ${safe.filename} · ` : ''}Sent from ${SITE_DOMAIN}
        </p>
      </div>`,
  };

  let { error } = await resend.emails.send(options);

  // Same sandbox fallback as api/notify-career.js: better to reach the inbox
  // from the Resend test sender than to lose the order entirely.
  if (error && configuredFrom !== 'onboarding@resend.dev') {
    console.warn(`Resend order failed from ${configuredFrom}. Retrying via sandbox.`, error);
    options.from = 'onboarding@resend.dev';
    ({ error } = await resend.emails.send(options));
  }

  if (error) {
    console.error('Order notification error:', error);
    return { ok: false };
  }
  return { ok: true };
}

/**
 * A confirmed payment that could not be tied to a stored order.
 *
 * Reached when the webhook has nothing to look up: always for Daraja (whose
 * branch in api/pay-callback.js does not use the store yet), and for Paystack
 * when KV is not configured, is down, or no longer holds the order. Daraja's
 * callback echoes CheckoutRequestID, amount, phone and receipt but not our
 * order id; Paystack's echoes the order id in its metadata.
 *
 * Without KV this can duplicate the "PAID" email from the browser poll, which
 * the footer says. It earns its place when the customer closed the tab
 * mid-payment, which is the one case where nothing else would tell you the
 * money arrived.
 *
 * → { ok } — false if Resend refused the email.
 */
export async function notifyUnmatchedPayment({ orderId, providerRef, receipt, amount, phone, email }) {
  const resend = resendClient();
  const from = process.env.NOTIFY_FROM || NOTIFY_FROM;

  const { error } = await resend.emails.send({
    from,
    to: process.env.NOTIFY_EMAIL || CONTACT_EMAIL,
    subject: cleanHeader(
      `Payment received · ${orderId ? `Order ${orderId}` : receipt || providerRef}`
    ),
    html: `
      <div style="font-family:sans-serif;max-width:560px;">
        <div style="background:#DCFCE7;border-left:4px solid #1D9E75;padding:12px 16px;margin-bottom:24px;">
          <strong style="color:#166534;font-size:14px;">${orderId ? 'Paystack' : 'M-Pesa'} confirmed a payment</strong>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${orderId ? row('Order ref', esc(orderId)) : ''}
          ${row('Receipt', receipt ? esc(receipt) : 'n/a')}
          ${row('Amount', amount ? money(amount) : 'n/a')}
          ${row('Paid by', phone ? esc(phone) : 'n/a')}
          ${email ? row('Email', esc(email)) : ''}
          ${row('Payment ref', providerRef ? esc(providerRef) : 'n/a')}
        </table>
        <p style="margin-top:24px;font-size:13px;color:#6B7280;line-height:1.6;">
          ${
            orderId
              ? `Match this to the "AWAITING PAYMENT" email for order ${esc(orderId)} to find the CV.`
              : 'Match this to the "AWAITING PAYMENT" email with the same phone number to find the order and the CV.'
          }<br /><br />
          If the customer stayed on the page, they have already had their receipt
          and you will have a "PAID" email for this order too, in which case this
          message is a duplicate and can be ignored.
        </p>
      </div>`,
  });
  if (error) console.error('Unmatched payment notification error:', error);
  return { ok: !error };
}

/**
 * A payment whose amount or currency does not match the order it names.
 *
 * Goes to you only — the customer is deliberately NOT receipted, because a
 * receipt says "confirmed" and this needs a person to look at it first. In
 * practice it means a misconfiguration (a price changed between checkout and
 * payment, a wrong currency on the account) rather than fraud, since the
 * amount is set server side on both rails, but either way the work should
 * not start until someone has checked the Paystack dashboard.
 *
 * → { ok } — false if Resend refused the email.
 */
async function notifyAmountMismatch({ order, providerRef, receipt, amount, currency }) {
  const resend = resendClient();
  const configuredFrom = process.env.NOTIFY_FROM || NOTIFY_FROM;
  const paid = `${currency ? esc(currency) : 'KES'} ${esc(Number(amount).toLocaleString('en-KE'))}`;

  const { error } = await resend.emails.send({
    from: configuredFrom,
    to: process.env.NOTIFY_EMAIL || CONTACT_EMAIL,
    replyTo: order.email,
    subject: cleanHeader(
      `CHECK AMOUNT · Order ${order.id} · paid ${paid}, expected ${money(order.amountKES)}`
    ),
    html: `
      <div style="font-family:sans-serif;max-width:560px;">
        <div style="background:#FEE2E2;border-left:4px solid #DC2626;padding:12px 16px;margin-bottom:24px;">
          <strong style="color:#991B1B;font-size:14px;">Amount mismatch: check before delivering</strong>
          <div style="color:#991B1B;font-size:13px;margin-top:2px;">
            The customer has NOT been sent a receipt.
          </div>
        </div>
        <h2 style="color:#0B1F3A;margin:0 0 16px;">${order.packageName}</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${row('Order ref', order.id)}
          ${row('Expected', money(order.amountKES))}
          ${row('Paid', paid)}
          ${row('Payment ref', providerRef ? esc(providerRef) : 'n/a')}
          ${row('Receipt', receipt ? esc(receipt) : 'n/a')}
          ${row('Name', order.name)}
          ${row('Email', order.email)}
          ${row('Phone', order.phone)}
        </table>
        <p style="margin-top:24px;font-size:13px;color:#6B7280;line-height:1.6;">
          Look the payment up in the Paystack dashboard. If it is genuinely short,
          refund it or ask the customer for the balance; if it is fine, reply to
          the customer yourself to confirm. The CV is on the earlier
          "awaiting payment" email for this ref.
        </p>
      </div>`,
  });
  if (error) console.error('Amount mismatch notification error:', error);
  return { ok: !error };
}

/**
 * Confirm a paid order: tells you, then receipts the customer.
 *
 * The customer receipt is attempted from the configured sender only, never the
 * sandbox address — onboarding@resend.dev can only deliver to the Resend
 * account owner, so sending a customer receipt from it is guaranteed to fail.
 * A failure there is logged, not thrown: the money has moved and the internal
 * record already exists, so it must not surface as a checkout error.
 *
 * → { ok } — whether the internal "PAID" email went out. That is the record
 * that matters for a retry decision; a failed receipt is logged above and
 * does not change it (see settlePayment).
 */
export async function markPaid({ order, receipt }) {
  // Card payments have no M-Pesa receipt; the Paystack reference stands in.
  const receiptLabel = order.method === 'card' ? 'Payment ref' : 'M-Pesa receipt';
  const resend = resendClient();
  const configuredFrom = process.env.NOTIFY_FROM || NOTIFY_FROM;
  const owner = process.env.NOTIFY_EMAIL || CONTACT_EMAIL;

  const { error } = await resend.emails.send({
    from: configuredFrom,
    to: owner,
    replyTo: order.email,
    subject: cleanHeader(`PAID · Order ${order.id} · ${order.packageName} · ${order.name}`),
    html: `
      <div style="font-family:sans-serif;max-width:560px;">
        <div style="background:#DCFCE7;border-left:4px solid #1D9E75;padding:12px 16px;margin-bottom:24px;">
          <strong style="color:#166534;font-size:14px;">Payment received</strong>
        </div>
        <h2 style="color:#0B1F3A;margin:0 0 16px;">${order.packageName}</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${row('Order ref', order.id)}
          ${row('Amount', money(order.amountKES))}
          ${order.serviceChargeKES ? row('Of which service charge', money(order.serviceChargeKES)) : ''}
          ${row(receiptLabel, receipt || 'n/a')}
          ${row('Name', order.name)}
          ${row('Email', order.email)}
          ${row('Phone', order.phone)}
        </table>
        <p style="margin-top:24px;font-size:13px;color:#6B7280;">
          The CV was attached to the earlier "awaiting payment" email for this ref.
        </p>
      </div>`,
  });
  if (error) console.error('Paid notification error:', error);

  try {
    const firstName = String(order.name || '').split(' ')[0] || 'there';
    const { error: receiptError } = await resend.emails.send({
      from: configuredFrom,
      to: order.email,
      replyTo: owner,
      subject: cleanHeader(`Payment confirmed · ${order.packageName} · CareerDataSolutions`),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0F172A;">
          <div style="height:4px;background:#C89A44;border-radius:2px;margin-bottom:28px;"></div>
          <h1 style="color:#0B1F3A;font-size:22px;margin:0 0 16px;">
            Thanks, ${firstName}, payment received.
          </h1>
          <p style="font-size:15px;line-height:1.7;color:#334155;margin:0 0 16px;">
            Your <strong>${order.packageName}</strong> order is confirmed and your CV is with us.
          </p>
          <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">
            ${row('Order ref', order.id)}
            ${row('Amount paid', money(order.amountKES))}
            ${order.serviceChargeKES
              ? row('Includes service charge', money(order.serviceChargeKES))
              : ''}
            ${row(receiptLabel, receipt || 'n/a')}
          </table>
          <p style="font-size:15px;line-height:1.7;color:#334155;margin:0 0 24px;">
            <strong style="color:#0B1F3A;">What happens next:</strong> we start work straight
            away and come back to you within ${order.timeline}. If we need anything else from
            you first, we will ask by reply to this email.
          </p>
          <p style="font-size:15px;line-height:1.7;color:#334155;margin:0 0 24px;">
            Questions in the meantime? Reply here, or message us on
            <a href="${WHATSAPP_URL}" style="color:#96702B;">WhatsApp</a>.
          </p>
          <p style="font-size:13px;line-height:1.6;color:#6B7280;margin:0;border-top:1px solid #E5E7EB;padding-top:16px;">
            CareerDataSolutions · Nairobi, Kenya<br />${SITE_DOMAIN}
          </p>
        </div>`,
    });
    if (receiptError) console.error('Customer receipt error:', receiptError);
  } catch (err) {
    console.error('Customer receipt error:', err);
  }

  return { ok: !error };
}

// ── Settling a payment ───────────────────────────────────────

/** Same amount, compared in Paystack's subunits so the check is integer
 *  arithmetic rather than floating point. Currency is only compared when the
 *  caller has one; every order here is billed in KES. */
function amountMatches(order, amount, currency) {
  if (currency && String(currency).toUpperCase() !== 'KES') return false;
  return Math.round(Number(amount) * 100) === Math.round(Number(order.amountKES) * 100);
}

/** Today's behaviour, used whenever there is no claim to rely on: the poll
 *  confirms the order it holds, the webhook emails you the payment unmatched.
 *  Either may duplicate the other, which is the price of having no store. */
async function settleWithoutClaim({ order, source, unmatched }) {
  if (source === 'poll' && order) {
    const sent = await markPaid({ order, receipt: unmatched.receipt });
    return { alreadySettled: false, ok: sent.ok, outcome: 'paid' };
  }
  const sent = await notifyUnmatchedPayment(unmatched);
  return { alreadySettled: false, ok: sent.ok, outcome: 'unmatched' };
}

/**
 * Settle a confirmed payment. The ONE path to the "paid" emails, called by
 * both the browser poll (api/order-status.js) and the webhook
 * (api/pay-callback.js), whichever gets there first.
 *
 * ── Exactly once ─────────────────────────────────────────────
 *
 * The poll can see the same payment as paid many times (a refresh, a second
 * tab, a response lost on the way back), and Paystack retries webhooks. So
 * the first thing this does is claim the payment with SET paid:<ref> NX. That
 * is atomic in Redis: of any number of concurrent callers, exactly one writes
 * the key. Everyone else gets { alreadySettled: true } and sends nothing.
 *
 * The winner then sends one of three things:
 *   - the order is known, and the amount matches (or the caller had no amount
 *     to compare): markPaid(), the "PAID" email and the customer receipt
 *   - the order is known, the amount or currency does not match: a "CHECK
 *     AMOUNT" email to you, and no receipt
 *   - the order cannot be found (KV empty or expired): the unmatched email
 *
 * ── When the email fails ─────────────────────────────────────
 *
 * If the email to you fails, the claim is released before returning, so the
 * next poll or the webhook retry can try again. Holding it would make the
 * retry a silent no-op and the payment would be confirmed nowhere. Releasing
 * it can mean the customer receives a second receipt if theirs did go out,
 * and a duplicate beats nothing. A failed customer receipt alone does not
 * release the claim: retrying would re-send your "PAID" email too, and the
 * usual cause (a mistyped address) does not get better with time.
 *
 * ── Without KV ───────────────────────────────────────────────
 *
 * No KV configured, or the claim call failing, means there is nothing to
 * de-duplicate against, so this behaves exactly as the code did before KV:
 * see settleWithoutClaim above.
 *
 * @param {object}  args
 * @param {object}  [args.order]       full order, when the caller has one (the
 *                                     poll does, from the signed token)
 * @param {string}  [args.orderId]     our id, when that is all the caller has
 * @param {string}  args.providerRef   the rail's payment reference — the key
 * @param {string}  [args.receipt]
 * @param {number}  [args.amount]      KES as the rail reports it, if it does
 * @param {string}  [args.currency]
 * @param {object}  [args.payer]       { phone, email } for the unmatched email
 * @param {'poll'|'webhook'} args.source
 *
 * → { alreadySettled, ok, outcome }, where ok is false only if the email to
 *   you failed to send, and outcome is 'paid' | 'mismatch' | 'unmatched' |
 *   'already-settled'. Throws only if Resend itself throws, after releasing
 *   the claim.
 */
export async function settlePayment({
  order, orderId, providerRef, receipt, amount, currency, payer = {}, source,
}) {
  const unmatched = {
    orderId: orderId ?? order?.id ?? null,
    providerRef,
    receipt,
    amount,
    phone: payer.phone ?? null,
    email: payer.email ?? null,
  };

  if (!providerRef || !kvAvailable()) {
    return settleWithoutClaim({ order, source, unmatched });
  }

  const claimKey = `paid:${providerRef}`;
  let claimed;
  try {
    claimed = await kv.set(claimKey, source, { ttlSeconds: ORDER_TTL_SECONDS, nx: true });
  } catch (err) {
    console.error(`[orders] Could not claim payment ${providerRef}; settling without a claim:`, err.message);
    return settleWithoutClaim({ order, source, unmatched });
  }

  if (!claimed) {
    console.log(`[orders] Payment ${providerRef} already settled; ${source} sends nothing.`);
    return { alreadySettled: true, ok: true, outcome: 'already-settled' };
  }

  const release = async () => {
    try {
      await kv.del(claimKey);
    } catch (err) {
      // Nothing more to do: the next attempt will find the claim held and
      // stop, and the error above this is already in the logs.
      console.error(`[orders] Could not release claim on ${providerRef}:`, err.message);
    }
  };

  try {
    // The token's copy is fine for the poll; the webhook has to look it up.
    // A passed-in order is trusted only for the payment it was issued for.
    const known =
      order && order.providerRef === providerRef ? order : await getOrder({ providerRef });

    let result;
    if (!known) {
      result = { ...(await notifyUnmatchedPayment(unmatched)), outcome: 'unmatched' };
    } else if (amount != null && !amountMatches(known, amount, currency)) {
      console.warn(
        `[orders] Amount mismatch on ${known.id} (${providerRef}): ` +
          `paid ${currency || 'KES'} ${amount}, expected KES ${known.amountKES}. No receipt sent.`
      );
      result = {
        ...(await notifyAmountMismatch({ order: known, providerRef, receipt, amount, currency })),
        outcome: 'mismatch',
      };
    } else {
      result = { ...(await markPaid({ order: known, receipt })), outcome: 'paid' };
    }

    if (!result.ok) await release();
    return { alreadySettled: false, ...result };
  } catch (err) {
    await release();
    throw err;
  }
}
