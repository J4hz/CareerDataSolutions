// ─────────────────────────────────────────────────────────────
// JSON-LD structured data, keyed by route.
//
// Read by the same two consumers as meta.js:
//   • scripts/prerender.js — serializes these into the static HTML
//   • src/components/Seo.jsx — renders them on client-side nav
//
// Structured data is the single highest-leverage thing for AI answer
// engines: it is how a crawler learns that this site is an organization
// in Nairobi that sells two named services, rather than an undifferentiated
// wall of text. Keep it factually identical to the visible page copy —
// schema that contradicts the page is worse than no schema.
// ─────────────────────────────────────────────────────────────

import {
  SITE_URL,
  SITE_NAME,
  CONTACT_EMAIL,
  BUSINESS,
  absoluteUrl,
  OG_IMAGE_URL,
} from '../config.js';
import { posts } from '../data/blog.js';
import { dataFaqs, careerFaqs } from '../data/faqs.js';
import { dataPackages, careerPackages } from '../data/packages.js';
import { allRoutes } from './meta.js';

/* Stable node identifiers. Every @id on the site is declared here, so the
   "no duplicate @id within a page" rule is checkable by reading one block
   rather than by grepping the file. faqPage() derives its own from the
   route it is emitted on, which is unique by construction. */
const ORG_ID            = `${SITE_URL}/#organization`;
const LOCAL_BUSINESS_ID = `${SITE_URL}/#localbusiness`;
const DATA_SERVICE_ID   = `${SITE_URL}/#data-service`;
const CAREER_SERVICE_ID = `${SITE_URL}/#career-service`;

/** Social/external profiles. Empty entries are dropped — a sameAs pointing
 *  at a placeholder is worse than an absent one. Fill these in as they go live. */
const SAME_AS = [
  // 'https://www.linkedin.com/company/careerdatasolutions',
  // 'https://www.upwork.com/agencies/careerdatasolutions',
].filter(Boolean);

/* Both tracks serve the same two areas, and so does the business itself.
   One array rather than three copies, so they cannot drift apart. */
const AREA_SERVED = [
  { '@type': 'Country', name: 'Kenya' },
  { '@type': 'Place', name: 'Worldwide' },
];

/** The publisher/provider node every other schema on the site points back to. */
function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    alternateName: 'Career Data Solutions',
    url: SITE_URL,
    logo: absoluteUrl('/favicon-192.png'),
    image: OG_IMAGE_URL,
    email: CONTACT_EMAIL,
    description:
      'CareerDataSolutions builds Power BI dashboards and ATS-optimized career documents from Nairobi, Kenya, grounded in 12 years of Emergency Medical Services operational experience.',
    founder: {
      '@type': 'Person',
      name: 'Kabiru Nyabwengi',
      jobTitle: 'Founder & Principal Consultant',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
    },
    areaServed: AREA_SERVED,
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
  };
}

/**
 * LocalBusiness. Emitted once, on the homepage only.
 *
 * Returns null — and therefore emits nothing — until the real details are
 * in config.js. See the TODO there: a LocalBusiness node is a claim about a
 * registered business, and a placeholder telephone or a guessed street
 * address is a false claim that can cost a Business Profile. Missing is
 * recoverable; wrong is not.
 *
 * Note this is a SEPARATE node from organization() rather than a retyping
 * of it. Organization is what publishes the site and what every Service and
 * BlogPosting points back to via @id; LocalBusiness is the physical/trading
 * entity. They are linked by parentOrganization so a crawler reads them as
 * one business, not two.
 */
