# Moving the blog from Sanity to EmDash (spike)

Status: a working spike on a branch, run locally only. Nothing was deployed, no Cloudflare
resource was created, and the live Cloudflare config and build commands are untouched on `main`.
Versions: `emdash` 1.5.0, `@emdash-cms/cloudflare` 1.5.0, `@astrojs/react` 7.1.9, Astro 7.4.12,
`@astrojs/cloudflare` 15.0.0-beta.5, `cf` 1.0.0-beta.32, wrangler 4.162.0, Node 25.9 locally.

## What is proven, and what is not

Proven (local, with miniflare/workerd D1, R2 and KV; no account):

- `pnpm install`, `pnpm check` (0 errors), `pnpm build`, `pnpm dev` all work on Astro 7 +
  `@astrojs/cloudflare` 15 beta + the `cf` config. EmDash is just `react()` + `emdash({ database: d1(), storage: r2() })`.
- **`output: 'static'` is kept.** EmDash's docs say `output: "server"` is required; it is not.
  Every non-blog page stays prerendered, the build output is still
  `.cloudflare/output/v0/workers/default/{assets,bundle}`, and the on-demand EmDash routes
  (`/_emdash/*`, sitemap, robots) are added by the integration.
- **The built Worker runs on workerd** (wrangler dev against the build output, local state): D1
  migrations apply on the first request, `/` and `/experience` are served from assets, the blog
  and `/_emdash/*` go through the Worker, `/_emdash/api/auth/dev-bypass` answers 403, and the
  content and media APIs answer 401 without a session.
- The four blog routes are re-implemented on EmDash (`src/blog/`), with en, zh and an English-only
  fixture. Verified against the running dev server: list in both languages; `仅有英文` marker and
  link to the English page for the English-only entry; hreflang only where a real translation exists
  (and with the translation's own slug); `/zh/...` for an English-only slug is a real 404 (see
  quirks below); missing post 404 with `no-store`; simulated outage gives 503 with `Retry-After: 120`
  and `no-store` on list and post; found pages carry `BLOG_CACHE_CONTROL`; empty database renders
  the empty state; body headings fold to h2/h3; hostile links render as plain words; media upload,
  cover image and a body image are served from local R2.
- Gates green on the branch: `check`, `build`, `verify:links`, `verify:seo`, `verify:stylesheet`,
  `verify:components:rs`, `fragments:check`, `rust:wasm:check` (after `pnpm rust:wasm`, because the
  Rust workspace changed), `theme:check`, `palette:check`, `design-system:check`, `pnpm audit`.
  `verify:contrast` (APCA) also passes against `astro dev` with EmDash installed and fixtures
  loaded: 15 routes, 437 blocks at 1280px and 420 at 390px, 0 failures. It needs
  `CONTRAST_HOST=localhost`: dev binds the IPv6 loopback, not `127.0.0.1`.

Not proven:

- A real deploy. `cf deploy`, D1/R2/KV provisioning from `cloudflare.config.ts`, and whether
  `bindings.d1()` with no ids auto-provisions are untested (and must stay so until the owner decides).
- The admin UI in a browser (setup wizard, passkey registration, the editor, the Translations panel).
  Only its HTTP surface was exercised; fixtures were written through the REST API.
- The 503 path with a genuinely unreachable D1; it was simulated by throwing in the read functions.
- Scheduled publishing and scheduled backups (see "Cron" below).
- axe-core and `verify:overlap` against the blog pages with real content.
- Deno (see the last section).

## Numbers

