// ─────────────────────────────────────────────────────────────
// Builds every logo asset from the vector brand definition in
// scripts/brand/ (the mark in mark.js, the wordmark outlines in wordmark.js).
//
// Run with:  npm run logo
//
// Outputs, all committed:
//
//   src/assets/generated/logo.svg            navbar, light theme
//   src/assets/generated/logo-reversed.svg   navbar dark theme, and footer
//   public/logo-email.png                    transactional emails (see below)
//   Career Data Solutions Logos svg/         the brand kit: horizontal and
//                                            stacked lockups, each light and
//                                            reversed, plus the icon alone
//
// ── Pure vectors ──
//
// The previous master was a converter's output with the icon embedded as
// rasters. These are true vectors end to end: the mark is drawn from
// measured geometry and the wordmark is font outlines, so every file is a
// few KB and sharp at any size.
//
// ── Why two files rather than one that themes itself ──
//
// currentColor would be tidier, but these are loaded with <img src>, and
// an SVG referenced that way is an isolated document: it cannot see the
// page's color, nor the data-theme attribute the toggle sets. An internal
// prefers-color-scheme media query inside the SVG would follow the system
// setting but ignore the toggle, which is worse than not trying. Two
// files, switched by CSS on data-theme, is the honest version.
//
// Not part of `npm run build`: the output is committed, like everything in
// src/assets/generated. Re-run only when the brand definition changes.
// ─────────────────────────────────────────────────────────────

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { markElements, TILE } from './brand/mark.js';
import { WORDS, WIDTH as WORD_WIDTH, CAP } from './brand/wordmark.js';

const root = dirname(fileURLToPath(new URL('.', import.meta.url)));
const generated = join(root, 'src', 'assets', 'generated');
const kit = join(root, 'Career Data Solutions Logos svg');

const NAVY = '#0B1F3A'; // --navy
const TEAL = '#1D9E75'; // --teal
const WHITE = '#FFFFFF';

const THEMES = {
  // Divider: --ink-soft in each theme. Rim: --line-dark.
  light: { ink: NAVY, accent: TEAL, divider: 'rgba(11,31,58,0.7)', outline: null },
  /* Teal is left alone in the reversed version: teal on navy is 5.1:1, and
     keeping the accent bright in dark is the same call theme.css makes for
     --accent-ink. The tile gets a faint rim because it is --navy-950, the
     footer's own background, and would otherwise vanish into it. At the navbar's
     45px height, 5 units is just under a pixel. */
  reversed: { ink: WHITE, accent: TEAL, divider: 'rgba(255,255,255,0.62)', outline: { color: 'rgba(255,255,255,0.14)', width: 5 } },
};

/* Lockup geometry, in the designer's export pixels with the tile's top-left
   at the origin. */
const HORIZONTAL = {
  divider: { x: 320, y: 9, w: 3, h: 250 },
  word: { x: 391.5, baseline: 179 },
};
const STACKED_GAP = 68; // tile bottom to cap top

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

function wordmark(theme, x, baseline) {
  const paths = WORDS.map((w) => `<path fill="${w.ink === 'accent' ? theme.accent : theme.ink}" d="${w.d}"/>`).join('');
  return `<g transform="translate(${x} ${baseline})">${paths}</g>`;
}

function mark(theme, x = 0, y = 0) {
  const inner = markElements({ outline: theme.outline });
  return x || y ? `<g transform="translate(${x} ${y})">${inner}</g>` : inner;
}

function horizontal(theme) {
  const { divider: d, word } = HORIZONTAL;
  return mark(theme)
    + `<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" rx="${d.w / 2}" fill="${theme.divider}"/>`
    + wordmark(theme, word.x, word.baseline);
}

function stacked(theme) {
  return mark(theme, (WORD_WIDTH - TILE) / 2, 0) + wordmark(theme, 0, TILE + STACKED_GAP + CAP);
}

/**
 * Wrap artwork in an <svg> whose viewBox is cropped to what it actually
 * draws. Measured by rendering rather than computed, because the glyphs'
 * round overshoot past the baseline and cap line is not in any number above.
 */
async function toDocument(body, title) {
  const loose = (vb) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
  const probe = loose('-50 -50 2000 1000');
  const scale = 2;
  const { data, info } = await sharp(Buffer.from(probe), { density: 72 * scale })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, x1 = -1, y0 = info.height, y1 = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * info.channels + 3] > 0) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error(`${title} renders as fully transparent`);
  const k = 2000 / info.width;
  const r = (v) => Math.round(v * 2) / 2;
  const box = { x: r(x0 * k - 50), y: r(y0 * k - 50), w: r((x1 - x0 + 1) * k), h: r((y1 - y0 + 1) * k) };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.w} ${box.h}" `
    + `width="${Math.round(box.w)}" height="${Math.round(box.h)}" role="img" aria-label="${title}">`
    + `<title>${title}</title>${body}</svg>\n`;
  return { svg, w: Math.round(box.w), h: Math.round(box.h) };
}

async function emit(dir, name, body, title = 'Career Data Solutions') {
  const doc = await toDocument(body, title);
  await writeFile(join(dir, name), doc.svg);
  console.log(`  ${name.padEnd(30)} ${`${doc.w}x${doc.h}`.padEnd(10)} ${kb(doc.svg.length)}`);
  return doc;
}

async function main() {
  await mkdir(generated, { recursive: true });
  await mkdir(kit, { recursive: true });

  console.log('\nsrc/assets/generated');
  const light = await emit(generated, 'logo.svg', horizontal(THEMES.light));
  await emit(generated, 'logo-reversed.svg', horizontal(THEMES.reversed));

  console.log('\nCareer Data Solutions Logos svg');
  await emit(kit, 'logo-horizontal.svg', horizontal(THEMES.light));
  await emit(kit, 'logo-horizontal-reversed.svg', horizontal(THEMES.reversed));
  await emit(kit, 'logo-stacked.svg', stacked(THEMES.light));
  await emit(kit, 'logo-stacked-reversed.svg', stacked(THEMES.reversed));
  await emit(kit, 'icon.svg', mark(THEMES.light));

  /* public/logo-email.png is referenced by absolute URL from the
     transactional emails (config.js EMAIL_LOGO_URL), so it needs a stable
     public path rather than a hashed build asset, and it must be a PNG
     because email clients cannot be relied on for SVG or WebP. 400px wide
     covers its 200px slot at 2x. Flattened onto white, because a
     transparent logo with navy lettering disappears in dark-mode inboxes. */
  const EMAIL_WIDTH = 400;
  const email = await sharp(Buffer.from(light.svg), { density: 72 * (EMAIL_WIDTH / light.w) * 1.5 })
    .resize({ width: EMAIL_WIDTH })
    .flatten({ background: WHITE })
    .png({ compressionLevel: 9, palette: true, effort: 10 })
    .toFile(join(root, 'public', 'logo-email.png'));
  console.log(`\npublic/logo-email.png  ${email.width}x${email.height}  ${kb(email.size)}`
    + `   (email <img> slot: 200x${Math.round((200 * light.h) / light.w)})\n`);
}

main().catch((err) => {
  console.error('Logo build failed:', err.message);
  process.exit(1);
});
