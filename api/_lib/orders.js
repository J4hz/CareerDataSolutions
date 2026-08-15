// ─────────────────────────────────────────────────────────────
// Order records for the career checkout.
//
// THIS IS THE ONLY FILE THAT KNOWS WHERE AN ORDER LIVES. api/order.js,
// api/order-status.js and api/pay-callback.js call the functions below and
// never touch storage directly.
//
// ── Why there is no database ─────────────────────────────────
//
// An STK push is asynchronous: one request asks the rail to ring the phone,
// and a *separate* request minutes later says whether it was paid. Serverless
// functions share no memory between the two, so something has to remember what
// order #abc was.
//
// Rather than add a datastore for that alone, the order is carried by the
// client in a signed token (sign/verify below). The browser holds it as an
// opaque string and posts it back when polling; the HMAC proves the contents
// are the ones this server issued, so the amount, package and customer cannot
// be edited in the round trip. The CV is emailed at creation and never needs
// to be held anywhere.
//
// ── Swapping in a real store ─────────────────────────────────
//
// If you later want order history, an admin view, or protection against a
// duplicate callback double-firing the emails, add Upstash/Vercel KV and give
// createOrder a `KV.set(id, order)` plus a `getOrder(id)` that reads it back.
// The signed token can stay as the client-side handle. Nothing outside this
// file changes.
// ─────────────────────────────────────────────────────────────

import crypto from 'node:crypto';
import { Resend } from 'resend';
import { CONTACT_EMAIL, NOTIFY_FROM, SITE_DOMAIN, WHATSAPP_URL } from '../../src/config.js';
import { cleanHeader } from './sanitize.js';

/** Tokens stop verifying after this long, so an abandoned checkout tab cannot
 *  be replayed days later. Comfortably longer than any STK prompt. */
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

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
export async function createOrder({ id, pkg, safe, cv, amountKES, promoApplied, foundingApplied }) {
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
            An M-Pesa prompt has been sent. You will get a second email if it is paid.
          </div>
        </div>
        <h2 style="color:#0B1F3A;margin:0 0 16px;">New order · ${pkg.name}</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${row('Order ref', id)}
          ${row('Package', `${pkg.name} (${pkg.tier})`)}
          ${row(
            'Amount',
            // Anything other than the list price is called out with what the
            // list price was, so a figure in your inbox is never just lower
            // than expected with no explanation attached to it.
            promoApplied
              ? `${money(amountKES)} <span style="color:#B45309;font-weight:600;">(PROMO CODE · list price ${money(pkg.amountKES)})</span>`
              : foundingApplied
                ? `${money(amountKES)} <span style="color:#B45309;font-weight:600;">(FOUNDING RATE · list price ${money(pkg.amountKES)})</span>`
                : money(amountKES)
          )}
          ${row('Name', safe.name)}
          ${row('Email', safe.email)}
          ${row('M-Pesa phone', safe.phone)}
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
 * A confirmed M-Pesa payment that could not be tied to an order.
 *
 * Daraja's callback echoes CheckoutRequestID, amount, phone and receipt, but
 * not the AccountReference and not our order token — so with no store there is
 * nothing to join on. See the note at the top of api/pay-callback.js.
 *
 * Normally harmless: the browser poll has usually already confirmed the same
 * payment and receipted the customer, making this a duplicate you can ignore.
 * It earns its place when the customer closed the tab mid-payment, which is the
 * one case where nothing else would tell you the money arrived.
 */
export async function notifyUnmatchedPayment({ providerRef, receipt, amount, phone }) {
  const resend = resendClient();
  const from = process.env.NOTIFY_FROM || NOTIFY_FROM;

  const { error } = await resend.emails.send({
    from,
    to: process.env.NOTIFY_EMAIL || CONTACT_EMAIL,
    subject: cleanHeader(`M-Pesa payment received · ${receipt || providerRef}`),
    html: `
      <div style="font-family:sans-serif;max-width:560px;">
        <div style="background:#DCFCE7;border-left:4px solid #1D9E75;padding:12px 16px;margin-bottom:24px;">
          <strong style="color:#166534;font-size:14px;">M-Pesa confirmed a payment</strong>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${row('Receipt', receipt || 'n/a')}
          ${row('Amount', amount ? money(amount) : 'n/a')}
          ${row('Paid by', phone ? String(phone) : 'n/a')}
          ${row('Checkout ID', providerRef || 'n/a')}
        </table>
        <p style="margin-top:24px;font-size:13px;color:#6B7280;line-height:1.6;">
          Match this to the "AWAITING PAYMENT" email with the same phone number to
          find the order and the CV.<br /><br />
          If the customer stayed on the page, they have already had their receipt
          and you will have a "PAID" email for this order too, in which case this
          message is a duplicate and can be ignored.
        </p>
      </div>`,
  });
  if (error) console.error('Unmatched payment notification error:', error);
}

/**
 * Confirm a paid order: tells you, then receipts the customer.
 *
 * The customer receipt is attempted from the configured sender only, never the
 * sandbox address — onboarding@resend.dev can only deliver to the Resend
 * account owner, so sending a customer receipt from it is guaranteed to fail.
 * A failure there is logged, not thrown: the money has moved and the internal
 * record already exists, so it must not surface as a checkout error.
 */
export async function markPaid({ order, receipt }) {
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
          ${row('M-Pesa receipt', receipt || 'n/a')}
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
            ${row('M-Pesa receipt', receipt || 'n/a')}
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
}
