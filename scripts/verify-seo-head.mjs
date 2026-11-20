/**
 * The SEO head moved from BaseLayout.astro to `rust:seo-head` (mzizi-discovery). This proves the
 * move changed nothing a crawler or a share card reads. Two comparisons, both semantic (tag set,
 * attribute values, JSON-LD after parsing; never string order):
 *
 *   1. REFERENCE: a frozen copy of the head BaseLayout used to build, run for every route in both
 *      languages plus the cases only a blog post produces (translated, untranslated, Chinese-first
 *      adventures, article og:type), against the new path: seoHeadProps() -> the wasm component.
 *   2. SHIPPED: `scripts/fixtures/seo-head.baseline.json` is the head of every prerendered page as
 *      built before the move. The current build output (`dist` is wherever `@astrojs/cloudflare`
 *      puts it, see DIST) must match it.
 *
 *   node scripts/verify-seo-head.mjs              both checks (the second needs a build)
 *   node scripts/verify-seo-head.mjs --snapshot   print the snapshot of the build output
 *
 * The new head may ADD tags only from ADDITIONS below (the crate emits twitter:title,
 * twitter:description and twitter:image, which the site never wrote; X falls back to og:* so they
 * agree with it). Anything else added, changed or missing fails.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { register } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, '.cloudflare/output/v0/workers/default/assets');
const FIXTURE = join(root, 'scripts/fixtures/seo-head.baseline.json');
const ADDITIONS = new Set(['meta name=twitter:title', 'meta name=twitter:description', 'meta name=twitter:image']);

/* ------------------------------------------------------------------ parsing */

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z][\w:-]*)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    if (m.index === 0) continue; // the tag name
    out[m[1]] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return out;
}

