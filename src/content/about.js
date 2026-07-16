// ─────────────────────────────────────────────────────────────
// The single source of truth for the About page copy.
//
// Rendered by components/AboutSection.jsx on BOTH /career/about and
// /data/about — the two routes share this content exactly; only the
// accent colour of the surrounding shell differs. Edit the words here,
// never in the component.
//
// Copy ported from reference/careerdatasolutions-rebuild.html (.about
// section).
//
// ⚠ Two things in the reference were flagged rather than carried over
//   silently:
//   1. The founder photo in the reference is a placeholder base64 image.
//      AboutSection renders a styled monogram panel until the real
//      photo asset is supplied — drop it in src/assets/ and wire it up
//      in AboutSection.jsx.
//   2. The credentials block says "13 YEARS · EMS OPERATIONS" while the
//      rest of the site says 12 years. The reference copy is used here
//      verbatim; confirm which number is right and reconcile.
// ─────────────────────────────────────────────────────────────

export const about = {
  eyebrow: 'The founder',

  pullQuote:
    '"Data and careers fail for the same reason: no one translated them properly."',

  bio: [
    'Kabiru is the founder of CareerDataSolutions. After 13 years of hands-on experience in EMS operations — where split-second decisions depended on accurate data and clear reporting — he saw the same gap repeat itself in two places: businesses drowning in data they couldn’t turn into decisions, and skilled professionals whose experience never made it past an applicant tracking system.',
    'CareerDataSolutions was built to close both gaps, grounded in one belief: every service we offer should be built around a real, provable market need — not a trend.',
  ],

  mission:
    'The same discipline that kept operations running under pressure now goes into every dashboard and CV we deliver.',

  credentials: [
    'KABIRU NYABWENGI',
    'FOUNDER, CAREERDATASOLUTIONS',
    '13 YEARS · EMS OPERATIONS',
    'DATA ANALYST & CAREER ADVANCEMENT STRATEGIST',
  ],

  /* Initials for the photo placeholder panel. Swap for the real image —
     see the note at the top of this file. */
  monogram: 'KN',
};
