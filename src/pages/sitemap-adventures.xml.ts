/**
 * The adventures child sitemap, replacing EmDash's own route for it.
 *
 * EmDash injects `/sitemap-adventures.xml` and writes `hreflang="zh"`; every page head and the main
 * sitemap here use `zh-Hans`, so the two disagreed. A route in `src/pages` wins over an injected one,
 * and `src/blog/discovery.ts` writes the same list the blog pages read. `customSitemaps` in
 * `astro.config.mjs` still points the index at this URL, which `/sitemap-adventures*` in
 * `cloudflare.config.ts` already sends to the Worker.
 */
export const prerender = false;

import type { APIRoute } from 'astro';

import { adventuresSitemap } from '../blog/discovery.js';
import { listAdventures } from '../blog/emdash.js';
import { responseFor } from '../blog/http.js';

export const GET: APIRoute = async () => {
  const result = await listAdventures();
  if (!result.ok) {
    const { status, headers } = responseFor('unavailable');
    return new Response('Sitemap temporarily unavailable', { status, headers });
  }
  return new Response(adventuresSitemap(result.data), {
    headers: { ...responseFor('found').headers, 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
