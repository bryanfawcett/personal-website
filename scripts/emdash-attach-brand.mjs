/**
 * Attach the logo and favicon to EmDash's own site settings (`site:logo`, `site:favicon`).
 *
 *   node scripts/emdash-attach-brand.mjs                 print the plan, change nothing
 *   node scripts/emdash-attach-brand.mjs --remote        do it against the production D1 and R2
 *
 * The public site already serves the files from /public. This is the other half: EmDash keeps its own
 * site identity (the admin's logo and favicon, and anything an EmDash theme renders) as media items
 * referenced from `site:*` options. Done through the admin this is Settings -> General -> upload; this
 * script does the same thing the upload route does, step for step, so it can be repeated or undone:
 *
 *   1. store the file in the media bucket under `<ulid><ext>` (the key EmDash would make)
 *   2. add the `media` row with the SHA-1 content hash ("sha1:<hex>", what EmDash computes)
 *   3. set the option to `{ "mediaId": "<id>", "alt": "..." }`
 *
 * Idempotent: a file whose content hash is already in `media` is reused, not stored twice.
 * Undo: `delete from options where name in ('site:logo','site:favicon')`, then delete the two media
 * rows and R2 objects it prints. Needs `wrangler login` (D1 and R2).
 */
import { createHash, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const remote = process.argv.includes('--remote');
const DB = 'bryanfawcett-site-db';
const BUCKET = 'bryanfawcett-site-media';

const ITEMS = [
  { option: 'site:logo', file: 'public/brand/logo-primary.png', mime: 'image/png', alt: 'Bryan Fawcett, Digital Craftsman' },
  { option: 'site:favicon', file: 'public/icon-512.png', mime: 'image/png', alt: 'Bryan Fawcett' },
];

/** A ULID: 48 bits of time then 80 bits of randomness, Crockford base32, 26 characters. */
function ulid() {
  const A = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let t = Date.now(), time = '';
  for (let i = 0; i < 10; i++) { time = A[t % 32] + time; t = Math.floor(t / 32); }
  const r = randomBytes(10);
  let n = 0n; for (const b of r) n = (n << 8n) | BigInt(b);
  let rand = ''; for (let i = 0; i < 16; i++) { rand = A[Number(n & 31n)] + rand; n >>= 5n; }
  return time + rand;
}

const sqlStr = (s) => `'${String(s).replaceAll("'", "''")}'`;
function d1(sql) {
  const out = execFileSync('wrangler', ['d1', 'execute', DB, '--remote', '--json', '--command', sql], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const parsed = JSON.parse(out.slice(out.indexOf('[')));
  return parsed[0]?.results ?? [];
}

console.log(remote ? `Attaching to ${DB} / ${BUCKET} (production)\n` : 'Plan only (add --remote to apply)\n');

for (const item of ITEMS) {
  const path = join(root, item.file);
  const bytes = readFileSync(path);
  const hash = `sha1:${createHash('sha1').update(bytes).digest('hex')}`;
  const { width, height } = await sharp(bytes).metadata();
  const filename = item.file.split('/').pop();
  console.log(`${item.option}`);
  console.log(`  file    ${item.file}  ${statSync(path).size} B  ${width}x${height}  ${item.mime}`);
  console.log(`  hash    ${hash}`);
  if (!remote) { console.log('  (not applied)\n'); continue; }

  const existing = d1(`select id, storage_key from media where content_hash = ${sqlStr(hash)} limit 1`)[0];
  let id, key;
  if (existing) {
    ({ id, storage_key: key } = existing);
    console.log(`  media   reusing ${id} (${key})`);
  } else {
    id = ulid(); key = `${ulid()}${extname(filename)}`;
    execFileSync('wrangler', ['r2', 'object', 'put', `${BUCKET}/${key}`, '--file', path, '--content-type', item.mime, '--remote'], { stdio: ['ignore', 'pipe', 'pipe'] });
    d1(
      `insert into media (id, filename, mime_type, size, width, height, alt, storage_key, content_hash, status, created_at) values (` +
      [sqlStr(id), sqlStr(filename), sqlStr(item.mime), bytes.length, width, height, sqlStr(item.alt), sqlStr(key), sqlStr(hash), sqlStr('ready'), sqlStr(new Date().toISOString())].join(', ') + ')',
    );
    console.log(`  media   created ${id}, stored as ${BUCKET}/${key}`);
  }
  const value = JSON.stringify({ mediaId: id, alt: item.alt });
  d1(`insert or replace into options (name, value) values (${sqlStr(item.option)}, ${sqlStr(value)})`);
  console.log(`  option  ${item.option} = ${value}`);
  console.log(`  served  https://bryanfawcett.com/_emdash/api/media/file/${key}\n`);
}
