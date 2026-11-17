/**
 * Cut Noto Serif SC down to the Chinese this site could ever set.
 *
 *     pnpm cjk
 *
 * Writes `public/fonts/noto-serif-sc-<weight>-gb2312.woff2` and prints the
 * `@font-face` blocks for `src/styles/global.css`.
 *
 * ## Why a webfont at all
 *
 * Han falls to the reader's own system face otherwise, and the faces are fine —
 * but *which* face depends on the platform, so the same Chinese paragraph is
 * Songti on a Mac and SimSun on Windows beside Latin that is IBM Plex either
 * way. One vendored face makes the pairing the same everywhere.
 *
 * ## Why GB2312 Level 1, and not the exact text
 *
 * An exact subset of the ~880 characters the site currently sets is 149 kB per
 * weight — six times lighter, and wrong. The blog renders from EmDash *per
 * request*: publishing a Chinese adventure puts it live without a rebuild, so
 * it would reach characters the last build never saw and fall back mid
 * sentence, one glyph at a time. A frequency set does not depend on today's
 * text, so it cannot go stale between builds.
 *
 * Level 1 is the 3,755 most common characters and covers ~99.9% of running
 * modern Chinese. Level 2 doubles the weight for the rare tail; a name or a
 * classical quotation that falls outside Level 1 lands on the system face,
 * which is exactly where all of it lands today.
 *
 * ## What it costs, and who pays
 *
 * Nothing, for an English reader. Every `@font-face` this emits carries a
 * `unicode-range` covering only CJK, so a browser downloads the file only when
 * the page actually sets a character in it — the English routes never touch it.
 * The weight lands on `/zh` alone.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'public', 'fonts');
const FAMILY = 'Noto Serif SC';

/* Body and labels. `--label-weight` is 600 and body copy is 400; the site sets
 * no Han at 700, and each weight is a separate static instance — Noto Serif SC
 * is not variable on Google Fonts — so a third would be another 700 kB. */
const WEIGHTS = [400, 600];

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

/** GB2312 Level 1: rows 16–55, the 3,755 most common characters. */
function gb2312Level1() {
  const out = new Set();
  const dec = new TextDecoder('gb2312');
  for (let hi = 0xb0; hi <= 0xd7; hi++) {
    for (let lo = 0xa1; lo <= 0xfe; lo++) {
      const ch = dec.decode(new Uint8Array([hi, lo]));
      if (ch && ch !== '�') out.add(ch.codePointAt(0));
    }
  }
  return out;
}

/* Full-width punctuation and the CJK marks — a Chinese sentence is unreadable
 * without them, and they are not in the GB2312 hanzi rows. */
const PUNCTUATION = (() => {
  const s = new Set();
  for (let c = 0x3000; c <= 0x303f; c++) s.add(c); // 、。〈〉《》「」『』
  for (let c = 0xff00; c <= 0xff65; c++) s.add(c); // ！＂＃…full-width forms
  for (let c = 0x2010; c <= 0x201f; c++) s.add(c); // dashes and quotes
  return s;
})();

const keep = [...new Set([...gb2312Level1(), ...PUNCTUATION])].sort((a, b) => a - b);

/**
 * The `unicode-range` the `@font-face` will carry.
 *
 * Deliberately the *blocks*, not the exact code points: it has to be a superset
 * of what the file contains, so a character the subset lacks still falls
 * through to the system face rather than rendering as tofu.
 *
 * And a superset of the Han only. The subset also contains dashes and curly
 * quotes — a Chinese sentence needs them — but naming U+2010-201F here made
 * every English page on the site download 690 kB of Chinese to draw an em
 * dash. A `unicode-range` is a download trigger, not a manifest.
 */
const RANGE = 'U+3000-303F, U+4E00-9FFF, U+F900-FAFF, U+FF00-FF65';

mkdirSync(OUT, { recursive: true });

const css = [];
for (const weight of WEIGHTS) {
  /* Without a browser User-Agent Google serves the whole face as one TTF,
   * which is what we want — the woff2 it serves a browser is pre-split into
   * ~100 unicode-range chunks and would have to be reassembled. */
  const api = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(FAMILY).replace(/%20/g, '+')}:wght@${weight}&display=swap`;
  const sheet = await (await fetch(api)).text();
  const url = sheet.match(/url\((https[^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error(`no TTF in the stylesheet for ${FAMILY} ${weight}`);

  const src = path.join(OUT, `.noto-serif-sc-${weight}.ttf`);
  writeFileSync(src, Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer()));

  const dest = path.join(OUT, `noto-serif-sc-${weight}-gb2312.woff2`);
  execFileSync(
    'pyftsubset',
    [
      src,
      `--unicodes=${keep.map((c) => c.toString(16)).join(',')}`,
      '--flavor=woff2',
      '--layout-features=*',
      `--output-file=${dest}`,
    ],
    { stdio: 'inherit' },
  );

  const { size } = await import('node:fs').then((fs) => fs.statSync(dest));
  console.log(`  ${path.basename(dest)}  ${Math.round(size / 1024)} kB`);

  css.push(
    `@font-face {\n` +
      `  font-family: 'Noto Serif SC';\n` +
      `  font-style: normal;\n` +
      `  font-weight: ${weight};\n` +
      `  font-display: swap;\n` +
      `  src: url('/fonts/${path.basename(dest)}') format('woff2');\n` +
      `  unicode-range: ${RANGE};\n` +
      `}`,
  );
  execFileSync('rm', ['-f', src]);
}

console.log(`\n${keep.length} code points kept. Paste into src/styles/global.css:\n`);
console.log(css.join('\n\n'));
