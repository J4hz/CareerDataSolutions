// Receives a CV submission from /contact/career and emails it to the team.
//
// Everything in req.body is attacker-controlled — the form is public and the
// endpoint can be hit directly with curl. Text is escaped via cleanText before
// it reaches the HTML body, and the file is validated by content, not by what
// the client claims it is. See api/_lib/sanitize.js.
//
// Environment variables required (set in Vercel dashboard):
//   RESEND_API_KEY  — from resend.com/api-keys
//   NOTIFY_EMAIL    — email address to receive CV submissions
//   NOTIFY_FROM     — verified sender address in Resend
//
// For local dev (.env.local):
//   RESEND_API_KEY=re_xxxxxxxxxxxx
//   NOTIFY_EMAIL=kabiru@careerdatasolutions.com
//   NOTIFY_FROM=onboarding@resend.dev

import { Resend } from 'resend';
import { CONTACT_EMAIL, NOTIFY_FROM, SITE_DOMAIN } from '../src/config.js';
import { cleanText, cleanHeader, isValidEmail, validateCvUpload } from './_lib/sanitize.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name, email, phone,
    targetRole, targetMarket, experienceLevel,
    careerGoals, message, cvBase64, cvName, cvType,
  } = req.body ?? {};

  if (!name || !email || !phone || !targetRole || !targetMarket
      || !experienceLevel || !careerGoals || !message || !cvBase64) {
    return res.status(400).json({
      error: 'All fields and CV are required'
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const cv = validateCvUpload({ cvBase64, cvName, cvType });
  if (!cv.ok) {
    // Rejected outright: nothing is forwarded, nothing is silently dropped.
    return res.status(400).json({ error: cv.error });
  }

  // From here on, only the cleaned values are used. Shadowing the raw names
  // means a later edit can't reach past the escaping by accident.
  const safe = {
    name:            cleanText(name, { maxLength: 120 }),
    email:           cleanText(email, { maxLength: 254 }),
    phone:           cleanText(phone, { maxLength: 40 }),
    targetRole:      cleanText(targetRole, { maxLength: 160 }),
    targetMarket:    cleanText(targetMarket, { maxLength: 60 }),
    experienceLevel: cleanText(experienceLevel, { maxLength: 40 }),
    careerGoals:     cleanText(careerGoals, { maxLength: 2000, multiline: true }),
    message:         cleanText(message, { maxLength: 2000, multiline: true }),
    filename:        cleanText(cv.filename, { maxLength: 100 }),
  };

  try {
    const { error } = await resend.emails.send({
      from: process.env.NOTIFY_FROM || NOTIFY_FROM,
      to:   process.env.NOTIFY_EMAIL || CONTACT_EMAIL,
      replyTo: email,
      subject: cleanHeader(`New CV submission: ${name} — ${targetRole}`),
      attachments: [{
        filename: cv.filename,
        content:  cv.buffer.toString('base64'),
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
                ${safe.name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;">
                Email</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;font-weight:600;">
                ${safe.email}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;">
                Phone</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;">
                ${safe.phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;">
                Target role</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;font-weight:600;">
                ${safe.targetRole}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;">
                Target market</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;">
                ${safe.targetMarket}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;">
                Experience</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;">
                ${safe.experienceLevel}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;vertical-align:top;">
                Career goals</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;">
                ${safe.careerGoals}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;
                         font-size:14px;vertical-align:top;">
                Notes</td>
              <td style="padding:10px 0;color:#0F172A;
                         font-size:14px;">
                ${safe.message}</td>
            </tr>
          </table>
          <p style="margin-top:24px;font-size:13px;
                    color:#6B7280;">
            Attached: ${safe.filename} · Sent from ${SITE_DOMAIN}
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
