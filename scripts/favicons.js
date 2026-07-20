// ─────────────────────────────────────────────────────────────
// Generates the favicons from the brand logo in src/assets/logo.png.
//
// Run with:  npm run favicons
//
// The logo is a horizontal lockup (icon + wordmark). A favicon is far too
// small to render the wordmark legibly, so this crops the square icon off
// the left and uses that alone. The crop is derived, not hardcoded: the
// image is trimmed of its surrounding white first, and because the icon is
// the tallest element in the lockup, the trimmed height is the icon's own
// height — so a square of that size taken from the left edge is exactly
// the icon. That keeps working if the logo is re-exported at another size.
//
// Outputs (both committed, both referenced from index.html):
//   public/favicon-32.png    browser tab
//   public/favicon-192.png   apple-touch-icon / home screen
//
// Not part of `npm run build`: the output is committed so the build stays
// fast. Re-run this only when the logo changes.
// ─────────────────────────────────────────────────────────────

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = dirname(fileURLToPath(new URL('.', import.meta.url)));
const sourcePath = join(root, 'src', 'assets', 'logo.png');
const publicDir = join(root, 'public');

const SIZES = [32, 192];

async function main() {
  // Trim the white surround, then take the leading square: the icon.
  const { data, info } = await sharp(sourcePath)
    .trim({ threshold: 10 })
    .toBuffer({ resolveWithObject: true });

  const size = info.height;

  if (info.width < size) {
    throw new Error(
      `Expected a horizontal lockup wider than it is tall; got ${info.width}x${info.height}.`
    );
  }

  const icon = await sharp(data)
    .extract({ left: 0, top: 0, width: size, height: size })
    .toBuffer();

  for (const px of SIZES) {
    const out = join(publicDir, `favicon-${px}.png`);
    await sharp(icon).resize(px, px, { fit: 'cover' }).png().toFile(out);
    console.log(`  favicon-${px}.png  ${px}x${px}`);
  }

  console.log(`\n✓ favicons generated from the ${size}x${size} logo icon`);
}

main().catch((err) => {
  console.error('Favicon generation failed:', err.message);
  process.exit(1);
});
