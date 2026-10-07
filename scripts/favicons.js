// ─────────────────────────────────────────────────────────────
// Generates every favicon asset from the vector brand mark in
// scripts/brand/mark.js, the same definition the logos are built from.
//
// Run with:  npm run favicons
//
// Colours are the logo's, which are all site tokens; nothing is changed for
// tab size. (The short bar, --navy-800 on --navy-950, is faint at 16px. That
// is accepted so the favicon stays on-palette.)
//
// One deliberate departure from the logo: the arrow is drawn heavier. At
// true weight its tail is under a pixel wide at 16px and breaks up.
//
// Outputs (all committed, all referenced from index.html):
//   public/favicon.svg       modern browsers, scales to any tab density
//   public/favicon-32.png    fallback for browsers without SVG icon support
//   public/favicon-192.png   apple-touch-icon / home screen / schema.org logo
//
// The 192 is deliberately full-bleed square with no rounding: iOS applies
// its own corner mask, and rounding it here would leave pale slivers
// outside the radius. Only the SVG and the 32 carry the rounded tile.
//
// Not part of `npm run build`: the output is committed so the build stays
// fast. Re-run this only when the mark changes.
// ─────────────────────────────────────────────────────────────

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { markElements, COLORS, TILE } from './brand/mark.js';

const root = dirname(fileURLToPath(new URL('.', import.meta.url)));
const publicDir = join(root, 'public');

const TAB = { weight: 1.35 };

const icon = (opts) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}" width="32" height="32">${markElements(opts)}</svg>\n`;

async function main() {
  const tabSvg = icon({ ...TAB });
  await writeFile(join(publicDir, 'favicon.svg'), tabSvg);
  console.log(`  favicon.svg      ${(tabSvg.length / 1024).toFixed(1)} KB`);

  await sharp(Buffer.from(tabSvg), { density: 72 * 8 })
    .resize(32, 32)
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, 'favicon-32.png'));
  console.log('  favicon-32.png   32x32');

  // Home-screen icon: full bleed, with the artwork shrunk toward the centre.
  // At logo proportions the arrow tip sits 12 units from the top-right
  // corner, exactly where iOS's corner mask cuts.
  const k = 0.8;
  const inset = (TILE * (1 - k)) / 2;
  const appSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}" width="192" height="192">`
    + `<rect width="${TILE}" height="${TILE}" fill="${COLORS.tile}"/>`
    + `<g transform="translate(${inset} ${inset}) scale(${k})">${markElements({ ...TAB, rounded: false, weight: 1.15 })}</g></svg>`;
  await sharp(Buffer.from(appSvg), { density: 72 * 4 })
    .resize(192, 192)
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, 'favicon-192.png'));
  console.log('  favicon-192.png  192x192');

  console.log('\n✓ favicons generated from scripts/brand/mark.js');
}

main().catch((err) => {
  console.error('Favicon generation failed:', err.message);
  process.exit(1);
});
