// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://bryanfawcett.com',
  adapter: cloudflare(),
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
