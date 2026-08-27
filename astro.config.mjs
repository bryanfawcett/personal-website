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

  /*
   * Two languages: English unprefixed at the root, Chinese under /zh.
   *
   * `prefixDefaultLocale: false` keeps every existing English URL exactly where
   * it is — no redirect, no change to a link anyone has already shared.
   * `redirectToDefaultLocale` is off for the same reason: /zh is a real page
   * authored in this repo, not a fallback that should bounce.
   */
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },

  /*
   * Every link on the site is written without a trailing slash.
   *
   * The default `format: 'directory'` emits minerals/index.html, and an
   * assets-only Worker can only serve that at /minerals/ — so every internal
   * link 307s to the slashed form first. No `html_handling` setting fixes it,
   * because the file genuinely lives at that path. `format: 'file'` emits
   * minerals.html instead, which is served at /minerals directly.
   */
  trailingSlash: 'never',
  build: { format: 'file' },
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
