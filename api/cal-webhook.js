// Environment variables required (set in Vercel dashboard):
//   CAL_WEBHOOK_SECRET — the secret you set when creating the webhook below
//   RESEND_API_KEY     — from resend.com/api-keys
//   NOTIFY_FROM        — verified sender address in Resend
//
// SETUP CHECKLIST:
// 1. In cal.com: Settings > Developer > Webhooks > New Webhook
// 2. Subscriber URL: https://<your-domain>/api/cal-webhook
// 3. Event trigger: check only "Booking Created"
// 4. Set a Secret — generate a random string and put the same value in
//    Vercel as CAL_WEBHOOK_SECRET
// 5. Save. Cal.com will now POST here server-to-server whenever someone
//    books, independent of whether the browser tab is still open.

import crypto from 'node:crypto';
import { Resend } from 'resend';
import { EMAIL_LOGO_URL, NOTIFY_FROM, CONTACT_EMAIL, NOTIFY_EMAIL } from '../src/config.js';
import { cleanText, isValidEmail } from './_lib/sanitize.js';

export const config = {
  api: { bodyParser: false },
};

// Resend client is initialized inside handler to avoid startup errors if key is missing.

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function isValidSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const signatureBuf = Buffer.from(signature, 'utf8');
  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

function responseValue(field) {
  if (field && typeof field === 'object' && 'value' in field) return field.value;
  return field;
}

export default async function handler(req, res) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Resend API key is not configured' });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers['x-cal-signature-256'];

  if (!isValidSignature(rawBody, signature, process.env.CAL_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (event.triggerEvent !== 'BOOKING_CREATED') {
    return res.status(200).json({ ok: true, skipped: true });
  }

  const booking = event.payload || {};
  const attendee = booking.attendees?.[0] || {};
  const email = attendee.email;

  // The HMAC proves the payload came from Cal.com — it says nothing about the
  // *contents*, which the booker typed into a public booking form. Escape them
  // like any other untrusted input before they reach the HTML body.
  const name = cleanText(attendee.name, { maxLength: 120 }) || 'there';
  const reason = cleanText(responseValue(booking.responses?.reason), {
    maxLength: 500,
    multiline: true,
  });

  if (!email || !isValidEmail(email)) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  try {
    const fromAddress = process.env.NOTIFY_FROM || NOTIFY_FROM;
    const isSandbox = fromAddress.includes('onboarding@resend.dev');
    const toAddress = email.trim();
    const ownerAddress = process.env.NOTIFY_EMAIL || CONTACT_EMAIL;

    if (isSandbox && toAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
      console.log(`Skipping webhook confirmation email to attendee ${toAddress} because Resend is in sandbox mode (can only send to verified owner address ${ownerAddress}).`);
      return res.status(200).json({ ok: true, sandboxSkipped: true });
    }

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      subject: "You're booked with CareerDataSolutions",
      html: `
        <div style="font-family: sans-serif; max-width: 560px;">
          <img src="${EMAIL_LOGO_URL}" alt="CareerDataSolutions" width="200" height="100" style="display: block; margin-bottom: 24px;" />
          <h2 style="color: #0B1F3A;">Thanks for booking, ${name}!</h2>
          <p style="color: #0F172A; font-size: 14px; line-height: 1.6;">
            Your discovery call is confirmed. Cal.com has already sent you a
            separate calendar invite with the exact time and video link.
          </p>
          <p style="color: #0F172A; font-size: 14px; line-height: 1.6;">
            ${reason
              ? `We'll come prepared to talk about: ${reason}.`
              : `Feel free to reply here with anything you'd like us to prepare for before the call.`}
          </p>
          <p style="margin-top: 24px; font-size: 13px; color: #6B7280;">
            — CareerDataSolutions
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Welcome email error:', error);
      return res.status(502).json({ error: 'Failed to send welcome email' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Welcome email error:', err);
    return res.status(500).json({ error: 'Failed to send welcome email' });
  }
}
