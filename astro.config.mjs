// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://bryanfawcett.com',
  adapter: cloudflare({
    // Every image on the site is a plain <img> or inline SVG — nothing uses
    // astro:assets — so the Cloudflare Images binding would be declared and
    // never called. `passthrough` drops it.
    imageService: 'passthrough',
  }),
  output: 'static',
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  redirects: {
    // Misspelling that is easy to land on, and a short form.
    '/orgins-with-perspective': '/origins-with-perspective',
    '/origins': '/origins-with-perspective',
  },
});
