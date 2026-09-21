// ─────────────────────────────────────────────────────────────
// Builds the two shipped logo assets from src/assets/logo-lockup.svg.
//
// Run with:  npm run logo
//
// Outputs src/assets/generated/logo.svg and logo-reversed.svg.
//
// ── What the master actually is ──
//
// Not a hand-drawn vector. It is a converter's output, and it is a mix:
//
//   - The WORDMARK is genuine vector, one <path> per letter, and the fills
//     are already the site's own brand values: #0b1f3a is --navy and
//     #1d9e75 is --teal, to the digit. That is what makes a reversed
//     version a recolour rather than a redraw.
//   - The ICON and the divider rule are RASTERS, each stored twice: a
//     colour image, plus a greyscale image used as a luminance mask. Two
//     filters turn that mask into alpha.
//   - On top of both sits a full-canvas 1774x887 image that is blank
//     white. It contributes nothing, it is 614 KB of the 757 KB file, and
//     it is the only reason the master renders as an opaque rectangle
//     rather than a transparent logo.
//   - A 22 KB <metadata> block of C2PA provenance.
//
// So this script drops the backdrop and the metadata, flattens each
// colour-plus-mask pair into one image at the size the page actually draws
// it, crops the viewBox to the artwork, and emits the light and reversed
// variants.
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
// src/assets/generated. Re-run only when the master changes.
// ─────────────────────────────────────────────────────────────

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const root = dirname(fileURLToPath(new URL('.', import.meta.url)));
const assets = join(root, 'src', 'assets');
const outDir = join(assets, 'generated');
const SOURCE = join(assets, 'logo-lockup.svg');

/* Each embedded raster is resized to the pixels it can actually use, which
   means working out how big it lands on screen rather than picking a
   number. The navbar draws the whole lockup about 245 CSS px wide, so a
   layer placed W user units wide inside a viewBox VW units wide renders at
   W / VW * 245 px, times DPR for retina.

   Doing this per layer is not fussiness. The three layers are 310x323,
   291x223 and 21x283, and one fixed width for all of them UPSCALES the
   last one, the divider hairline, from 21px to 160px wide. That single
   mistake added 137 KB to the output. Never enlarge. */
const NAV_CSS_WIDTH = 245;
const DPR = 3;

/* The wordmark fill in the master, which is --navy exactly. In the
   reversed asset it becomes white. --teal is left alone: teal on navy is
   5.1:1, and leaving the brand accent bright in dark is the same call
   theme.css already makes for --accent-ink. */
const WORDMARK_INK = '#0b1f3a';
const WORDMARK_INK_REVERSED = '#ffffff';

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

/**
 * Flatten a colour image plus its luminance mask into one RGBA PNG, sized
 * to what the page can actually show.
 *
 * Palette PNG, not truecolour: this is flat artwork, a navy tile with
 * three solid bars and a white arrow, so indexing it costs nothing
 * visually while cutting the payload by roughly 5x. It also stays a PNG,
 * which is the one raster format certain to decode inside an SVG
 * everywhere.
 */
