/**
 * APCA contrast check — `pnpm verify:contrast`, and a CI gate.
 *
 * Every text block on every route, at desktop and phone width, scored against
 * the ground it is actually painted on, and held to the minimum size APCA gives
 * for that contrast at that weight. Exits non-zero if any block is under it.
 *
 * Three things WCAG 2.x contrast can't do and this does:
 *  - composites text over the *painted* ground (gradients, grain, ruling,
 *    schematics) rather than against a declared background-color;
 *  - reads the ground under the glyphs themselves, not under the element box;
 *  - judges by APCA's size-and-weight lookup rather than one flat ratio, which
 *    is the whole point of APCA: 13px/400 and 24px/700 are not the same ask.
 *
 * How the ground is found, and why it took three tries:
 *
 *  1. Hiding only the target element's ink reads its *parent's* ink as ground
 *     whenever the target is an inline run inside a painted block — an `<em>`
 *     inside a `<p>`. Same colour both sides, so an ordinary emphasis scores
 *     Lc 0. That was six of the seven "worst" results in the first run.
 *  2. Hiding every element's ink at once fixes that and breaks something else:
 *     the element's own box contains its border, its mineral bar, its ::after
 *     rule — all full-strength ink, none of it under a glyph. A chip scored
 *     Lc 7.8 against its own hairline border.
 *
 * So: shoot the box twice, once with the page's ink on and once with it off,
 * and treat the pixels that differ as the glyphs. The ground is then the
 * worst-case pixel of the ink-off plate *inside that mask* — the ground the
 * letters are actually drawn on, and nothing else.
 */
import { chromium } from 'playwright';
import { APCAcontrast, sRGBtoY, fontLookupAPCA } from 'apca-w3';

const PORT = process.env['CONTRAST_PORT'] || process.argv[2] || '4321';
const HOST = process.env['CONTRAST_HOST'] || '127.0.0.1';
/* Both the desktop column and a 390px phone: the shell reflows, panels narrow
 * and the display sizes clamp down, so a pairing that clears the floor on one
 * can miss it on the other. */
const WIDTHS = (process.argv[3] || '1280,390').split(',').map(Number);
/*
 * The site follows the device's colour scheme, so every block is scored in
 * both: a pairing that clears on the dark board can fail on paper, and the
 * reverse. Pass a third argument to narrow it, e.g. `light`.
 */
const SCHEMES = (process.argv[4] || 'light,dark').split(',');
const ROUTES = [
  '/', '/experience', '/adventures', '/origins-with-perspective', '/minerals', '/book', '/nope',
  '/zh', '/zh/experience', '/zh/adventures', '/zh/origins-with-perspective', '/zh/minerals', '/zh/book',
];

/*
 * Freeze before measuring anything.
 *
 * The nav links fade colour over 0.2s, and a probe that shoots mid-fade reads
 * the ink as the ground. `scroll-behavior: smooth` is the same hazard one level
 * up: scrollIntoViewIfNeeded returns before the page has stopped moving, so the
 * two plates get taken of different content and the glyph diff is meaningless.
 */
const FREEZE = `
  html{scroll-behavior:auto!important}
  *,*::before,*::after{transition:none!important;animation:none!important}
`;

/* Every letterform on the page off at once. Borders, rules and bars stay —
 * the glyph mask is what excludes them. */
const PLATE = `
  html.__plate, html.__plate *, html.__plate *::before, html.__plate *::after {
    color: transparent !important;
    text-decoration-color: transparent !important;
    -webkit-text-stroke-color: transparent !important;
    text-shadow: none !important;
    caret-color: transparent !important;
  }
`;

const SEL = 'p,li,h1,h2,h3,h4,h5,h6,a,span,dd,dt,blockquote,figcaption,button,time,strong,em,code,label';
const parseRGB = (s) => (s.match(/[\d.]+/g) || []).slice(0, 4).map(Number);
const over = (fg, bg) => { const a = fg[3] ?? 1; return [0, 1, 2].map(i => Math.round(fg[i] * a + bg[i] * (1 - a))); };

