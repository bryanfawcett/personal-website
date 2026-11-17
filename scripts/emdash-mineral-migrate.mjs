/**
 * Brings an EXISTING `adventures` collection's `mineral` options up to seed/seed.json, locally.
 *
 * A seed only applies to an empty database, so changing the options in `seed.json` does nothing to a
 * collection that already exists (the schema lives in D1, not in the seed). This is the path that
 * does it: `PUT /_emdash/api/schema/collections/adventures/fields/mineral` with the seed's options.
 * It is the same call the admin's Content Types editor makes. Local dev server only (dev-only auth
 * bypass), like scripts/emdash-fixtures.mjs.
 *
 *   node scripts/emdash-mineral-migrate.mjs http://localhost:4321           apply
 *   node scripts/emdash-mineral-migrate.mjs http://localhost:4321 --probe   only report accepts/rejects
 *
 * Output shows whether an entry with a family outside the old seven ("river") is accepted before
 * and after, which is the evidence that the field's own validation does or does not gate it.
 */
import { readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4321';
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base)) {
  console.error('Refusing: local dev server only.');
  process.exit(1);
}
const probeOnly = process.argv.includes('--probe');
const seed = JSON.parse(readFileSync(new URL('../seed/seed.json', import.meta.url), 'utf8'));
const options = seed.collections.find((c) => c.slug === 'adventures').fields.find((f) => f.slug === 'mineral').validation.options;

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
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json, text };
}

await call('/_emdash/api/setup/dev-bypass?content=0');
await call('/_emdash/api/auth/dev-bypass');

const FIELD = '/_emdash/api/schema/collections/adventures/fields/mineral';
const show = async (label) => {
  const f = await call(FIELD);
  const opts = f.json?.data?.item?.validation?.options ?? f.json?.data?.validation?.options ?? f.json?.item?.validation?.options;
  console.log(`${label}: field has ${Array.isArray(opts) ? opts.length : '?'} options${Array.isArray(opts) ? ` (river ${opts.includes('river') ? 'present' : 'absent'})` : ''}`);
  return opts;
};

/** Create a draft with `mineral`, report whether the API accepted it, delete it again. */
async function probe(family) {
  const r = await call('/_emdash/api/content/adventures', {
    method: 'POST',
    body: JSON.stringify({
      data: { title: `PROBE ${family}`, adventure_date: '2026-01-01T00:00:00.000Z', mineral: family },
      slug: `probe-${family}`,
      locale: 'en',
    }),
  });
  const id = r.json?.data?.item?.id ?? r.json?.data?.id ?? r.json?.item?.id;
  console.log(`  create with mineral=${family}: HTTP ${r.status}${r.status >= 300 ? ' ' + r.text.slice(0, 160) : ''}`);
  if (id) await call(`/_emdash/api/content/adventures/${id}`, { method: 'DELETE' });
  return r.status < 300;
}

await show('before');
await probe('river');
if (!probeOnly) {
  const cur = await call(FIELD);
  const item = cur.json?.data?.item ?? cur.json?.data ?? cur.json?.item;
  const put = await call(FIELD, { method: 'PUT', body: JSON.stringify({ validation: { ...(item?.validation ?? {}), options } }) });
  console.log(`PUT field: HTTP ${put.status}${put.status >= 300 ? ' ' + put.text.slice(0, 300) : ''}`);
  await show('after');
  await probe('river');
}
