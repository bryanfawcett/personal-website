/**
 * The adventures section of llms.txt, generated from EmDash.
 *
 * `/llms.txt` itself is a static file (it is in `public/`, so it never reaches the Worker, and the
 * blog's posts live in D1, not in the build). This is the live part: published adventures, newest
 * first, with Chinese versions beside their English post. `public/llms.txt` links here. It lives
 * under `/adventures/` because that path is already routed to the Worker first
 * (`runWorkerFirst` in `cloudflare.config.ts`); serving `/llms.txt` itself dynamically would need
 * that one line added there.
 */
export const prerender = false;

import type { APIRoute } from 'astro';

import { adventuresLlms } from '../../blog/discovery.js';
import { listAdventures } from '../../blog/emdash.js';
import { responseFor } from '../../blog/http.js';

export const GET: APIRoute = async () => {
  const result = await listAdventures();
  if (!result.ok) {
    const { status, headers } = responseFor('unavailable');
    return new Response('Temporarily unavailable', { status, headers });
  }
  return new Response(adventuresLlms(result.data), {
    headers: { ...responseFor('found').headers, 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
