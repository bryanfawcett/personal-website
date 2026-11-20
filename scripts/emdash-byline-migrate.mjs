/**
 * Applies the byline schema to an EmDash database, through EmDash's own admin API. Idempotent.
 *
 * A seed cannot do this: EmDash's seed format has no way to define byline custom fields, and a seed
 * only applies to an empty database anyway. The definitions live in seed/seed.json under
 * `x-bylineFields` (EmDash ignores that key); this script reads them.
 *
 *   node scripts/emdash-byline-migrate.mjs http://localhost:4321            fields only (local dev server)
 *   node scripts/emdash-byline-migrate.mjs http://localhost:4321 --probe    report what would change, change nothing
 *   node scripts/emdash-byline-migrate.mjs http://localhost:4321 --create-byline
 *       also creates (never overwrites) the site owner's byline, English and Chinese, linked to the
 *       signed-in admin user, so a post by that user is credited without touching the post
 *
 *   EMDASH_TOKEN=ec_pat_... node scripts/emdash-byline-migrate.mjs https://bryanfawcett.com --remote [--user-email you@example.com] ...
 *       a deployed site. Only with --remote AND a token (an API token with the `admin` scope; the
 *       session-less dev bypass does not exist in production). Without both, anything that is not
 *       localhost is refused.
 *
 * Fields: created when absent, label/required/validation brought in line when they differ.
 * `type` and `translatable` cannot change on an existing field (EmDash refuses once values exist):
 * a mismatch is reported, never forced. Nothing is ever deleted.
 */
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:\/\//.test(a)) ?? 'http://localhost:4321').replace(/\/$/, '');
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const remote = flag('--remote');
const token = process.env.EMDASH_TOKEN ?? '';
const local = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base);
if (!local && !(remote && token)) {
  console.error('Refusing: not localhost. A deployed site needs both --remote and EMDASH_TOKEN.');
  process.exit(1);
}
if (remote && !token) {
  console.error('Refusing: --remote needs EMDASH_TOKEN.');
  process.exit(1);
}
const probeOnly = flag('--probe');
const createByline = flag('--create-byline');

const seed = JSON.parse(readFileSync(new URL('../seed/seed.json', import.meta.url), 'utf8'));
const wanted = seed['x-bylineFields'].fields;

let cookie = '';
async function call(path, init = {}) {
  const res = await fetch(base + path, {
    redirect: 'manual',
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-emdash-request': '1',
      origin: base,
      ...(token ? { authorization: `Bearer ${token}` } : { cookie }),
      ...(init.headers ?? {}),
    },
  });
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const jar = new Map(cookie.split('; ').filter(Boolean).map((x) => [x.split('=')[0], x]));
    jar.set(c.split('=')[0], c.split(';')[0]);
    cookie = [...jar.values()].join('; ');
  }
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json, text };
}
const fail = (what, r) => {
  console.error(`FAILED ${what}: HTTP ${r.status} ${r.text.slice(0, 300)}`);
  process.exit(1);
};

if (local && !remote) {
  await call('/_emdash/api/setup/dev-bypass?content=0');
  await call('/_emdash/api/auth/dev-bypass');
}

/* ------------------------------------------------------------------ fields */

const list = await call('/_emdash/api/admin/byline-fields');
if (list.status !== 200) fail('list byline fields', list);
const have = new Map((list.json?.data?.items ?? []).map((f) => [f.slug, f]));
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

