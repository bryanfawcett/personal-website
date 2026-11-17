// Prints the three GROQ queries from src/sanity/queries.ts as JSON, for tests/queries_parity.rs.
// Run from the repo root:
//   node --experimental-strip-types --import ./scripts/ts-specifier-hook.mjs crates/site-worker/scripts/dump-queries.mjs
import { BLOG_CACHE_CONTROL } from '../../../src/sanity/client.ts';
import * as q from '../../../src/sanity/queries.ts';

console.log(JSON.stringify({ ADVENTURE_LIST: q.ADVENTURE_LIST, ADVENTURE_EN: q.ADVENTURE_EN, ADVENTURE_ZH: q.ADVENTURE_ZH, BLOG_CACHE_CONTROL }));
