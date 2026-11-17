/**
 * Compare the Rust Worker's pages with the Astro ones: structure and text, not bytes.
 *
 *   node crates/site-worker/scripts/compare.mjs <astro-base> <worker-base> <path>...
 *   node crates/site-worker/scripts/compare.mjs http://localhost:4321 http://localhost:8788 /adventures /zh/adventures
 *
 * For each path both servers are asked with `Sec-Fetch-Mode: navigate` (what a browser sends;
 * curl without it does not exercise the asset layer). It compares:
 *   - status, Cache-Control and Retry-After;
 *   - the head's searchable facts: title, description, canonical, hreflang, og:*;
 *   - the whole <body>, normalised: attributes sorted, `data-astro-*` and <script>/<style>
 *     dropped, whitespace collapsed, one token per line. Header, footer, rail and main.
 * and prints a unified diff of whatever differs. Exit 0 when nothing differs.
 */
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const [astro, worker, ...paths] = process.argv.slice(2);
if (!astro || !worker || paths.length === 0) {
  console.error('usage: compare.mjs <astro-base> <worker-base> <path>...');
  process.exit(2);
}

const VOID = new Set(['meta', 'link', 'img', 'br', 'hr', 'input']);

function tokens(html) {
  const out = [];
  const body = html.slice(html.indexOf('<body'));
  const re = /<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1>|<\/?([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)/g;
  let m;
  while ((m = re.exec(body))) {
    if (m[1] || m[0].startsWith('<!--')) continue;
    if (m[4] !== undefined) {
      // &#39; / &#x27; / ' are one apostrophe; &nbsp; is a space that survives collapsing.
      const text = m[4].replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, '\u00a0').replace(/[ \t\r\n]+/g, ' ').trim();
      if (text) out.push(`"${text}"`);
      continue;
    }
    const closing = m[0].startsWith('</');
    const name = m[2].toLowerCase();
    if (closing) {
      out.push(`</${name}>`);
      continue;
    }
    const attrs = [];
    for (const a of m[3].matchAll(/([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
      if (a[1].startsWith('data-astro-')) continue;
      attrs.push(`${a[1]}="${(a[2] ?? a[3] ?? a[4] ?? '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'")}"`);
    }
    out.push(`<${name}${attrs.length ? ' ' + attrs.sort().join(' ') : ''}>`);
  }
  return out;
}

function headFacts(html) {
  const head = html.slice(0, html.indexOf('</head>'));
  const facts = [];
  const title = /<title>([\s\S]*?)<\/title>/.exec(head);
  if (title) facts.push(`title: ${title[1]}`);
  for (const m of head.matchAll(/<(meta|link)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g)) {
    const tag = m[0].replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'");
    if (/name="description"|rel="canonical"|rel="alternate"|property="og:(?!image)|name="twitter:card"|name="robots"/.test(tag)) {
      facts.push(tag.replace(/\s*\/?>$/, '>').replace(/\s+/g, ' '));
    }
  }
  return facts.sort();
}

async function get(base, path) {
  const res = await fetch(base + path, { headers: { 'Sec-Fetch-Mode': 'navigate' }, redirect: 'manual' });
  return {
    status: res.status,
    cache: res.headers.get('cache-control'),
    retry: res.headers.get('retry-after'),
    html: await res.text(),
  };
}

const dir = mkdtempSync(join(tmpdir(), 'compare-'));
let differing = 0;

for (const path of paths) {
  const [a, w] = await Promise.all([get(astro, path), get(worker, path)]);
  console.log(`\n=== ${path}`);
  const meta = (r) => `status=${r.status} cache-control=${r.cache} retry-after=${r.retry}`;
  const sameMeta = meta(a) === meta(w);
  console.log(`${sameMeta ? 'same ' : 'DIFF '} ${sameMeta ? meta(a) : `\n   astro  ${meta(a)}\n   worker ${meta(w)}`}`);
  if (!sameMeta) differing++;

  for (const [label, left, right] of [
    ['head', headFacts(a.html), headFacts(w.html)],
    ['body', tokens(a.html), tokens(w.html)],
  ]) {
    const fa = join(dir, `${label}-astro.txt`);
    const fw = join(dir, `${label}-worker.txt`);
    writeFileSync(fa, left.join('\n') + '\n');
    writeFileSync(fw, right.join('\n') + '\n');
    const d = spawnSync('diff', ['-U2', fa, fw], { encoding: 'utf8' });
    if (d.status === 0) console.log(`same  ${label} (${left.length} ${label === 'head' ? 'facts' : 'tokens'})`);
    else {
      differing++;
      console.log(`DIFF  ${label}: ${left.length} astro vs ${right.length} worker\n${d.stdout.split('\n').slice(2).join('\n')}`);
    }
  }
}
console.log(differing === 0 ? '\nno differences' : `\n${differing} difference group(s)`);
process.exit(differing === 0 ? 0 : 1);