for (const f of wanted) {
  const cur = have.get(f.slug);
  if (!cur) {
    console.log(`field ${f.slug}: ${probeOnly ? 'would create' : 'creating'} (${f.type}, translatable=${f.translatable})`);
    if (probeOnly) continue;
    const r = await call('/_emdash/api/admin/byline-fields', { method: 'POST', body: JSON.stringify(f) });
    if (r.status !== 201) fail(`create ${f.slug}`, r);
    continue;
  }
  if (cur.type !== f.type || cur.translatable !== f.translatable) {
    console.log(`field ${f.slug}: exists as ${cur.type}/translatable=${cur.translatable}, wanted ${f.type}/${f.translatable}. NOT changed (immutable once values exist); fix by hand.`);
    continue;
  }
  const patch = {};
  if (cur.label !== f.label) patch.label = f.label;
  if (!same(cur.validation, f.validation ?? null)) patch.validation = f.validation ?? null;
  if (Object.keys(patch).length === 0) {
    console.log(`field ${f.slug}: up to date`);
    continue;
  }
  console.log(`field ${f.slug}: ${probeOnly ? 'would update' : 'updating'} ${Object.keys(patch).join(', ')}`);
  if (probeOnly) continue;
  const r = await call(`/_emdash/api/admin/byline-fields/${f.slug}`, { method: 'PUT', body: JSON.stringify(patch) });
  if (r.status !== 200) fail(`update ${f.slug}`, r);
}

/* ----------------------------------------------------------------- byline */

if (createByline) {
  // The user the byline is keyed to: the signed-in one locally, a named one remotely.
  let userId;
  if (remote) {
    const email = option('--user-email');
    if (!email) {
      console.error('--create-byline with --remote needs --user-email (the admin user to key the byline to).');
      process.exit(1);
    }
    const u = await call(`/_emdash/api/admin/users?search=${encodeURIComponent(email)}`);
    userId = (u.json?.data?.items ?? []).find((x) => x.email === email)?.id;
    if (!userId) fail(`find user ${email}`, u);
  } else {
    const me = await call('/_emdash/api/auth/me');
    userId = me.json?.data?.id;
    if (!userId) fail('read the signed-in user', me);
  }

  const OWNER = {
    slug: 'bryan-fawcett',
    websiteUrl: 'https://bryanfawcett.com',
    en: {
      displayName: 'Bryan Fawcett',
      bio: 'A systems thinker who designs for the whole: people, data, tools and the constraints they live under. Founder & CEO of Nyuchi Africa and founder of The Bundu Foundation.',
      job_title: 'Digital Craftsman',
    },
    zh: {
      displayName: 'Bryan Fawcett',
      bio: '系统思考者，为整体而设计：人、数据、工具，以及它们所处的约束。Nyuchi Africa 创始人兼首席执行官，The Bundu Foundation 创始人。',
      job_title: '数字工匠',
    },
    shared: {
      linkedin_url: 'https://www.linkedin.com/in/bryandavidfawcett/',
      github_url: 'https://github.com/bryanfawcett/',
      x_url: 'https://x.com/bryanfawcett',
    },
  };

  let anchorId;
  for (const locale of ['en', 'zh']) {
    const v = OWNER[locale];
    const existing = await call(`/_emdash/api/admin/bylines?search=${OWNER.slug}&locale=${locale}`);
    const row = (existing.json?.data?.items ?? []).find((b) => b.slug === OWNER.slug && b.locale === locale);
    const customFields = { job_title: v.job_title, ...(locale === 'en' ? OWNER.shared : {}) };
    const body = { displayName: v.displayName, bio: v.bio, websiteUrl: OWNER.websiteUrl, userId, customFields };
    if (row) {
      // Never overwritten: a PUT replaces every field it omits with null (a photo set in the admin,
      // even the link to the user), and a re-run must not undo what the owner has edited since.
      anchorId ??= row.id;
      console.log(`byline ${OWNER.slug} (${locale}): exists, left as it is`);
    } else {
      console.log(`byline ${OWNER.slug} (${locale}): ${probeOnly ? 'would create' : 'creating'}`);
      if (probeOnly) continue;
      const create = { slug: OWNER.slug, locale, ...body, ...(locale === 'en' ? {} : { translationOf: anchorId }) };
      const r = await call('/_emdash/api/admin/bylines', { method: 'POST', body: JSON.stringify(create) });
      if (r.status !== 201) fail(`create byline ${locale}`, r);
      anchorId ??= r.json?.data?.id;
    }
  }
  console.log('The photo is set in the admin (Bylines, choose an image): an upload cannot be made idempotent from here.');
}
console.log(probeOnly ? 'probe done, nothing changed' : 'done');
