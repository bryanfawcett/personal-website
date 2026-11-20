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
8. **Mineral picker.** Resolved: the select now lists all 21 families, generated from the palette
   (see "Mineral field: 7 to 21"); no picker was built.
9. **Date.** The Sanity `publishedAt` (date of the adventure) is a custom `adventure_date` field;
   EmDash's own `publishedAt` is a separate system field. Two dates is a small authoring trap.
10. **Security headers differ on blog routes.** EmDash middleware adds `X-Frame-Options`,
    `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy` to on-demand routes (and a
    CSP to the admin). Prerendered pages do not get them. Not a conflict, a difference.
11. **Two sitemaps and two robots surfaces.** EmDash injects `/sitemap.xml`, `/sitemap-<collection>.xml`
    and `/robots.txt`. The static `robots.txt` and the Astro `sitemap-index.xml` win for
    prerendered paths; the index lists `sitemap-adventures.xml` through `customSitemaps`. EmDash's
    child sitemap emitted `hreflang="zh"`, the site uses `zh-Hans`. Fixed with our own route
    (see "SEO and discovery").
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
14. A seed's select options apply only to an empty database, and nothing says so where the field is
    edited; changing options for an existing collection is a separate schema call (tested above). The
    admin's select shows raw option values, with no label or swatch per option.
15. A route in `src/pages` silently replaces an injected EmDash route of the same path (useful for the
    sitemap, surprising otherwise). In dev, a pages endpoint that fails to compile is not reported: the
    request falls through to the next matching route (a 404 from `[slug].astro`) with nothing in the
    log.
16. `@astrojs/cloudflare/entrypoints/server` has no `scheduled()`, so the documented setup for
    scheduled publishing and backups needs a different worker entry that `cf`'s config documentation
    does not mention (see "Backup").
17. The built-in sitemap lists entries of every locale, including ones with no counterpart, and always
    writes bare `zh`; there is no option for the hreflang code.
18. Backup archives are stored beside the media they protect and are off by default; the docs could say
    plainly that this is not an off-site copy.

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
| 4 | Mineral field | **no plugin**; a `select` field already works (done) | n/a | 21 families **done**; swatch picker judged not worth building | done |
| 5 | SEO and discovery | site code, not a plugin | n/a | **Done** (cover og:image, article tags and JSON-LD, generated llms.txt section, zh-Hans sitemap) | done |
| 6 | N4 sanitise on publish and at render | site code, **done** (`sanitizeBody`, `pnpm test:blog`); publish half is items 1 and 2 | n/a | covered | done |
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

## The seven, triaged

