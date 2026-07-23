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
  '/': {
    title: `${SITE_NAME} · Power BI Dashboards & Career Services | Nairobi, Kenya`,
    description:
      'CareerDataSolutions builds Power BI dashboards and ATS-optimized CVs from Nairobi, Kenya. Grounded in 12 years of EMS operational experience, working with clients locally and internationally.',
  },

  // ── Data track ──
  '/data/services': {
    title: `Data Services · Power BI Dashboards & Analytics Automation | ${SITE_NAME}`,
    description:
      'Power BI dashboards, Excel automation and operational analytics for organizations in Kenya and beyond. Free discovery call, quote confirmed in writing before work begins.',
  },
  '/data/packages': {
    title: `Data Scope Tiers & Pricing · Power BI Dashboards | ${SITE_NAME}`,
    description:
      'Scope tiers for Power BI dashboard builds and analytics automation, from a single-department starter dashboard to an ongoing automation retainer, in KES and USD.',
  },
  '/data/about': {
    title: `About Kabiru Nyabwengi · ${SITE_NAME} | Nairobi, Kenya`,
    description:
      'CareerDataSolutions is led by Kabiru Nyabwengi, whose years of EMS operations experience ground both the Power BI analytics and the career strategy work the consultancy delivers.',
  },
  '/data/contact': {
    title: `Book a Discovery Call · Data Services | ${SITE_NAME}`,
    description:
      'Tell us what you are trying to see and where your data sits, and book a free 30-minute discovery call to scope a Power BI dashboard or analytics automation project.',
  },

  // ── Career track ──
  '/career/services': {
    title: `Career Services · ATS CV Writing & LinkedIn Optimization | ${SITE_NAME}`,
    description:
      'ATS-optimized CV writing, LinkedIn profile optimization and career coaching for professionals targeting roles in Kenya, the UK, the US and the Gulf. Free CV review, honest feedback.',
  },
  '/career/packages': {
    title: `Career Packages & Pricing · CV Writing & LinkedIn | ${SITE_NAME}`,
    description:
      'Transparent packages for ATS-optimized CV writing, LinkedIn optimization and interview coaching, from entry-level to mid-career, in KES and USD.',
  },
  '/career/about': {
    title: `About Kabiru Nyabwengi · ${SITE_NAME} | Nairobi, Kenya`,
    description:
      'CareerDataSolutions is led by Kabiru Nyabwengi, whose years of EMS operations experience ground both the career strategy and the Power BI analytics work the consultancy delivers.',
  },
  '/career/contact': {
    title: `Submit Your CV · Career Services | ${SITE_NAME}`,
    description:
      'Send us your CV and career goals to start an ATS-optimized CV rewrite, LinkedIn optimization or career coaching engagement.',
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
      'CareerDataSolutions is led by Kabiru Nyabwengi, whose years of EMS operations experience ground both the Power BI analytics and the career strategy work the consultancy delivers.',
  },

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
