/**
 * The downloadable contact card.
 *
 * A static endpoint: `output: 'static'` prerenders this to a real file, so the
 * assets-only Worker serves it without needing a `main`.
 */
import type { APIRoute } from 'astro';

import { vcard } from '../brand/vcard.js';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(vcard(), {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bryan-fawcett.vcf"',
    },
  });