const browser = await chromium.launch();

/*
 * The widths run concurrently.
 *
 * Nothing in a width's pass touches anything outside it — its findings, its
 * skips and its count are all declared inside — so the only thing the sequence
 * ever bought was tidy console output, and that is what `out` is for: each
 * width buffers its own report and prints it whole at the end, so the two do
 * not interleave. Measured 133s to 89s.
 */
const checkWidth = async (WIDTH, SCHEME) => {
const out = [];
const log = (...a) => out.push(a.join(' '));
const page = await browser.newPage({
  viewport: { width: WIDTH, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: SCHEME,
});
const findings = [];
const aside = [];
const unreachable = [];
let checked = 0;

for (const route of ROUTES) {
  /*
   * A 5xx is skipped; a navigation error is fatal.
   *
   * The four blog routes render from Sanity per request, and an unreachable CMS
   * is a different problem with its own three states (see CLAUDE.md) — not this
   * check's to fail on. But a server that is not answering at all is not a
   * skippable route: without the distinction, a Worker that fell over mid-run
   * skips all thirteen routes, finds no failures, and reports a clean pass.
   */
  let res;
  try {
    res = await page.goto(`http://${HOST}:${PORT}${route}`, { waitUntil: 'networkidle' });
  } catch (err) {
    console.error(`\ncannot reach ${route}: ${err.message}`);
    console.error(`Is the site being served at ${HOST}:${PORT}?`);
    await browser.close();
    process.exit(2);
  }
  /*
   * 503 is the blog saying Sanity is unreachable, which is a different problem
   * with its own three states (see CLAUDE.md) and not this gate's to fail on.
   * Every other 5xx is a broken page, and skipping those was the same hole in
   * a different shape: thirteen routes could 500 and the run would still find
   * no failures and exit 0.
   */
  if (res && res.status() === 503) {
    unreachable.push(`${route} — HTTP 503 (CMS unreachable)`);
    continue;
  }
  if (res && res.status() >= 500) {
    console.error(`\n${route} returned HTTP ${res.status()} — the page is broken, not skippable.`);
    await browser.close();
    process.exit(2);
  }
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('.reveal')) el.classList.add('is-visible');
  });
  await page.addStyleTag({ content: FREEZE });
  await page.addStyleTag({ content: PLATE });
  // The skip link is translated off-canvas until focused. Focus it, so it is
  // measured in the only state a reader ever sees it in.
  await page.evaluate(() => document.querySelector('.skip-link')?.focus());
  await page.waitForTimeout(150);

  // Leaf text elements only, deduped by (class, size, weight, colour).
  const targets = await page.evaluate((sel) => {
    const out = [];
    const seen = new Set();
    for (const el of document.querySelectorAll(sel)) {
      if (el.querySelector(sel)) continue;
      const txt = (el.textContent || '').trim();
      if (!txt) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (el.closest('.visually-hidden') || cs.clipPath?.includes('inset(50%)')) continue;

      // Stroked type paints its letterform with -webkit-text-stroke and leaves
      // `color` transparent. The stroke is the ink; measure that.
      const strokeW = parseFloat(cs.webkitTextStrokeWidth) || 0;
      const alpha = Number((cs.color.match(/[\d.]+/g) || [])[3] ?? 1);
      const stroked = alpha === 0 && strokeW > 0;
      const ink = stroked ? cs.webkitTextStrokeColor : cs.color;
      if (!stroked && alpha === 0) continue;

      // Parked off-canvas until focused (the skip link): no ground to sample.
      const offCanvas = r.bottom + scrollY < 0 || r.right + scrollX < 0;

      const cls = (typeof el.className === 'string' ? el.className.split(' ')[0] : '') || el.tagName.toLowerCase();
      const key = `${cls}|${cs.fontSize}|${cs.fontWeight}|${ink}`;
      if (seen.has(key)) continue;
      seen.add(key);
      el.setAttribute('data-apca', String(out.length));
      out.push({
        i: out.length, cls, size: parseFloat(cs.fontSize),
        weight: Number(cs.fontWeight) || 400, color: ink, stroked, offCanvas,
        sample: txt.slice(0, 28),
      });
    }
    return out;
  }, SEL);

  const plate = (on) => page.evaluate(
    (v) => document.documentElement.classList.toggle('__plate', v), on);

  /*
   * One pair of plates per viewport, not per element.
   *
   * Two full-viewport screenshots serve every target that fits inside the same
   * scroll window, which for this site is a dozen or more. Shooting each box
   * separately meant about 1400 screenshots a run, and `wrangler dev` falls
   * over somewhere under that load — the check then skipped every remaining
   * route and reported a clean pass. Fewer, larger captures is both faster and
   * the difference between a gate and a coin toss.
   */
  const vp = page.viewportSize();
  const docY = await page.evaluate(() => {
    const m = {};
    for (const el of document.querySelectorAll('[data-apca]')) {
      const r = el.getBoundingClientRect();
      m[el.getAttribute('data-apca')] = r.top + scrollY;
    }
    return m;
  });

  const queue = targets.filter((t) => !t.offCanvas);
  for (const t of targets) {
    if (t.offCanvas) aside.push({ route, why: 'off-canvas until focused', ...t });
  }
  queue.sort((a, b) => (docY[a.i] ?? 0) - (docY[b.i] ?? 0));

  let windowTop = null;
  /*
   * The skip link is focused only while the skip link itself is measured.
   * Left focused for the whole route, it sits over the sticky header, and
   * every header label under it was scored against the skip link rather than
   * against the header a reader sees. Changing the focus changes the page, so
   * the held window is dropped and the plates are taken again.
   */
  let skipFocused = true;
  for (const t of queue) {
    const el = await page.$(`[data-apca="${t.i}"]`);
    if (!el) continue;

    const wantSkip = await el.evaluate((node) => node.closest('.skip-link') !== null);
    if (wantSkip !== skipFocused) {
      await page.evaluate((focus) => {
        const link = document.querySelector('.skip-link');
        if (!(link instanceof HTMLElement)) return;
        if (focus) link.focus();
        else link.blur();
      }, wantSkip);
      await page.waitForTimeout(30);
      skipFocused = wantSkip;
      windowTop = null;
    }

    // Re-scroll only when this target does not fit in the window already held.
    let box = await el.boundingBox();
    if (!box || box.width < 2 || box.height < 2) continue;
    if (windowTop === null || box.y < 0 || box.y + box.height > vp.height) {
      const top = Math.max(0, (docY[t.i] ?? 0) - 80);
      await page.evaluate((y) => scrollTo(0, y), top);
      await page.waitForTimeout(30);
      box = await el.boundingBox();
      if (!box || box.width < 2 || box.height < 2) continue;
      await plate(false);
      const on = await page.screenshot();
      await plate(true);
      const off = await page.screenshot();
      await plate(false);
      const ok = await page.evaluate(async ([a64, b64]) => {
        const load = async (b64) => {
          const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
          const c = document.createElement('canvas');
          c.width = img.width; c.height = img.height;
          c.getContext('2d').drawImage(img, 0, 0);
          return c;
        };
        window.__A = await load(a64);
        window.__B = await load(b64);
        return window.__A.width === window.__B.width && window.__A.height === window.__B.height;
      }, [on.toString('base64'), off.toString('base64')]);
      if (!ok) { windowTop = null; continue; }
      windowTop = top;
    }

    /*
     * Read the content box, not the border box. Glyphs paint inside the
     * content box; the padding and border around them are where a pill's
     * rounded ends live, and Chromium re-rasterises that curve's antialiasing
     * a hair differently when the text colour changes. On a 44px pill the
     * edge pixels that moved were enough to pass as "glyph", scored against
     * the sheet beyond the curve, and failed a gold button with dark text as
     * Lc 0. Trimming to the content box loses no glyph pixel.
     */
    const inset = await el.evaluate((node) => {
      const cs = getComputedStyle(node);
      const n = (v) => parseFloat(v) || 0;
      // Inline boxes wrap across lines; their padding is not a frame to trim.
      if (cs.display.startsWith('inline') && cs.display !== 'inline-flex' && cs.display !== 'inline-block') {
        return { l: 0, r: 0, t: 0, b: 0 };
      }
      return {
        l: n(cs.paddingLeft) + n(cs.borderLeftWidth),
        r: n(cs.paddingRight) + n(cs.borderRightWidth),
        t: n(cs.paddingTop) + n(cs.borderTopWidth),
        b: n(cs.paddingBottom) + n(cs.borderBottomWidth),
      };
    });
    const content = {
      x: box.x + inset.l,
      y: box.y + inset.t,
      width: Math.max(2, box.width - inset.l - inset.r),
      height: Math.max(2, box.height - inset.t - inset.b),
    };

    // Clamp the read into the viewport: a box hanging off the edge would
    // otherwise read pixels the capture does not hold.
    const cx = Math.max(0, Math.min(content.x, vp.width - 2));
    const cy = Math.max(0, Math.min(content.y, vp.height - 2));
    const cw = Math.max(2, Math.min(content.width, vp.width - cx));
    const ch = Math.max(2, Math.min(content.height, vp.height - cy));

    const ink = parseRGB(t.color);
    const ground = await page.evaluate(([rect, inkRGB]) => {
      const grab = (canvas) => canvas.getContext('2d')
        .getImageData(rect.x, rect.y, rect.w, rect.h).data;
      const A = grab(window.__A), B = grab(window.__B);
      const lum = (r, g, b) => {
        const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const inkL = lum(inkRGB[0], inkRGB[1], inkRGB[2]);
      // A pixel belongs to a glyph if the ink plate moved it appreciably. 24 is
      // above antialiasing fringe and below any real stem.
      const hist = new Map();
      let n = 0;
      for (let i = 0; i < A.length; i += 4) {
        const d = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
        if (d < 24) continue;
        n++;
        const k = (B[i] << 16) | (B[i + 1] << 8) | B[i + 2];
        hist.set(k, (hist.get(k) || 0) + 1);
      }
      if (!n) return null;
      /*
       * Worst case = the ground closest in luminance to the ink — but only
       * where enough of the text actually sits on it.
       *
       * Taking the single closest-in-luminance pixel scores a button by the one
       * antialiased pixel where a glyph meets the button's own rim: 504 of 516
       * mask pixels on the deck button were the white fill, and the outlier
       * that decided its score was a single pixel of edge. So a ground has to
       * account for at least half a percent of the glyph coverage, and at least
       * two pixels, before it counts as the ground this text is on. A grid line
       * crossing a text block clears that easily; a rim pixel does not.
       */
      const floor = Math.max(2, Math.ceil(n * 0.005));
      let best = null, bestGap = Infinity, bestCount = 0;
      for (const [k, count] of hist) {
        if (count < floor) continue;
        const px = [(k >> 16) & 255, (k >> 8) & 255, k & 255];
        const gap = Math.abs(lum(px[0], px[1], px[2]) - inkL);
        if (gap < bestGap) { bestGap = gap; best = px; bestCount = count; }
      }
      return best ? { bg: best, n, count: bestCount } : null;
    }, [{ x: Math.round(cx), y: Math.round(cy), w: Math.round(cw), h: Math.round(ch) }, ink.slice(0, 3)]);

    /*
     * No glyph pixels moved between the plates — and that is a failure, not an
     * aside.
     *
     * The mask works by turning the page's ink off and keeping the pixels that
     * changed. Text painted in exactly its own background colour changes
     * nothing, so it produces an empty mask — the same empty mask as text that
     * is clipped away or covered. Filing all of it under "not scored" means the
     * one input the gate cannot measure is the one where contrast is zero.
     *
     * This is not hypothetical. `.panel a` beat `.btn` on specificity and
     * painted the primary call to action in `--ink` on an `--ink` fill; the
     * gate printed `.btn  no glyph pixels found  "Book a call"` three lines
     * above "every text block clears the minimum" and exited 0.
     *
     * An element that is genuinely invisible for an innocent reason — clipped,
     * covered, occluded — has no business being measured either, so it does not
     * belong in a bucket that passes silently. Fail, and make the run say why.
     */
    if (!ground) {
      findings.push({
        route, cls: t.cls, size: t.size, weight: t.weight, Lc: 0,
        need: 'ANY', bg: 'no glyph pixels — ink may equal its ground',
        px: '0px', stroked: t.stroked, sample: t.sample,
      });
      continue;
    }

    const bg = ground.bg;
    const fg = over(ink, bg);
    const Lc = Math.abs(APCAcontrast(sRGBtoY(fg), sRGBtoY(bg)));
    const lut = fontLookupAPCA(Lc);
    const idx = Math.max(1, Math.min(9, Math.round(t.weight / 100)));
    const need = lut[idx];
    checked++;
    const prohibited = need >= 777;
    if (prohibited || t.size < need) {
      findings.push({
        route, cls: t.cls, size: t.size, weight: t.weight, Lc: +Lc.toFixed(1),
        need: prohibited ? 'prohibited' : need, bg: `rgb(${bg.join(' ')})`,
        px: `${ground.count}/${ground.n}px`, stroked: t.stroked, sample: t.sample,
      });
    }
  }
}

