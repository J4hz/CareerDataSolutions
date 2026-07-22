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
// notify-career.js, plus the optional PAYMENT_PROVIDER and ORDER_SECRET.

import { packages } from '../src/data/packages.js';
import { cleanText, isValidEmail, validateCvUpload } from './_lib/sanitize.js';
import { createOrder, newOrderId, signOrder } from './_lib/orders.js';
import { normalizeMsisdn, requestStkPush } from './_lib/payments.js';
import { resolveAmount } from './_lib/promo.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Server is not configured to take orders yet.' });
  }

  const { packageId, name, email, phone, message, promoCode, cvBase64, cvName, cvType } =
    req.body ?? {};

  if (!packageId || !name || !email || !phone || !cvBase64) {
    return res.status(400).json({ error: 'Please complete every field and attach your CV.' });
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

  const msisdn = normalizeMsisdn(phone);
  if (!msisdn) {
    return res.status(400).json({
      error: 'Enter a valid Kenyan mobile number, for example 0712 345 678.',
    });
  }

  const cv = validateCvUpload({ cvBase64, cvName, cvType });
  if (!cv.ok) {
    return res.status(400).json({ error: cv.error });
  }

  // Only the cleaned values are used from here. Shadowing the raw names means a
  // later edit cannot reach past the escaping by accident.
  const safe = {
    name: cleanText(name, { maxLength: 120 }),
    email: cleanText(email, { maxLength: 254 }),
    phone: cleanText(msisdn, { maxLength: 20 }),
    message: cleanText(message, { maxLength: 2000, multiline: true }),
    filename: cleanText(cv.filename, { maxLength: 100 }),
  };

  const id = newOrderId();

  // The charged amount is decided HERE, from the package plus the server-held
  // promo code. api/promo.js only told the browser what to display; it has no
  // say in what is billed.
  const { amountKES, promoApplied } = resolveAmount(pkg, promoCode);

  try {
    // The CV reaches the inbox before any payment is attempted, so a failed or
    // abandoned payment never costs us the submission.
    const stored = await createOrder({ id, pkg, safe, cv, amountKES, promoApplied });
    if (!stored.ok) {
      return res.status(502).json({ error: 'We could not save your order. Please try again.' });
    }

    const push = await requestStkPush({
      amount: amountKES,
      phone: msisdn,
      reference: id,
      description: `${pkg.name} · CareerDataSolutions`,
    });

    if (!push.ok) {
      // The order is already with us, so this is recoverable by hand rather
      // than a dead end for the customer.
      return res.status(502).json({
        error: push.error || 'We could not reach M-Pesa. We have your details and will follow up.',
        orderId: id,
      });
    }

    // Signed so the status poll can trust these values without a database.
    const token = signOrder({
      id,
      packageId: pkg.id,
      packageName: pkg.name,
      amountKES,
      promoApplied,
      timeline: pkg.timeline,
      name: safe.name,
      email: email.trim(),
      phone: msisdn,
      providerRef: push.providerRef,
    });

    return res.status(200).json({
      orderId: id,
      status: push.status,
      token,
      amountKES,
      promoApplied,
    });
  } catch (err) {
    console.error('Order error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
