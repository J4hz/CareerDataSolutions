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
// ─────────────────────────────────────────────────────────────

import { mkdir, readFile, writeFile } from 'node:fs/promises';
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

  const routes = Object.keys(allRoutes());

  const build = async (pathname) => {
    const appHtml = await render(pathname);
    return template
      .replace('<!--head-->', headFor(pathname).trim())
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

  console.log(`\n✓ prerendered ${routes.length} routes + 404`);
}

main().catch((err) => {
  console.error('\n✗ prerender failed:\n', err);
  process.exit(1);
});
