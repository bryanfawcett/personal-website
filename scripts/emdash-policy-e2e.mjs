/**
 * Proves the publish-time policy plugins against a LOCAL EmDash dev server, through the REST API.
 *
 *   pnpm dev                                   (one terminal)
 *   node scripts/emdash-policy-e2e.mjs [http://localhost:4321]
 *
 * Creates POLICY-TEST drafts, tries to publish each, and checks that bad ones are refused with the
 * editor-facing message and a clean one goes through. Localhost only, dev-only auth bypass; it never
 * touches a deployed site. Drafts it leaves behind are labelled and are deleted at the end.
 */
const base = process.argv[2] ?? 'http://localhost:4321';
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base)) {
  console.error('Refusing: this is for a local dev server only.');
  process.exit(1);
}

let cookie = '';
async function call(path, init = {}) {
  const res = await fetch(base + path, {
    redirect: 'manual',
    ...init,
    headers: { 'content-type': 'application/json', 'x-emdash-request': '1', origin: base, cookie, ...(init.headers ?? {}) },
  });
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const jar = new Map(cookie.split('; ').filter(Boolean).map((x) => [x.split('=')[0], x]));
    jar.set(c.split('=')[0], c.split(';')[0]);
    cookie = [...jar.values()].join('; ');
  }
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text };
}

const key = () => Math.random().toString(36).slice(2, 10);
const span = (text, marks = []) => ({ _type: 'span', _key: key(), text, marks });
const block = (style, children, extra = {}) => ({ _type: 'block', _key: key(), style, markDefs: [], children, ...extra });
const link = (label, href) => {
  const k = key();
  return block('normal', [span('See '), span(label, [k])], { markDefs: [{ _type: 'link', _key: k, href }] });
};
const image = (mediaId, alt) => ({ _type: 'image', _key: key(), asset: { _ref: mediaId }, ...(alt === undefined ? {} : { alt }) });

await call('/_emdash/api/setup/dev-bypass?content=0');
const auth = await call('/_emdash/api/auth/dev-bypass');
if (auth.status >= 300) throw new Error('dev bypass failed: ' + auth.status);

const form = new FormData();
const { readFile } = await import('node:fs/promises');
form.set('file', new Blob([await readFile(new URL('../public/nav-portrait.webp', import.meta.url))], { type: 'image/webp' }), 'policy-test.webp');
const up = await fetch(base + '/_emdash/api/media', { method: 'POST', body: form, headers: { origin: base, 'x-emdash-request': '1', cookie } });
const media = (await up.json()).data.item;