async function flatten(colourB64, maskB64, targetWidth) {
  const colour = Buffer.from(colourB64, 'base64');
  const mask = Buffer.from(maskB64, 'base64');
  const meta = await sharp(colour).metadata();

  const width = Math.max(1, Math.min(meta.width, targetWidth));   // never enlarge
  const height = Math.max(1, Math.round((meta.height / meta.width) * width));

  const rgb = await sharp(colour).resize({ width, height }).removeAlpha().toBuffer();
  /* The master's two filters compute alpha as the mask's LUMINANCE
     (0.2126/0.7152/0.0722), which is what greyscale conversion does. */
  const alpha = await sharp(mask).resize({ width, height }).greyscale().toColourspace('b-w').toBuffer();

  const png = await sharp(rgb).joinChannel(alpha)
    .png({ compressionLevel: 9, palette: true, colours: 128, effort: 10 })
    .toBuffer();

  return { png, width, height, from: `${meta.width}x${meta.height}` };
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const original = await readFile(SOURCE, 'utf8');
  let svg = original;
  console.log(`\nmaster  ${kb(original.length)}`);

  // ── 1. C2PA provenance block ────────────────────────────────────────
  let before = svg.length;
  svg = svg.replace(/<metadata>[\s\S]*?<\/metadata>/, '');
  console.log(`  metadata stripped          -${kb(before - svg.length)}`);

  // ── 2. the blank full-canvas backdrop ───────────────────────────────
  const wAttr = svg.match(/<svg[^>]*?\swidth="(\d+)"/);
  const hAttr = svg.match(/<svg[^>]*?\sheight="(\d+)"/);
  if (!wAttr || !hAttr) throw new Error('could not read the svg width/height');
  const cw = Number(wAttr[1]), ch = Number(hAttr[1]);

  const backdrop = new RegExp(
    '<g clip-path="url\\(#[0-9a-f]+\\)">\\s*<g transform="[^"]*">\\s*'
    + `<image[^>]*width="${cw}"[^>]*height="${ch}"[^>]*/>\\s*</g>\\s*</g>`
  );
  if (!backdrop.test(svg)) {
    throw new Error(`no ${cw}x${ch} blank backdrop found; has the master changed shape?`);
  }
  before = svg.length;
  svg = svg.replace(backdrop, '');
  console.log(`  ${cw}x${ch} backdrop removed  -${kb(before - svg.length)}`);

  // ── 3. flatten every colour + luminance-mask pair ───────────────────
  const masks = [...svg.matchAll(
    /<mask id="([0-9a-f]+)">[\s\S]*?<image[^>]*?(?:xlink:href|href)="data:image\/png;base64,([^"]*)"[^>]*\/>[\s\S]*?<\/mask>/g
  )];
  if (!masks.length) throw new Error('no masked images found; has the master changed shape?');

  const viewBoxWidth = Number(svg.match(/viewBox="([\d.\-\s]+)"/)[1].trim().split(/\s+/)[2]);
  let saved = 0;

  for (const [, id, maskB64] of masks) {
    const group = new RegExp(
      `<g mask="url\\(#${id}\\)">\\s*(<g transform="([^"]*)">)\\s*`
      + '(<image[^>]*?(?:xlink:href|href)="data:image/png;base64,([^"]*)"[^>]*/>)\\s*</g>\\s*</g>'
    );
    const m = svg.match(group);
    if (!m) throw new Error(`mask ${id} has no matching masked group`);
    const [whole, openG, transform, imageTag, colourB64] = m;

    /* How wide this layer lands in user units: its own width attribute,
       times the scale in its transform matrix. */
    const placedWidth = Number(imageTag.match(/\swidth="([\d.]+)"/)[1])
      * Number(transform.match(/matrix\(([-\d.]+)/)[1]);
    const target = Math.ceil((placedWidth / viewBoxWidth) * NAV_CSS_WIDTH * DPR);

    const flat = await flatten(colourB64, maskB64, target);
    /* width/height on the <image> are USER units and fix the placement, so
       they must survive untouched even though the pixels behind them
       shrink. Only the data URI changes. */
    const newImage = imageTag.replace(
      /(?:xlink:href|href)="data:image\/png;base64,[^"]*"/,
      `xlink:href="data:image/png;base64,${flat.png.toString('base64')}"`
    );
    const replacement = `${openG}${newImage}</g>`;
    saved += whole.length - replacement.length;
    svg = svg.replace(whole, replacement);

    console.log(`    layer ${flat.from.padEnd(8)} -> ${`${flat.width}x${flat.height}`.padEnd(9)}`
      + `${kb(flat.png.length).padStart(8)}   (renders ${(placedWidth / viewBoxWidth * NAV_CSS_WIDTH).toFixed(0)}px wide)`);

    svg = svg.replace(new RegExp(`<mask id="${id}">[\\s\\S]*?</mask>`), '');
  }

  for (const fid of [...svg.matchAll(/<filter[^>]*id="([0-9a-f]+)"/g)].map((x) => x[1])) {
    if (!svg.includes(`url(#${fid})`)) {
      svg = svg.replace(new RegExp(`<filter[^>]*id="${fid}"[\\s\\S]*?</filter>`), '');
    }
  }
  console.log(`  ${masks.length} mask pairs flattened      -${kb(saved)}`);

  // ── 4. crop the viewBox to the artwork ──────────────────────────────
  const vbParts = svg.match(/viewBox="([\d.\-\s]+)"/)[1].trim().split(/\s+/).map(Number);
  const vw = vbParts[2], vh = vbParts[3];

  const probeScale = 4;
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 * probeScale })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, x1 = -1, y0 = info.height, y1 = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * info.channels + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error('the cleaned svg renders as fully transparent');

  const k = vw / info.width;
  const pad = 0.5;
  const box = {
    x: Math.max(0, x0 * k - pad),
    y: Math.max(0, y0 * k - pad),
    w: Math.min(vw, (x1 - x0 + 1) * k + pad * 2),
    h: Math.min(vh, (y1 - y0 + 1) * k + pad * 2),
  };
  const r = (n) => Number(n.toFixed(2));
  console.log(`  viewBox cropped to artwork   ${r(box.w)} x ${r(box.h)}`
    + `  aspect ${(box.w / box.h).toFixed(2)}:1`
    + `  (dropped ${(100 * (1 - (box.w * box.h) / (vw * vh))).toFixed(0)}% empty canvas)`);

  svg = svg
    .replace(/viewBox="[^"]*"/, `viewBox="${r(box.x)} ${r(box.y)} ${r(box.w)} ${r(box.h)}"`)
    .replace(/\swidth="\d+"/, ` width="${Math.round(box.w)}"`)
    .replace(/\sheight="\d+"/, ` height="${Math.round(box.h)}"`)
    .replace(/\szoomAndPan="[^"]*"/, '')
    .replace(/<defs>\s*<g\/>\s*/, '<defs>')
    .replace(/>\s+</g, '><')
    .trim();

  // ── 5. the two variants ─────────────────────────────────────────────
  const ink = new RegExp(WORDMARK_INK, 'gi');
  const swaps = (svg.match(ink) ?? []).length;
  if (!swaps) throw new Error(`no ${WORDMARK_INK} wordmark fills found to reverse`);

  const light = svg;
  const reversed = svg.replace(ink, WORDMARK_INK_REVERSED);

  await writeFile(join(outDir, 'logo.svg'), light);
  await writeFile(join(outDir, 'logo-reversed.svg'), reversed);

  console.log(`\n  logo.svg           ${kb(light.length)}`);
  console.log(`  logo-reversed.svg  ${kb(reversed.length)}   (${swaps} wordmark fills navy -> white)`);
  console.log(`  master was ${kb(original.length)}: ${(original.length / light.length).toFixed(0)}x smaller\n`);
}

main().catch((err) => {
  console.error('Logo build failed:', err.message);
  process.exit(1);
});
