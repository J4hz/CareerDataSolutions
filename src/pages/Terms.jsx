import LegalPage from '../components/LegalPage';

/**
 * SCAFFOLD ONLY — see the note in Privacy.jsx; the same reasoning applies.
 *
 * A reviewed Terms of Service / Scope of Work document already exists
 * separately, per the pre-launch checklist. It has simply never been
 * published as a page. This route is where it goes, so publishing is a
 * paste rather than a build.
 *
 * Nothing here is drafted or paraphrased from that document — its wording
 * is the reviewed artefact and this file must not pre-empt it. noindex in
 * src/seo/meta.js until it lands.
 */
export default function Terms() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      sections={[
        {
          heading: 'What this page will cover',
          body:
            'The reviewed terms will set out the scope of each engagement, what is delivered and when, revision rounds, payment and deposit terms, and how either side ends an engagement.',
        },
        {
          heading: 'Where the text comes from',
          body:
            'A Terms of Service and Scope of Work document has already been reviewed and exists outside this repository. Publishing is a matter of moving that wording here.',
        },
      ]}
    />
  );
}
