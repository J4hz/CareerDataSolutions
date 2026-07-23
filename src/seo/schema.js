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
  absoluteUrl,
  OG_IMAGE_URL,
} from '../config.js';
import { posts } from '../data/blog.js';
import { dataFaqs, careerFaqs } from '../data/faqs.js';
import { allRoutes } from './meta.js';

const ORG_ID = `${SITE_URL}/#organization`;

/** Social/external profiles. Empty entries are dropped — a sameAs pointing
 *  at a placeholder is worse than an absent one. Fill these in as they go live. */
const SAME_AS = [
  // 'https://www.linkedin.com/company/careerdatasolutions',
  // 'https://www.upwork.com/agencies/careerdatasolutions',
].filter(Boolean);

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
      'CareerDataSolutions builds Power BI dashboards and ATS-optimized career documents from Nairobi, Kenya, grounded in 12 years of EMS operational experience.',
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
    areaServed: [
      { '@type': 'Country', name: 'Kenya' },
      { '@type': 'Place', name: 'Worldwide' },
    ],
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
  };
}

/** A Service node, provided by the organization above. */
function service({ name, description, serviceType, url, offers }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType,
    url: absoluteUrl(url),
    provider: { '@id': ORG_ID },
    areaServed: [
      { '@type': 'Country', name: 'Kenya' },
      { '@type': 'Place', name: 'Worldwide' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${name} offerings`,
      itemListElement: offers.map((offer) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: offer },
      })),
    },
  };
}

const dataService = () =>
  service({
    name: 'Data Analytics & Power BI Dashboards',
    serviceType: 'Business intelligence and data analytics consulting',
    url: '/data/services',
    description:
      'Power BI dashboard design, Excel workflow automation and operational analytics for organizations, built for adoption by teams, not just for reporting.',
    offers: [
      'Custom Power BI dashboard design and build',
      'Excel automation and recurring reporting',
      'Data cleaning and structuring across multiple sources',
      'Forecasting and business performance analysis',
      'KPI tracking and executive dashboards',
    ],
  });

const careerService = () =>
  service({
    name: 'CV Writing, LinkedIn Optimization & Career Coaching',
    serviceType: 'Career consulting and CV writing',
    url: '/career/services',
    description:
      'ATS-optimized CV writing, LinkedIn profile optimization, cover letters and interview preparation for professionals targeting roles in Kenya and internationally.',
    offers: [
      'ATS-compliant, keyword-optimized CV writing',
      'LinkedIn profile optimization',
      'Cover letters tailored to specific roles',
      'Interview preparation and job search strategy',
    ],
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

  // The homepage presents both tracks, so it carries both Service nodes.
  if (pathname === '/') {
    blocks.push(dataService(), careerService());
  }

  // Each service page carries its Service node and its FAQPage — the FAQ
  // markup is generated from the same data the visible accordion renders.
  if (pathname === '/data/services') {
    blocks.push(dataService(), faqPage(dataFaqs, '/data/services'));
  }
  if (pathname === '/career/services') {
    blocks.push(careerService(), faqPage(careerFaqs, '/career/services'));
  }

  const post = posts.find((p) => p.slug === pathname);
  if (post) blocks.push(blogPosting(post));

  const crumbs = breadcrumbs(pathname);
  if (crumbs) blocks.push(crumbs);

  return blocks;
}
