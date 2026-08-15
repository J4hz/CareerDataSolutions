// ─────────────────────────────────────────────────────────────
// Single source of truth for per-route head tags.
//
// Read by BOTH:
//   • scripts/prerender.js — bakes these into static HTML at build
//     time, so crawlers that don't run JS (social scrapers, GPTBot,
//     ClaudeBot, PerplexityBot) see the correct tags.
//   • src/components/Seo.jsx — re-renders them on client-side nav.
//
// Adding a route? Add it here and it flows into the prerendered
// pages and the sitemap automatically.
// ─────────────────────────────────────────────────────────────

import { absoluteUrl, OG_IMAGE_URL, SITE_NAME } from '../config.js';
import { posts } from '../data/blog.js';

const DEFAULT_OG_IMAGE = OG_IMAGE_URL;

/** Static routes, keyed by path. `title` is the full <title>.
 *
 *  The site splits into two themed sub-sites: /data/* (teal) and
 *  /career/* (gold), mirrored four ways each (services, packages, about,
 *  contact) around a neutral landing page and blog. Legacy paths from
 *  before the split are 308-redirected in vercel.json and are deliberately
 *  NOT listed here — a listed route gets prerendered and canonicalised. */
export const staticRoutes = {
  /* TITLES ARE WRITTEN TO A BUDGET. Google truncates around 60 characters,
     so the words that earn the click go first and the brand goes last,
     where losing it costs least. Every commercial route names its
     geography, because "in Kenya" is half of what these pages are trying
     to be found for and a description-only mention is a weaker signal than
     the title. Check the length before adding to one of these. */
  '/': {
    title: `Power BI Dashboards & CV Writing, Nairobi | ${SITE_NAME}`,
    description:
      'CareerDataSolutions builds Power BI dashboards and ATS-optimized CVs from Nairobi, Kenya. Grounded in 12 years of Emergency Medical Services operational experience, working with clients locally and internationally.',
  },

  // ── Data track ──
  '/data/services': {
    title: `Power BI Dashboards & Analytics, Kenya | ${SITE_NAME}`,
    description:
      'Power BI dashboards, Excel automation and operational analytics for businesses in Nairobi and across Kenya. Free discovery call, quote confirmed in writing before work begins.',
  },
  '/data/packages': {
    title: `Power BI Dashboard Pricing, Kenya | ${SITE_NAME}`,
    description:
      'What a Power BI dashboard costs in Kenya: scope tiers from a single-department starter build to an ongoing automation retainer, priced in KES and USD.',
  },
  '/data/about': {
    title: `About Kabiru Nyabwengi · ${SITE_NAME} | Nairobi, Kenya`,
    description:
      'CareerDataSolutions is led by Kabiru Nyabwengi, whose years of Emergency Medical Services operations experience ground both the Power BI analytics and the career strategy work the consultancy delivers.',
  },
  '/data/contact': {
    title: `Book a Free Power BI Discovery Call | ${SITE_NAME}`,
    description:
      'Tell us what you are trying to see and where your data sits, and book a free 30-minute discovery call to scope a Power BI dashboard or analytics automation project in Kenya.',
  },

  // ── Career track ──
  '/career/services': {
    title: `ATS CV Writing & LinkedIn Optimization, Kenya | ${SITE_NAME}`,
    description:
      'ATS-optimized CV writing, LinkedIn profile optimization and interview coaching in Nairobi, for professionals targeting roles in Kenya, the UK, the US and the Gulf. Free CV review, honest feedback.',
  },
  '/career/packages': {
    title: `CV Writing & LinkedIn Packages, Kenya | ${SITE_NAME}`,
    description:
      'What professional CV writing costs in Kenya: packages covering ATS-optimized CVs, LinkedIn optimization and interview coaching, entry-level to mid-career, in KES and USD.',
  },
  '/career/about': {
    title: `About Kabiru Nyabwengi · ${SITE_NAME} | Nairobi, Kenya`,
    description:
      'CareerDataSolutions is led by Kabiru Nyabwengi, whose years of Emergency Medical Services operations experience ground both the career strategy and the Power BI analytics work the consultancy delivers.',
  },
  /* "free CV review" is the strongest query this site can honestly answer —
     it is a real, free thing on the other side of the click, not a lead
     magnet with a paywall behind it. Worth the whole title. */
  '/career/contact': {
    title: `Free CV Review, Kenya | ${SITE_NAME}`,
    description:
      'Send your CV for a free, honest review from Nairobi before you pay for anything, or start an ATS-optimized CV rewrite, LinkedIn optimization or interview coaching engagement.',
  },
  // Checkout. Listed here so it is prerendered — a route in App.jsx but not in
  // this registry hard-404s on a direct load (see scripts/prerender.js). The
  // package is a query param, so this one file serves every package. noindex
  // because a checkout page has nothing to offer a search result, and
  // scripts/sitemap.js skips it for the same reason.
  '/career/order': {
    title: `Complete Your Order · Career Services | ${SITE_NAME}`,
    description:
      'Complete your CareerDataSolutions package order: send your CV and details, then pay securely by M-Pesa.',
    noindex: true,
  },

  // ── Neutral ──
  // The homepage's About link. Same page as the two track About routes; this
  // is the one a visitor who has not chosen a lane lands on.
  '/about': {
    title: `About Kabiru Nyabwengi · ${SITE_NAME} | Nairobi, Kenya`,
    description:
      'CareerDataSolutions is led by Kabiru Nyabwengi, whose years of Emergency Medical Services operations experience ground both the Power BI analytics and the career strategy work the consultancy delivers.',
  },

  // ── Legal ──
  // Removed while the two pages are hidden (see App.jsx), on the same
  // reasoning as the '/blog' entry below: a route left in this registry is
  // prerendered and reachable by anyone with the URL even when nothing
  // links to it, which is not hidden.
  //
  // They were noindex while they existed, so nothing has been submitted to
  // a search engine and there is no ranking to lose by removing them. Put
  // both entries back — WITHOUT noindex, once the text is real — in the
  // same commit that restores the routes:
  // '/privacy': {
  //   title: `Privacy Policy | ${SITE_NAME}`,
  //   description:
  //     'How CareerDataSolutions handles the personal data submitted through this site.',
  // },
  // '/terms': {
  //   title: `Terms of Service | ${SITE_NAME}`,
  //   description:
  //     'The terms covering CareerDataSolutions engagements, deliverables and payment.',
  // },

  // The '/blog' entry is removed while Insights is hidden, so the blog is
  // left out of the prerender and the sitemap. Restore it alongside the
  // routes in App.jsx:
  // '/blog': {
  //   title: `Blog · Data Analytics & Career Strategy | ${SITE_NAME}`,
  //   description:
  //     'Practical writing on Power BI, operational analytics and career strategy, drawn from real dashboard builds and CV reviews in the Kenyan and international job markets.',
  // },
};