The owner asked for seven things to be built as EmDash plugins, for Nyuchi to adopt on Mzizi later.
Only some are plugin-shaped. Evidence is in the plugin API (`hooks.content-policy:register`,
the capability list in `emdash`'s code, `@emdash-cms/cloudflare/worker`) and in the code on the
branches named below.

| # | Item | Kind | Where it lives | Why |
|---|---|---|---|---|
| 1 | Link policy | **plugin** (native, local) | `packages/emdash-plugins/` (other branch), rule shared with `src/blog/portable-text.ts` | `content:beforePublish`/`beforeSave` can refuse a draft with a bad link; the render path already drops it, so this only improves the editor's message. Native so it imports the one `classifyLink`. |
| 2 | Accessibility policy | **plugin** (sandboxed) | `packages/emdash-plugins/` (other branch) | A pure check over `content.data` at publish. Nothing in CI can see CMS content, so only a hook can enforce alt text. |
| 3 | Safe rich text | **site code**, plus the plugins above as the editor-facing half | `src/blog/portable-text.ts` (`sanitizeBody`, `renderBody`), `src/blog/normalize.ts`, tests in `scripts/tests/blog-untrusted.test.mjs` | A plugin runs when an editor publishes; render runs on every read of whatever is in D1, including content that never passed a hook (an import, a revision restore, a compromised account). Treat the render path as the control (N4). |
| 4 | Translation policy | **site code**, optional hook | `src/blog/emdash.ts`, `src/views/AdventureView.astro` | hreflang and the switcher already come only from a real published sibling. A hook that refuses a zh entry with no en sibling is a courtesy (other branch). |
| 5 | Mineral field | **not a plugin**: a `select` suffices | `seed/seed.json` (generated), `scripts/build-seed-minerals.mjs`, `src/blog/normalize.ts` | See "Mineral field: 7 to 21". |
| 6 | SEO and discovery | **site code**; a plugin cannot do it | `src/layouts/seo-head.ts`, `tools/components-wasm/src/seo_head.rs`, `src/blog/discovery.ts`, `src/pages/sitemap-adventures.xml.ts`, `src/pages/adventures/llms.txt.ts` | `page:metadata` only reaches EmDash's own head component, which would emit a second head next to `rust:seo-head`. |
| 7 | Backup | **core feature**, not a plugin, and **not possible** as a sandboxed D1-to-R2 plugin | EmDash core; needs the Cron Trigger and the EmDash worker entry | See "Backup". |

## Mineral field: 7 to 21

Done. The adventure `mineral` select now offers the 21 Mzizi families, generated rather than typed:

- `scripts/build-seed-minerals.mjs` (`pnpm seed:minerals`) writes the keys of
  `src/brand/mzizi-palette.generated.ts` (the `mzizi-tokens` output) into the options of the `mineral`
  field in `seed/seed.json`, in palette order, editing only that array. `pnpm seed:minerals:check` is a
  CI step beside `palette:check`: it fails if the seed differs from the palette, and also if any family
  has no `[data-mineral="..."]` rule in `src/styles/tokens.css` (an option with no rule would look
  chosen and draw the fallback). All 21 have one.
- The site maps the stored name through `mineralOf` (`src/blog/normalize.ts`): a value is accepted only
  if it is a palette key, and is then written as `data-mineral="<name>"`. A hex, a wrong case or anything
  else is ignored and the entry gets the default (cobalt). The CMS never stores a colour.
- **Select or swatch picker? Select suffices; no picker was built.** The server already validates the
  field (below, a `river` entry is refused with a 400 until the option exists), the value is a name that
  is its own display label, and the choice is made once per post. A picker would be a native plugin with
  a React field widget for the admin, to put 21 small squares where a dropdown of 21 words already
  works. The one thing a picker would add (seeing the colour while choosing) is not worth a widget to
  maintain through EmDash upgrades. Revisit if editors ask.
- **An existing database does not pick up a changed seed.** A seed applies only to an empty database;
  the schema lives in D1. The path for a collection that already exists, tested locally
  (`scripts/emdash-mineral-migrate.mjs`, localhost only):

  ```
  before: field has 7 options (river absent)
    create with mineral=river: HTTP 400 VALIDATION_ERROR  mineral: Invalid option: expected one of "cobalt"|...
  PUT field: HTTP 200
  after: field has 21 options (river present)
    create with mineral=river: HTTP 201
  ```

  That is `PUT /_emdash/api/schema/collections/adventures/fields/mineral` with
  `{ "validation": { "options": [...] } }`, the call the admin's content-type editor makes
  (requires `schema:manage`). For production the owner either edits the field's options in the admin
  (Content Types, Adventures, Mineral) or calls that endpoint with an admin token; the list to paste is
  `pnpm seed:minerals` output (`seed/seed.json`). A fresh database gets all 21 from the seed. After the
  change, a post saved with `river` rendered `data-mineral="river"` on its article.

## SEO and discovery (site code)

- **Cover as `og:image`, and article metadata.** `src/views/AdventureView.astro` passes the cover and the
  post's dates to `BaseLayout`, through `seoHeadProps` to the Rust `seo-head` component (new optional
  props: `imageWidth`, `imageHeight`, `article`). The cover URL is made absolute against the site and
  must be http(s) (a `javascript:` URL falls back to the default card). Width and height are the cover's
  own, or omitted when unknown: the crate hard-codes 1200x630, which would be a false claim about a
  photograph, so `og:image:width`/`height` are dropped rather than guessed. Alt is the cover's alt, else
  the post title. A post emits `article:published_time`, `article:modified_time`, `article:author`
  (the site URL, the profile URL the tag asks for). **Published time is the adventure's own date**,
  the one the page shows, not EmDash's `publishedAt`; modified is EmDash's `updatedAt`. There is no
  tags or section field in the schema, so `article:tag`/`article:section` are supported by the component
  but not filled; adding a `tags` field would be a schema change.
- **Article JSON-LD** is added, a deliberate change (the previous head had none): `mzizi-discovery`'s
  `article()` provides headline, author, datePublished and image; `dateModified`, `inLanguage`,
  `mainEntityOfPage` and `publisher` are added on top with `with()`, so nothing the crate offers is
  dropped. Not a post: no article tags, no Article node.
- **`verify:seo`** now runs 25 cases (was 19): the six new ones cover a cover with a size, a cover
  without one, no cover, a `javascript:` cover, Chinese with no modified time, and a hostile title,
  and assert the article tags, the Article node, that no `<script>` leaves the JSON-LD, and that
  pages that are not posts carry none of it. Reverting the cover wiring fails it.
- **llms.txt.** `public/llms.txt` is static and never reaches the Worker, and posts are in D1, so the
  list cannot be a build step. `/adventures/llms.txt` (`src/pages/adventures/llms.txt.ts`) is generated
  from the same list the blog reads: newest first, the Chinese version beside its English post, titles
  and excerpts escaped and flattened to one line. `public/llms.txt` links to it. It sits under
  `/adventures/` because that path is already routed to the Worker first; making `/llms.txt` itself
  dynamic needs `'/llms.txt'` added to `runWorkerFirst` in `cloudflare.config.ts` and the static file
  removed. That file was not touched here.
