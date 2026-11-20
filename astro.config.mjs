// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import emdash from 'emdash/astro';
import { d1, r2 } from '@emdash-cms/cloudflare';
import rust from './src/integrations/rust/index.ts';
import { a11yPolicy } from './packages/emdash-plugins/a11y-policy/src/index.ts';
import { linkPolicy } from './packages/emdash-plugins/link-policy/src/index.ts';
import { translationPolicy } from './packages/emdash-plugins/translation-policy/src/index.ts';

/*
 * The blog is rendered per request out of EmDash (D1), so its posts are not prerendered routes and
 * the sitemap integration cannot see them. EmDash serves its own child sitemap for the collection
 * at /sitemap-adventures.xml; the index lists it through `customSitemaps` below.
 */
import { SITE_URL as SITE } from './src/data/site.ts';
const buildDate = new Date().toISOString();

// https://astro.build/config
export default defineConfig({
  site: SITE,
  adapter: cloudflare({
    // The portrait is the only raster on the site, and every route prerenders,
    // so sharp resizes it once at build time and the Worker just serves files.
    // `cloudflare` here would declare an Images binding that nothing calls at
    // runtime; `passthrough` would ship the 1.5 MB source untouched.
    imageService: 'compile',
  }),
  output: 'static',

  /*
   * Sessions off.
   *
   * With a server entrypoint present the adapter otherwise declares a KV
   * binding for Astro's session store, which then has to exist in Cloudflare
   * before a deploy will go through. Nothing on this site has a session.
   */
  // SPIKE: was `session: false`. EmDash keeps the signed-in admin user in the Astro
  // session, so the adapter's default KV session driver (binding SESSION) is needed.
  // Listed as a DECISION in docs/emdash-migration.md.

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
  /*
   * The sitemap carries hreflang alternates, not just URLs.
   *
   * Every route exists in both languages, and the pairing is already declared
   * in each page's head. Repeating it here is what Google asks for on a
   * bilingual site: the two forms corroborate each other, and a crawler that
   * reaches the sitemap first learns the pairing without fetching both pages.
   *
   * `en` has no path segment (prefixDefaultLocale is false), so it is the
   * default and unprefixed URLs resolve to it; `zh` maps to the `zh-Hans`
   * hreflang code the head already uses, rather than a bare `zh`.
   */
  integrations: [
    // React is for the EmDash admin only; public pages ship no framework JS.
    react(),
    emdash({
      database: d1({ binding: 'DB', session: 'auto', coalesce: true }),
      storage: r2({ binding: 'MEDIA' }),
      /*
       * Publish-time policy, from packages/emdash-plugins. They are "standard" (sandbox-format) plugins
       * with their shared rules bundled in, registered in `plugins` so they run in-process: moving them
       * to `sandboxed` needs `sandboxRunner: sandbox()` and a Worker Loader binding, a Cloudflare
       * resource nobody has created yet. Their capabilities are enforced either way.
       */
      plugins: [a11yPolicy(), linkPolicy(), translationPolicy()],
    }),
    rust({
      glue: 'src/integrations/rust/pkg/components_wasm.js',
      wasm: 'src/integrations/rust/pkg/components_wasm_bg.wasm',
    }),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', zh: 'zh-Hans' },
      },
      customSitemaps: [`${SITE}/sitemap-adventures.xml`],
      serialize(item) {
        item.lastmod = buildDate;
        return item;
      },
    }),
  ],
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
