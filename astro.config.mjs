// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import rust from './src/integrations/rust/index.ts';

/*
 * The blog is rendered per request, so its posts are not prerendered routes and the
 * sitemap integration cannot see them. Ask Sanity for the slugs at build time instead.
 * If Sanity is unreachable the sitemap is built without them rather than failing the build.
 */
const SANITY = 'https://zsx9erk1.apicdn.sanity.io/v2025-02-19/data/query/production';
const SITE = 'https://bryanfawcett.com';
/** @type {Map<string, string>} url -> ISO last-modified */
const postDates = new Map();
try {
  const q = '*[_type == "adventure" && defined(slug.current)]{language, "slug": slug.current, _updatedAt}';
  const res = await fetch(`${SANITY}?perspective=published&query=${encodeURIComponent(q)}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (res.ok) {
    const { result } = await res.json();
    for (const post of result ?? []) {
      const prefix = post.language === 'zh' ? '/zh' : '';
      postDates.set(`${SITE}${prefix}/adventures/${post.slug}`, post._updatedAt);
    }
  }
} catch {
  // Sitemap without posts is better than no build.
}
const buildDate = new Date().toISOString();

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
   * Sessions off.
   *
   * With a server entrypoint present the adapter otherwise declares a KV
   * binding for Astro's session store, which then has to exist in Cloudflare
   * before a deploy will go through. Nothing on this site has a session.
   */
  session: false,

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
    rust({
      glue: 'src/integrations/rust/pkg/components_wasm.js',
      wasm: 'src/integrations/rust/pkg/components_wasm_bg.wasm',
    }),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', zh: 'zh-Hans' },
      },
      customPages: [...postDates.keys()],
      serialize(item) {
        item.lastmod = postDates.get(item.url) ?? buildDate;
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
