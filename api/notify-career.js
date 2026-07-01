// Environment variables required (set in Vercel dashboard):
//   RESEND_API_KEY  — from resend.com/api-keys
//   NOTIFY_EMAIL    — email address to receive CV submissions
//   NOTIFY_FROM     — verified sender address in Resend
//
// For local dev (.env.local):
//   RESEND_API_KEY=re_xxxxxxxxxxxx
//   NOTIFY_EMAIL=contact@careerdatasolutions.co.ke
//   NOTIFY_FROM=onboarding@resend.dev

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name, email, phone,
    targetRole, targetMarket, experienceLevel,
    message, cvBase64, cvName, cvType,
  } = req.body;

  if (!name || !email || !cvBase64) {
    return res.status(400).json({
      error: 'Name, email and CV are required'
    });
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.NOTIFY_FROM || 'onboarding@resend.dev',
      to:   process.env.NOTIFY_EMAIL
            || 'contact@careerdatasolutions.co.ke',
      subject: `New CV submission: ${name} — ${targetRole}`,
      attachments: [{
        filename: cvName,
        content:  cvBase64,
      }],
      html: `
        <div style="font-family:sans-serif;max-width:560px;">
          <h2 style="color:#0B1F3A;">
            New CV submission — Career Services
          </h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;width:160px;">
                Name</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;font-weight:600;">
                ${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;">
                Email</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;font-weight:600;">
                ${email}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;">
                Phone</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;">
                ${phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;">
                Target role</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;font-weight:600;">
                ${targetRole}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;">
                Target market</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;">
                ${targetMarket}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;">
                Experience</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;">
                ${experienceLevel}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;vertical-align:top;">
                Notes</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;">
                ${message || 'None'}</td>
            </tr>
          </table>
          <p style="margin-top:24px;font-size:13px;
                    color:#6B7280;">
            CV attached · Sent from careerdatasolutions.co.ke
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend career error:', error);
      return res.status(502).json({ error: 'Failed to send submission' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend career error:', err);
    return res.status(500).json({
      error: 'Failed to send submission'
    });
  }
}