- **Sitemap hreflang.** Confirmed: EmDash's `/sitemap-adventures.xml` writes `hreflang="zh"`; the pages
  and the main sitemap use `zh-Hans`. Fixed with a route of our own
  (`src/pages/sitemap-adventures.xml.ts`); a route in `src/pages` wins over the integration's injected
  one (verified: the response changed from `http://localhost` URLs with `zh` to the site's URLs with
  `zh-Hans`). It is built from the English records, like the blog list, so an untranslated post lists
  English and `x-default` only; a Chinese entry with no English original (possible in EmDash, absent from
  our list too) is not in it, where EmDash's own sitemap would include it.

## Sanitise at render (N4)

`src/blog/portable-text.ts` was escaping correctly (text and attributes are escaped, links are checked,
the `javascript:`, `data:`, backslash and tab cases were already handled by `classifyLink`) but it was
not hardened as an untrusted-input path. Probing it with hostile Portable Text found:

| Input | Before | Now |
|---|---|---|
| a span with 5000 marks, or a list item at level 5000 | `RangeError: Maximum call stack size exceeded`, thrown from `renderBody`, which the view does not catch: a 500 for the whole document | marks capped at 16 distinct (the Rust prototype's `MAX_MARKS_PER_SPAN`), list level 1 to 6, and `renderBody` fails closed to an empty body |
| a 20 MB span, 200,000 blocks | rendered in full (20 MB of HTML from one field) | 20,000 characters per span, 400,000 per body, 2,000 blocks, 500 spans per block |
| an unknown mark name | `<span class="unknown__pt__mark__<attacker text>">` (escaped, but attacker-chosen) | the words, no span |
| `underline` | an inline `style` attribute, dropped by `style-src 'self'` | `<u>` |
| unknown block types, styles, list kinds, non-string `text`, non-array `children`, `null` entries | tolerated, but each wrote a `console.warn` per block to the Worker log | dropped by an allow-list (`sanitizeBody`); no log line from input |
| an image `src` from the cover field | any non-empty string was passed on | on-site path or https only, no whitespace or backslash (`isSafeImageSrc`); size must be a finite number up to 20,000 |
| a slug of any length or content | looked up | over 200 characters, or with a control character or a separator, is a 404 without asking the CMS |
| the three response states | inline in two views | `src/blog/http.ts`: a missing adventure is `404` and `no-store`, an outage `503`, `Retry-After`, `no-store`; only a found page is cacheable |

Ported from the Rust Worker prototype (PR #54): the mark cap, list-depth bound, a date path that cannot
throw on hostile input (`isoDate` accepts only a Date, a number or a string of up to 40 characters), and
"never cache a not-found answer" (here: `responseFor('missing')` is `no-store`; this path has no
in-process cache to poison, unlike the prototype's last-good map).

Not changed, and why: the body cut is silent (a post over the caps loses its tail, not the page). The
limits are far above any post a person writes; the accessibility plugin could report a body that hits
them.

`pnpm test:blog` (25 tests, `scripts/tests/blog-untrusted.test.mjs`, CI step) pins each row, plus the
21-family mapping, the sitemap and llms.txt escaping. **Each fix was reverted in turn and the tests
re-run** (`mutate.py`-style, one revert per run): all 18 fixes that have a test failed their test
without the fix; bypassing `sanitizeBody` fails five. Two guards turned out to be redundant behind
`toHTML`'s own `unknownType` (the block-type allow-list in `sanitizeBody`, and the `unknownMark`
override once marks are filtered) and no test can tell them apart from the sanitiser; they stay as
defence in depth.

## Backup

**It cannot be a sandboxed plugin, and EmDash already has it as a core feature.** Evidence from the
installed `emdash` 1.5.0 and `@emdash-cms/cloudflare` 1.5.0:

- A sandboxed plugin's storage capabilities are `content:*`, `media:*`, `users:read`, `network:request`
  and `email:*`. `media:write` writes entries in the media library, not an arbitrary R2 object; there is
  no capability that reads D1 as a whole (schema, users, options, revisions) or writes to an R2 bucket.
  A plugin that read `content:read` and `PUT` the JSON to an external HTTPS endpoint would back up only
  content, not the schema or settings, and would hold the credential in plugin settings (which need
  `EMDASH_ENCRYPTION_KEY`). Not recommended.
- Core has it: `maybeRunScheduledBackup` (in `emdash/dist/backup-*.mjs`) writes a full JSON archive
  (`schema` and every table, drafts and trashed included, with an allow-list of options that excludes
  secrets) to the media storage under `backups/emdash-backup-<timestamp>-<id>.json`, retention 1 to 30
  (7 by default), at most once per 23 hours. It is **off by default** (`emdash:backups`,
  `enabled: false`) and is driven only from the maintenance tick, "never from a request".
- The tick comes from the Worker's `scheduled()` handler. That handler is in
  `@emdash-cms/cloudflare/worker`'s default export, which wraps the Astro server handler. This repo's
  `cloudflare.config.ts` uses the adapter's own entrypoint
  (`@astrojs/cloudflare/entrypoints/server`), which has **no `scheduled()`**, so even with a Cron
  Trigger nothing would run: no backups, and no scheduled publishing either.
- The same file warns: the archive is built in memory ("truly huge databases should use
  `wrangler d1 export`"), and the archive goes into the **same R2 bucket** as the media, so it is not an
  independent copy: losing the bucket or the account loses both. It also contains no media files.

**Decision for the owner** (nothing implemented, `cloudflare.config.ts` untouched):

1. Use core backups, with the worker entry and a Cron Trigger. This needs, in order:
   a. Point `worker.entrypoint` in `cloudflare.config.ts` at `@emdash-cms/cloudflare/worker` instead of
      the adapter's entrypoint. Untested with `cf` (EmDash's docs assume `wrangler.jsonc` and a `main`;
      listed under the gaps above).
   b. Add a Cron Trigger (for example every 5 minutes: scheduled publishing wants a short interval,
      backups gate themselves to daily). `cf`'s config field for crons is unverified here; the `cf`
      bundle contains the string `crons`, so `triggers.crons` is likely.
   c. Build, deploy, then in the admin enable scheduled backups and choose a retention.
   d. Copy the archive out of the bucket on a schedule you control (an `rclone`/`wrangler r2` job or a
      second bucket in another account), because a backup beside the data it protects is half a backup.
2. Whichever you choose, also rely on D1's point-in-time restore (Time Travel; Cloudflare documents
   30 days on the Paid plan, not verified in this spike) and run a manual `wrangler d1 export` before
   risky changes.
3. Do **not** build a plugin for this.

What this changes if deferred: with the adapter entrypoint, a post scheduled for the future will not
publish by itself either. If scheduling is not wanted, the cost of deferring is only the missing backup.
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

## Bylines: the author comes from the CMS

Before, `seo-head.ts` hard-coded the author of every post. Now the post's EmDash byline is the source,
and a post with none falls back to the site profile, byte for byte as before (`verify:seo` pins it).

- **What a byline carries.** EmDash's fixed columns do most of it: `display_name`, `bio`,
  `avatar_media_id` (the photo), `website_url` (the profile URL: `article:author` and Person `url`),
  `user_id` (keys the byline to an admin user: an entry with no explicit credit is credited to the byline
  linked to its author, `source: "inferred"`), `locale`. Custom fields, defined in
  `seed/seed.json` under `x-bylineFields`: `job_title` (string, translatable), `linkedin_url`,
  `github_url`, `x_url` (url, shared across locales), `same_as_other` (text, one https URL per line, because byline
  fields have no repeater; the types are only string, text, url, boolean, select).
- **Gap: EmDash's seed cannot define byline fields**, and its `bylines[]` carry no custom values, so
  `x-bylineFields` is a key EmDash ignores (`validateSeed` still passes) and
  `scripts/emdash-byline-migrate.mjs` applies it through the admin API, on any database.
- **Reading.** `getAdventure` maps `entry.data.bylines` through `bylinesOf` (`src/blog/normalize.ts`):
  plain text with caps (name 80, role 120, bio 500, 6 sameAs, 5 bylines), every URL https and through
  `classifyLink`, the photo an on-site or https path, a slug of `[a-z][a-z0-9-]*` or the byline is dropped.
  Hydration is strict per locale: a Chinese post needs the Chinese variant of the byline (the script creates both),
  otherwise it has none and falls back to the site profile.
- **Rendering.** `AdventureView` shows "By name, role" (and the photo) under the mineral rule, in both languages.
  The head: one `article:author` per byline URL and one Person per byline in the Article's `author`
  (`@id` `https://bryanfawcett.com/#author-<slug>`), the site Person and WebSite nodes untouched.
- **Gap: a byline PUT replaces every omitted field with null**, including `userId` and the photo. Send the whole record.
  The script therefore never updates an existing byline. `twitter:creator` stays `@bryanfawcett` for every post.

Applying to production (owner, after review): create an API token with the `admin` scope in the admin,
then `EMDASH_TOKEN=ec_pat_... node scripts/emdash-byline-migrate.mjs https://bryanfawcett.com --remote --probe`
(reports only), then without `--probe` but with `--create-byline --user-email <the admin's email>`, then set the photo in the admin
(Bylines). Rollback: delete the two bylines in the admin (posts fall back to the site profile at once), and
the five fields under Bylines, Fields (values are deleted with them).

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
