/**
 * The blog's read path treated as hostile input (Mzizi N4), plus the 21-family mineral mapping, the
 * three response states and the discovery files. Run with `pnpm test:blog`; no build and no EmDash.
 *
 * Each test was run against the code with its fix reverted and failed there (docs/emdash-migration.md,
 * "Sanitise at render"), so a pass means the fix is what makes it pass.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const src = (p) => import(`${root}src/${p}`);

const { renderBody, sanitizeBody, classifyLink } = await src('blog/portable-text.ts');
const { mineralOf, isoDate, imageOf, isPlausibleSlug } = await src('blog/normalize.ts');
const { responseFor } = await src('blog/http.ts');
const { adventuresLlms, adventuresSitemap } = await src('blog/discovery.ts');
const { MZIZI_PALETTE } = await src('brand/mzizi-palette.generated.ts');

const span = (text, marks = []) => ({ _type: 'span', _key: 'a', text, marks });
const block = (children, extra = {}) => ({ _type: 'block', _key: 'b', style: 'normal', markDefs: [], children, ...extra });
const linkBlock = (href) => block([span('word', ['k'])], { markDefs: [{ _type: 'link', _key: 'k', href }] });
const count = (s, needle) => s.split(needle).length - 1;

/* ---------------------------------------------------------------- 1. minerals */

test('every one of the 21 palette families maps to itself, and is keyed in tokens.css', () => {
  const families = Object.keys(MZIZI_PALETTE);
  assert.equal(families.length, 21);
  const tokens = readFileSync(`${root}src/styles/tokens.css`, 'utf8');
  for (const f of families) {
    assert.equal(mineralOf(f), f);
    assert.ok(tokens.includes(`[data-mineral="${f}"]`), `${f} has no [data-mineral] rule in tokens.css`);
  }
});

test('a mineral is never a hex or anything outside the palette', () => {
  for (const bad of ['#4DD0E1', 'RIVER', 'river ', 'red', '', null, undefined, 5, {}, ['river'], '<script>', '__proto__', 'constructor'])
    assert.equal(mineralOf(bad), undefined, JSON.stringify(bad));
});

test('seed/seed.json offers exactly the palette families, in palette order', () => {
  const seed = JSON.parse(readFileSync(`${root}seed/seed.json`, 'utf8'));
  const options = seed.collections.find((c) => c.slug === 'adventures').fields.find((f) => f.slug === 'mineral').validation.options;
  assert.deepEqual(options, Object.keys(MZIZI_PALETTE));
});

test('seed:minerals --check fails when the seed has drifted from the palette', () => {
  const run = (...args) =>
    execFileSync('node', ['--experimental-strip-types', '--import', `${root}scripts/ts-specifier-hook.mjs`, `${root}scripts/build-seed-minerals.mjs`, ...args], { encoding: 'utf8', stdio: 'pipe' });
  assert.match(run('--check'), /match the palette/);
});

/* ------------------------------------------------------------ 3. portable text */

test('hostile text is escaped, not interpreted', () => {
  const html = renderBody([block([span('<script>alert(1)</script> & "x" \'y\'')])]);
  assert.equal(html, '<p>&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot; &#x27;y&#x27;</p>');
});

test('block types that are not block or image are dropped (script, style, embeds, a bare span)', () => {
  for (const type of ['script', 'style', 'html', 'embed', 'span', '<img src=x onerror=alert(1)>']) {
    assert.equal(renderBody([{ _type: type, _key: 'x', code: 'alert(1)', text: 'visible?' }]), '', type);
  }
});

test('an unknown block style renders as a paragraph, never as the attacker-chosen tag', () => {
  assert.equal(renderBody([block([span('x')], { style: '<img src=x onerror=alert(1)>' })]), '<p>x</p>');
  assert.equal(renderBody([block([span('x')], { style: 'h1' })]), '<h2>x</h2>');
});

test('an unknown mark or annotation keeps the words and invents no attribute or class', () => {
  const html = renderBody([block([span('x', ['"><script>alert(1)</script>', 'k'])], { markDefs: [{ _type: 'evil', _key: 'k', href: 'x' }] })]);
  assert.equal(html, '<p>x</p>');
});

test('a mark key that tries to break out of an attribute is not a link', () => {
  const html = renderBody([block([span('x', ['k" onmouseover="alert(1)'])], { markDefs: [{ _type: 'link', _key: 'k" onmouseover="alert(1)', href: '/a' }] })]);
  assert.equal(html, '<p>x</p>');
  assert.ok(!html.includes('onmouseover'));
});

test('links: only web, mail, phone and on-site paths survive; the words always do', () => {
  const dead = ['javascript:alert(1)', ' javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:x', '/\\evil.example', '//evil.example', '\\\\evil.example', 'https://evil.example/ x', 'file:///etc/passwd', ''];
  for (const href of dead) {
    const html = renderBody([linkBlock(href)]);
    assert.equal(html, '<p>word</p>', JSON.stringify(href));
  }
  assert.match(renderBody([linkBlock('https://bryanfawcett.com/x')]), /<a href="https:\/\/bryanfawcett.com\/x">word<\/a>/);
  assert.match(renderBody([linkBlock('https://bryanfawcett.com.evil.example/')]), /target="_blank" rel="noopener noreferrer"/);
  assert.match(renderBody([linkBlock('mailto:a@b.example')]), /<a href="mailto:a@b.example">/);
});

