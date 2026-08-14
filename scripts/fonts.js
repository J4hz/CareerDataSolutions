// ─────────────────────────────────────────────────────────────
// Downloads the two brand fonts from Google and writes them, plus a local
// @font-face stylesheet, into the repo so the site serves its own fonts.
//
// Run with:  npm run fonts
//
// Why self-host: loading these from Google costs a DNS lookup, a TLS
// handshake and two round trips to a second origin before the first
// character can be painted — and the browser only discovers the font files
// after the stylesheet that names them has itself arrived. Serving them
// from our own origin removes the second connection entirely, and lets the
// critical weights be preloaded from index.html (see the <link rel=preload>
// tags there) so they download alongside the CSS rather than after it.
//
// Only the `latin` subset is kept. The site is English; the Google CSS also
// ships cyrillic, greek and vietnamese cuts, which no page here can use.
// Note that latin covers general punctuation (U+2000-206F), so curly quotes
// and en dashes in the copy are included.
//
// Both families are VARIABLE fonts: Google serves one file per family that
// covers every weight, and its CSS points all three @font-face rules at
// that same file. So the faces are deduplicated by content hash and emitted
// as one file and one @font-face per family, with a font-weight RANGE. Done
// naively this ships each family three times over — 221.5 KB instead of
// 73.8 KB — and the browser cannot even reuse the cache entry, because the
// identical bytes sit at three different names.
//
// Outputs, all committed:
//   public/fonts/*.woff2      the font files, served from our own origin
//   src/styles/fonts.css      the @font-face rules, imported by globals.css
//
// Not part of `npm run build`: this reaches out to the network, and the
// output is committed. Re-run it only to change weights or update a font.
// ─────────────────────────────────────────────────────────────

import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

const root = dirname(fileURLToPath(new URL('.', import.meta.url)));
const fontsDir = join(root, 'public', 'fonts');
const stylesDir = join(root, 'src', 'styles');

// Must stay in step with --font-display / --font-body in globals.css.
const URL_ =
  'https://fonts.googleapis.com/css2' +
  '?family=Plus+Jakarta+Sans:wght@600;700;800' +
  '&family=Inter:wght@400;500;600' +
  '&display=swap';

// Google serves woff2 only to browsers that ask like one.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const slug = (family) => family.toLowerCase().replace(/\s+/g, '-');

// ── Metric-matched fallbacks ─────────────────────────────────
// Self-hosting removed the render-blocking font stylesheet, which means the
// page now paints BEFORE the webfont arrives instead of after it — so the
// swap became visible, and reflowed the hero headline and everything under
// it. That measured 0.057 CLS on desktop where the site had been at 0.
//
// These faces give the fallback the webfont's own metrics, so the text
// occupies the same space either way and the swap moves nothing. The
// numbers are measured, not guessed: both fonts were rendered to a canvas
// against Arial at 100px, and
//
//   size-adjust      = webfont advance width / Arial advance width
//   ascent-override  = webfont ascent / size-adjust
//   descent-override = webfont descent / size-adjust
//
// Both families run ~7-8% wider than Arial, which is the whole of the
// shift. RE-MEASURE THESE if either font is ever changed or re-cut.
//
// src is local() only: nothing is downloaded, and on a system without
// Arial the face simply does not load and the stack falls through to the
// next family, rather than applying Arial's metrics to some other font.
const FALLBACKS = [
  {
    family: 'Plus Jakarta Sans',
    sizeAdjust: '108.11%',
    ascent: '96.2%',
    descent: '20.35%',
  },
  {
    family: 'Inter',
    sizeAdjust: '106.84%',
    ascent: '90.79%',
    descent: '22.46%',
  },
];

