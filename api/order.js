// Creates a career package order: validates the submission, emails it with the
// CV attached, and asks the payment rail to ring the customer's phone.
//
// Everything in req.body is attacker-controlled — the form is public and this
// endpoint can be hit directly with curl. Two consequences drive the code below:
//
//   1. The amount is NEVER read from the request. The client sends a package
//      id; the price comes from src/data/packages.js on this side. Otherwise
//      anyone could buy a KES 15,000 package for one shilling.
//   2. Text is escaped before it reaches an HTML email body, and the CV is
//      validated by its actual bytes rather than the type the client claims.
//      See api/_lib/sanitize.js.
//
// Environment variables: RESEND_API_KEY, NOTIFY_EMAIL, NOTIFY_FROM as in
// notify-career.js, plus the optional PAYMENT_PROVIDER and ORDER_SECRET, and
// the KV variables described in api/_lib/kv.js.

import { packages } from '../src/data/packages.js';
import { cleanText, isValidEmail, validateCvUpload } from './_lib/sanitize.js';
import { createOrder, newOrderId, saveOrder, signOrder } from './_lib/orders.js';
import {
  normalizeMsisdn,
  requestStkPush,
  startCardCheckout,
  supportsCard,
} from './_lib/payments.js';
import { resolveAmount } from './_lib/promo.js';
import { limited } from './_lib/rate-limit.js';
import { SITE_DOMAIN, SITE_URL } from '../src/config.js';
import { withServiceCharge } from '../src/data/pricing.js';

/**
 * Where the card checkout sends the customer back to. Follows the request's
 * host so a preview deploy returns to itself, but only for hosts that are
 * ours — anything else falls back to the production site.
 */