/** The SEO-relevant part of a head, as `{ tags: Map(key -> sorted values[]), ld: parsed JSON[] }`. */
export function parseHead(html) {
  const head = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? html;
  const tags = new Map();
  const add = (key, value) => tags.set(key, [...(tags.get(key) ?? []), value].sort());
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head);
  if (title) add('title', decode(title[1]));
  for (const m of head.matchAll(/<meta\s(?:[^>"']|"[^"]*"|'[^']*')*>/gi)) {
    const a = attrs(m[0]);
    if (a.property?.startsWith('og:') || a.property?.startsWith('article:')) add(`meta property=${a.property}`, a.content ?? '');
    else if (a.name === 'description' || a.name === 'robots' || a.name?.startsWith('twitter:')) add(`meta name=${a.name}`, a.content ?? '');
  }
  for (const m of head.matchAll(/<link\s(?:[^>"']|"[^"]*"|'[^']*')*>/gi)) {
    const a = attrs(m[0]);
    if (a.rel === 'canonical') add('link rel=canonical', a.href ?? '');
    else if (a.rel === 'alternate' && a.hreflang) add(`link rel=alternate hreflang=${a.hreflang}`, a.href ?? '');
  }
  const ld = [...head.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => JSON.parse(m[1]));
  return { tags: Object.fromEntries([...tags].sort(([a], [b]) => (a < b ? -1 : 1))), ld };
}

/* --------------------------------------------------------------- comparison */

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Differences between the old head and the new one. Additions are only those in ADDITIONS. */
export function diffHeads(oldHead, newHead, extraAdditions = []) {
  const problems = [];
  for (const [k, v] of Object.entries(oldHead.tags)) {
    if (!(k in newHead.tags)) problems.push(`MISSING  ${k} = ${JSON.stringify(v)}`);
    else if (!same(v, newHead.tags[k])) problems.push(`CHANGED  ${k}: ${JSON.stringify(v)} -> ${JSON.stringify(newHead.tags[k])}`);
  }
  for (const k of Object.keys(newHead.tags)) {
    if (!(k in oldHead.tags) && !ADDITIONS.has(k) && !extraAdditions.includes(k)) problems.push(`ADDED    ${k} = ${JSON.stringify(newHead.tags[k])}`);
  }
  if (!same(oldHead.ld, newHead.ld)) problems.push(`JSON-LD differs:\n  old ${JSON.stringify(oldHead.ld)}\n  new ${JSON.stringify(newHead.ld)}`);
  return problems;
}

/* ------------------------------------------------------- build-output walk */

function pages(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) { if (e !== '_astro' && e !== 'fonts') walk(p); }
      else if (e.endsWith('.html')) out.push(p);
    }
  };
  walk(dir);
  return out.sort();
}

function snapshot(dir) {
  const snap = {};
  for (const p of pages(dir)) snap[relative(dir, p)] = parseHead(readFileSync(p, 'utf8'));
  return snap;
}

if (process.argv.includes('--snapshot')) {
  console.log(JSON.stringify(snapshot(DIST), null, 1));
  process.exit(0);
}

/* ---------------------------------------- 1. reference vs the new component */

register(pathToFileURL(join(root, 'scripts/ts-resolve-hook.mjs')));
const { initSync, render } = await import(pathToFileURL(join(root, 'src/integrations/rust/pkg/components_wasm.js')));
initSync({ module: readFileSync(join(root, 'src/integrations/rust/pkg/components_wasm_bg.wasm')) });
const { seoHeadProps } = await import(pathToFileURL(join(root, 'src/layouts/seo-head.ts')));
const { bylinesOf } = await import(pathToFileURL(join(root, 'src/blog/normalize.ts')));
const { PROFILE, profileInLang } = await import(pathToFileURL(join(root, 'src/data/profile.ts')));
const { allPaths, localizePath } = await import(pathToFileURL(join(root, 'src/i18n/routing.ts')));
const { bcp47, defaultLang, ogLocale } = await import(pathToFileURL(join(root, 'src/i18n/ui.ts')));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * The og:image tags. No image given: the frozen default card, exactly as before. A page's own image
 * (an adventure cover) is absolute, keeps its own size or none when unknown, and is alt-texted by
 * its alt or else the page title. A URL that is not http(s) never becomes a share image.
 */
function imageTags(image, title) {
  let abs = null;
  try {
    const u = image ? new URL(image.url, 'https://bryanfawcett.com') : null;
    if (u && (u.protocol === 'https:' || u.protocol === 'http:')) abs = u.href;
  } catch {}
  const m = (k, v) => `<meta property="${k}" content="${esc(v)}" />`;
  if (!abs) return [m('og:image', 'https://bryanfawcett.com/og-bryan-fawcett.jpg'), m('og:image:width', 1200), m('og:image:height', 630), m('og:image:alt', 'Bryan Fawcett — Digital Craftsman')].join('');
  return [m('og:image', abs), ...(image.width && image.height ? [m('og:image:width', image.width), m('og:image:height', image.height)] : []), m('og:image:alt', image.alt || title)].join('');
}

/** BaseLayout.astro's SEO head exactly as it was before the move, frozen. */
function referenceHtml({ title, description, path, lang, alternates, ogType, site, image }) {
  const localized = alternates
    ? Object.entries(alternates).map(([entryLang, entryPath]) => ({ lang: entryLang, path: entryPath }))
    : allPaths(path);
  const here = localized.find((entry) => entry.lang === lang)?.path ?? localizePath(path, lang);
  const canonical = new URL(here, site).href;
  const fullTitle = here === '/' || here === '/zh' ? title : `${title} | ${PROFILE.name}`;
  const profile = profileInLang(lang);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person', '@id': 'https://bryanfawcett.com/#person', name: PROFILE.name, givenName: 'Bryan', familyName: 'Fawcett',
        jobTitle: profile.roles.map((r) => r.title), description: profile.summary, url: 'https://bryanfawcett.com',
        email: `mailto:${PROFILE.email}`, image: 'https://bryanfawcett.com/og-bryan-fawcett.jpg',
        sameAs: PROFILE.socials.map((s) => s.href),
        worksFor: profile.roles.map((r) => ({ '@type': 'Organization', name: r.org })),
        founder: [
          { '@type': 'Organization', name: 'Nyuchi Africa', url: 'https://nyuchi.com' },
          { '@type': 'Organization', name: 'The Bundu Foundation', url: 'https://www.bundu.org' },
        ],
        knowsAbout: PROFILE.knowsAbout,
      },
      { '@type': 'WebSite', '@id': 'https://bryanfawcett.com/#website', url: 'https://bryanfawcett.com', name: `${PROFILE.name} — ${profile.title}`, publisher: { '@id': 'https://bryanfawcett.com/#person' }, inLanguage: bcp47[lang] },
    ],
  };
  const m = (attr, k, v) => `<meta ${attr}="${k}" content="${esc(v)}" />`;
  return `<head><title>${esc(fullTitle)}</title>${m('name', 'description', description)}<link rel="canonical" href="${canonical}" />
${localized.map((e) => `<link rel="alternate" hreflang="${bcp47[e.lang]}" href="${new URL(e.path, site).href}" />`).join('')}
<link rel="alternate" hreflang="x-default" href="${new URL(localized.find((e) => e.lang === defaultLang)?.path ?? here, site).href}" />
${m('property', 'og:type', ogType)}${m('property', 'og:url', canonical)}${m('property', 'og:site_name', PROFILE.name)}${m('property', 'og:title', fullTitle)}${m('property', 'og:description', description)}${m('property', 'og:locale', ogLocale[lang])}
${localized.filter((e) => e.lang !== lang).map((e) => m('property', 'og:locale:alternate', ogLocale[e.lang])).join('')}
${imageTags(image, title)}
${m('name', 'twitter:card', 'summary_large_image')}${m('name', 'twitter:creator', '@bryanfawcett')}
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script></head>`;
}

