// ─────────────────────────────────────────────────────────────
// Build-time prerender.
//
// Runs after `vite build`. For every route in src/seo/meta.js it renders
// the app to static HTML and writes dist/<route>/index.html with that
// route's own canonical, title, description and OG tags baked into <head>.
//
// Why: this is a client-rendered SPA, and vercel.json rewrites every URL
// to index.html. Without this step every route ships identical head tags
// — which is exactly the "every page canonicalises to the homepage" bug.
// Crawlers that don't execute JS (LinkedIn/WhatsApp/Slack link scrapers,
// GPTBot, ClaudeBot, PerplexityBot) only ever see what's in the HTML, so
// fixing this in React alone would not have reached them.
//
// The tags written here are marked data-prerendered; src/main.jsx removes
// them just before hydration so React can own the head from then on
// without duplicating anything.
//
// ── Why vercel.json has no rewrites ──
//
// It used to carry a catch-all rewrite of every path to /index.html, which is
// the standard SPA setup. That has to go once routes are prerendered: with it
// in place Vercel hands any unknown URL the homepage's HTML — including the
// homepage's canonical tag — with a 200 status, which is the "every page
// canonicalises to the homepage" bug all over again, just narrowed to 404s.
//
// Instead: every route is a real file on disk, Vercel matches the filesystem
// first, and anything unmatched falls back to the dist/404.html written below
// (noindex, no canonical) with a real 404 status.
//
// Two consequences to keep in mind:
//   • A route in App.jsx but NOT in src/seo/meta.js is never prerendered, so
//     it will hard-404 on a direct load instead of silently working. Add new
//     routes to meta.js.
//   • /contact is a client-side <Navigate>, not a page, so it needs the
//     server-side redirect in vercel.json to survive a direct load.
//
// (vercel.json is strict JSON and rejects comment keys inside a redirect
// object, so this note lives here rather than next to the config.)
// ─────────────────────────────────────────────────────────────

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render } from '../dist-ssr/entry-server.js';
import { allRoutes, metaForPath } from '../src/seo/meta.js';
import { schemaForPath } from '../src/seo/schema.js';
import { SITE_NAME } from '../src/config.js';

const root = dirname(fileURLToPath(new URL('.', import.meta.url)));
const distDir = join(root, 'dist');

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const tag = (html) => `    ${html}\n`;

/** Build the <head> block for a route, from the shared SEO registry. */
function headFor(pathname) {
  const meta = metaForPath(pathname);
  const attr = escapeAttr;

  let head = '';
  head += tag(`<title data-prerendered>${attr(meta.title)}</title>`);
  head += tag(`<meta data-prerendered name="description" content="${attr(meta.description)}" />`);

  if (meta.noindex) {
    head += tag(`<meta data-prerendered name="robots" content="noindex, follow" />`);
  }
  if (meta.canonical) {
    head += tag(`<link data-prerendered rel="canonical" href="${attr(meta.canonical)}" />`);
    head += tag(`<meta data-prerendered property="og:url" content="${attr(meta.canonical)}" />`);
  }

  head += tag(`<meta data-prerendered property="og:type" content="${attr(meta.type)}" />`);
  head += tag(`<meta data-prerendered property="og:site_name" content="${attr(SITE_NAME)}" />`);
  head += tag(`<meta data-prerendered property="og:title" content="${attr(meta.title)}" />`);
  head += tag(`<meta data-prerendered property="og:description" content="${attr(meta.description)}" />`);
  head += tag(`<meta data-prerendered property="og:image" content="${attr(meta.image)}" />`);

  head += tag(`<meta data-prerendered name="twitter:card" content="summary_large_image" />`);
  head += tag(`<meta data-prerendered name="twitter:title" content="${attr(meta.title)}" />`);
  head += tag(`<meta data-prerendered name="twitter:description" content="${attr(meta.description)}" />`);
  head += tag(`<meta data-prerendered name="twitter:image" content="${attr(meta.image)}" />`);

  // JSON-LD. Escaping `<` keeps a future `</script>` in any copy string from
  // terminating the block early; it stays valid JSON either way.
  for (const block of schemaForPath(pathname)) {
    const json = JSON.stringify(block, null, 2).replace(/</g, '\\u003c');
    head += tag(`<script data-prerendered type="application/ld+json">\n${json}\n    </script>`);
  }

  return head;
}

