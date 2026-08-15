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
  //   Starter    7–21 days               → KES 90,000 / $700
  //   Growth     3–6 weeks               → KES 160,000 / $1,250
  //   Automation build, then ongoing     → KES 60,000 / $450, per month
  //
  // For reference when they next move: costed against the timelines above,
  // Growth lands near KES 1,600/hr, under a full Nairobi BI consultant rate
  // of KES 2,500–3,000/hr, because a 3–6 week window spreads the same fee
  // over roughly twice the days.
  //
  // STARTER NEEDS RECOSTING. It was quoted at 5–10 business days and worked
  // out near KES 4,000/hr, comfortably above that consultant rate. The
  // window is now 7–21 days — close to twice the midpoint — so the same
  // KES 90,000 buys roughly half the hourly it used to, which puts it at or
  // below the rate it was priced to beat. Either the fee or the window is
  // the thing to move; nothing here has been adjusted to compensate.
  //
  // USD is a conversion at ~130 KES/USD rounded to the nearest $50, on the
  // same basis for every tier, so an overseas client and a local one are
  // quoted the same work at the same price. Re-round if the rate moves.

  {
    id: 'starter-dashboard',
    track: 'data',
    trackLabel: 'Data Analytics',
    tier: '2–3 departments',
    name: 'Starter Dashboard',
    audience: 'Operations, Finance, Sales',
    pricePrefix: 'Starting at',
    priceKES: 'KES 90,000',
    amountKES: null,
    priceUSD: '$700 USD',
    timeline: '7–21 days',
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
    tier: 'Multi-department (2–7)',
    name: 'Growth Dashboard',
    audience: 'Multi-source reporting across teams',
    pricePrefix: 'Starting at',
    priceKES: 'KES 160,000',
    amountKES: null,
    priceUSD: '$1,250 USD',
    timeline: '3–6 weeks',
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
    // The cadence rides on the prefix, not on either figure. A "/mo" hung off
    // one of the two currencies binds to that currency and reads as though the
    // other is a one-off, and repeating it on both makes the longest price
    // string on the page. Up here it covers the pair once and keeps them
    // symmetric with the other tiers.
    pricePrefix: 'Monthly, starting at',
    priceKES: 'KES 60,000',
    amountKES: null,
    // Same ~130 KES/USD basis rounded to the nearest $50 as the other two tiers.
    priceUSD: '$450 USD',
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