const site = new URL('https://bryanfawcett.com');
const routes = ['/', '/experience', '/book', '/how-this-was-built', '/minerals', '/origins-with-perspective', '/adventures'];
const cases = [];
for (const path of routes)
  for (const lang of ['en', 'zh']) {
    cases.push({ name: `${path} ${lang}`, title: 'Test page', description: 'A "quoted" <b>description</b> & more', path, lang, ogType: path === '/' ? 'profile' : 'website', site });
  }
// What only a blog post produces: its own slug per language, or English alone, and og:type article.
cases.push(
  { name: 'adventure en, translated', title: "Fire & Ice: a day's trek", description: "It's </script><b>x</b>", path: '/adventures', lang: 'en', alternates: { en: '/adventures/fire-ice', zh: '/zh/adventures/huo-yu-bing' }, ogType: 'article', site },
  { name: 'adventure zh, translated', title: '火与冰', description: '一段旅程', path: '/adventures', lang: 'zh', alternates: { zh: '/zh/adventures/huo-yu-bing', en: '/adventures/fire-ice' }, ogType: 'article', site },
  { name: 'adventure en, untranslated', title: 'Only English', description: 'No Chinese version', path: '/adventures', lang: 'en', alternates: { en: '/adventures/only-english' }, ogType: 'article', site },
  { name: 'adventure zh, no original', title: '只有中文', description: '没有英文版', path: '/adventures', lang: 'zh', alternates: { zh: '/zh/adventures/zhi-you' }, ogType: 'article', site },
  { name: 'adventure list, no alternates', title: 'Adventures', description: 'The list', path: '/adventures', lang: 'en', alternates: undefined, ogType: 'article', site },
);