/* ── Each route's own CSS ──
 *
 * Every page is lazy() in App.jsx, so Vite splits its CSS (Home-*.css,
 * tracks-*.css, ...) into the page's chunk, and the browser only fetches
 * it once the JS has downloaded and run. The template's <head> links just
 * the global stylesheet. So a prerendered page arrived with its full
 * markup but none of its page styles, and showed raw, unstyled content
 * until the JS caught up: very visible on a slow connection.
 *
 * Fix: link the page's CSS, and preload its JS, straight from the HTML.
 * The paths come from Vite's build manifest; the route -> page map below
 * mirrors the lazy() imports and <Route>s in App.jsx. A route missing here
 * fails the build rather than quietly shipping unstyled.
 *
 * The tags are marked data-route-asset, NOT data-prerendered: main.jsx
 * strips data-prerendered tags before hydrating, which would pull the CSS
 * back off the page. Vite's chunk loader sees these links already exist
 * and does not fetch the files twice. */
const ROUTE_PAGES = {
  '/': 'src/pages/Home.jsx',
  '/about': 'src/pages/About.jsx',
  '/data/services': 'src/pages/DataServices.jsx',
  '/data/packages': 'src/pages/Packages.jsx',
  '/data/about': 'src/pages/About.jsx',
  '/data/contact': 'src/pages/ContactData.jsx',
  '/career/services': 'src/pages/CareerServices.jsx',
  '/career/packages': 'src/pages/Packages.jsx',
  '/career/about': 'src/pages/About.jsx',
  '/career/contact': 'src/pages/ContactCareer.jsx',
  '/career/order': 'src/pages/CareerOrder.jsx',
  '/404': 'src/pages/NotFound.jsx',
};

/** The CSS files and JS chunks a page's chunk pulls in, transitively. */
function pageAssets(manifest, pathname) {
  const page = ROUTE_PAGES[pathname];
  if (!page) throw new Error(`no page mapped for ${pathname}: add it to ROUTE_PAGES`);
  if (!manifest[page]) throw new Error(`${page} (for ${pathname}) is not in the Vite manifest`);

  const css = new Set();
  const js = new Set();
  const seen = new Set();
  const walk = (key) => {
    if (seen.has(key)) return;
    seen.add(key);
    const chunk = manifest[key];
    // The entry chunk's CSS and JS are already in the template.
    if (chunk.isEntry) return;
    js.add(chunk.file);
    for (const file of chunk.css ?? []) css.add(file);
    for (const dep of chunk.imports ?? []) walk(dep);
  };
  walk(page);

  return (
    [...css].map((f) => tag(`<link data-route-asset rel="stylesheet" crossorigin href="/${f}">`)).join('')
    + [...js].map((f) => tag(`<link data-route-asset rel="modulepreload" crossorigin href="/${f}">`)).join('')
  );
}

/** "/" -> dist/index.html, "/blog/x" -> dist/blog/x/index.html */
function outputPathFor(pathname) {
  return pathname === '/'
    ? join(distDir, 'index.html')
    : join(distDir, pathname.replace(/^\//, ''), 'index.html');
}

async function main() {
  const template = await readFile(join(distDir, 'index.html'), 'utf8');

  if (!template.includes('<!--head-->')) {
    throw new Error('index.html is missing the <!--head--> placeholder');
  }
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('index.html is missing <div id="root"></div>');
  }

  const manifest = JSON.parse(await readFile(join(distDir, '.vite', 'manifest.json'), 'utf8'));
  const routes = Object.keys(allRoutes());

  const build = async (pathname) => {
    const appHtml = await render(pathname);
    return template
      .replace('<!--head-->', headFor(pathname).trim())
      // Before </head>, i.e. after the global stylesheet: page CSS has to
      // come later in the cascade, exactly as it does when the chunk loads it.
      .replace(/\n\s*<\/head>/, `\n${pageAssets(manifest, pathname)}  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  };

  for (const pathname of routes) {
    const outputPath = outputPathFor(pathname);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, await build(pathname));

    console.log(`  prerendered  ${pathname}`);
  }

  // Vercel serves dist/404.html — with a real 404 status — for any path that
  // doesn't match a file. Every route is now a file, so this is genuinely the
  // not-found case. It renders the NotFound page, noindex and with no canonical
  // (metaForPath returns canonical: null for unknown paths). Without it, the
  // old catch-all rewrite to /index.html would hand every junk URL the
  // homepage's HTML — and therefore the homepage's canonical — all over again.
  await writeFile(join(distDir, '404.html'), await build('/404'));
  console.log('  prerendered  404.html');

  // Build-time only: no reason to deploy a map of every chunk.
  await rm(join(distDir, '.vite'), { recursive: true, force: true });

  console.log(`\n✓ prerendered ${routes.length} routes + 404`);
}

main().catch((err) => {
  console.error('\n✗ prerender failed:\n', err);
  process.exit(1);
});
