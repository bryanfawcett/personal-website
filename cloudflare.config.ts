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
			// EmDash: content (D1) and media (R2). Names must match astro.config.mjs.
			DB: bindings.d1(),
			MEDIA: bindings.r2(),
			// Astro session store; EmDash keeps the signed-in admin user in it.
			SESSION: bindings.kv(),
		},
		observability: { enabled: true },
	},
});
