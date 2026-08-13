// ─────────────────────────────────────────────────────────────
// Builds the responsive image derivatives from the full-size originals in
// src/assets/, writing them to src/assets/generated/.
//
// Run with:  npm run images
//
// The originals stay in the repo as the masters — they are the only copies
// at full resolution, and this script is re-runnable against them. Nothing
// imports them directly any more; components and CSS import out of
// generated/ instead.
//
// Sizes are derived from how each image is actually displayed, at 2x for
// retina, not from the source dimensions:
//
//   logo      shown at 45px tall in the navbar (245x45) and 38px in the
//             footer, so one 490x90 asset covers both at 2x. The source is
//             1654x304 — nearly 7x the pixels that ever reach the screen.
//
//   heroes    full-bleed CSS backgrounds: 800 for phones, 1600 for
//             everything else, which is also the source width. Only two
//             tiers because each one costs a hand-written CSS fallback
//             pair, and these photographs sit under an 87%-opaque navy
//             gradient — the detail a middle tier would buy is not visible.
//
//   kabiru    the founder portrait, a column roughly 450px wide at its
//             largest, so 400 / 640 / 900 covers 1x and 2x.
//
// Every raster gets a WebP and a same-size fallback in the original format.
// Nothing here is lossless: WebP q78 and JPEG q80 (mozjpeg) are the point
// on the curve where these particular photographs stop showing artefacts —
// re-check visually if you change them.
//
// Not part of `npm run build`: the output is committed so the build stays
// fast. Re-run this only when an original changes.
// ─────────────────────────────────────────────────────────────

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readdir, stat } from 'node:fs/promises';
import sharp from 'sharp';

const root = dirname(fileURLToPath(new URL('.', import.meta.url)));
const assets = join(root, 'src', 'assets');
const outDir = join(assets, 'generated');

const WEBP = { quality: 78 };
const JPEG = { quality: 80, mozjpeg: true };
const PNG = { compressionLevel: 9, palette: true };

const JOBS = [
  { src: 'logo.png', name: 'logo', widths: [490], fallback: 'png' },
  { src: 'hero-career.jpg', name: 'hero-career', widths: [800, 1600], fallback: 'jpg' },
  { src: 'hero-data.jpg', name: 'hero-data', widths: [800, 1600], fallback: 'jpg' },
  { src: 'kabiru.jpg', name: 'kabiru', widths: [400, 640, 900], fallback: 'jpg' },
];

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function main() {
  await mkdir(outDir, { recursive: true });

  let before = 0;
  let after = 0;

  for (const job of JOBS) {
    const srcPath = join(assets, job.src);
    const meta = await sharp(srcPath).metadata();
    const srcSize = (await stat(srcPath)).size;
    before += srcSize;
    console.log(`\n${job.src}  ${meta.width}x${meta.height}  ${kb(srcSize)}`);

    for (const w of job.widths) {
      const resized = () => sharp(srcPath).resize({ width: w, withoutEnlargement: true });

      const webpPath = join(outDir, `${job.name}-${w}.webp`);
      const webpInfo = await resized().webp(WEBP).toFile(webpPath);

      const fallbackPath = join(outDir, `${job.name}-${w}.${job.fallback}`);
      const fallbackInfo =
        job.fallback === 'png'
          ? await resized().png(PNG).toFile(fallbackPath)
          : await resized().jpeg(JPEG).toFile(fallbackPath);

      after += webpInfo.size + fallbackInfo.size;
      console.log(
        `  ${job.name}-${w}  ${webpInfo.width}x${webpInfo.height}` +
          `  webp ${kb(webpInfo.size)}  ${job.fallback} ${kb(fallbackInfo.size)}`
      );
    }
  }

  const files = (await readdir(outDir)).length;
  console.log(`\n✓ ${files} files in src/assets/generated/`);
  console.log(`  originals ${kb(before)} → derivatives ${kb(after)}`);
}

main().catch((err) => {
  console.error('Image generation failed:', err.message);
  process.exit(1);
});