function returnUrl(req, pkgId) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
  const ours =
    host === SITE_DOMAIN ||
    host === `www.${SITE_DOMAIN}` ||
    host.endsWith('.vercel.app') ||
    /^localhost(:\d+)?$/.test(host);
  const origin = !ours ? SITE_URL : host.startsWith('localhost') ? `http://${host}` : `https://${host}`;
  return `${origin}/career/order?pkg=${encodeURIComponent(pkgId)}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // The tightest limit on the site. A successful call makes someone's phone
  // ring with an M-Pesa prompt, so an unlimited endpoint is a way to harass
  // a stranger's handset using our payment account — quite apart from the
  // email and the STK push each attempt costs us. Five in ten minutes is
  // far above what a real buyer needs, including retries after a typo.
  if (await limited(req, res, 'order', { limit: 5, windowSeconds: 600 })) return;
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Server is not configured to take orders yet.' });
  }

  const { packageId, name, email, phone, message, promoCode, cvBase64, cvName, cvType } =
    req.body ?? {};
  const method = req.body?.method === 'card' ? 'card' : 'mpesa';

  // Paying for someone else. name/email/phone above are then the payer's, and
  // the recipient is the client the work is for. The payer may not have the
  // recipient's CV, so it is optional here: markPaid() emails the recipient
  // to ask for it.
  const gift = req.body?.forWhom === 'other';
  const { recipientName, recipientEmail, recipientPhone } = req.body ?? {};

  // A card payer has no M-Pesa prompt to receive, so the phone is optional.
  if (!packageId || !name || !email || (method === 'mpesa' && !phone)) {
    return res.status(400).json({ error: 'Please complete every field.' });
  }
  if (!gift && !cvBase64) {
    return res.status(400).json({ error: 'Please attach your CV.' });
  }
  if (gift && (!recipientName || !recipientEmail)) {
    return res.status(400).json({
      error: 'Please enter the name and email of the person this is for.',
    });
  }

  if (method === 'card' && !supportsCard()) {
    return res.status(400).json({ error: 'Card payments are not available yet. Please use M-Pesa.' });
  }

  // The package is the price. Only career packages are purchasable — the data
  // track is still "coming soon" (see src/App.jsx).
  const pkg = packages.find((p) => p.id === packageId && p.track === 'career');
  if (!pkg) {
    return res.status(400).json({ error: 'That package is not available.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (gift && !isValidEmail(recipientEmail)) {
    return res.status(400).json({
      error: 'Please enter a valid email address for the person this is for.',
    });
  }

  // Card payers may be abroad, so their number is kept as typed for contact
  // rather than forced into Kenyan form.
  const msisdn = method === 'mpesa' ? normalizeMsisdn(phone) : normalizeMsisdn(phone) || phone || '';
  if (method === 'mpesa' && !msisdn) {
    return res.status(400).json({
      error: 'Enter a valid Kenyan mobile number, for example 0712 345 678.',
    });
  }

  // Absent only on a gift order (checked above); anything sent is validated.
  const cv = cvBase64 ? validateCvUpload({ cvBase64, cvName, cvType }) : null;
  if (cv && !cv.ok) {
    return res.status(400).json({ error: cv.error });
  }

  // Only the cleaned values are used from here. Shadowing the raw names means a
  // later edit cannot reach past the escaping by accident.
  const safe = {
    name: cleanText(name, { maxLength: 120 }),
    email: cleanText(email, { maxLength: 254 }),
    phone: cleanText(msisdn, { maxLength: 20 }),
    message: cleanText(message, { maxLength: 2000, multiline: true }),
    filename: cv ? cleanText(cv.filename, { maxLength: 100 }) : '',
  };

  // Kept as typed, like a card payer's phone: the recipient may be abroad and
  // is only ever contacted, never charged.
  const recipient = gift
    ? {
        name: cleanText(recipientName, { maxLength: 120 }),
        email: String(recipientEmail).trim(),
        phone: cleanText(normalizeMsisdn(recipientPhone) || recipientPhone || '', {
          maxLength: 20,
        }),
      }
    : null;

  const id = newOrderId();

  // The charged amount is decided HERE, from the package plus the server-held
  // promo code. api/promo.js only told the browser what to display; it has no
  // say in what is billed.
  const priced = resolveAmount(pkg, promoCode);
  const { promoApplied, foundingApplied } = priced;

  // The payment method's service charge goes on top of whatever the package
  // came to. amountKES from here on is the full amount billed.
  const baseKES = priced.amountKES;
  const { totalKES: amountKES, serviceChargeKES } = withServiceCharge(baseKES, method);

  try {
    // The CV reaches the inbox before any payment is attempted, so a failed or
    // abandoned payment never costs us the submission.
    const stored = await createOrder({
      id, pkg, safe, cv, recipient, amountKES, baseKES, serviceChargeKES, promoApplied,
      foundingApplied, method,
    });
    if (!stored.ok) {
      return res.status(502).json({ error: 'We could not save your order. Please try again.' });
    }

    const push =
      method === 'card'
        ? await startCardCheckout({
            amount: amountKES,
            email: email.trim(),
            reference: id,
            callbackUrl: returnUrl(req, pkg.id),
          })
        : await requestStkPush({
            amount: amountKES,
            phone: msisdn,
            email: email.trim(), // Paystack requires one; Daraja ignores it
            reference: id,
            description: `${pkg.name} · CareerDataSolutions`,
          });

    if (!push.ok) {
      // The order is already with us, so this is recoverable by hand rather
      // than a dead end for the customer.
      return res.status(502).json({
        error:
          push.error ||
          (method === 'card'
            ? 'We could not start the card payment. We have your details and will follow up.'
            : 'We could not reach M-Pesa. We have your details and will follow up.'),
        orderId: id,
      });
    }

    const order = {
      id,
      packageId: pkg.id,
      packageName: pkg.name,
      amountKES,
      serviceChargeKES,
      promoApplied,
      timeline: pkg.timeline,
      name: safe.name,
      email: email.trim(),
      phone: safe.phone,
      method,
      providerRef: push.providerRef,
      // Gift orders only. The recipient's email is the validated raw address,
      // like the payer's; everything else in here is already escaped.
      recipient,
      cvAttached: Boolean(cv),
    };

    // Stored so the payment webhook can find it if the browser never comes
    // back. Best effort: without KV, or with KV down, the token below still
    // carries everything the status poll needs.
    await saveOrder(order);

    // Signed so the status poll can trust these values without a lookup.
    const token = signOrder(order);

    return res.status(200).json({
      orderId: id,
      status: 'pending',
      token,
      // Card only: where to send the browser to enter card details.
      authorizationUrl: push.authorizationUrl,
      amountKES,
      serviceChargeKES,
      promoApplied,
      foundingApplied,
    });
  } catch (err) {
    console.error('Order error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
