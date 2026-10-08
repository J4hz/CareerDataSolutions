// ─────────────────────────────────────────────────────────────
// Generates every favicon asset from ONE vector definition of the brand
// mark: the three-bar growth chart with the arrow sweeping over it.
//
// Run with:  npm run favicons
//
// Why the mark is redrawn here rather than downsampled from the logo PNG:
// a favicon is rendered at 16–32px, and at that size a resampled raster of
// the mark turns to mush — the arrow in particular is a hairline that
// disappears entirely. So the geometry below is traced from the logo export
// (bar widths, heights and gaps, and the arrow's centreline and taper, were
// all measured off it) and redrawn as vectors, with three deliberate
// departures for legibility at tab size:
//
//   1. The arrow is drawn heavier than the logo's, and its tail stops short
//      of tapering to nothing — at true proportion the thin end is under
//      half a pixel at 32px and simply disappears.
//   2. It carries a navy halo, so it stays separate from the bars it
//      crosses instead of merging with them once the edges soften.
//   3. The short bar is lifted from the logo's near-navy slate to a steel
//      blue. The logo's own value is ~1.3:1 against the navy tile — fine at
//      poster size, invisible at 16px.
//
// Colours are the brand palette from src/styles/theme.css (the logo export
// is a hair off it; the tokens win), except that steel blue, which is the
// navy lightened until the bar reads.
//
// Outputs (all committed, all referenced from index.html):
//   public/favicon.svg       modern browsers, scales to any tab density
//   public/favicon-32.png    fallback for browsers without SVG icon support
//   public/favicon-192.png   apple-touch-icon / home screen / schema.org logo
//
// The 192 is deliberately full-bleed square with no rounding: iOS applies
// its own corner mask, and rounding it here would leave dark slivers
// outside the radius. Only the SVG and the 32 carry the rounded tile.
//
// Not part of `npm run build`: the output is committed so the build stays
// fast. Re-run this only when the mark changes.
// ─────────────────────────────────────────────────────────────

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const root = dirname(fileURLToPath(new URL('.', import.meta.url)));
const publicDir = join(root, 'public');

const NAVY = '#0B1F3A'; // --navy
const TEAL = '#1D9E75'; // --teal
const GOLD = '#F4A833'; // --gold
const STEEL = '#4A6A96'; // --navy lightened; see header note
const WHITE = '#FFFFFF';

// ── The mark, in its own coordinate space ────────────────────
// Origin is the bottom-left corner of the first bar, axes as SVG's (y grows
// downward), so the bars rise into negative y. 100 units = the width of the
// three bars and their gaps, which is the scale the logo was measured in.

const BARS = [
  { x: 0, w: 27, h: 45.4, fill: STEEL },
  { x: 36.2, w: 27, h: 69.7, fill: GOLD },
  { x: 73, w: 27.6, h: 110.3, fill: TEAL },
];
const BAR_RADIUS = 4.5;

// The arrow's centreline: a cubic fitted to the curve traced off the logo.
const CURVE = [
  [-6, -1],
  [30, -2],
  [74, -24],
  [106, -63],
];

// Half-width of the tail at each end. The logo runs ~0.25 → 6.2 here; the
// thin end is raised so it survives to 16px (see note 1 above).
const TAIL_HALF_START = 2.4;
const TAIL_HALF_END = 6.4;
const TAIL_TAPER = 1.6; // >1 keeps the thickening late, as the logo does

// The head, placed off the end of the curve. Its direction is steeper than
// the curve's end tangent, as in the logo, so the arrow reads as still
// accelerating at the tip rather than flattening out.
const HEAD_DIR = [0.52, -0.854];
const HEAD_LENGTH = 34;
const HEAD_HALF = 12.5;
const HEAD_SET_BACK = 3; // how far the head's base sits back down the curve

const HALO = 3.4; // navy separation drawn around the whole arrow

const bezier = (t) => {
  const u = 1 - t;
  const [p0, p1, p2, p3] = CURVE;
  return [0, 1].map(
    (i) =>
      u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]
  );
};

const tangent = (t) => {
  const u = 1 - t;
  const [p0, p1, p2, p3] = CURVE;
  const d = [0, 1].map(
    (i) =>
      3 * u * u * (p1[i] - p0[i]) + 6 * u * t * (p2[i] - p1[i]) + 3 * t * t * (p3[i] - p2[i])
  );
  const len = Math.hypot(d[0], d[1]);
  return [d[0] / len, d[1] / len];
};

