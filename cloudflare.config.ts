import { bindings, defineConfig } from 'cf/config';
import * as entrypoint from '@astrojs/cloudflare/entrypoints/server' with { type: 'cf-worker' };

// Replaces wrangler.jsonc. See CLAUDE.md "Architecture" for why each field exists.
export default defineConfig({
	worker: {
		name: 'bryanfawcett-site',
		compatibilityDate: '2026-08-26',
		compatibilityFlags: ['nodejs_compat'],
		entrypoint,
		assets: {
			notFoundHandling: '404-page',
			// Without this the blog 404s for every real visitor: assets are matched
			// before the Worker, and a browser navigation (Sec-Fetch-Mode: navigate)
			// is answered from the asset tree or 404.html. curl hides it.
			runWorkerFirst: ['/adventures', '/adventures/*', '/zh/adventures', '/zh/adventures/*', '/_emdash/*', '/sitemap-adventures*'],
		},
		env: {
			ASSETS: bindings.assets(),
			// EmDash: content (D1) and media (R2). Binding names must match astro.config.mjs.
			// Resources are named `bryanfawcett-site-<purpose>` and created explicitly (an unnamed
			// binding would be auto-provisioned under an opaque name). Ids are identifiers, not secrets.
			DB: bindings.d1({ name: 'bryanfawcett-site-db', id: 'b375164b-e9a7-42ca-ae41-462dbcf053e3' }),
			MEDIA: bindings.r2({ name: 'bryanfawcett-site-media' }),
			// Astro session store; EmDash keeps the signed-in admin user in it.
			SESSION: bindings.kv({ id: '230958898f024b46a206a99e3fad8dc4' }),
			// Passkeys are bound to the hostname they were created on.
			// Literal on purpose: importing src/data/site.ts here makes the dev server refuse that file (403).
			EMDASH_SITE_URL: bindings.text('https://bryanfawcett.com'),
		},
		observability: { enabled: true },
	},
});