async function main() {
  await mkdir(fontsDir, { recursive: true });

  const res = await fetch(URL_, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Google Fonts returned ${res.status}`);
  const css = await res.text();

  // Each @font-face is preceded by a /* subset */ comment; keep only latin.
  const blocks = css.split('/*').slice(1);
  const families = new Map();
  const downloads = new Map(); // remote url -> bytes, so each file is fetched once

  for (const block of blocks) {
    const subset = block.slice(0, block.indexOf('*/')).trim();
    if (subset !== 'latin') continue;

    const family = /font-family:\s*'([^']+)'/.exec(block)?.[1];
    const weight = Number(/font-weight:\s*(\d+)/.exec(block)?.[1]);
    const src = /src:\s*url\(([^)]+)\)/.exec(block)?.[1];
    const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1];
    if (!family || !weight || !src) continue;

    if (!downloads.has(src)) {
      const font = await fetch(src, { headers: { 'User-Agent': UA } });
      if (!font.ok) throw new Error(`${family} ${weight}: ${font.status}`);
      downloads.set(src, Buffer.from(await font.arrayBuffer()));
    }
    const bytes = downloads.get(src);
    const hash = createHash('sha256').update(bytes).digest('hex');

    const entry = families.get(family) ?? { family, weights: [], hashes: new Set() };
    entry.weights.push(weight);
    entry.hashes.add(hash);
    entry.bytes = bytes;
    entry.range = range?.trim();
    families.set(family, entry);
  }

  if (!families.size) throw new Error('No latin faces found — did the CSS format change?');

  const faces = [];
  for (const entry of families.values()) {
    if (entry.hashes.size > 1) {
      throw new Error(
        `${entry.family} returned ${entry.hashes.size} distinct files for its weights. ` +
          'That means it is no longer a single variable font, and this script needs ' +
          'to go back to writing one file per weight.'
      );
    }

    const weights = entry.weights.sort((a, b) => a - b);
    const file = `${slug(entry.family)}.woff2`;
    await writeFile(join(fontsDir, file), entry.bytes);

    faces.push({
      family: entry.family,
      weights,
      file,
      range: entry.range,
      size: entry.bytes.length,
    });
    console.log(
      `  ${file.padEnd(26)} ${(entry.bytes.length / 1024).toFixed(1).padStart(6)} KB` +
        `  variable, weights ${weights[0]}–${weights.at(-1)}`
    );
  }

  const sheet = `/* ─────────────────────────────────────────────────────────────
   Self-hosted brand fonts. GENERATED — edit scripts/fonts.js, not this
   file, and re-run \`npm run fonts\`.

   Latin subset only; see the script for why. font-display: swap is carried
   over from Google's own CSS: text paints immediately in the fallback and
   is re-rendered when the face arrives, rather than hanging invisible.

   One file and one rule per family: both are variable fonts, so the weight
   is a RANGE and every weight in it comes out of the same file. Both files
   are preloaded from index.html, so they are fetched alongside this
   stylesheet rather than after it.
   ───────────────────────────────────────────────────────────── */

${faces
  .map(
    (f) => `@font-face {
  font-family: '${f.family}';
  font-style: normal;
  font-weight: ${f.weights[0]} ${f.weights.at(-1)};
  font-display: swap;
  src: url('/fonts/${f.file}') format('woff2');${
    f.range ? `\n  unicode-range: ${f.range};` : ''
  }
}`
  )
  .join('\n\n')}

/* ── Metric-matched fallbacks ─────────────────────────────────
   Named "<Family> Fallback" and referenced from --font-display and
   --font-body in globals.css, immediately after the real family. They
   render in Arial with the webfont's own metrics, so the text takes the
   same space before and after the swap and nothing moves. See the note in
   scripts/fonts.js for where the numbers come from.
   ───────────────────────────────────────────────────────────── */

${FALLBACKS.map(
  (f) => `@font-face {
  font-family: '${f.family} Fallback';
  src: local('Arial');
  size-adjust: ${f.sizeAdjust};
  ascent-override: ${f.ascent};
  descent-override: ${f.descent};
  line-gap-override: 0%;
}`
).join('\n\n')}
`;

  await writeFile(join(stylesDir, 'fonts.css'), sheet);
  const total = faces.reduce((n, f) => n + f.size, 0);
  console.log(`\n✓ ${faces.length} faces, ${(total / 1024).toFixed(1)} KB total`);
  console.log('  public/fonts/ + src/styles/fonts.css');
}

main().catch((err) => {
  console.error('Font download failed:', err.message);
  process.exit(1);
});
