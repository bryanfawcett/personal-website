/**
 * A stand-in for Sanity's query API, serving fixtures/adventures.json.
 *
 * The production dataset has no published adventures, so the Worker and the Astro pages are
 * both pointed here to compare them on real-shaped data. It recognises the three GROQ
 * queries by their text (they are fixed strings in src/sanity/queries.ts) and answers in the
 * `{ "result": … }` envelope. It does not interpret GROQ.
 *
 *   node crates/site-worker/fixtures/server.mjs [port]            # default 4399
 *
 * Control endpoint, for exercising the resilience wiring in the real Worker runtime:
 *   GET /__mode?m=ok|down|slow     down answers 503, slow stalls for 12 s (past the 8 s budget)
 *   GET /__stats                   how many queries it has answered
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const data = JSON.parse(readFileSync(fileURLToPath(new URL('./adventures.json', import.meta.url)), 'utf8'));
const port = Number(process.argv[2] ?? 4399);
let mode = 'ok';
let hits = 0;

/** The card projection, as `CARD_FIELDS` selects it. */
const card = (a) => ({ _id: a._id, title: a.title, slug: a.slug, publishedAt: a.publishedAt, place: a.place, mineral: a.mineral, excerpt: a.excerpt, cover: a.cover });

function answer(query, params) {
  const slug = params.slug;
  if (query.includes('order(publishedAt desc)')) {
    return [...data.en]
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
      .map((a) => {
        const zh = a.translation ? data.zh.find((z) => z.slug === a.translation.slug) : null;
        return { ...card(a), zh: zh ? { title: zh.title, slug: zh.slug, excerpt: zh.excerpt, place: zh.place } : null };
      });
  }
  if (query.includes('language == "en" && slug.current == $slug')) {
    const a = data.en.find((x) => x.slug === slug);
    return a ? { ...card(a), language: 'en', body: a.body, translation: a.translation ?? null } : null;
  }
  if (query.includes('language == "zh" && slug.current == $slug')) {
    const a = data.zh.find((x) => x.slug === slug);
    return a ? { ...card(a), language: 'zh', body: a.body, original: a.original ?? null } : null;
  }
  return undefined;
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/__mode') {
    mode = url.searchParams.get('m') ?? 'ok';
    return res.end(`mode=${mode}\n`);
  }
  if (url.pathname === '/__stats') return res.end(`${hits}\n`);
  hits++;
  const done = () => {
    if (mode === 'down') {
      res.writeHead(503, { 'content-type': 'application/json' });
      return res.end('{"error":"fixture down"}');
    }
    const query = url.searchParams.get('query') ?? '';
    const params = {};
    for (const [k, v] of url.searchParams) if (k.startsWith('$')) params[k.slice(1)] = JSON.parse(v);
    const result = answer(query, params);
    if (result === undefined) {
      res.writeHead(400, { 'content-type': 'application/json' });
      return res.end('{"error":"fixture does not know this query"}');
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ query, result, ms: 1 }));
  };
  if (mode === 'slow') setTimeout(done, 12_000);
  else done();
}).listen(port, '127.0.0.1', () => console.log(`fixture sanity on http://127.0.0.1:${port}`));