test('a href that tries to leave its attribute is escaped', () => {
  const html = renderBody([linkBlock('https://example.org/"onmouseover="alert(1)')]);
  assert.match(html, /^<p><a href="[^"]*" target="_blank" rel="noopener noreferrer">word<\/a><\/p>$/);
});

test('image blocks: javascript:/data:/protocol-relative sources are dropped; alt cannot break out', () => {
  for (const url of ['javascript:alert(1)', 'data:image/svg+xml,<svg onload=alert(1)>', '//evil.example/x.png', 'http://insecure.example/x.png', '/x y.png'])
    assert.equal(renderBody([{ _type: 'image', _key: 'i', asset: { url } }]), '', url);
  const html = renderBody([{ _type: 'image', _key: 'i', asset: { _ref: 'abc' }, alt: '" onerror="alert(1)', caption: '<b>c</b>' }]);
  // The img has exactly the attributes the renderer wrote: nothing the alt said became one.
  assert.match(html, /<img src="[^"]*" alt="[^"]*" loading="lazy" decoding="async">/);
  assert.ok(html.includes('&lt;b&gt;c&lt;/b&gt;'));
});

test('non-string text, children, marks and bodies do not throw', () => {
  const html = renderBody([
    null,
    5,
    'str',
    [],
    block('not an array'),
    block([span({ a: 1 }), span(5), span(null), span(undefined), { _type: 'span', text: 'ok', marks: 'strong' }]),
    block([span('kept', [1, null, {}, ['strong']])]),
  ]);
  assert.match(html, /<p>kept<\/p>/);
  assert.equal(renderBody('not an array'), '');
  assert.equal(renderBody({ not: 'array' }), '');
  assert.equal(renderBody(undefined), '');
  assert.deepEqual(sanitizeBody(null), []);
});

test(`a span with thousands of marks renders its text (cap: 16 distinct, as in the Rust prototype)`, () => {
  const marks = Array.from({ length: 5000 }, (_, i) => `m${i}`);
  const defs = marks.map((k) => ({ _type: 'link', _key: k, href: `https://example.org/${k}` }));
  const html = renderBody([block([span('survives', marks)], { markDefs: defs })]);
  assert.ok(html.includes('survives'), 'the text must survive');
  assert.ok(count(html, '<a ') <= 16, `${count(html, '<a ')} nested links`);
  const repeated = renderBody([block([span('survives', Array.from({ length: 5000 }, () => 'strong'))])]);
  assert.equal(repeated, '<p><strong>survives</strong></p>');
});

test(`list nesting is bounded (cap: 6 levels)`, () => {
  const deep = renderBody([block([span('deep')], { listItem: 'bullet', level: 5000 })]);
  assert.ok(deep.includes('deep'));
  assert.ok(count(deep, '<ul>') <= 6, `${count(deep, '<ul>')} nested lists`);
  const many = renderBody(Array.from({ length: 3000 }, (_, i) => block([span('x')], { listItem: 'number', level: i + 1 })));
  assert.ok(many.includes('<ol>'));
  for (const bad of [-3, 0, NaN, Infinity, '2', null]) assert.ok(renderBody([block([span('x')], { listItem: 'bullet', level: bad })]).includes('<ul>'), String(bad));
  assert.equal(renderBody([block([span('x')], { listItem: '<script>', level: 1 })]), '<p>x</p>');
});

test('a huge body is cut, not rendered in full', () => {
  const big = renderBody([block([span('y'.repeat(20_000_000))])]);
  assert.ok(big.length < 100_000, `${big.length} chars from a 20 MB span`);
  // 500 blocks of 20,000 characters each: 10 MB in all, which the body budget cuts to 400,000.
  const many = renderBody(Array.from({ length: 500 }, () => block([span('z'.repeat(20_000))])));
  const chars = many.replace(/<[^>]*>/g, '').length;
  assert.ok(chars <= 400_000, `${chars} text characters`);
});

test('underline carries no inline style (style-src self would drop it)', () => {
  const html = renderBody([block([span('u', ['underline'])])]);
  assert.equal(html, '<p><u>u</u></p>');
});

test('classifyLink rejects control characters and backslashes anywhere', () => {
  for (const href of ['/a\\b', '/a\nb', 'https://x.example/\u0000', 'https://x.example/a b']) assert.equal(classifyLink(href), null, JSON.stringify(href));
});

/* ----------------------------------------------------------- the rest of the path */

