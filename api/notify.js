// Environment variables required (set in Vercel dashboard):
//   RESEND_API_KEY  — from resend.com/api-keys
//   NOTIFY_EMAIL    — email address to receive booking alerts
//   NOTIFY_FROM     — verified sender address in Resend
//
// For local dev, create a .env.local file at the project root:
//   RESEND_API_KEY=re_xxxxxxxxxxxx
//   NOTIFY_EMAIL=kabiru@careerdatasolutions.com
//   NOTIFY_FROM=onboarding@resend.dev

// SETUP CHECKLIST:
// 1. Go to cal.com and create a free account
// 2. Create an event type called "Discovery Call" (30 minutes)
// 3. Update CAL_LINK in src/config.js with your username/event-slug
//    Example: "kabiru-nyabwengi/discovery-call"
// 4. Go to resend.com and create a free account
// 5. Get your API key from resend.com/api-keys
// 6. In Vercel dashboard: Settings > Environment Variables
//    Add: RESEND_API_KEY, NOTIFY_EMAIL, NOTIFY_FROM
// 7. If using a custom domain for NOTIFY_FROM, verify it in Resend
//    Until then, use: onboarding@resend.dev as NOTIFY_FROM

import { Resend } from 'resend';
import { CONTACT_EMAIL, NOTIFY_FROM, SITE_DOMAIN } from '../src/config.js';
import { cleanText, cleanHeader, isValidEmail } from './_lib/sanitize.js';
import { limited } from './_lib/rate-limit.js';

export default async function handler(req, res) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Resend API key is not configured' });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Every accepted call sends mail to the team inbox on Resend's quota, and
  // nothing here is authenticated. Same five in ten minutes as the two
  // notify-* routes; no browser code posts here at all any more (cal-webhook
  // took over booking alerts), so even that is generous.
  if (await limited(req, res, 'notify', { limit: 5, windowSeconds: 600 })) return;

  const { name, email, phone, reason, discussion } = req.body ?? {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // This endpoint is public: everything below is escaped before it reaches
  // the HTML body. See api/_lib/sanitize.js.
  const safe = {
    name:       cleanText(name, { maxLength: 120 }),
    email:      cleanText(email, { maxLength: 254 }),
    phone:      cleanText(phone, { maxLength: 40 }),
    reason:     cleanText(reason, { maxLength: 500, multiline: true }),
    discussion: cleanText(discussion, { maxLength: 2000, multiline: true }),
  };

  try {
    let fromAddress = process.env.NOTIFY_FROM || NOTIFY_FROM;
    const emailOptions = {
      from: fromAddress,
      to:   process.env.NOTIFY_EMAIL || CONTACT_EMAIL,
      replyTo: email,
      subject: cleanHeader(`New discovery call booked: ${name}`),
      html: `
        <div style="font-family: sans-serif; max-width: 560px;">
          <h2 style="color: #0B1F3A;">New booking from CareerDataSolutions</h2>
          <table style="width:100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #6B7280; font-size: 14px;
                         width: 120px;">Name</td>
              <td style="padding: 10px 0; color: #0F172A; font-size: 14px;
                         font-weight: 600;">${safe.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">
                Email</td>
              <td style="padding: 10px 0; color: #0F172A; font-size: 14px;
                         font-weight: 600;">${safe.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">
                Phone</td>
              <td style="padding: 10px 0; color: #0F172A; font-size: 14px;
                         font-weight: 600;">${safe.phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6B7280; font-size: 14px;
                         vertical-align: top;">Reason</td>
              <td style="padding: 10px 0; color: #0F172A; font-size: 14px;">
                ${safe.reason || 'Not provided'}</td>
            </tr>
            ${safe.discussion ? `
            <tr>
              <td style="padding: 10px 0; color: #6B7280; font-size: 14px;
                         vertical-align: top;">Discussion</td>
              <td style="padding: 10px 0; color: #0F172A; font-size: 14px;">
                ${safe.discussion}
              </td>
            </tr>` : ''}
          </table>
          <p style="margin-top: 24px; font-size: 13px; color: #6B7280;">
            Sent from ${SITE_DOMAIN}
          </p>
        </div>
      `,
    };

    let sendResult = await resend.emails.send(emailOptions);
    let error = sendResult.error;

    if (error && fromAddress !== 'onboarding@resend.dev') {
      console.warn(`Resend failed with sender ${fromAddress}. Retrying with onboarding@resend.dev... Error:`, error);
      fromAddress = 'onboarding@resend.dev';
      emailOptions.from = fromAddress;
      const retryResult = await resend.emails.send(emailOptions);
      error = retryResult.error;
    }

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'Failed to send notification' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
