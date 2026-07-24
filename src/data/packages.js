// `priceKES` / `priceUSD` are display strings and are the only thing the UI
// shows. `amountKES` is the authoritative integer the server charges — api/order.js
// looks the package up by id and reads it from here, so a tampered request body
// cannot change what gets billed. Keep the two in step when a price changes.
//
// Only the CAREER packages carry an `amountKES`, because only they are bought
// off the page. The data tiers are quoted, not sold: `pricePrefix` marks them
// as starting points, the real number is fixed in writing after the discovery
// call, and api/order.js refuses any id whose track is not 'career'.
export const packages = [

  // ── DATA ANALYTICS ──────────────────────────────────────
  // Scope tiers, not fixed packages. Dashboard work varies too much by data
  // complexity to price sight-unseen, so these exist to let a visitor
  // self-select before the call. See track.packagesNote in data/tracks.js for
  // the framing that runs above the cards.
  //
  // THE NUMBERS. Set by the business, not derived from a rate card:
  //
  //   Starter    5–10 business days      → KES 45,000 / $350
  //   Growth     2–3 weeks               → KES 80,000 / $600
  //   Automation build, then ongoing     → KES 55,000/mo
  //
  // For reference when they next move: costed against the timelines above,
  // Starter works out near KES 2,000/hr and Growth nearer KES 1,450/hr, both
  // under a full Nairobi BI consultant rate of KES 2,500–3,000/hr. They are
  // entry positions for the local SME market, so raising Growth is the first
  // move if the tiers ever need to converge on that rate.
  //
  // USD is a conversion at ~130 KES/USD rounded to the nearest $50, on the
  // same basis for every tier, so an overseas client and a local one are
  // quoted the same work at the same price. Re-round if the rate moves.

  {
    id: 'starter-dashboard',
    track: 'data',
    trackLabel: 'Data Analytics',
    tier: 'Single department',
    name: 'Starter Dashboard',
    audience: 'Sales, HR, or operations',
    pricePrefix: 'Starting at',
    priceKES: 'KES 45,000',
    amountKES: null,
    priceUSD: '$350 USD',
    timeline: '5–10 business days',
    features: [
      '1 Power BI dashboard',
      'Up to 2 data sources',
      'Basic data cleaning included',
      '1 revision round',
      '30-min walkthrough call',
    ],
    featured: false,
    badge: null,
  },

  {
    id: 'growth-dashboard',
    track: 'data',
    trackLabel: 'Data Analytics',
    tier: 'Multi-department',
    name: 'Growth Dashboard',
    audience: 'Multi-source reporting across teams',
    pricePrefix: 'Starting at',
    priceKES: 'KES 80,000',
    amountKES: null,
    priceUSD: '$600 USD',
    timeline: '2–3 weeks',
    features: [
      'Multiple linked dashboards',
      'Up to 5 data sources',
      'Full data cleaning and structuring',
      '2 revision rounds',
      '45-min training session',
      '30 days of post-delivery support',
    ],
    // No badge and no featured treatment: the three tiers are scope brackets a
    // visitor self-selects into, so singling one out pushes a choice that only
    // their data can actually make.
    featured: false,
    badge: null,
  },

  {
    id: 'automation-partner',
    track: 'data',
    trackLabel: 'Data Analytics',
    tier: 'Ongoing reporting',
    name: 'Automation Partner',
    audience: 'Monthly retainer',
    pricePrefix: 'Starting at',
    priceKES: 'KES 55,000/mo',
    amountKES: null,
    // No USD equivalent is published for the retainer: it is quoted per
    // engagement after the discovery call. PackageCard drops the separator
    // when this is null.
    priceUSD: null,
    timeline: 'Build: 3–4 weeks, then ongoing',
    features: [
      'Dashboards plus Excel/Power Query automation',
      'Data sources scoped at discovery',
      'Monthly refresh and maintenance',
      'Priority turnaround on requests',
      'Quarterly strategy review call',
    ],
    featured: false,
    badge: null,
  },

  // ── CAREER SERVICES ──────────────────────────────────────

  {
    id: 'career-kickstart',
    track: 'career',
    trackLabel: 'Career Services',
    tier: 'Entry Level',
    name: 'Career Kickstart',
    audience: 'Fresh graduate · 0–1 yr experience',
    priceKES: 'KES 5,500',
    amountKES: 5500,
    priceUSD: '$45 USD',
    timeline: '3 business days',
    features: [
      'ATS-optimized CV (1–2 pages)',
      'Cover letter',
      'LinkedIn optimization',
      '15 interview questions and answers shared as PDF',
    ],
    featured: false,
    badge: null,
  },

  {
    id: 'career-builder',
    track: 'career',
    trackLabel: 'Career Services',
    tier: 'Junior and Early Career',
    name: 'Career Builder',
    audience: '1–3 years experience',
    priceKES: 'KES 9,500',
    amountKES: 9500,
    priceUSD: '$75 USD',
    timeline: '4–5 business days',
    features: [
      'ATS-optimized CV',
      'Modern resume',
      'Tailored cover letter',
      'LinkedIn optimization',
      'Interview preparation call (45 mins)',
      '1 revision round',
    ],
    featured: false,
    badge: null,
  },

  {
    id: 'career-pro',
    track: 'career',
    trackLabel: 'Career Services',
    tier: 'Mid-Level',
    name: 'Career Pro',
    audience: '3–7 years experience',
    priceKES: 'KES 15,000',
    amountKES: 15000,
    priceUSD: '$120 USD',
    timeline: '5–7 business days',
    features: [
      'ATS-optimized CV',
      'Modern resume',
      'Tailored cover letter',
      'LinkedIn optimization',
      'Interview preparation call (45 mins)',
      'Career positioning strategy note',
      '2 revision rounds',
    ],
    featured: false,
    badge: null,
  },

];

// Convenience exports for filtered views
export const dataPackages   = packages.filter(p => p.track === 'data');
export const careerPackages = packages.filter(p => p.track === 'career');