/** Blog post routes, derived from the post data so they can't drift.
 *  Not currently wired into allRoutes() while the blog is hidden. */
export function blogRoutes() {
  return Object.fromEntries(
    posts.map((post) => [
      post.slug,
      {
        title: `${post.title} | ${SITE_NAME}`,
        description: post.excerpt,
        type: 'article',
        author: post.author,
        date: post.date,
      },
    ])
  );
}

/** Every route that should be prerendered and listed in the sitemap.
 *  Spread blogRoutes() back in here to restore the blog. */
export function allRoutes() {
  return { ...staticRoutes };
}

/** Head tags for any path not in the registry (404s). Never indexed,
 *  and deliberately given no canonical — a canonical here is what made
 *  every unknown URL claim to be the homepage. */
const NOT_FOUND = {
  title: `Page not found · ${SITE_NAME}`,
  description: 'That page does not exist. Browse our services, packages or about page instead.',
  noindex: true,
};

/** Resolve the head tags for a path. */
export function metaForPath(pathname) {
  const routes = allRoutes();
  const route = routes[pathname];

  if (!route) {
    return { ...NOT_FOUND, canonical: null, image: DEFAULT_OG_IMAGE, type: 'website' };
  }

  return {
    title: route.title,
    description: route.description,
    canonical: absoluteUrl(pathname),
    image: route.image ?? DEFAULT_OG_IMAGE,
    type: route.type ?? 'website',
    author: route.author,
    date: route.date,
    // Registered routes are indexable unless they opt out. This used to be a
    // hardcoded false, which silently discarded `noindex: true` on any entry in
    // staticRoutes — Seo.jsx and scripts/prerender.js both read this function,
    // so neither could emit a robots tag for a real route.
    noindex: route.noindex ?? false,
  };
}
