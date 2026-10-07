// ─────────────────────────────────────────────────────────────
// The brand mark as vectors: a dark rounded tile, three rising bars, and a
// white arrow sweeping over them.
//
// Shared by scripts/logo-svg.js (the lockups) and scripts/favicons.js (the
// tab and home-screen icons), so the mark is defined exactly once.
//
// The geometry was measured off the designer's PNG export (Career Data
// Solutions Logos (5), Oct 2026), where the tile is ~270px square. It is
// expressed in that tile's own frame: (0,0) is the tile's top-left corner and
// the tile is TILE units on a side, so every number below is a pixel
// distance in the export.
//
// Colours: every one is a site token from src/styles/theme.css, so the logo
// and the page are one palette. Where the export used a value the site has
// no token for, it maps to the nearest token: the near-black tile (#090E19)
// to --navy-950, the slate bar (#2B3442) to --navy-800. Keep these in step
// with theme.css if the palette changes.
// ─────────────────────────────────────────────────────────────

export const TILE = 270;
export const TILE_RADIUS = 49;

export const COLORS = {
  tile: '#06121F',   // --navy-950
  slate: '#143255',  // --navy-800
  gold: '#F4A833',   // --gold
  teal: '#1D9E75',   // --teal
  arrow: '#FFFFFF',  // --white
};

/* Each bar is a quadrilateral: vertical sides, a flat base, and a top that
   slopes up to the right, steeper bar by bar, so the three tops read as one
   rising curve under the arrow. Corners are listed bottom-left, top-left,
   top-right, bottom-right, each with its own rounding. The top-right
   rounding grows with the slope, as in the export. */
const BASE = 248;
const BARS = [
  { fill: 'slate', x0: 29, x1: 94.5, top0: 172, top1: 156, r: [8, 8, 9, 8] },
  { fill: 'gold', x0: 104.5, x1: 168.5, top0: 148, top1: 116, r: [8, 7, 12, 8] },
  { fill: 'teal', x0: 179.5, x1: 242.5, top0: 101, top1: 52, r: [8, 7, 17, 8] },
];

/* The arrow's centreline: a cubic fitted to the export's stroke (max error
   about half a pixel), run on into the notch
   in the head's back edge so the two join without a step. */
const CURVE = [
  [29.5, 159.5],
  [95.5, 144],
  [161.5, 109],
  [222, 39.5],
];
// Half-width of the shaft at the tail and at the head. The export thickens
// from ~11 to ~15px along its length.
const SHAFT_HALF = [5.5, 7.5];

/* The head: tip, the two barbs, and a shallow notch in its back edge. The
   head points more steeply than the shaft arrives, as in the export, so the
   arrow reads as still accelerating at the tip. */
const HEAD = {
  tip: [242, 12.5],
  barbs: [
    [204, 29.5],
    [237, 53.5],
  ],
  notch: 4,
};

const n = (v) => Number(v.toFixed(2));
const pt = ([x, y]) => `${n(x)} ${n(y)}`;
const unit = ([x, y]) => {
  const l = Math.hypot(x, y);
  return [x / l, y / l];
};

/** A closed polygon with each corner rounded by a quadratic of radius r[i]. */
function roundedPolygon(points, radii) {
  const count = points.length;
  let d = '';
  points.forEach((p, i) => {
    const prev = points[(i + count - 1) % count];
    const next = points[(i + 1) % count];
    const toPrev = unit([prev[0] - p[0], prev[1] - p[1]]);
    const toNext = unit([next[0] - p[0], next[1] - p[1]]);
    const r = radii[i];
    const a = [p[0] + toPrev[0] * r, p[1] + toPrev[1] * r];
    const b = [p[0] + toNext[0] * r, p[1] + toNext[1] * r];
    d += `${i === 0 ? 'M' : 'L'}${pt(a)}Q${pt(p)} ${pt(b)}`;
  });
  return `${d}Z`;
}

const bezier = (t) => {
  const u = 1 - t;
  return [0, 1].map(
    (i) =>
      u * u * u * CURVE[0][i] + 3 * u * u * t * CURVE[1][i]
      + 3 * u * t * t * CURVE[2][i] + t * t * t * CURVE[3][i]
  );
};