| | before | with EmDash |
|---|---|---|
| `/` HTML | 42,429 B | 42,429 B (byte-identical) |
| `/experience` HTML | 46,930 B | 46,930 B (byte-identical) |
| `/zh`, `/minerals`, `/book` | | byte-identical |
| scripts and styles referenced by `/` and `/experience` | ClientRouter, MziziHeader, page, BaseLayout.css | the same four, same hashes |
| React or admin code in any public page | | none (`grep react` on the built HTML: 0) |
| static asset tree | 3.4 MB, 53 files | 22.8 MB, 152 files (the admin SPA, in `/_astro/`) |
| Worker `bundle/` | 2.3 MB | 51 MB on disk including source maps; about 19.4 MB of JS/WASM without maps, about 5.2 MB when gzipped per module (rough, not Cloudflare's own measurement) |

So the public pages cost nothing. The Worker bundle is the real cost: roughly 5 MB compressed is
over the Workers Free limit (3 MB) and inside the Paid limit (10 MB). **A Workers Paid plan looks
required**; confirm with a real `cf deploy --dry-run` equivalent before committing. The blog routes
(`/adventures` in dev) are about the same size as any other page; their weight is the same layout.

## Decisions for the owner (conflicts with a project rule)

None of these were resolved by editing a rule, except where the branch had to change something to
run, which is listed.

1. **React.** Allowed for the admin only (owner decision). The admin bundle never reaches a public
   page, so "no framework JS on public pages" still holds. `react`, `react-dom`, `@astrojs/react`
   are now dependencies; the `react()` integration is installed. CLAUDE.md "Everything is Astro"
   and Common Pitfall 5 need rewording to say "public pages".
2. **`session: false` is gone (branch change).** CLAUDE.md says nothing here has a session; EmDash
   keeps the signed-in admin user in the Astro session and warned that sign-in fails without one.
   With the default driver the adapter declares a KV binding `SESSION`. That is a new KV namespace
   to exist before deploy. No public page uses it.
3. **`wrangler` is a peer** of `@emdash-cms/cloudflare` (>=4.99.0), while the repo deploys with `cf`.
   It was installed as a dependency to satisfy the peer and used only to run the built Worker
   locally. It is not used to build or deploy. Whether `cf` is acceptable as the only deploy path
   for an EmDash site is untested; EmDash's own docs assume `wrangler.jsonc` and `wrangler deploy`.
4. **The Worker's `main`.** EmDash's template wraps the adapter handler in
   `@emdash-cms/cloudflare/worker` (adds a `scheduled()` handler and a Durable Object class). The
   `cf` config here uses the adapter's own entrypoint. Consequence: no cron handler, so
   **scheduled publishing and scheduled backups do not run**. The `adventures` collection does not
   declare `scheduling`. Adopting the EmDash worker entry means a `cf` `triggers.crons` entry and a
   different `entrypoint`; untested.
5. **Node floor.** EmDash needs Node >=22.16 (the repo said 22.12, CI uses Node 22). The
   coordinator is moving the floor on `main`; this branch assumes it and does not touch
   `engines`. Note the Cloudflare guide itself says 22.23.4. Several existing devDependencies
   already warn on Node 25 (`cf` wants 22.23+/24.22+/26.12+; `vite-plus` 22.18+).
6. **`@portabletext/to-html` stays.** The brief said to remove it with the Sanity dependencies.
   EmDash stores rich text as Portable Text, and this is a generic renderer, not a Sanity client.
   Replacing it with a hand-written renderer (lists, nested marks) is risk for no gain. Alternative:
   EmDash's own `PortableText` Astro component, which cannot enforce `classifyLink`'s own-host
   rule and `target`/`rel` policy. Owner may overrule.
7. **Images are not resized.** Sanity's CDN did width/crop/webp. EmDash serves the stored file at
   `/_emdash/api/media/file/<key>`; resizing needs Cloudflare Images or Astro's image service, and
   `<Image>` is forbidden on on-demand routes in this repo (`/_image` does not exist there). Uploaded
   images should be resized and compressed before upload. This is a visible regression for a
   photo-led blog.
8. **Mineral picker.** The Sanity schema offered the seven minerals; the `mineral` select in
   `seed/seed.json` keeps those seven. The brief mentions 21 families; widening is a list change
   (ideally generated from `src/brand/mzizi-palette.generated.ts`).
9. **Date.** The Sanity `publishedAt` (date of the adventure) is a custom `adventure_date` field;
   EmDash's own `publishedAt` is a separate system field. Two dates is a small authoring trap.
10. **Security headers differ on blog routes.** EmDash middleware adds `X-Frame-Options`,
    `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy` to on-demand routes (and a
    CSP to the admin). Prerendered pages do not get them. Not a conflict, a difference.
11. **Two sitemaps and two robots surfaces.** EmDash injects `/sitemap.xml`, `/sitemap-<collection>.xml`
    and `/robots.txt`. The static `robots.txt` and the Astro `sitemap-index.xml` win for
    prerendered paths; the index lists `sitemap-adventures.xml` through `customSitemaps`. EmDash's
    child sitemap emits `hreflang="zh"`, the site uses `zh-Hans`; align one of them.
12. **Rust workspace.** Removing `tools/verify-image-urls` changed `tools/Cargo.lock`, which changes
    the wasm source hash, so `src/integrations/rust/pkg` was rebuilt (`pnpm rust:wasm`). The Rust
    blog Worker prototype (PR #54, `crates/site-worker`) was not touched.

## Admin protection

Tested locally, no auth:

- Fresh database: `/_emdash/admin` redirects to `/_emdash/admin/setup`, and `GET
  /_emdash/api/setup/status` answers `needsSetup: true` to anyone. **The first person to finish the
  wizard becomes administrator.** A deployed empty site is therefore takeover-able by whoever gets
  there first.
- After setup (simulated with the dev bypass): content and media APIs answer 401 without a session or
  token; `dev-bypass` routes answer 403 in a production build (they exist only when `import.meta.env.DEV`).
- Passkeys are bound to the hostname they were created on; set `EMDASH_SITE_URL` for the custom domain.

Recommended order (owner action, nothing done): put Cloudflare Access in front of `/_emdash/*`
*before* the first deploy (`@emdash-cms/cloudflare` exports an `access()` auth config), or complete the
setup wizard in the same minute as the first deploy. **Access must not cover
`/_emdash/api/media/file/*`**, because every blog image is served from that path, nor
`/sitemap-adventures*`. Set `EMDASH_ENCRYPTION_KEY` as a secret only if plugin settings are used.

## What the owner must do in Cloudflare (none was done)

1. Workers Paid plan (see the bundle size above).
2. Create a D1 database for the Worker and bind it as `DB`.
3. Create an R2 bucket and bind it as `MEDIA` (optionally a public custom domain for it, then set
   `publicUrl` on `r2()` so images skip the Worker).
4. Create a KV namespace and bind it as `SESSION`.
   `cloudflare.config.ts` on this branch declares all three with `bindings.d1()`, `bindings.r2()`,
   `bindings.kv()`; whether `cf` creates them on deploy is unknown. If not, create them and add the
   ids.
5. Zero Trust: an Access application over `/_emdash/*` with the two bypass paths above, restricted to
   the owner's identity.
6. Secrets/variables: `EMDASH_SITE_URL=https://bryanfawcett.com` (and `EMDASH_ENCRYPTION_KEY` only if
   plugins with settings are enabled).
7. After the first deploy: open `/_emdash/admin` on the production hostname and finish setup
   immediately (or behind Access). Register a passkey on that hostname.
8. Optional: a Cron Trigger and the EmDash worker entry for scheduled publishing and backups.

Build and deploy command changes: **none were needed for the build** (`pnpm build` is the same
`vp run tokens && vp exec astro build`, and EmDash writes `.emdash/migrations.json`, now committed).
The dashboard build command stays as is, but because `package.json` and the lockfile changed the
install step now pulls EmDash and wrangler.

## EmDash behaviours and gaps (candidates for upstream issues)

1. The docs say `output: "server"` is required; `output: 'static'` plus on-demand routes works.
2. Sessions: with `session: false` EmDash only warns at config time; a clearer failure or a
   documented KV requirement would help.
3. `getEmDashEntry(collection, slug, { locale })` falls back to the default-locale entry when the
   locale has none, even with no `i18n.fallback` configured. There is no strict option; callers must
   compare `data.locale`.
4. `entry.id` is `<locale>/<slug>` for non-default locales but the bare slug for the default; `data.slug`
   is bare. Easy to build wrong URLs (this spike's hreflang first rendered `/zh/adventures/zh/<slug>`).
5. Image fields store no `src`; the value carries `meta.storageKey`/`id` and needs
   `Astro.locals.emdash.getPublicMediaUrl` or the `Image` component to resolve. Plain-markup consumers
   must rebuild the URL themselves. Portable Text image blocks need alt/caption but alt is optional.
6. Select options go in `validation.options`, not `options` (the typed `options` is widget config);
   the seed docs show neither for `select`.
7. Seeds apply on the first request of an empty database, so a seed with content ships that content to
   production. A schema-only mode for committed seeds would be safer than "never put content in it".
8. The setup wizard is open to the first visitor on a fresh database. An `EMDASH_SETUP_TOKEN` or
   allow-listed first user would remove the race.
9. The EmDash worker entry (`@emdash-cms/cloudflare/worker`) assumes `wrangler.jsonc` and a `main`;
   guidance for the `cf` config (cron, Durable Object exports) is missing.
10. The built Worker is about 19 MB uncompressed because admin, MCP, registry and every admin locale
    are in one bundle. A way to split the admin Worker from the public render path would let a public
    site stay under the Free-plan limit.
11. Cache-hint and sitemap routes use `hreflang="zh"`; BCP 47 script subtags (`zh-Hans`) are what this
    site publishes.
12. `astro preview` serves only static assets for this setup (no Worker), so the built Worker cannot be
    tried without hand-writing a wrangler config; a documented local run of the built output would help.
13. Dev server listens on `localhost` (IPv6) only; tools that use `127.0.0.1` fail with a timeout.

## Plugins we need

Checked against the real plugin API: `skills/creating-plugins/SKILL.md` and its references (hooks,
content, portable-text-blocks) shipped in the scaffold, and the hook tables in `hooks.md`.
Facts that decide the answers:

- **Sandboxed** plugins export a `SandboxedPlugin` const from `src/plugin.ts`, declare capabilities in
  `emdash-plugin.jsonc`, cannot import Node built-ins, and are bundled by the plugin CLI. They cannot
  define Portable Text block types, Astro components, or React admin code.
- **Native** plugins use `definePlugin()` / `createPlugin()`, run with the site's authority, and can
  ship React admin, Astro components and custom Portable Text blocks. They install as a site
  dependency (or local code), never from the registry.
- Publish policy hooks need `hooks.content-policy:register`: `content:beforePublish`,
  `beforeSchedule`, `beforeUnpublish`. They receive `event.content.data` (the draft, including the
  Portable Text body) and return `void` or `{ cancel: true, reason }` (1-500 plain-text characters). The
  scheduler runs `beforePublish` again when an entry falls due.
- `content:beforeSave` can reject too, from a sandbox, by returning a `SAVE_REJECTED` envelope.
- `page:metadata` contributes typed head tags, but only through EmDash's own head component, which this
  site does not use (the head is `rust:seo-head` via `BaseLayout`).
- EmDash core already has scheduled backups (`backups/` prefix in the media storage, 7 by default),
  driven by the Cron Trigger.

Ranking, with kind and format. "Gate" means needed before the blog goes live.

| # | Item | Plugin or site code | Format | Priority | Effort |
|---|---|---|---|---|---|
| 1 | Link policy at publish and save (`classifyLink`) | plugin | native, local in-repo | Gate? No: the render path already enforces it. Do next; it gives the editor an error instead of a silently dropped link | low |
| 1b | Link policy at render (defence in depth) | site code, **done** (`src/blog/portable-text.ts`, `verify:links`) | n/a | Gate, done | done |
| 2 | Accessibility policy at publish | plugin | sandboxed | **Gate**: nothing in CI can see CMS content, so alt text and link text are only enforced if this hook does it | low-medium |
| 3 | Translation policy | mostly site code (done); optional hook | sandboxed if built | Nice to have | low |
| 4 | Mineral field | **no plugin**; a `select` field already works (done) | n/a | Nice to have (21 families, swatch picker) | low / medium |
| 5 | SEO and discovery | site code, not a plugin | n/a | Gate for article OG/JSON-LD wiring; sitemap done | low |
| 6 | N4 sanitise on publish and at render | covered by 1, 1b, 2; no separate plugin | n/a | covered | none |
| 7 | Scheduled D1 export to R2 | **reject as a plugin**: core backups already do it | n/a | Needs the Cron Trigger (decision 4) | none |

Details and reasoning:

1. **Link policy.** A sandboxed plugin could do it (a pure function over `content.data.body`, needing
   only `hooks.content-policy:register`), but the sandbox bundle cannot import `src/blog/portable-text.ts`,
   so the rule would live twice and drift. A native plugin defined inside the repo can import the same
   `classifyLink`, one rule, one test. Trade: native runs with site authority, acceptable for our own
   code that never leaves the repo. Register on `beforePublish` and `beforeSave` (a draft with a bad
   link should fail early). `verify:links` should call the plugin's check as well as the renderer.
2. **Accessibility policy.** Pure function, sandboxed. Checks on `data.body` and `data.cover`: every
   image block and the cover has non-empty alt (decorative images are not a case this blog needs); no
   `h1` (and, because the renderer folds levels, no `h4`+ either, so the author sees what will render);
   no skipped heading level starting at h2; reject link text such as "click here", "here", "link",
   "read more". Cancel with one clear reason. The renderer cannot invent alt text, which is why this is a
   gate: today a missing alt renders `alt=""` and passes every automated check.
3. **Translation policy.** Rendering already derives hreflang and the switcher only from a real
   published sibling, so correctness does not depend on a plugin. A hook that refuses to publish a zh
   entry without an en sibling would need `content:read` (translations) and is a courtesy. Slug
   uniqueness per locale: not tested here; if EmDash does not enforce it, a `beforePublish` check is the
   place. Start by testing.
4. **Mineral.** `select` with `validation.options` already stores a name, emitted as `data-mineral`, never
   a hex value. Widening to 21 names is a seed edit (generate it from the palette file with a script so
   the two cannot drift). A swatch picker or a per-block mineral in rich text would be a native plugin
   (React widget, custom Portable Text block plus an Astro renderer). Not worth it until a post needs it.
5. **SEO and discovery.** The blog views already pass title, description and alternates to `BaseLayout`
   and the existing `rust:seo-head`. Still to do as plain site code: pass the cover image as `og:image`,
   and add article metadata. Do not enable `page:metadata`/`EmDashHead`; it would emit a second head.
   `/sitemap-adventures.xml` comes from EmDash and is listed in the sitemap index. For `llms.txt`,
   either list the post index statically or add an `llms-adventures.txt` route; both are site code.
6. **N4.** Sanitise at publish (1, 2) and at render (1b), and treat every read as untrusted: HTML,
   iframe, video and unknown block types render as nothing, text is escaped by the renderer. No extra
   plugin.
7. **Backups.** The Cloudflare table in EmDash's docs lists backups under the Cron Trigger. A sandboxed
   plugin has no capability to write an arbitrary R2 object (`media:write` writes the media library), so
   it could not do this anyway. Enable the core feature and the Cron Trigger.

Order of work: (2) accessibility policy, then (1) link policy as a native local plugin, then site code
for OG image and article metadata, then the 21-family select. Nothing else needs a plugin.

## Plugins: built (packages/emdash-plugins)

Items 1, 2 and 3 above exist as three adoptable plugins plus a shared core; see
`packages/emdash-plugins/README.md`. Two corrections to the analysis above, found by building them:

- **The link policy is sandboxed, not native.** A bundling step compiles the shared rules into each
  plugin, so the sandbox's "cannot import repo code" limit no longer forces native. One capability
  (`hooks.content-policy:register`) instead of site authority. The render check in
  `src/blog/portable-text.ts` imports the same core, so there is one rule.
- **Event shape:** a policy hook's `event.content` is the whole content item (`id`, `slug`, `status`,
  `locale`, `translationGroup`, `data`), and the draft is hydrated first, so the check sees what is being
  published. Hook errors fail closed.

They are registered in `plugins: []` (format `standard`), not `sandboxed: []`, because the latter needs
`sandboxRunner: sandbox()` and a Worker Loader binding, which is a Cloudflare resource. Proven against
the local dev server with `node scripts/emdash-policy-e2e.mjs`. Not proven: the admin UI showing the
message, scheduled publishing (no cron), a real isolate.

Gaps found (upstream candidates):

1. A policy hook registered without `hooks.content-policy:register` is **skipped with a console warning**,
   i.e. the policy silently stops applying. It should be a startup error.
2. `definePlugin()` in `emdash` is the native form (it requires `id`); the sandbox-format default export
   is a bare `{ hooks }` object, but the docs and the descriptor doc comment both say `definePlugin`.
3. `content.getTranslations`/`list` are optional methods on `ContentAccess`, so a sandboxed plugin must
   handle their absence (the translation plugin fails closed).
4. The policy reason is plain text capped at 500 code points with no structure, so several findings have
   to be flattened into one string and truncated.
5. Slug uniqueness is enforced at create (`SLUG_CONFLICT`) but not, as far as tested, at publish.
6. Seeds apply content and plugins reject content: a fixture that is *meant* to be unsafe (the hostile
   links) can no longer be published through the API, so render-time defence is tested by `verify:links`
   rather than by a live post.

## Deno

Not tested: Deno is not installed on this machine, so there is no run to report. Evidence from the
packages only. EmDash declares `engines.node >=22.16`, its CLI is a Node bin, and its documented targets
are Node (`@astrojs/node`, SQLite) and Cloudflare. Local development here goes through the Cloudflare
Vite plugin and miniflare/workerd, which are Node packages with native binaries; Deno's npm
compatibility may run them but that is unverified, and `vite-plus`, `cf`, `playwright` and the Rust
verifiers would each need the same check. Production is Cloudflare Workers regardless, so this only
affects local tooling. Worth a one-hour test on a machine with Deno before committing to it: install,
`astro dev`, `astro build`, and the `emdash` CLI.

## Reproducing the local proof

```bash
pnpm install
pnpm dev                          # D1, R2 and KV are simulated under .cloudflare/state (gitignored)
node scripts/emdash-fixtures.mjs  # FIXTURE entries (en, zh, English-only, hostile links) and an image
# open http://localhost:4321/adventures and /zh/adventures
```

The fixtures script refuses any host that is not localhost and uses a dev-only auth bypass. It is the
only place fixture content lives; `seed/seed.json` holds the schema alone.