findings.sort((a, b) => a.Lc - b.Lc);
log(`\nchecked ${checked} text blocks across ${ROUTES.length - unreachable.length} routes at ${WIDTH}px, ${SCHEME}`);
log(`APCA failures: ${findings.length}\n`);
const seen = new Set();
for (const f of findings) {
  const k = `${f.cls}|${f.size}|${f.weight}`;
  if (seen.has(k)) continue;
  seen.add(k);
  const mark = f.stroked ? ' (stroked)' : '';
  log(`  Lc ${String(f.Lc).padStart(5)}  ${String(f.size).padStart(5)}px/${f.weight}  needs ${String(f.need).padStart(6)}px  on ${f.bg.padEnd(46)} ${String(f.px).padEnd(10)} .${f.cls.padEnd(22)}${mark} "${f.sample}"`);
}
log(`\n(${seen.size} distinct element classes failing)`);

if (unreachable.length) {
  log(`\nroutes skipped (${unreachable.length}):`);
  for (const u of unreachable) log(`  ${u}`);
}

if (aside.length) {
  const shown = new Set();
  log(`\nnot scored by screenshot (${aside.length}):`);
  for (const a of aside) {
    const k = `${a.cls}|${a.why}`;
    if (shown.has(k)) continue;
    shown.add(k);
    log(`  .${a.cls.padEnd(24)} ${a.why}  "${a.sample}"`);
  }
}

await page.close();
console.log(out.join('\n'));
return findings.length;
};

/*
 * Independent per width, so a scheme's widths run together; the schemes run
 * one after the other, so the dev server never carries more than the two
 * concurrent passes it was measured against.
 */
let failed = 0;
for (const scheme of SCHEMES) {
  failed += (await Promise.all(WIDTHS.map((w) => checkWidth(w, scheme)))).reduce((a, b) => a + b, 0);
}

await browser.close();
if (failed) {
  console.error(`\nAPCA: ${failed} text blocks under the minimum size for their contrast and weight.`);
  process.exit(1);
}
console.log('\nAPCA: every text block clears the minimum size for its contrast and weight.');
