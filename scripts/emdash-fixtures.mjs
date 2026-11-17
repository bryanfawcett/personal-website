/**
 * Seeds clearly labelled FIXTURE adventures into a LOCAL EmDash dev server, to prove the blog routes.
 *
 *   pnpm dev            (in one terminal)
 *   node scripts/emdash-fixtures.mjs [http://localhost:4321]
 *
 * It signs in through EmDash's dev-only bypass (import.meta.env.DEV), which a production build
 * refuses with 403, and writes through the admin REST API. Never run it against a deployed site,
 * and never put this content in seed/seed.json: a seed is applied to an empty production database
 * on its first request.
 */
const base = process.argv[2] ?? 'http://localhost:4321';
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base)) {
  console.error('Refusing: fixtures are for a local dev server only.');
  process.exit(1);
}

let cookie = '';
async function call(path, init = {}) {
  const res = await fetch(base + path, {
    redirect: 'manual',
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-emdash-request': '1',
      origin: base,
      cookie,
      ...(init.headers ?? {}),
    },
  });
  const set = res.headers.getSetCookie?.() ?? [];
  if (set.length) {
    const jar = new Map(cookie.split('; ').filter(Boolean).map((c) => [c.split('=')[0], c]));
    for (const c of set) jar.set(c.split('=')[0], c.split(';')[0]);
    cookie = [...jar.values()].join('; ');
  }
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json, text };
}

const span = (text, marks = []) => ({ _type: 'span', _key: Math.random().toString(36).slice(2, 10), text, marks });
const block = (style, children, extra = {}) => ({
  _type: 'block',
  _key: Math.random().toString(36).slice(2, 10),
  style,
  markDefs: [],
  children,
  ...extra,
});
const linkBlock = (label, href) => {
  const key = Math.random().toString(36).slice(2, 10);
  return block('normal', [span(label + ' ', [key])], { markDefs: [{ _type: 'link', _key: key, href }] });
};

const bodyEn = [
  block('normal', [span('FIXTURE: this is not a real post. It exists to prove the blog routes locally.')]),
  block('h2', [span('A heading')]),
  block('normal', [span('Plain, '), span('bold', ['strong']), span(' and '), span('italic', ['em']), span(' text with <b>markup</b> & an ampersand.')]),
  block('h3', [span('A subheading')]),
  block('blockquote', [span('A quote, set apart.')]),
  block('normal', [span('first')], { listItem: 'bullet', level: 1 }),
  block('normal', [span('second')], { listItem: 'bullet', level: 1 }),
  linkBlock('External', 'https://example.com/a?b=1&c=2'),
  linkBlock('Own site', 'https://bryanfawcett.com/experience'),
  linkBlock('Path', '/experience'),
];

const hostile = [
  block('normal', [span('FIXTURE: hostile links. None of these may become a live link.')]),
  linkBlock('js', 'javascript:alert(1)'),
  linkBlock('data', 'data:text/html,<script>alert(1)</script>'),
  linkBlock('backslash', '/\\evil.example'),
  linkBlock('tab', '/\t/evil.example'),
  linkBlock('mixed-case', 'JaVaScRiPt:alert(1)'),
  linkBlock('lookalike', 'https://bryanfawcett.com.evil.example/'),
];

const bodyZh = [
  block('normal', [span('FIXTURE：这不是真实文章，仅用于在本地验证博客路由。')]),
  block('h2', [span('一个标题')]),
  block('normal', [span('正文，含'), span('粗体', ['strong']), span('与'), span('斜体', ['em']), span('。')]),
];

async function create(data, extra) {
  const r = await call('/_emdash/api/content/adventures', { method: 'POST', body: JSON.stringify({ data, ...extra }) });
  if (r.status >= 300) throw new Error(`create failed ${r.status}: ${r.text.slice(0, 400)}`);
  const id = r.json?.data?.item?.id ?? r.json?.data?.id ?? r.json?.item?.id;
  const p = await call(`/_emdash/api/content/adventures/${id}/publish`, { method: 'POST', body: '{}' });
  if (p.status >= 300) throw new Error(`publish failed ${p.status}: ${p.text.slice(0, 400)}`);
  console.log('created', extra.locale, extra.slug, id);
  return id;
}

// A tiny local image for the cover and the body, uploaded through the media API (local R2).
import { readFile } from 'node:fs/promises';
async function upload() {
  const form = new FormData();
  form.set('file', new Blob([await readFile(new URL('../public/nav-portrait.webp', import.meta.url))], { type: 'image/webp' }), 'fixture-image.webp');
  form.set('alt', 'FIXTURE image');
  const res = await fetch(base + '/_emdash/api/media', { method: 'POST', body: form, headers: { origin: base, 'x-emdash-request': '1', cookie } });
  const json = await res.json();
  if (!res.ok) throw new Error('upload failed ' + JSON.stringify(json).slice(0, 300));
  return json.data.item;
}

const boot = await call('/_emdash/api/setup/dev-bypass?content=0');
console.log('setup bypass', boot.status);
const auth = await call('/_emdash/api/auth/dev-bypass');
console.log('auth bypass', auth.status);

const media = await upload();
bodyEn.push({ _type: 'image', _key: 'img1', asset: { _ref: media.id }, alt: 'FIXTURE body image', caption: 'FIXTURE caption' });
const enId = await create(
  { cover: { id: media.id, alt: 'FIXTURE cover alt', caption: 'FIXTURE cover caption' }, title: 'FIXTURE: Mana Pools at dawn', place: 'Mana Pools, Zimbabwe', adventure_date: '2026-06-01T00:00:00.000Z', excerpt: 'FIXTURE excerpt, translated into Chinese.', mineral: 'malachite', body: bodyEn },
  { slug: 'fixture-mana-pools', locale: 'en' },
);
await create(
  { title: 'FIXTURE：黎明时的马纳波尔斯', place: '马纳波尔斯，津巴布韦', adventure_date: '2026-06-01T00:00:00.000Z', excerpt: 'FIXTURE 摘要。', mineral: 'malachite', body: bodyZh },
  { slug: 'fixture-mana-pools-zh', locale: 'zh', translationOf: enId },
);
await create(
  { title: 'FIXTURE: English only', place: 'Singapore', adventure_date: '2026-05-01T00:00:00.000Z', excerpt: 'FIXTURE with no translation.', body: bodyEn.slice(0, 3) },
  { slug: 'fixture-english-only', locale: 'en' },
);
// With the link-policy plugin registered, EmDash refuses to PUBLISH this entry (HTTP 422), which is the
// point. The draft stays; the render path's own check is covered by `pnpm verify:links`.
try {
  await create(
    { title: 'FIXTURE: hostile links', place: 'Nowhere', adventure_date: '2026-04-01T00:00:00.000Z', excerpt: 'FIXTURE link-safety check.', body: hostile },
    { slug: 'fixture-hostile-links', locale: 'en' },
  );
} catch (error) {
  if (!/PUBLISH_REJECTED/.test(String(error))) throw error;
  console.log('hostile-links fixture: publish refused by the policy plugins, as intended (left as a draft)');
}
