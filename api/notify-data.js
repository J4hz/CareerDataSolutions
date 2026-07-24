// Receives a discovery-call request from /data/contact and emails it to the
// team, then confirms to the sender. The career-side mirror of this is
// api/notify-career.js; the only structural difference is that there is no
// file upload here, so nothing is attached.
//
// Everything in req.body is attacker-controlled — the form is public and the
// endpoint can be hit directly with curl. Text is escaped via cleanText before
// it reaches the HTML body. See api/_lib/sanitize.js.
//
// Environment variables required (set in Vercel dashboard):
//   RESEND_API_KEY  — from resend.com/api-keys
//   NOTIFY_EMAIL    — email address to receive the requests
//   NOTIFY_FROM     — verified sender address in Resend

import { Resend } from 'resend';
import { CALENDLY_URL, CONTACT_EMAIL, NOTIFY_FROM, SITE_DOMAIN, WHATSAPP_URL } from '../src/config.js';
import { cleanText, cleanHeader, isValidEmail } from './_lib/sanitize.js';

// The three selects are closed sets. Mapping the submitted value through these
// means the email can only ever contain a label chosen here, never whatever
// string a hand-rolled request decided to send.
const DATA_LOCATION = {
  'spreadsheets':    'Excel / Google Sheets',
  'business-system': 'A business system (CRM, ERP, accounting)',
  'database':        'A database (SQL, Access)',
  'multiple':        'Multiple systems that do not talk to each other',
  'unsure':          'Not sure, needs help figuring this out',
};

const DATA_STATE = {
  'clean':       'Clean and consistent',
  'mostly-fine': 'Mostly fine, some gaps',
  'messy':       'Messy, needs work',
  'unsure':      'Not sure',
};

const EXISTING_REPORT = {
  'excel-report': 'Yes, an Excel report',
  'dashboard':    'Yes, a dashboard',
  'first':        'No, this would be the first one',
};

// Moved here off /data/contact, where it sat above the form and answered a
// question nobody has until after they have submitted. The confirmation email
// below is where it gets read. Static strings — nothing here is user input.
const NEXT_STEPS = [
  'We map your data sources against the decisions you are trying to make',
  'We flag anything that will affect scope or timeline before the call',
  'You get a link to book your free discovery call within 1 business day',
  'On the call we walk through what is possible and what it would cost',
  'No obligation. Quotes follow the discovery call, never the other way around',
];

