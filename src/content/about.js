// ─────────────────────────────────────────────────────────────
// The single source of truth for the About page copy.
//
// Rendered by components/AboutSection.jsx on BOTH /career/about and
// /data/about. The two routes render this page IDENTICALLY: it is one
// shared About, so it does not take the surrounding shell's accent.
//
// Copy from "about-section-mockup Final.html", with two deliberate
// departures:
//
//   1. Em dashes are removed throughout. The site is deliberately
//      em-dash free (see the same note in components/Footer.jsx), so the
//      mockup's "— not vanity metrics" reads ", not vanity metrics" here
//      and the 8-dashboards label uses a colon.
//   2. The mockup's "Photo to be added" caption on the placeholder panel
//      is not carried over. It is a note to ourselves, and it would be
//      visible to every visitor.
//
// VOICE: third person, describing Kabiru as "he". The one exception is
// "every service we offer" below, which is how the mockup words it.
//
// The founder photo is still a placeholder monogram. Drop the real asset
// in src/assets/ and swap the panel in AboutSection.jsx.
// ─────────────────────────────────────────────────────────────

export const about = {
  eyebrow: 'The founder',

  pullQuote:
    '"Data and careers fail for the same reason: no one translated them properly."',

  /* Paragraphs before the two-track pivot below. */
  bioBefore: [
    'Kabiru is the founder of CareerDataSolutions. With 13+ years of hands-on experience in EMS operations, where split-second decisions depend on accurate data and clear reporting, he saw the same gap repeat itself in two places: businesses drowning in data they couldn’t turn into decisions, and skilled professionals whose experience never made it past an applicant tracking system.',
  ],

  /* The paragraph that names both tracks. Brighter and bolder than the body
     copy around it, but not colour-split: the page is monochrome. */
  pivot:
    'For businesses, that means dashboards built around decisions you actually need to make, not vanity metrics. For professionals, that means a CV and career strategy built around what actually gets you hired, not another template.',

  bioAfter: [
    'CareerDataSolutions was built to close both gaps, grounded in one belief: every service we offer should be built around a real, provable market need, not a trend.',
    'On the career side, he applies the same structured, data-first approach, treating a CV and job search like a dataset: what’s the signal, what’s the noise, what actually gets a recruiter’s attention.',
  ],

  /* Proof block: a claim, then the numbers behind it. */
  statBox: {
    quote:
      'In his role leading Data Analytics, he took a fragmented reporting environment to real-time, decision-ready dashboards and digitized processes across the organization. That’s the same rigor he brings to every dashboard and CV he builds.',
    stats: [
      { num: '8', label: 'dashboards deployed: 7 dept + 1 executive' },
      { num: '2', label: 'manual processes digitized and streamlined' },
      { num: '16', label: 'months in, still growing' },
    ],
  },

  /* Sentence case here; the uppercase look is CSS, so the strings stay
     readable and the first line can be emphasised on its own. */
  credentials: [
    'Kabiru Nyabwengi',
    'Founder, CareerDataSolutions',
    '13+ years · EMS operations',
    'Business intelligence analyst, healthcare analytics, career advancement strategist',
  ],

  /* Initials for the photo placeholder panel. */
  monogram: 'KN',
};
