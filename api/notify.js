// Environment variables required (set in Vercel dashboard):
//   RESEND_API_KEY  — from resend.com/api-keys
//   NOTIFY_EMAIL    — email address to receive booking alerts
//   NOTIFY_FROM     — verified sender address in Resend
//
// For local dev, create a .env.local file at the project root:
//   RESEND_API_KEY=re_xxxxxxxxxxxx
//   NOTIFY_EMAIL=careerdatasolutions@gmail.com
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

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, reason, discussion } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.NOTIFY_FROM || 'onboarding@resend.dev',
      to:   process.env.NOTIFY_EMAIL || 'careerdatasolutions@gmail.com',
      subject: `New discovery call booked: ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px;">
          <h2 style="color: #0B1F3A;">New booking from CareerDataSolutions</h2>
          <table style="width:100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #6B7280; font-size: 14px;
                         width: 120px;">Name</td>
              <td style="padding: 10px 0; color: #0F172A; font-size: 14px;
                         font-weight: 600;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">
                Email</td>
              <td style="padding: 10px 0; color: #0F172A; font-size: 14px;
                         font-weight: 600;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">
                Phone</td>
              <td style="padding: 10px 0; color: #0F172A; font-size: 14px;
                         font-weight: 600;">${phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6B7280; font-size: 14px;
                         vertical-align: top;">Reason</td>
              <td style="padding: 10px 0; color: #0F172A; font-size: 14px;">
                ${reason || 'Not provided'}</td>
            </tr>
            ${discussion ? `
            <tr>
              <td style="padding: 10px 0; color: #6B7280; font-size: 14px;
                         vertical-align: top;">Discussion</td>
              <td style="padding: 10px 0; color: #0F172A; font-size: 14px;">
                ${discussion}
              </td>
            </tr>` : ''}
          </table>
          <p style="margin-top: 24px; font-size: 13px; color: #6B7280;">
            Sent from careerdatasolutions.co.ke
          </p>
        </div>
      `,
    });

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
