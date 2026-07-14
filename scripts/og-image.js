// ─────────────────────────────────────────────────────────────
// Generates public/og-image.png — the 1200x630 card that LinkedIn,
// WhatsApp, X and Slack render when someone shares a link to the site.
//
// Run with:  npm run og
//
// Not part of `npm run build`: the output is committed, so the build
// stays fast and the card can't silently change on a deploy. Re-run this
// only when the brand or the tagline changes.
//
// This is a placeholder built from the brand tokens in styles/globals.css.
// Replacing public/og-image.png with a designed asset is a drop-in swap —
// keep it 1200x630 and under ~1MB (some scrapers refuse larger).
// ─────────────────────────────────────────────────────────────

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = dirname(fileURLToPath(new URL('.', import.meta.url)));
const outputPath = join(root, 'public', 'og-image.png');

const WIDTH = 1200;
const HEIGHT = 630;

const NAVY = '#0B1F3A';
const NAVY2 = '#122848';
const TEAL = '#24C28F';
const GOLD = '#F4A833';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="100%" stop-color="${NAVY2}"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Accent bar: teal for the data track, gold for the career track -->
  <rect x="0" y="0" width="600" height="10" fill="${TEAL}"/>
  <rect x="600" y="0" width="600" height="10" fill="${GOLD}"/>

  <!-- Oversized watermark, echoing the homepage hero -->
  <text x="1060" y="600" font-family="Helvetica, Arial, sans-serif"
        font-size="440" font-weight="bold" fill="#FFFFFF"
        fill-opacity="0.04" text-anchor="middle">12</text>

  <text x="80" y="200" font-family="Helvetica, Arial, sans-serif"
        font-size="26" font-weight="bold" fill="#FFFFFF" fill-opacity="0.6"
        letter-spacing="4">CAREERDATASOLUTIONS</text>

  <text x="80" y="300" font-family="Helvetica, Arial, sans-serif"
        font-size="64" font-weight="bold" fill="#FFFFFF">Data Driven <tspan fill="${TEAL}">Impact.</tspan></text>
  <text x="80" y="380" font-family="Helvetica, Arial, sans-serif"
        font-size="64" font-weight="bold" fill="#FFFFFF">Career Defining <tspan fill="${GOLD}">Results.</tspan></text>

  <text x="80" y="460" font-family="Helvetica, Arial, sans-serif"
        font-size="27" fill="#FFFFFF" fill-opacity="0.75">Power BI dashboards and ATS-optimized CVs.</text>
  <text x="80" y="500" font-family="Helvetica, Arial, sans-serif"
        font-size="27" fill="#FFFFFF" fill-opacity="0.75">Nairobi, Kenya — working with clients worldwide.</text>

  <text x="80" y="570" font-family="Helvetica, Arial, sans-serif"
        font-size="22" fill="${TEAL}">careerdatasolutions.com</text>
</svg>
`;

const info = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outputPath);

console.log(`✓ og-image.png — ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