const tangent = (t) => {
  const u = 1 - t;
  const [p0, p1, p2, p3] = CURVE;
  return unit([0, 1].map(
    (i) => 3 * u * u * (p1[i] - p0[i]) + 6 * u * t * (p2[i] - p1[i]) + 3 * t * t * (p3[i] - p2[i])
  ));
};

/**
 * The shaft as one closed outline: up one side of the tapering stroke, back
 * down the other, with a round cap at the tail. `weight` scales the width,
 * which the favicon uses to keep the arrow alive at 16px.
 */
function shaftPath(weight = 1, steps = 40) {
  const half = (t) => (SHAFT_HALF[0] + (SHAFT_HALF[1] - SHAFT_HALF[0]) * t) * weight;
  const side = (sign) => {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const [x, y] = bezier(t);
      const [ux, uy] = tangent(t);
      pts.push([x - uy * half(t) * sign, y + ux * half(t) * sign]);
    }
    return pts;
  };
  const upper = side(1);
  const lower = side(-1).reverse();
  const capR = half(0);
  return `M${pt(upper[0])}${upper.slice(1).map((p) => `L${pt(p)}`).join('')}`
    + `${lower.map((p) => `L${pt(p)}`).join('')}`
    + `A${n(capR)} ${n(capR)} 0 0 0 ${pt(upper[0])}Z`;
}

/** The head, scaled about its own centre by `weight`. */
function headPath(weight = 1) {
  const { tip, barbs, notch } = HEAD;
  const c = [(tip[0] + barbs[0][0] + barbs[1][0]) / 3, (tip[1] + barbs[0][1] + barbs[1][1]) / 3];
  const s = (p) => [c[0] + (p[0] - c[0]) * weight, c[1] + (p[1] - c[1]) * weight];
  const mid = [(barbs[0][0] + barbs[1][0]) / 2, (barbs[0][1] + barbs[1][1]) / 2];
  const toTip = unit([tip[0] - mid[0], tip[1] - mid[1]]);
  const notchPt = [mid[0] + toTip[0] * notch, mid[1] + toTip[1] * notch];
  return `M${pt(s(tip))}L${pt(s(barbs[0]))}L${pt(s(notchPt))}L${pt(s(barbs[1]))}Z`;
}

/**
 * The mark's SVG elements in the TILE frame.
 *
 *   rounded   false gives a full-bleed square tile (for iOS, which masks
 *             its own corners)
 *   slate     override for the short bar; the favicon lifts it, since the
 *             export's value is ~1.3:1 on the tile and vanishes at 16px
 *   weight    arrow thickness multiplier
 *   outline   optional { color, width } stroke around the tile, for dark
 *             backgrounds where the near-black tile would otherwise lose
 *             its edge. Drawn inside the tile, so the footprint is unchanged.
 */
export function markElements({ rounded = true, slate = COLORS.slate, weight = 1, outline = null } = {}) {
  const rx = rounded ? TILE_RADIUS : 0;
  const inset = outline ? outline.width / 2 : 0;
  const tile = outline
    ? `<rect x="${inset}" y="${inset}" width="${TILE - inset * 2}" height="${TILE - inset * 2}" rx="${rx - inset}" `
      + `fill="${COLORS.tile}" stroke="${outline.color}" stroke-width="${outline.width}"/>`
    : `<rect width="${TILE}" height="${TILE}" rx="${rx}" fill="${COLORS.tile}"/>`;

  const bars = BARS.map((b) => {
    const fill = b.fill === 'slate' ? slate : COLORS[b.fill];
    const d = roundedPolygon(
      [[b.x0, BASE], [b.x0, b.top0], [b.x1, b.top1], [b.x1, BASE]],
      b.r
    );
    return `<path d="${d}" fill="${fill}"/>`;
  }).join('');

  // Two paths, not one: the shaft and head overlap, and as subpaths of a
  // single path opposite windings would punch a hole where they meet.
  const arrow = `<g fill="${COLORS.arrow}"><path d="${shaftPath(weight)}"/><path d="${headPath(weight)}"/></g>`;
  return tile + bars + arrow;
}
