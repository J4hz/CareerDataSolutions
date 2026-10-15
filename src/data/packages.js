// `priceKES` / `priceUSD` are display strings and are the only thing the UI
// shows. `amountKES` is the authoritative integer the server charges — api/order.js
// looks the package up by id and reads it from here, so a tampered request body
// cannot change what gets billed. Keep the two in step when a price changes.
//
// Only the CAREER packages carry an `amountKES`, because only they are bought
// off the page. The data tiers are quoted, not sold: they carry no price, the
// real number is fixed in writing after the discovery call, and api/order.js
// refuses any id whose track is not 'career'.

// The single figure the data pricing sections publish, above the cards.
// Non-breaking spaces so each figure never splits from its currency.
// USD follows the site rule: KES ÷ 131, rounded UP to the next multiple of 5.
export const DATA_PACKAGES_FROM = 'Data packages start from KES 120,000 / USD 920.';

// USD on every price below is KES ÷ 131, rounded UP to the next multiple of 5.
// Hand-entered, so redo the sum here whenever a KES price changes.

export const packages = [

  // ── DATA ANALYTICS ──────────────────────────────────────
  // Scope tiers, not fixed packages. Dashboard work varies too much by data
  // complexity to price sight-unseen, so these exist to let a visitor
  // self-select before the call. See track.packagesNote in data/tracks.js for
  // the framing that runs above the cards.
  //
  // NO PRICES ON THE CARDS. The tiers publish no figure of their own; the
  // one number shown is the floor in DATA_PACKAGES_FROM above, which the
  // pricing sections state once above the cards. priceKES / priceUSD are null
  // so PackageCard skips the price line and schema.js emits no offer price.
  // `priceNote`, where set, stands in the price slot instead.

  {
    id: 'starter-dashboard',
    track: 'data',
    trackLabel: 'Data Analytics',
    tier: '2–3 departments',
    name: 'Starter Dashboard',
    audience: 'Operations, Finance, Sales',
    priceKES: null,
    amountKES: null,
    priceUSD: null,
    timeline: '7–21 days',
    features: [
      'Data cleaning',
      '3 data sources',
      'One revision round',
      '3-in-1 dashboard',
      '30-minute walkthrough',
    ],
    featured: false,
    badge: null,
  },

  {
    id: 'growth-dashboard',
    track: 'data',
    trackLabel: 'Data Analytics',
    tier: '3–7 departments',
    name: 'Growth Dashboard',
    audience: 'Multi-source reporting across teams',
    priceKES: null,
    amountKES: null,
    priceUSD: null,
    timeline: '3–6 weeks',
    features: [
      'Data cleaning',
      'Up to 7 data sources',
      '2 revision rounds',
      'Multiple linked dashboards',
      '1-hour training session for department heads',
      '30-day post-delivery support',
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
    priceKES: null,
    amountKES: null,
    priceUSD: null,
    // A retainer, so the KES 120,000 floor above does not describe it. Says
    // so on the card rather than leaving it to read as part of that figure.
    priceNote: 'Monthly, quoted after the discovery call',
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
      'One revision round',
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
    priceUSD: '$115 USD',
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

  {
    id: 'career-executive',
    track: 'career',
    trackLabel: 'Career Services',
    tier: 'Senior',
    name: 'Career Executive',
    audience: 'For professionals with 8–12 years of experience ready for senior roles.',
    priceKES: 'KES 22,000',
    amountKES: 22000,
    priceUSD: '$170 USD',
    timeline: '7–10 business days',
    features: [
      'Everything in Career Pro',
      'Executive positioning',
    ],
    featured: false,
    badge: null,
  },

];

// Convenience exports for filtered views
export const dataPackages   = packages.filter(p => p.track === 'data');
export const careerPackages = packages.filter(p => p.track === 'career');

// ── À LA CARTE ──────────────────────────────────────────────
// Single career services at one flat price each. The visitor picks any mix,
// so there is no fixed package to look up: alaCartePackage() builds one from
// the chosen ids, and the server rebuilds it from the same ids (never from an
// amount the browser sends), so the total cannot be edited on the way through.
export const A_LA_CARTE_ID = 'a-la-carte';
export const A_LA_CARTE_PRICE_KES = 3000;
// 3,000 ÷ 131 = 22.9, rounded up to the next 5. The total is this times the
// number of services, so the per-service and total figures always agree.
export const A_LA_CARTE_PRICE_USD = 25;

export const alaCarteServices = [
  { id: 'cv',             name: 'ATS-optimized CV writing' },
  { id: 'resume',         name: 'Modern resume' },
  { id: 'cover-letter',   name: 'Tailored cover letter' },
  { id: 'linkedin',       name: 'LinkedIn profile optimization' },
  { id: 'interview-call', name: 'Interview preparation call (45 mins)' },
  { id: 'interview-qa',   name: '15 interview questions and answers (PDF)' },
  { id: 'job-search',     name: 'Job search strategy' },
  { id: 'positioning',    name: 'Career positioning strategy note' },
];

/**
 * The package for a set of à la carte service ids, or null when none of them
 * is a real service. Unknown ids are dropped and duplicates collapse, because
 * the list is filtered rather than the input mapped.
 */
export function alaCartePackage(ids) {
  const wanted = Array.isArray(ids) ? ids.map(String) : [];
  const chosen = alaCarteServices.filter((s) => wanted.includes(s.id));
  if (chosen.length === 0) return null;

  const amountKES = chosen.length * A_LA_CARTE_PRICE_KES;
  const names = chosen.map((s) => s.name);
  return {
    id: A_LA_CARTE_ID,
    track: 'career',
    trackLabel: 'Career Services',
    tier: `${chosen.length} service${chosen.length === 1 ? '' : 's'}`,
    name: 'À la carte',
    // What the order emails and receipts call it, so the inbox shows what
    // was actually bought.
    orderLabel: `À la carte: ${names.join(', ')}`,
    audience: `KES ${A_LA_CARTE_PRICE_KES.toLocaleString('en-KE')} / $${A_LA_CARTE_PRICE_USD} USD per service`,
    priceKES: `KES ${amountKES.toLocaleString('en-KE')}`,
    amountKES,
    priceUSD: `$${chosen.length * A_LA_CARTE_PRICE_USD} USD`,
    timeline: '3–5 business days',
    features: names,
    services: chosen.map((s) => s.id),
    featured: false,
    badge: null,
  };
}

/**
 * Any purchasable career package by id: a fixed tier, or an à la carte
 * selection when the id is A_LA_CARTE_ID. Used by the checkout page and by
 * api/order.js and api/promo.js, so all three resolve a package the same way.
 */
export function findCareerPackage(packageId, services) {
  if (packageId === A_LA_CARTE_ID) return alaCartePackage(services);
  return careerPackages.find((p) => p.id === packageId) ?? null;
}
