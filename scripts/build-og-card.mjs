/**
 * Render the social card once, into public/og-bryan-fawcett.jpg.
 *
 * Not a build step: the card only changes when the portrait or the wording
 * does, and og:image has to live at a stable, unhashed URL so scrapers can
 * cache it. Run by hand after either changes:
 *
 *   node scripts/build-og-card.mjs
 *
 * The type is set with the site's own faces. librsvg reads fontconfig, not
 * woff2, so install the vendored fonts as TTF first (see the README note in
 * scripts/fetch-fonts.py) or the card falls back to a system serif.
 */
import sharp from 'sharp';
import { SHEET, INK, MARKS } from '../src/brand/tokens.ts';

const W = 1200;
const H = 630;
const PLATE = 470;

// The exact family names fontconfig reports for the vendored variable fonts —
// `fc-list | grep -Ei 'cormorant|plex'`. "Cormorant Garamond" alone matches
// nothing and silently falls back to a system sans.
const SERIF = 'Cormorant Garamond Light';
const MONO = 'IBM Plex Mono SemiBold';

const face = await sharp('src/assets/bryan-fawcett.png')
  .extract({ left: 105, top: 130, width: 620, height: 620 })
  .resize(PLATE, PLATE)
  .modulate({ saturation: 0.5, brightness: 0.97 })
  .toBuffer();

// The same line vocabulary the site uses: hairline frame, corner brackets,
// a ruled label. Written as SVG because it composites in one pass.
const seg = 34;
const px = 80;
const py = (H - PLATE) / 2;
const tx = px + PLATE + 64;

const overlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect x="28" y="28" width="${W - 56}" height="${H - 56}"
        fill="none" stroke="${INK.base}" stroke-opacity="0.28" stroke-width="1"/>

  <rect x="${px - 7}" y="${py - 7}" width="${PLATE + 14}" height="${PLATE + 14}"
        fill="none" stroke="${INK.base}" stroke-opacity="0.2" stroke-width="1"/>
  <g stroke="${INK.base}" stroke-width="2" fill="none">
    ${corner(px - 7, py - 7, 1, 1)}
    ${corner(px + PLATE + 7, py - 7, -1, 1)}
    ${corner(px - 7, py + PLATE + 7, 1, -1)}
    ${corner(px + PLATE + 7, py + PLATE + 7, -1, -1)}
  </g>

  <text x="${tx}" y="${py + 176}" font-family="${SERIF}" font-size="76"
        font-weight="700" fill="${INK.base}">Bryan Fawcett</text>
  <text x="${tx}" y="${py + 222}" font-family="${MONO}" font-size="20"
        font-weight="600" letter-spacing="5.2" fill="${INK.base}"
        fill-opacity="0.72">DIGITAL CRAFTSMAN</text>

  <line x1="${tx}" y1="${py + 268}" x2="${W - 80}" y2="${py + 268}"
        stroke="${INK.base}" stroke-opacity="0.28" stroke-width="1"/>

  <text x="${tx}" y="${py + 320}" font-family="${SERIF}" font-size="35"
        font-style="italic" fill="${INK.base}" fill-opacity="0.9">I craft dynamic ecosystems</text>
  <text x="${tx}" y="${py + 364}" font-family="${SERIF}" font-size="35"
        font-style="italic" fill="${INK.base}" fill-opacity="0.9">that unite and empower</text>
  <text x="${tx}" y="${py + 408}" font-family="${SERIF}" font-size="35"
        font-style="italic" fill="${INK.base}" fill-opacity="0.9">communities.</text>

  <text x="${tx}" y="${py + 462}" font-family="${MONO}" font-size="17"
        font-weight="600" letter-spacing="4" fill="${MARKS.pencil}">BRYANFAWCETT.COM</text>
</svg>`);

/** Two strokes meeting at (x, y), running in the (dx, dy) direction. */
function corner(x, y, dx, dy) {
  return `<path d="M ${x + dx * seg} ${y} L ${x} ${y} L ${x} ${y + dy * seg}"/>`;
}

await sharp({ create: { width: W, height: H, channels: 3, background: SHEET.base } })
  .composite([
    { input: face, left: px, top: py },
    { input: overlay, left: 0, top: 0 },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile('public/og-bryan-fawcett.jpg');

console.log(`og card ${W}x${H} → public/og-bryan-fawcett.jpg`);
