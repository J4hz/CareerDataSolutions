// `priceKES` / `priceUSD` are display strings and are the only thing the UI
// shows. `amountKES` is the authoritative integer the server charges — api/order.js
// looks the package up by id and reads it from here, so a tampered request body
// cannot change what gets billed. Keep the two in step when a price changes.
export const packages = [

  // ── DATA ANALYTICS ──────────────────────────────────────

  {
    id: 'insight-starter',
    track: 'data',
    trackLabel: 'Data Analytics',
    tier: 'Micro Enterprise',
    name: 'Insight Starter',
    audience: '1–10 staff',
    priceKES: 'KES 20,000',
    amountKES: 20000,
    priceUSD: '$155 USD',
    timeline: '5–7 business days',
    features: [
      '1 department dashboard (Excel or Power BI)',
      'Basic data cleaning and preparation',
      'Up to 5 KPIs tracked',
      'Summary insights report',
      '1 revision round',
    ],
    featured: false,
    badge: null,
  },

  {
    id: 'analytics-pro',
    track: 'data',
    trackLabel: 'Data Analytics',
    tier: 'Small Enterprise',
    name: 'Analytics Pro',
    audience: '11–50 staff',
    priceKES: 'KES 45,000',
    amountKES: 45000,
    priceUSD: '$350 USD',
    timeline: '2–3 weeks',
    features: [
      '2–3 department Power BI dashboards',
      'Full data audit and cleaning',
      'KPI framework design (up to 15 KPIs)',
      'Recommendations and insights report',
      'Excel automation for 1 workflow',
      '2 revision rounds',
    ],
    featured: true,
    badge: 'Most popular',
    badgeTrack: 'data',
  },

  {
    id: 'enterprise-suite',
    track: 'data',
    trackLabel: 'Data Analytics',
    tier: 'Medium Enterprise',
    name: 'Enterprise Suite',
    audience: '51–250 staff',
    priceKES: 'KES 90,000',
    amountKES: 90000,
    priceUSD: '$700 USD',
    timeline: '3–5 weeks',
    features: [
      '4–7 department Power BI dashboards',
      'End-to-end data architecture review',
      'Full KPI framework and executive dashboard',
      'Advanced Excel automation',
      'Monthly reporting templates',
      '3 revision rounds',
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