// Table-based so Outlook keeps the bullet aligned with wrapped text; a flex or
// list-style layout is not reliable across email clients.
const nextStepsBlock = (accent) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"
         style="width:100%;border-collapse:separate;border:1px solid #E5E7EB;
                border-radius:10px;margin:0 0 24px;">
    <tr>
      <td style="padding:18px 20px;">
        <div style="font-size:13px;font-weight:700;color:#0B1F3A;margin-bottom:14px;">
          What happens after you submit
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          ${NEXT_STEPS.map((item) => `
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

  const { name, company, email, phone, goal, dataLocation, dataState, existingReport } =
    req.body ?? {};

  if (!name || !email || !phone || !goal || !dataLocation || !dataState || !existingReport) {
    return res.status(400).json({ error: 'Please complete every required field.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const location = DATA_LOCATION[dataLocation];
  const state    = DATA_STATE[dataState];
  const existing = EXISTING_REPORT[existingReport];
  if (!location || !state || !existing) {
    return res.status(400).json({ error: 'Please choose one of the listed options.' });
  }

  // From here on, only the cleaned values are used. Shadowing the raw names
  // means a later edit cannot reach past the escaping by accident.
  const safe = {
    name:    cleanText(name, { maxLength: 120 }),
    company: cleanText(company, { maxLength: 160 }),
    email:   cleanText(email, { maxLength: 254 }),
    phone:   cleanText(phone, { maxLength: 40 }),
    goal:    cleanText(goal, { maxLength: 2000, multiline: true }),
  };

  const row = (label, value) => `
    <tr>
      <td style="padding:10px 0;color:#6B7280;font-size:14px;width:180px;vertical-align:top;">
        ${label}</td>
      <td style="padding:10px 0;color:#0F172A;font-size:14px;">
        ${value}</td>
    </tr>`;

  try {
    const configuredFrom = process.env.NOTIFY_FROM || NOTIFY_FROM;
    let fromAddress = configuredFrom;
    const emailOptions = {
      from: fromAddress,
      to:   process.env.NOTIFY_EMAIL || CONTACT_EMAIL,
      replyTo: email,
      subject: cleanHeader(`New discovery call request: ${name}${company ? ` · ${company}` : ''}`),
      html: `
        <div style="font-family:sans-serif;max-width:560px;">
          <h2 style="color:#0B1F3A;">
            New discovery call request · Data Services
          </h2>
          <table style="width:100%;border-collapse:collapse;">
            ${row('Name', `<strong>${safe.name}</strong>`)}
            ${row('Organization', safe.company || 'Not provided')}
            ${row('Email', `<strong>${safe.email}</strong>`)}
            ${row('Phone / WhatsApp', safe.phone)}
            ${row('Wants to see', safe.goal)}
            ${row('Data lives in', location)}
            ${row('State of the data', state)}
            ${row('Replacing', existing)}
          </table>
          <div style="margin-top:24px;padding:14px 16px;background:#F8FAFC;
                      border-left:4px solid #1D9E75;">
            <div style="font-size:13px;font-weight:700;color:#0B1F3A;margin-bottom:4px;">
              Next step
            </div>
            <div style="font-size:13px;color:#334155;line-height:1.6;">
              Send this booking link once you have read the above:<br />
              <a href="${CALENDLY_URL}" style="color:#17805E;">${CALENDLY_URL}</a>
            </div>
          </div>
          <p style="margin-top:24px;font-size:13px;color:#6B7280;">
            Sent from ${SITE_DOMAIN}
          </p>
        </div>
      `,
    };

    let sendResult = await resend.emails.send(emailOptions);
    let error = sendResult.error;

    if (error && fromAddress !== 'onboarding@resend.dev') {
      console.warn(`Resend data failed with sender ${fromAddress}. Retrying with onboarding@resend.dev... Error:`, error);
      fromAddress = 'onboarding@resend.dev';
      emailOptions.from = fromAddress;
      const retryResult = await resend.emails.send(emailOptions);
      error = retryResult.error;
    }

    if (error) {
      console.error('Resend data error:', error);
      return res.status(502).json({ error: 'Failed to send request' });
    }

    // Confirmation to the requester. The important email has already sent, so a
    // failure here is logged rather than surfaced: a hiccup on the confirmation
    // must never make the visitor think their request failed. Always sent from
    // the configured address, never the sandbox fallback, which can only
    // deliver to the Resend account owner.
    try {
      const firstName = safe.name.split(' ')[0] || 'there';
      const { error: welcomeError } = await resend.emails.send({
        from:    configuredFrom,
        to:      email.trim(),
        replyTo: process.env.NOTIFY_EMAIL || CONTACT_EMAIL,
        subject: cleanHeader('Your discovery call request · CareerDataSolutions'),
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0F172A;">
            <div style="height:4px;background:#1D9E75;border-radius:2px;margin-bottom:28px;"></div>
            <h1 style="color:#0B1F3A;font-size:22px;margin:0 0 16px;">
              Thanks, ${firstName}, we have your request.
            </h1>
            <p style="font-size:15px;line-height:1.7;color:#334155;margin:0 0 16px;">
              This is a quick confirmation that your details reached
              CareerDataSolutions. There is nothing else you need to do right now.
            </p>
            ${nextStepsBlock('#1D9E75')}
            <p style="font-size:15px;line-height:1.7;color:#334155;margin:0 0 24px;">
              In a hurry? You can
              <a href="${CALENDLY_URL}" style="color:#17805E;">book a time directly</a>,
              or message us on
              <a href="${WHATSAPP_URL}" style="color:#17805E;">WhatsApp</a>.
            </p>
            <p style="font-size:13px;line-height:1.6;color:#6B7280;margin:0;border-top:1px solid #E5E7EB;padding-top:16px;">
              CareerDataSolutions · Nairobi, Kenya<br />
              ${SITE_DOMAIN}
            </p>
          </div>
        `,
      });
      if (welcomeError) console.error('Data confirmation email error:', welcomeError);
    } catch (welcomeErr) {
      console.error('Data confirmation email error:', welcomeErr);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend data error:', err);
    return res.status(500).json({ error: 'Failed to send request' });
  }
}