/**
 * The arrow as a single closed outline: up one side of the tapering tail,
 * around the head, back down the other side. One path rather than a stroke
 * plus a triangle, so the head and tail never show a seam between them and
 * the halo can be a plain stroke of the same shape.
 */
function arrowPath(steps = 48) {
  const half = (t) => TAIL_HALF_START + (TAIL_HALF_END - TAIL_HALF_START) * t ** TAIL_TAPER;
  const side = (sign) => {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const [x, y] = bezier(t);
      const [ux, uy] = tangent(t);
      const h = half(t) * sign;
      pts.push([x - uy * h, y + ux * h]);
    }
    return pts;
  };

  const end = bezier(1);
  const [ux, uy] = tangent(1);
  const base = [end[0] - ux * HEAD_SET_BACK, end[1] - uy * HEAD_SET_BACK];
  const [hx, hy] = HEAD_DIR;
  const tip = [base[0] + hx * HEAD_LENGTH, base[1] + hy * HEAD_LENGTH];
  const barb = (sign) => [base[0] - hy * HEAD_HALF * sign, base[1] + hx * HEAD_HALF * sign];

  const upper = side(1);
  const lower = side(-1).reverse();
  const fmt = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`;

  return (
    `M ${fmt(upper[0])} ` +
    upper.slice(1).map((p) => `L ${fmt(p)}`).join(' ') +
    ` L ${fmt(barb(1))} L ${fmt(tip)} L ${fmt(barb(-1))} ` +
    lower.map((p) => `L ${fmt(p)}`).join(' ') +
    ' Z'
  );
}

/** Extremes of everything drawn, so the mark can be centred in the tile. */
function markBounds(arrow) {
  const xs = [];
  const ys = [];
  for (const b of BARS) {
    xs.push(b.x, b.x + b.w);
    ys.push(0, -b.h);
  }
  for (const m of arrow.matchAll(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g)) {
    xs.push(parseFloat(m[1]));
    ys.push(parseFloat(m[2]));
  }
  const pad = HALO / 2;
  return {
    left: Math.min(...xs) - pad,
    right: Math.max(...xs) + pad,
    top: Math.min(...ys) - pad,
    bottom: Math.max(...ys) + pad,
  };
}

/** The mark alone, scaled and centred in a `size` tile with `pad` clear. */
function markGroup(size, pad) {
  const arrow = arrowPath();
  const box = markBounds(arrow);
  const w = box.right - box.left;
  const h = box.bottom - box.top;
  const k = Math.min((size - pad * 2) / w, (size - pad * 2) / h);
  const tx = (size - w * k) / 2 - box.left * k;
  const ty = (size - h * k) / 2 - box.top * k;

  const bars = BARS.map(
    (b) =>
      `<rect x="${b.x}" y="${-b.h}" width="${b.w}" height="${b.h}" ` +
      `rx="${BAR_RADIUS}" fill="${b.fill}"/>`
  ).join('\n      ');

  return `<g transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${k.toFixed(5)})">
      ${bars}
      <path d="${arrow}" fill="${NAVY}" stroke="${NAVY}" stroke-width="${HALO * 2}" stroke-linejoin="round"/>
      <path d="${arrow}" fill="${WHITE}"/>
    </g>`;
}

/** Full icon: navy tile plus the mark. `radius` 0 gives a full-bleed square. */
function icon({ size, pad, radius }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${NAVY}"/>
  ${markGroup(size, pad)}
</svg>
`;
}

async function main() {
  // Tab icon: rounded tile, drawn on a 32-unit grid so the vector and the
  // PNG fallback are the same picture.
  const tabSvg = icon({ size: 32, pad: 2.5, radius: 7 });
  await writeFile(join(publicDir, 'favicon.svg'), tabSvg);
  console.log('  favicon.svg');

  await sharp(Buffer.from(tabSvg), { density: 384 })
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon-32.png'));
  console.log('  favicon-32.png   32x32');

  // Home-screen icon: full bleed, and roomier padding because iOS crops the
  // corners and sets the icon among others with generous margins.
  const appSvg = icon({ size: 192, pad: 30, radius: 0 });
  await sharp(Buffer.from(appSvg), { density: 288 })
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'favicon-192.png'));
  console.log('  favicon-192.png  192x192');

  console.log('\n✓ favicons generated from the vector mark in this script');
}

main().catch((err) => {
  console.error('Favicon generation failed:', err.message);
  process.exit(1);
});
