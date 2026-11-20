/**
 * The raster sizes the web asks for, rendered from the supplied brand vectors in public/brand/.
 *
 *   pnpm brand          write favicon.ico, icon-*.png, apple-touch-icon.png, mstile and the PNG logo
 *   pnpm brand:check    fail if a file is missing, the wrong size, or /icon.svg is not the favicon vector
 *
 * The vectors in public/brand/ are the source of truth and are never edited by this script (only
 * their <title>s were set when they were named). Everything here is a straight render of them:
 * no tracing, no redrawing. Colours come from the files themselves (the app icon's own ground), so
 * a new set of vectors needs no change here.
 *
 *   app-icon.svg        rounded square, the Apple touch icon, manifest icons, Windows tile
 *   favicon-64.svg      the same mark for the tab: /icon.svg, and the 16/32/48 inside favicon.ico
 *   logo-primary.svg    the lockup, as a PNG for places that do not take SVG (a CMS logo field)
 *
 * PNGs are not compared byte for byte (libvips differs between machines); the check is that they
 * exist at the right size.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const brand = join(pub, 'brand');
const check = process.argv.includes('--check');

const read = (f) => readFileSync(join(brand, f));
const APP = read('app-icon.svg');
const FAVICON = read('favicon-64.svg');
const LOGO = read('logo-primary.svg');

/** The app icon's own ground: the first rect's fill. */
const ground = APP.toString().match(/<rect[^>]*fill="(#[0-9A-Fa-f]{6})"/)?.[1];
if (!ground) throw new Error('app-icon.svg: no ground rect to read a colour from');

const render = (svg, size) => sharp(svg, { density: 512 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toBuffer();

/** The icon on its own ground, full bleed: no transparent corners (Apple and maskable icons need none). */
async function bleed(size, scale = 1) {
  const inner = Math.round(size * scale);
  const mark = await render(APP, inner);
  return sharp({ create: { width: size, height: size, channels: 4, background: ground } })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** A PNG-in-ICO file: the .ico container just wraps PNGs. */
function ico(pngs) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const dir = [];
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8); e.writeUInt32LE(offset, 12);
    dir.push(e); offset += data.length;
  }
  return Buffer.concat([head, ...dir, ...pngs.map((x) => x.data)]);
}

const SQUARE = {
  'icon-192.png': 192, 'icon-512.png': 512,
  'icon-maskable-192.png': 192, 'icon-maskable-512.png': 512,
  'apple-touch-icon.png': 180, 'mstile-150x150.png': 150,
};

if (check) {
  let bad = 0;
  const fav = join(pub, 'icon.svg');
  if (!existsSync(fav) || !readFileSync(fav).equals(FAVICON)) { bad++; console.error('stale: public/icon.svg is not public/brand/favicon-64.svg'); }
  for (const [file, size] of Object.entries(SQUARE)) {
    if (!existsSync(join(pub, file))) { bad++; console.error(`missing: public/${file}`); continue; }
    const m = await sharp(join(pub, file)).metadata();
    if (m.width !== size || m.height !== size) { bad++; console.error(`wrong size: public/${file} is ${m.width}x${m.height}, want ${size}`); }
  }
  for (const file of ['favicon.ico', join('brand', 'logo-primary.png')]) {
    if (!existsSync(join(pub, file))) { bad++; console.error(`missing: public/${file}`); }
  }
  if (bad) { console.error('\nthe brand rasters are stale: run `pnpm brand` and commit'); process.exit(1); }
  console.log('brand icons are up to date');
  process.exit(0);
}

writeFileSync(join(pub, 'icon.svg'), FAVICON);
writeFileSync(join(pub, 'icon-192.png'), await render(APP, 192));
writeFileSync(join(pub, 'icon-512.png'), await render(APP, 512));
// Maskable: the whole mark inside the 80% safe zone, on the icon's own ground.
writeFileSync(join(pub, 'icon-maskable-192.png'), await bleed(192, 0.8));
writeFileSync(join(pub, 'icon-maskable-512.png'), await bleed(512, 0.8));
writeFileSync(join(pub, 'apple-touch-icon.png'), await bleed(180));
writeFileSync(join(pub, 'mstile-150x150.png'), await render(APP, 150));
writeFileSync(join(pub, 'favicon.ico'), ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await render(FAVICON, size) })))));

// The lockup as a PNG, transparent, 1600 wide, for a CMS logo field and anywhere SVG is refused.
const meta = await sharp(LOGO, { density: 96 }).metadata();
writeFileSync(join(brand, 'logo-primary.png'), await sharp(LOGO, { density: 384 }).resize(1600, Math.round((1600 * meta.height) / meta.width)).png({ compressionLevel: 9 }).toBuffer());

console.log(`wrote icon.svg, favicon.ico, ${Object.keys(SQUARE).join(', ')}, brand/logo-primary.png (ground ${ground})`);