// Posts with their own image and article metadata. The old head had neither: these are deliberate
// additions (og:image from the cover, article:* tags, an Article JSON-LD node), checked below.
const ART = { headline: 'Fire & Ice', publishedTime: '2026-06-01T00:00:00.000Z', modifiedTime: '2026-06-02T10:00:00.000Z' };
const post = (name, extra) => ({ name, title: 'Fire & Ice', description: 'A "day" <trek>', path: '/adventures', lang: 'en', alternates: { en: '/adventures/fire-ice', zh: '/zh/adventures/huo-yu-bing' }, ogType: 'article', site, article: ART, ...extra });
cases.push(
  post('post, cover with size', { image: { url: '/_emdash/api/media/file/abc.webp', width: 1600, height: 900, alt: 'A "ridge" at <dawn>' } }),
  post('post, cover without size', { image: { url: 'https://media.example/cover.jpg' } }),
  post('post, no cover', {}),
  post('post, hostile cover url falls back to the default', { image: { url: 'javascript:alert(1)', width: 10, height: 10 } }),
  post('post, zh, no modified time', { lang: 'zh', title: '火与冰', article: { headline: '火与冰', publishedTime: '2026-06-01T00:00:00.000Z' } }),
  post('post, hostile title', { title: '"><script>alert(1)</script>', article: { headline: '"><script>alert(1)</script>', publishedTime: '2026-06-01T00:00:00.000Z' } }),
);