const ids = [];
async function attempt(label, data, extra, expect) {
  const make = await call('/_emdash/api/content/adventures', { method: 'POST', body: JSON.stringify({ data: { title: `POLICY-TEST ${label}`, adventure_date: '2026-06-01T00:00:00.000Z', ...data }, ...extra }) });
  if (make.status >= 300) throw new Error(`create "${label}" failed ${make.status}: ${make.text.slice(0, 300)}`);
  const id = make.json?.data?.item?.id ?? make.json?.data?.id;
  ids.push(id);
  const pub = await call(`/_emdash/api/content/adventures/${id}/publish`, { method: 'POST', body: '{}' });
  const message = pub.json?.error?.message ?? pub.json?.message ?? '';
  const ok = expect === 'published' ? pub.status < 300 : pub.status >= 400 && expect.every((s) => message.includes(s));
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}\n      -> HTTP ${pub.status}${message ? `\n${message.split('\n').map((l) => '         ' + l).join('\n')}` : ''}`);
  if (!ok) { console.log('      raw:', pub.text.slice(0, 400)); process.exitCode = 1; }
  return id;
}

const goodBody = [block('normal', [span('POLICY-TEST body.')]), block('h2', [span('A heading')]), block('h3', [span('A subheading')]), link('the Mana Pools guide', '/adventures/x'), image(media.id, 'A herd of elephants at dawn')];
const goodCover = { id: media.id, alt: 'Cover alt text' };

await attempt('clean post publishes', { body: goodBody, cover: goodCover }, { slug: 'policy-test-clean', locale: 'en' }, 'published');
await attempt('missing alt text on a body image', { body: [...goodBody.slice(0, 4), image(media.id)], cover: goodCover }, { slug: 'policy-test-alt', locale: 'en' }, ['no alt text']);
await attempt('missing alt text on the cover', { body: goodBody, cover: { id: media.id } }, { slug: 'policy-test-cover', locale: 'en' }, ['cover image has no alt text']);
await attempt('h1 in the body', { body: [block('h1', [span('Big')]), ...goodBody], cover: goodCover }, { slug: 'policy-test-h1', locale: 'en' }, ['Change this to Heading (h2)']);
await attempt('skipped heading level (body starts at h3)', { body: [block('h3', [span('Too deep')]), ...goodBody], cover: goodCover }, { slug: 'policy-test-skip', locale: 'en' }, ['must be Heading (h2)']);
await attempt('javascript: link', { body: [...goodBody, link('totally safe', 'javascript:alert(1)')], cover: goodCover }, { slug: 'policy-test-js', locale: 'en' }, ['is not allowed']);
await attempt('vague link text', { body: [...goodBody, link('click here', '/adventures/x')], cover: goodCover }, { slug: 'policy-test-vague', locale: 'en' }, ['does not say where the link goes']);
await attempt('several problems at once', { body: [block('h1', [span('T')]), image(media.id), link('here', 'javascript:1')], cover: { id: media.id } }, { slug: 'policy-test-many', locale: 'en' }, ['4 problems', '1.', '2.']);

// Translations: an orphan zh entry (created on its own, so it has no English sibling) is refused;
// a zh entry made from a published English one is allowed once that English entry is published.
await attempt('orphan zh entry (no English entry)', { body: goodBody, cover: goodCover }, { slug: 'policy-test-orphan-zh', locale: 'zh' }, ['not linked to a "en" entry']);
const enId = ids[0]; // the clean post, published above
await attempt('zh translation of a published English entry publishes', { body: [block('normal', [span('POLICY-TEST 正文。')]), block('h2', [span('一个标题')])] }, { slug: 'policy-test-clean-zh', locale: 'zh', translationOf: enId }, 'published');
// An English entry that is still a draft: its Chinese translation must wait for it.
const draftEn = await call('/_emdash/api/content/adventures', { method: 'POST', body: JSON.stringify({ data: { title: 'POLICY-TEST draft en', adventure_date: '2026-06-01T00:00:00.000Z', body: goodBody, cover: goodCover }, slug: 'policy-test-draft-en', locale: 'en' }) });
const draftEnId = draftEn.json?.data?.item?.id ?? draftEn.json?.data?.id;
ids.push(draftEnId);
await attempt('zh translation whose English entry is still a draft', { body: goodBody, cover: goodCover }, { slug: 'policy-test-draft-zh', locale: 'zh', translationOf: draftEnId }, ['not published yet']);

// Slugs: EmDash refuses a duplicate at create time itself, so the plugin's slug rule is a second line.
const dup = await call('/_emdash/api/content/adventures', { method: 'POST', body: JSON.stringify({ data: { title: 'POLICY-TEST dup', adventure_date: '2026-06-01T00:00:00.000Z' }, slug: 'policy-test-clean', locale: 'en' }) });
const dupOk = dup.status === 409 && /SLUG_CONFLICT/.test(dup.text);
console.log(`${dupOk ? 'PASS' : 'FAIL'}  duplicate slug in the same language\n      -> HTTP ${dup.status} ${dup.json?.error?.code ?? ''} (enforced by EmDash at create, before the plugin runs)`);
if (!dupOk) process.exitCode = 1;

for (const id of [...ids].reverse()) {
  await call(`/_emdash/api/content/adventures/${id}/unpublish`, { method: 'POST', body: '{}' });
  await call(`/_emdash/api/content/adventures/${id}`, { method: "DELETE" });
  await call(`/_emdash/api/content/adventures/${id}/permanent`, { method: "DELETE" });
}
console.log(process.exitCode ? '\nSOME CHECKS FAILED' : '\nall policy checks behaved as expected');