function localBusiness() {
  const b = BUSINESS;

  // All three gates must be answered. serviceAreaOnly is checked against
  // null specifically, since `false` is a valid, meaningful answer.
  if (!b.legalName || !b.telephone || b.serviceAreaOnly === null) return null;

  // A storefront must actually have a street. If serviceAreaOnly is false
  // and nobody filled the address in, that is a half-answered config, not a
  // business with no street — so emit nothing rather than a partial address.
  if (!b.serviceAreaOnly && !b.streetAddress) return null;

  const address = {
    '@type': 'PostalAddress',
    addressLocality: b.addressLocality,
    addressRegion: b.addressRegion,
    addressCountry: b.addressCountry,
    ...(b.streetAddress ? { streetAddress: b.streetAddress } : {}),
    ...(b.postalCode ? { postalCode: b.postalCode } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': LOCAL_BUSINESS_ID,
    name: b.legalName,
    ...(b.legalName === SITE_NAME ? {} : { alternateName: SITE_NAME }),
    url: SITE_URL,
    telephone: b.telephone,
    email: CONTACT_EMAIL,
    image: OG_IMAGE_URL,
    logo: absoluteUrl('/favicon-192.png'),
    address,
    areaServed: AREA_SERVED,
    parentOrganization: { '@id': ORG_ID },
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
  };
}

/**
 * The KES figure for a package.
 *
 * Career tiers carry `amountKES`, the authoritative integer api/order.js
 * actually bills. Data tiers deliberately carry null there — they are quoted
 * after a discovery call, not sold off the page — so their number is read
 * from the display string the pricing page itself shows, which is exactly
 * the figure this schema is supposed to mirror.
 *
 * USD is not emitted as a second Offer. src/data/packages.js documents it as
 * a conversion at ~130 KES/USD rounded to the nearest $50, so it is the same
 * price restated, not a separate one to advertise.
 */
function kesAmount(pkg) {
  if (typeof pkg.amountKES === 'number') return pkg.amountKES;
  const digits = String(pkg.priceKES).replace(/[^0-9]/g, '');
  return digits ? Number(digits) : null;
}

/**
 * One Offer per package tier, built from src/data/packages.js so the schema
 * cannot claim a tier or a price the pricing page does not show.
 *
 * Three price shapes, because the page has three:
 *   • a flat price          → price + priceCurrency  (career tiers)
 *   • "Starting at"         → minPrice               (data build tiers)
 *   • "Monthly, starting at" → minPrice per 1 MON    (Automation Partner)
 * The monthly case is detected from `pricePrefix`, which is the same string
 * the card renders, so the two cannot disagree about the cadence.
 */
function packageOffer(pkg, url) {
  const amount = kesAmount(pkg);
  const prefix = pkg.pricePrefix || '';
  const isMonthly = prefix.toLowerCase().includes('monthly');

  const offer = {
    '@type': 'Offer',
    name: pkg.name,
    category: pkg.tier,
    url: absoluteUrl(url),
    availability: 'https://schema.org/InStock',
    itemOffered: {
      '@type': 'Service',
      name: pkg.name,
      description: `${pkg.features.join('. ')}. Timeline: ${pkg.timeline}.`,
    },
  };

  if (amount === null) return offer;

  if (isMonthly) {
    offer.priceSpecification = {
      '@type': 'UnitPriceSpecification',
      priceCurrency: 'KES',
      minPrice: amount,
      referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
    };
  } else if (prefix) {
    // "Starting at" — a floor, not a price. Asserting it as `price` would be
    // the one thing the visible copy is careful not to say.
    offer.priceSpecification = {
      '@type': 'PriceSpecification',
      priceCurrency: 'KES',
      minPrice: amount,
    };
  } else {
    offer.price = amount;
    offer.priceCurrency = 'KES';
  }

  return offer;
}

/** A Service node, provided by the organization above. */
function service({ id, name, description, serviceType, url, packages, packagesUrl }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': id,
    name,
    description,
    serviceType,
    url: absoluteUrl(url),
    provider: { '@id': ORG_ID },
    areaServed: AREA_SERVED,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${name} packages`,
      url: absoluteUrl(packagesUrl),
      itemListElement: packages.map((pkg) => packageOffer(pkg, packagesUrl)),
    },
  };
}

/* The two Service nodes. Their offer catalogues are the real tiers from
   src/data/packages.js — Starter/Growth/Automation Partner on the data side,
   Kickstart/Builder/Pro on the career side — so a price or a tier name can
   only change in one place and the schema follows the page automatically. */

const dataService = () =>
  service({
    id: DATA_SERVICE_ID,
    name: 'Data Analytics & Power BI Dashboards',
    serviceType: 'Business intelligence and data analytics consulting',
    url: '/data/services',
    packagesUrl: '/data/packages',
    packages: dataPackages,
    description:
      'Power BI dashboard design, Excel workflow automation and operational analytics for organizations, built for adoption by teams, not just for reporting. Covers dashboard design and build, data cleaning and structuring across multiple sources, forecasting and business performance analysis, and KPI tracking for executives.',
  });

const careerService = () =>
  service({
    id: CAREER_SERVICE_ID,
    name: 'CV Writing, LinkedIn Optimization & Career Coaching',
    serviceType: 'Career consulting and CV writing',
    url: '/career/services',
    packagesUrl: '/career/packages',
    packages: careerPackages,
    description:
      'ATS-optimized CV writing, LinkedIn profile optimization, cover letters and interview preparation for professionals targeting roles in Kenya and internationally. Includes keyword-optimized CVs built to parse cleanly, cover letters tailored to specific roles, and job search strategy.',
  });

/**
 * FAQPage for a service route. Built from the same data the visible
 * accordion renders (src/data/faqs.js), so the markup can't drift from
 * the page — schema that contradicts the page is worse than no schema.
 */
function faqPage(faqs, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(url)}#faq`,
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/** BlogPosting for a post route. */
function blogPosting(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: absoluteUrl(post.slug),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(post.slug) },
    image: OG_IMAGE_URL,
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.category,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@id': ORG_ID },
    isPartOf: {
      '@type': 'Blog',
      name: `${SITE_NAME} Blog`,
      url: absoluteUrl('/blog'),
    },
  };
}