/* Bylines: EmDash-shaped credits in, Person nodes and article:author out. No credit means the site profile (asserted in the loop). */
const credit = (byline, sortOrder = 0) => ({ byline, sortOrder, roleLabel: null, source: 'explicit' });
const FULL = {
  id: '01JTEST', slug: 'jane-doe', displayName: 'Jane Doe', bio: 'Writes about "roads" & rivers.',
  avatarMediaId: 'm1', avatarStorageKey: 'jane.webp', avatarAlt: 'Jane', websiteUrl: 'https://jane.example/about',
  userId: 'u1', isGuest: false, locale: 'en', translationGroup: 'g1',
  customFields: { job_title: 'Field editor', linkedin_url: 'https://www.linkedin.com/in/jane/', github_url: 'https://github.com/jane', x_url: 'https://x.com/jane', same_as_other: 'https://mastodon.example/@jane\nhttps://jane.example/about\njavascript:alert(1)' },
};
const OTHER = { ...FULL, id: '01JTWO', slug: 'sam-roe', displayName: 'Sam Roe', websiteUrl: 'https://sam.example/', avatarStorageKey: null, avatarMediaId: null, customFields: { job_title: 'Photographer' } };
cases.push(
  post('byline, every field', {
    credits: [credit(FULL)],
    check: ({ authors, authorTags, expect }) => {
      const a = authors[0];
      expect(authors.length === 1 && a?.['@type'] === 'Person', 'one Person per byline');
      expect(a?.['@id'] === 'https://bryanfawcett.com/#author-jane-doe', 'author @id is not stable');
      expect(a?.name === 'Jane Doe' && a?.url === 'https://jane.example/about' && a?.jobTitle === 'Field editor', 'author name, url or jobTitle wrong');
      expect(a?.description === 'Writes about "roads" & rivers.', 'author description wrong');
      expect(a?.image === 'https://bryanfawcett.com/_emdash/api/media/file/jane.webp', 'author image is not the absolute media URL');
      expect(JSON.stringify(a?.sameAs) === JSON.stringify(['https://www.linkedin.com/in/jane/', 'https://github.com/jane', 'https://x.com/jane', 'https://mastodon.example/@jane']), `sameAs wrong: ${JSON.stringify(a?.sameAs)}`);
      expect(JSON.stringify(authorTags) === JSON.stringify(['https://jane.example/about']), 'article:author is not the byline URL');
    },
  }),
  post('two bylines, in sortOrder', {
    credits: [credit(OTHER, 1), credit(FULL, 0)],
    check: ({ authors, authorTags, expect }) => {
      expect(authors.length === 2 && authors[0]?.name === 'Jane Doe' && authors[1]?.name === 'Sam Roe', 'two Persons in sortOrder expected');
      expect(authors[0]?.['@id'] !== authors[1]?.['@id'], 'two bylines share an @id');
      expect(authors[1]?.image === undefined && authors[1]?.sameAs === undefined, 'a byline with no photo or links invented them');
      expect(JSON.stringify([...authorTags].sort()) === JSON.stringify(['https://jane.example/about', 'https://sam.example/']), 'two article:author tags expected');
    },
  }),
  post('byline, zh', { lang: 'zh', title: '火与冰', credits: [credit({ ...FULL, locale: 'zh', displayName: '简', customFields: { job_title: '编辑' } })], check: ({ authors, expect }) => expect(authors[0]?.name === '简' && authors[0]?.jobTitle === '编辑', 'zh byline wrong') }),
  post('byline, hostile values', {
    credits: [credit({
      ...FULL, slug: 'evil', displayName: `X${'y'.repeat(300)}`,
      bio: '<script>alert(1)</script><b>bio</b> </script><img src=x onerror=alert(1)>',
      websiteUrl: 'javascript:alert(1)',
      avatarStorageKey: 'http://evil.example/p.jpg',
      customFields: { job_title: '<i>Boss</i>', linkedin_url: 'javascript:alert(2)', github_url: 'data:text/html,x', x_url: 'http://insecure.example/x', same_as_other: 'https://user:pw@evil.example/\nhttps://ok.example/p' },
    })],
    check: ({ authors, authorTags, rust, expect }) => {
      const a = authors[0];
      expect(a && a.name.length <= 80 && a.name.startsWith('Xyy'), 'an overlong name was not capped');
      expect(a?.url === undefined && authorTags.length === 0, 'a javascript: profile URL got out');
      expect(a?.image === undefined, 'a non-https image got out');
      expect(a?.description === 'bio', `markup survived in the bio: ${a?.description}`);
      expect(a?.jobTitle === 'Boss', `markup survived in the job title: ${a?.jobTitle}`);
      expect(JSON.stringify(a?.sameAs) === JSON.stringify(['https://ok.example/p']), `hostile sameAs survived: ${JSON.stringify(a?.sameAs)}`);
      expect(!/javascript:|data:text|onerror/.test(rust.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')), 'a hostile value reached a tag');
    },
  }),
  // Straight into seoHeadProps, with what `bylineOf` would have refused: the head must not rely on its caller.
  post('byline, hostile values handed straight to the head', {
    authors: [{ slug: 'raw', name: 'Raw', url: 'javascript:alert(1)', image: { src: 'http://evil.example/p.jpg', alt: '' }, sameAs: ['javascript:alert(2)', 'http://insecure.example/', 'https://fine.example/'] }],
    check: ({ authors, authorTags, expect }) => {
      const a = authors[0];
      expect(a?.url === undefined && authorTags.length === 0, 'head let a javascript: URL through');
      expect(a?.image === undefined, 'head let a non-https image through');
      expect(JSON.stringify(a?.sameAs) === JSON.stringify(['https://fine.example/']), 'head let a non-https sameAs through');
    },
  }),
  post('byline, none usable falls back to the site profile', { credits: [credit({ slug: 'Bad Slug', displayName: 'No' }), credit({ slug: 'ok', displayName: '   ' })] }),
  post('credits is an empty list', { credits: [] }),
  post('credits is hostile junk', { credits: [null, 5, 'x', { byline: 5 }, { byline: { slug: 'a', displayName: { toString() { throw new Error('boom'); } } } }] }),
);

/** Article node out of the JSON-LD graph, so the rest can be compared with the frozen reference. */
function withoutArticle(head) {
  const ld = head.ld.map((doc) => ({ ...doc, '@graph': doc['@graph']?.filter((n) => n['@type'] !== 'Article') }));
  return { ...head, ld };
}

let failures = 0;
for (const c of cases) {
  // A case may carry EmDash-shaped byline credits (run through the real `bylinesOf`, as the page does)
  // or hand-built `authors` (to reach `seoHeadProps` with values `bylineOf` would already have refused).
  const input = c.credits !== undefined
    ? { ...c, article: { ...c.article, authors: bylinesOf(c.credits) } }
    : c.authors ? { ...c, article: { ...c.article, authors: c.authors } } : c;
  const rust = render('seo-head', JSON.stringify(seoHeadProps(input)));
  const got = parseHead(`<head>${rust}</head>`);
  const problems = c.article
    ? diffHeads(parseHead(referenceHtml(c)), withoutArticle(got), ['meta property=article:published_time', 'meta property=article:modified_time', 'meta property=article:author'])
    : diffHeads(parseHead(referenceHtml(c)), got);
  if (c.article) {
    const t = (k) => got.tags[k]?.[0];
    const node = got.ld[0]?.['@graph']?.find((n) => n['@type'] === 'Article');
    const expect = (cond, msg) => { if (!cond) problems.push(msg); };
    expect(t('meta property=article:published_time') === c.article.publishedTime, 'article:published_time wrong');
    expect(t('meta property=article:modified_time') === c.article.modifiedTime, 'article:modified_time wrong');
    if ((input.article.authors ?? []).length === 0) {
      // No byline: the site's owner, exactly as before bylines existed.
      expect(t('meta property=article:author') === 'https://bryanfawcett.com', 'article:author wrong');
      expect(JSON.stringify(node?.author) === JSON.stringify({ '@type': 'Person', name: PROFILE.name }), 'no-byline Article author is not the site profile');
    }
    expect(got.ld[0]?.['@graph']?.some((n) => n['@id'] === 'https://bryanfawcett.com/#person' && n['@type'] === 'Person'), 'the site Person node is gone');
    expect(got.ld[0]?.['@graph']?.some((n) => n['@type'] === 'WebSite' && n.publisher?.['@id'] === 'https://bryanfawcett.com/#person'), 'the WebSite publisher is gone');
    if (c.check) c.check({ got, node, rust, expect, authorTags: got.tags['meta property=article:author'] ?? [], authors: [].concat(node?.author ?? []) });
    expect(node && node.headline === c.article.headline && node.datePublished === c.article.publishedTime, 'Article JSON-LD missing or wrong');
    expect(node && node.dateModified === c.article.modifiedTime, 'Article dateModified wrong');
    expect(node && node.mainEntityOfPage === got.tags['link rel=canonical'][0], 'Article mainEntityOfPage is not the canonical URL');
    expect(node && node.inLanguage === bcp47[c.lang], 'Article inLanguage wrong');
    expect(node && node.image === got.tags['meta property=og:image'][0], 'Article image differs from og:image');
    expect(!rust.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '').includes('<script'), 'a <script> got out of the JSON-LD');
    expect(!/<\/script>[^]*<\/script>/.test(rust) || (rust.match(/<\/script>/g) ?? []).length === 1, 'the JSON-LD script was closed early');
    if (!c.image || !/^https?:/.test(new URL(c.image.url, 'https://bryanfawcett.com').protocol)) expect(t('meta property=og:image') === 'https://bryanfawcett.com/og-bryan-fawcett.jpg', 'default image not used');
    if (c.image && !(c.image.width && c.image.height) && !/^javascript/.test(c.image.url)) expect(!('meta property=og:image:width' in got.tags) && !('meta property=og:image:height' in got.tags), 'an unknown image size was invented');
  } else {
    const leaked = Object.keys(got.tags).filter((k) => k.startsWith('meta property=article:'));
    if (leaked.length || got.ld[0]?.['@graph']?.some((n) => n['@type'] === 'Article')) problems.push('a page that is not a post carries article metadata');
  }
  if (problems.length) { failures++; console.error(`FAIL ${c.name}\n  ${problems.join('\n  ')}`); }
}
console.log(`reference: ${cases.length - failures} of ${cases.length} cases match`);

/* --------------------------------------------- 2. the shipped pages, before */

if (existsSync(DIST) && existsSync(FIXTURE)) {
  const baseline = JSON.parse(readFileSync(FIXTURE, 'utf8'));
  const now = snapshot(DIST);
  let n = 0;
  for (const [file, old] of Object.entries(baseline)) {
    n++;
    if (!now[file]) { failures++; console.error(`FAIL ${file}: page no longer built`); continue; }
    const problems = diffHeads(old, now[file]);
    if (problems.length) { failures++; console.error(`FAIL ${file}\n  ${problems.join('\n  ')}`); }
  }
  console.log(`shipped: ${n} prerendered pages compared with the pre-move baseline`);
} else {
  console.log('shipped: skipped (needs a build and the baseline fixture)');
}

process.exit(failures ? 1 : 0);
