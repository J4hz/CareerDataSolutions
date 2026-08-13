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
import { CALENDLY_URL, CONTACT_EMAIL, NOTIFY_FROM, SITE_DOMAIN, WHATSAPP_URL } from '../src/config.js';
import { cleanText, cleanHeader, isValidEmail, validateCvUpload } from './_lib/sanitize.js';
import { limited } from './_lib/rate-limit.js';

// Moved here off /career/contact, where it sat above the form and answered a
// question nobody has until after they have submitted. The welcome email below
// is where it gets read. `role` is the already-escaped safe.targetRole, folded
// into the first line so the list keeps the personalisation the prose had.
const nextSteps = (role) => [
  `We review your CV against your target role${role ? ` (${role})` : ''} and market`,
  'We identify the exact gaps holding you back',
  'You get a link to book your free discovery call within 1 business day',
  'On the call we walk you through what we found and what we recommend',
  'No obligation to purchase; the review and the call are free',
];

// Table-based so Outlook keeps the bullet aligned with wrapped text; a flex or
// list-style layout is not reliable across email clients.
const nextStepsBlock = (role, accent) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"
         style="width:100%;border-collapse:separate;border:1px solid #E5E7EB;
                border-radius:10px;margin:0 0 24px;">
    <tr>
      <td style="padding:18px 20px;">
        <div style="font-size:13px;font-weight:700;color:#0B1F3A;margin-bottom:14px;">
          What happens after you submit
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          ${nextSteps(role).map((item) => `
            <tr>
              <td style="padding:0 8px 10px 0;vertical-align:top;line-height:1.6;
                         font-size:14px;color:${accent};font-weight:700;">&bull;</td>
              <td style="padding:0 0 10px;font-size:14px;line-height:1.6;color:#334155;">
                ${item}</td>
            </tr>`).join('')}
        </table>
      </td>
    </tr>
  </table>`;

export default async function handler(req, res) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Resend API key is not configured' });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Each accepted call sends mail with an attachment. Unlimited, it is a way
  // to flood the team inbox and burn the Resend quota. Five in ten minutes
  // leaves room for a re-send after a bad upload.
  if (await limited(req, res, 'notify-career', { limit: 5, windowSeconds: 600 })) return;

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
    // The configured sender. The team notification below may fall back to the
    // Resend sandbox address if this one fails, but the applicant confirmation
    // never does — see the comment on that send.
    const configuredFrom = process.env.NOTIFY_FROM || NOTIFY_FROM;
    let fromAddress = configuredFrom;
    const emailOptions = {
      from: fromAddress,
      to:   process.env.NOTIFY_EMAIL || CONTACT_EMAIL,
      replyTo: email,
      subject: cleanHeader(`New CV submission: ${name} · ${targetRole}`),
      attachments: [{
        filename: cv.filename,
        content:  cv.buffer.toString('base64'),
      }],
      html: `
        <div style="font-family:sans-serif;max-width:560px;">
          <h2 style="color:#0B1F3A;">
            New CV submission · Career Services
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
          <div style="margin-top:24px;padding:14px 16px;background:#F8FAFC;
                      border-left:4px solid #C89A44;">
            <div style="font-size:13px;font-weight:700;color:#0B1F3A;
                        margin-bottom:4px;">
              Once you have reviewed the CV
            </div>
            <div style="font-size:13px;color:#334155;line-height:1.6;">
              Send this booking link to the applicant:<br />
              <a href="${CALENDLY_URL}" style="color:#96702B;">${CALENDLY_URL}</a>
            </div>
          </div>
          <p style="margin-top:24px;font-size:13px;
                    color:#6B7280;">
            Attached: ${safe.filename} · Sent from ${SITE_DOMAIN}
          </p>
        </div>
      `,
    };

    let sendResult = await resend.emails.send(emailOptions);
    let error = sendResult.error;

    if (error && fromAddress !== 'onboarding@resend.dev') {
      console.warn(`Resend career failed with sender ${fromAddress}. Retrying with onboarding@resend.dev... Error:`, error);
      fromAddress = 'onboarding@resend.dev';
      emailOptions.from = fromAddress;
      const retryResult = await resend.emails.send(emailOptions);
      error = retryResult.error;
    }

    if (error) {
      console.error('Resend career error:', error);
      return res.status(502).json({ error: 'Failed to send submission' });
    }

    // Welcome / confirmation to the applicant. The important email (the CV to
    // the team) has already sent, so a failure here is logged, not surfaced —
    // a hiccup on the confirmation must never make the visitor think their
    // submission failed. Interpolated values are the already-escaped `safe.*`
    // ones; the recipient address is the validated raw email.
    try {
      const toAddress = email.trim();
      const ownerAddress = process.env.NOTIFY_EMAIL || CONTACT_EMAIL;

      // Always the configured sender, never the sandbox fallback that the team
      // notification may have switched to. onboarding@resend.dev can only
      // deliver to the Resend account owner, so sending an applicant
      // confirmation from it is guaranteed to fail — better to attempt the real
      // address and log a real error than to send from one that cannot work.
      {
        const firstName = safe.name.split(' ')[0] || 'there';
        const { error: welcomeError } = await resend.emails.send({
          from:    configuredFrom,
          to:      toAddress,
          replyTo: ownerAddress,
          subject: cleanHeader("We've received your CV · CareerDataSolutions"),
          html: `
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0F172A;">
              <div style="height:4px;background:#C89A44;border-radius:2px;margin-bottom:28px;"></div>
              <h1 style="color:#0B1F3A;font-size:22px;margin:0 0 16px;">
                Thanks, ${firstName}, we've got your CV.
              </h1>
              <p style="font-size:15px;line-height:1.7;color:#334155;margin:0 0 16px;">
                This is a quick confirmation that your CV and details reached
                CareerDataSolutions. There is nothing else you need to do right now.
              </p>
              ${nextStepsBlock(safe.targetRole, '#C89A44')}
              <p style="font-size:15px;line-height:1.7;color:#334155;margin:0 0 24px;">
                Questions in the meantime? Just reply to this email, or message us on
                <a href="${WHATSAPP_URL}" style="color:#96702B;">WhatsApp</a>.
              </p>
              <p style="font-size:13px;line-height:1.6;color:#6B7280;margin:0;border-top:1px solid #E5E7EB;padding-top:16px;">
                CareerDataSolutions · Nairobi, Kenya<br />
                ${SITE_DOMAIN}
              </p>
            </div>
          `,
        });
        if (welcomeError) console.error('Welcome email error:', welcomeError);
      }
    } catch (welcomeErr) {
      console.error('Welcome email error:', welcomeErr);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend career error:', err);
    return res.status(500).json({
      error: 'Failed to send submission'
    });
  }
}
