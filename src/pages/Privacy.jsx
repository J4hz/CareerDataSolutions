import LegalPage from '../components/LegalPage';

/**
 * SCAFFOLD ONLY — there is no policy here yet, by design.
 *
 * The site collects personal data today (CV uploads in /career/order, phone
 * numbers for M-Pesa, email addresses on every form) with no published
 * privacy policy. This route exists so that publishing one is a content
 * swap rather than a development task.
 *
 * The text is pending advocate review per the pre-launch checklist. It is
 * deliberately NOT drafted, paraphrased or generated here: a policy that
 * merely reads like a policy is worse than an obvious placeholder, because
 * it looks finished. The route is noindex in src/seo/meta.js until real
 * text lands.
 */
export default function Privacy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      sections={[
        {
          heading: 'What this page will cover',
          body:
            'The reviewed policy will set out what personal data CareerDataSolutions collects, why, how long it is kept, who it is shared with, and how to ask for a copy or its deletion.',
        },
        {
          heading: 'Data the site collects today',
          body:
            'CV uploads and contact details submitted through the career forms, the phone number used for M-Pesa payment, and the email address and message submitted through the contact forms.',
        },
      ]}
    />
  );
}
