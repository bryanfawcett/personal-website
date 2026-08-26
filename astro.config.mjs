// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://bryanfawcett.com',
  adapter: cloudflare({
    // The portrait is the only raster on the site, and every route prerenders,
    // so sharp resizes it once at build time and the Worker just serves files.
    // `cloudflare` here would declare an Images binding that nothing calls at
    // runtime; `passthrough` would ship the 1.5 MB source untouched.
    imageService: 'compile',
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