/** Human-readable trail for a path, used to build the BreadcrumbList. */
const BREADCRUMB_LABELS = {
  // Neutral About sits directly under Home: it belongs to no track, so the
  // trackRoot lookup below finds nothing to nest it under.
  '/about':           'About',
  '/data/services':   'Data Services',
  '/data/packages':   'Data Packages & Pricing',
  '/data/about':      'About',
  '/data/contact':    'Book a Discovery Call',
  '/career/services': 'Career Services',
  '/career/packages': 'Career Packages & Pricing',
  '/career/about':    'About',
  '/career/contact':  'Submit Your CV',
  // '/blog': 'Blog',  — restore with the blog routes in App.jsx.
};

/** BreadcrumbList for any path below the homepage. Blog posts nest under /blog. */
function breadcrumbs(pathname) {
  if (pathname === '/') return null;

  const trail = [{ name: 'Home', path: '/' }];
  const post = posts.find((p) => p.slug === pathname);

  if (post) {
    trail.push({ name: 'Blog', path: '/blog' });
    trail.push({ name: post.title, path: post.slug });
  } else if (BREADCRUMB_LABELS[pathname]) {
    // Track pages nest under their track's services page, which acts as
    // the section root ( /data and /career themselves only redirect ).
    const trackRoot = pathname.startsWith('/data/')
      ? '/data/services'
      : pathname.startsWith('/career/')
        ? '/career/services'
        : null;

    if (trackRoot && trackRoot !== pathname) {
      trail.push({ name: BREADCRUMB_LABELS[trackRoot], path: trackRoot });
    }
    trail.push({ name: BREADCRUMB_LABELS[pathname], path: pathname });
  } else {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * Every JSON-LD block for a path. Returns [] for routes with nothing to say
 * (a 404 should not be asserting facts about the business).
 */
export function schemaForPath(pathname) {
  // Unknown path — a 404. It gets no schema at all: a noindex page should
  // not be asserting facts about the business to whatever crawled it.
  if (!allRoutes()[pathname]) return [];

  const blocks = [];

  // Emitted on every route, not just the homepage: the Service and
  // BlogPosting nodes below reference it by @id, and a crawler that
  // landed on a deep link has never seen the homepage's copy.
  blocks.push(organization());

  // The homepage presents both tracks, so it carries both Service nodes —
  // and the LocalBusiness node, which belongs to the site root and is
  // emitted exactly once across the whole site. localBusiness() returns
  // null until the real details are filled into config.js, so nothing is
  // asserted about a phone number or an address we do not have.
  if (pathname === '/') {
    blocks.push(dataService(), careerService());

    const business = localBusiness();
    if (business) blocks.push(business);
  }

  // Each service page carries its Service node and its FAQPage — the FAQ
  // markup is generated from the same data the visible accordion renders.
  if (pathname === '/data/services') {
    blocks.push(dataService(), faqPage(dataFaqs, '/data/services'));
  }
  if (pathname === '/career/services') {
    blocks.push(careerService(), faqPage(careerFaqs, '/career/services'));
  }

  // The pricing pages are where the offer catalogue is actually visible, so
  // they carry the Service node that holds it. Same @id as the copy on the
  // services page — one Service described twice, not two services.
  if (pathname === '/data/packages')   blocks.push(dataService());
  if (pathname === '/career/packages') blocks.push(careerService());

  const post = posts.find((p) => p.slug === pathname);
  if (post) blocks.push(blogPosting(post));

  const crumbs = breadcrumbs(pathname);
  if (crumbs) blocks.push(crumbs);

  return blocks;
}