test('isoDate never throws and never invents a date', () => {
  const epoch = new Date(0).toISOString();
  for (const bad of ['', 'nope', '😀'.repeat(50), '2026-13-45', {}, [], null, undefined, Symbol('x'), 1e300, NaN, { toString() { throw new Error('x'); } }, '9'.repeat(5000)])
    assert.equal(isoDate(bad), epoch, String(typeof bad));
  assert.equal(isoDate('2026-06-01T00:00:00.000Z'), '2026-06-01T00:00:00.000Z');
  assert.equal(isoDate(new Date('2026-06-01T00:00:00Z')), '2026-06-01T00:00:00.000Z');
  // An array whose string form is a date is still not a date.
  assert.equal(isoDate(['2026-06-01']), epoch);
});

test('imageOf drops sources that are not a file on this site or https, and non-finite sizes', () => {
  for (const src of ['javascript:alert(1)', 'data:image/png;base64,AAAA', '//evil.example/a.png', 'http://x.example/a.png', '/a b.png', '/a\\b.png'])
    assert.equal(imageOf({ src }), undefined, src);
  assert.equal(imageOf({ id: '../../etc/passwd' }), undefined);
  assert.equal(imageOf({ src: 'https://ok.example/a.png' })?.src, 'https://ok.example/a.png');
  const img = imageOf({ id: 'abc123', width: Infinity, height: -4, alt: { not: 'a string' } });
  assert.deepEqual([img?.src, img?.width, img?.height, img?.alt], ['/_emdash/api/media/file/abc123', undefined, undefined, '']);
});

test('slugs: junk is a 404 without asking the CMS', () => {
  assert.ok(isPlausibleSlug('fixture-mana-pools'));
  assert.ok(isPlausibleSlug('火与冰'));
  for (const bad of ['', 'a'.repeat(201), 'a\u0000b', 'a\nb', 'a/b', 'a\\b', '..\u007f'])
    assert.equal(isPlausibleSlug(bad), false, JSON.stringify(bad));
});

test('the three outcomes: only a found page is cacheable, and 503 says when to retry', () => {
  assert.equal(responseFor('found').status, 200);
  assert.match(responseFor('found').headers['Cache-Control'], /s-maxage=60/);
  const missing = responseFor('missing');
  assert.equal(missing.status, 404);
  assert.equal(missing.headers['Cache-Control'], 'no-store');
  const down = responseFor('unavailable');
  assert.equal(down.status, 503);
  assert.equal(down.headers['Cache-Control'], 'no-store');
  assert.equal(down.headers['Retry-After'], '120');
});

/* ------------------------------------------------------------------- discovery */

const card = (over = {}) => ({ id: '1', title: 'Fire & Ice', slug: 'fire-ice', date: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-02T00:00:00.000Z', zh: null, ...over });

test('llms.txt section: newest first, Chinese beside English, nothing from the CMS can add a line or a link', () => {
  const text = adventuresLlms([
    card({ title: 'A [b](https://evil.example) \n- [injected](https://evil.example)', slug: 'a)(b c', excerpt: 'line one\nline two - [x](y)', zh: { slug: '火 冰', title: 'z' } }),
    card({ title: 'Plain', slug: 'plain' }),
  ]);
  const lines = text.trimEnd().split('\n');
  assert.equal(lines[0], "## Bryan's Adventures");
  assert.equal(lines.length, 5, text);
  assert.ok(lines.slice(3).every((l) => l.startsWith('- [')));
  assert.ok(!/(?<!\\)\]\(https:\/\/evil/.test(text), 'an unescaped link from a title');
  assert.ok(lines[3].includes('https://bryanfawcett.com/adventures/a%29%28b%20c'));
  assert.ok(lines[3].includes('/zh/adventures/%E7%81%AB%20%E5%86%B0'));
  assert.deepEqual(adventuresLlms([]).trimEnd().split('\n').length, 3);
});

test('adventures sitemap: hreflang is zh-Hans like every other page, never a bare zh', () => {
  const xml = adventuresSitemap([card({ zh: { slug: 'huo-yu-bing', title: 'z', updatedAt: '2026-06-03T00:00:00.000Z' } }), card({ slug: 'english-only', title: 'e' })]);
  assert.ok(xml.includes('hreflang="zh-Hans"'));
  assert.ok(!/hreflang="zh"/.test(xml), 'a bare zh');
  assert.equal(count(xml, '<url>'), 3);
  // The untranslated post names English and x-default only.
  const only = xml.split('<url>').find((u) => u.includes('/adventures/english-only</loc>'));
  assert.ok(only && !only.includes('zh-Hans'));
  assert.ok(xml.includes('<loc>https://bryanfawcett.com/zh/adventures/huo-yu-bing</loc>'));
  assert.ok(xml.includes('<lastmod>2026-06-03T00:00:00.000Z</lastmod>'));
});

test('adventures sitemap escapes what the CMS controls', () => {
  const xml = adventuresSitemap([card({ slug: 'a&b<c>"d\'', updatedAt: '"><x/>' })]);
  assert.ok(!/<x\/>|<c>/.test(xml), xml);
  assert.ok(!xml.includes('a&b'));
});
