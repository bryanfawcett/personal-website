# The blog as a Rust Worker (prototype)

`crates/site-worker` is bryanfawcett.com's four on-demand blog routes, `/adventures`,
`/adventures/<slug>` and the `/zh` pair, written as a [workers-rs](https://github.com/cloudflare/workers-rs)
Worker. **It is a prototype and is not wired into deployment.** Nothing in `cloudflare.config.ts`,
`package.json`, CI or the Astro source was changed to build it; the Astro blog keeps serving
production. This page says what it is, what has and has not been shown, what switching over would
take, and which gaps it found in the Mzizi crates it was built to exercise.

The reason it exists: Mzizi is a research project, and N4 (safety) and N5 (resilience) are the
nodes its registry says are meant to be real Rust. A site that argues for them should run on them.
The blog is the one part of this site with a real failure mode (a third-party content service the
page cannot render without), which is what N5 is for, and the only part that renders untrusted text
(N4).

## What it uses

| Concern | Where it comes from |
| --- | --- |
| Whether Sanity may be called, and for how long | `mzizi-resilience =0.7.0`: `Breaker`, `Deadline`, `chain::run` (`src/sanity.rs`) |
| Head, hreflang, Open Graph, JSON-LD | `mzizi-discovery =0.7.0`: `generate_metadata`, `SchemaOrg`, `generate_schema_ld` (`src/head.rs`) |
| Header, footer, schematics, page header, panel | `tools/components`, the same crate that renders the fragments and the WebAssembly Hero. Reused by path, not copied. |
| Portable Text to HTML | `src/portable.rs`, a closed allow-list renderer (no `@portabletext/to-html`) |
| Image URLs | `src/image.rs`, a port of `src/sanity/image.ts`; the vectors in `scripts/verify-image-urls.mjs` are unit tests |
| GROQ | `src/queries.rs`, byte-identical to `src/sanity/queries.ts` (proved by `tests/queries_parity.rs`) |
| Runtime | `worker =0.9.0` on `wasm32-unknown-unknown`, as in the deck's `crates/deck-worker` |

The crate is its own Cargo workspace (`[workspace]` in its `Cargo.toml`) with its own lock file, so
`worker`/`wasm-bindgen` never enter `tools/Cargo.lock`, and `verify:components:rs`, `fragments:check`
and `rust:wasm:check` are untouched. It depends on `tools/components` with `default-features = false`
(no `scraper`).

## The shape

`src/lib.rs` is a sans-IO library; `src/worker_glue.rs` (compiled for wasm only) is the only file
with a `worker::` type in it. `handler::respond(route, deps)` takes a route and three
dependencies, a `Transport` (one `get(url, timeout_ms)`), a `Clock` and the isolate's `Guard`, and
returns `Reply { status, headers, body }`. Every test below drives that with a fake clock and a
scripted transport, so the breaker, the deadline and the stale cache are tested with no sleeps.

### The three states

| State | Status | Cache-Control | Other |
| --- | --- | --- | --- |
| Found / empty list | 200 | `public, max-age=0, s-maxage=60, stale-while-revalidate=600` (the string in `BLOG_CACHE_CONTROL`, checked by `tests/queries_parity.rs`) | `X-Blog-Source: fresh \| stale` |
| No such adventure (Sanity answered `null`) | 404 | `no-store` | the "No such adventure" page |
| Sanity unreachable and nothing remembered | 503 | `no-store` | `Retry-After: 120` |

### How `mzizi-resilience` is wired

`Sanity::groq` does, per call:

1. `Deadline::new(now, 8000)` is the budget (the TypeScript's `AbortSignal.timeout(8000)`). The
   transport is given `remaining_ms`, not a fresh 8 s, and a spent budget never calls out.
2. `Breaker::acquire(now)`. Five failures in 30 s open it for 30 s. While open (or while a half-open
   probe is out) the network is not touched at all. What counts: timeouts, network errors, a garbled
   body, 5xx and 429. A 4xx other than 429 is our own bad request, not Sanity being sick, so it
   neither counts nor strands a probe (`release`).
3. `chain::run([fresh, stale])`. Stage 0 serves the live answer; stage 1 serves the last good answer
   for the same query from this isolate, if it is at most ten minutes old; otherwise `AllFailed`.
   `Served.degraded` becomes `X-Blog-Source: stale`.

The stale cache is what makes "stale for ten minutes if Sanity is unreachable" true. In the Astro
site that sentence is only a header (`stale-while-revalidate=600`), and a Worker's response is not
held by Cloudflare's CDN unless the Worker uses the Cache API (see "What is not proven"), so no
stale copy is actually kept anywhere.

### Escaping (N4)

Sanity text is untrusted. Every string goes through maud's escaping, `escape_text` /
`escape_attr`, or the closed Portable Text renderer. The renderer can emit only `p h2 h3
blockquote ul ol li strong em code u del a br figure img figcaption`, an `<a>` carries `href` (and
`target`/`rel` off-site) only, and the `href` is scheme-checked (http, https, mailto, tel, relative;
anything else loses the anchor and keeps the words). `data-mineral` is checked against the seven
known minerals, image references against the narrow `image-<id>-<w>x<h>-<ext>` grammar, and the
head's JSON-LD goes through `mzizi-discovery`'s `<`/`>`/`&` escaping so a title cannot close the
script that carries it. Unit tests cover script tags, `javascript:` and `data:` links, tab and
newline inside a scheme, quote breakouts in attributes, an attribute-injecting style name, absurd
list nesting, malformed JSON of every shape, and an end-to-end page built from a dataset of
nothing but hostile strings.

## What is proven, and how

`cargo test --manifest-path crates/site-worker/Cargo.toml` runs 71 tests.

| Behaviour | Evidence |
| --- | --- |
| Three states, status codes, Cache-Control, Retry-After | handler unit tests; live in workerd against real Sanity (404 for a missing slug, 200 empty list) |
| Resilience: fresh, stale, expiry, breaker open/half-open/closed, 4xx not counted, remaining-budget timeout, spent budget | `src/sanity.rs` tests with a fake clock and scripted failing transport |
| The same, in the real runtime | `scripts/resilience-live.sh` against the fixture server told to fail or stall, under `wrangler dev` (workerd): stale served, 503 with `Retry-After`, breaker stops the calls, one probe closes it, an 8 s budget enforced on a stalled Sanity |
| Portable Text and hostile input | `src/portable.rs`, `src/head.rs`, `src/handler.rs` tests |
| Image URLs | `src/image.rs` (the `verify:images` vectors) |
| GROQ and cache policy equal the TypeScript | `tests/queries_parity.rs` runs `src/sanity/queries.ts` under Node |
| Same pages as Astro | `scripts/compare.mjs`, below |
| The chrome is the shared Rust | it calls `components::{header, footer, schematics, page_header, panel}`; no markup is copied |

### Comparison with the Astro pages

`scripts/compare.mjs <astro> <worker> <paths…>` fetches both with `Sec-Fetch-Mode: navigate`, then
compares status, `Cache-Control` and `Retry-After`; the head's facts (title, description, canonical,
every hreflang, `og:*`); and the whole `<body>` as a normalised token stream (attributes sorted,
`data-astro-*`, scripts and styles dropped, whitespace collapsed): header, footer, rail, page header
and content.

**The production dataset (`zsx9erk1/production`) has zero published adventures** (checked
2026-11-17: `count(*[_type=="adventure"]) = 0`). So:

* Against **real Sanity**, both servers were compared on `/adventures`, `/zh/adventures`,
  `/adventures/nope` and `/zh/adventures/nope` (empty list and a real 404): bodies identical.
* For lists and posts there is nothing real to render, so the comparison ran against **fixtures**,
  `fixtures/adventures.json`, an English adventure with a translation (cover, headings, nested bullet
  list, overlapping marks, an external and an internal link, a quote, an image with a caption), an
  English-only one and a hostile one, plus the Chinese translation. Every title is prefixed
  `[FIXTURE]`. `fixtures/server.mjs` stands in for Sanity's query API, recognising the three queries
  by text. For the Astro side `src/sanity/client.ts`'s endpoint was pointed at that server
  **temporarily in a working tree and reverted**; it is not in this PR.

Results on fixtures: `/adventures`, `/zh/adventures`, `/adventures/fixture-zambezi`,
`/zh/adventures/fixture-zambezi-zh`, `/adventures/fixture-english-only`: status, cache header, head
facts and body tokens all identical (415, 421, 387, 347 and 337 body tokens). Screenshots of the post
match to the pixel at 1280 px (aside from Astro's dev toolbar). The Chinese list correctly links the
untranslated adventure to its English URL with the `仅有英文` badge and `lang="en"`.

## Deliberate differences from Astro

These are the only differences `compare.mjs` reports, and each is on purpose:

1. **`javascript:` links.** The Astro renderer's `link` override re-implemented escaping but dropped
   `@portabletext/to-html`'s own scheme check, so a body containing a `javascript:` link renders
   `<a href="javascript:…">` (reproduced on the Astro dev server with the hostile fixture). The Studio
   restricts schemes; the dataset API does not. The Rust renderer drops the anchor. **This is a real
   defect in the live site, independent of this prototype.**
2. **"External" link test.** Astro: `startsWith('https://bryanfawcett.com')`, which treats
   `https://bryanfawcett.com.evil.example` as internal. Rust compares the host exactly.
3. **Underline** is `<u>`, not an inline `style`. **`h1`/`h4`..`h6` and unknown styles** render as `<p>`
   (Astro's merge left `to-html`'s defaults for them, so a stray `h1` would put a second `h1` on the page).
4. **Unreachable list.** `AdventuresView.astro` returns **200 with `Cache-Control: public, s-maxage=60`**
   when Sanity is down, so the edge may hold the "not loading" notice. `CLAUDE.md` says an unreachable
   Sanity is a 503 with `Retry-After` and neither is cacheable; the post view does that and the list
   does not. The Worker does it for both.
5. **404/503 `og:type`** is `website`; Astro says `article` on the "No such adventure" page.
6. **A bad `publishedAt`** omits the date; Astro's `Intl.DateTimeFormat.format` throws a `RangeError`, a
   500 for the whole page. **A record missing a title or slug** is skipped; Astro would print `undefined`.
7. **JSON-LD** is a Person + WebSite + `Blog`/`BlogPosting` graph from `mzizi-discovery`, not
   `BaseLayout`'s fuller Person (it has no `knowsAbout` or `worksFor`; those fields are not in the
   exported `site.json`). Not compared by `compare.mjs`.
8. **The footer year** is the current year at request time; Astro's is the build's.
9. **`X-Blog-Source`** and `X-Content-Type-Options` are new response headers.

## What is not proven

* **Not deployed, not run on Cloudflare's edge.** Everything ran in `wrangler dev` (workerd) locally.
  Memory, CPU time and cold-start on the edge are unmeasured.
* **The `cf` CLI building this Worker is untested.** The site is built and deployed with `cf`, not
  `wrangler`. The deck's Rust Worker uses `wrangler.toml`. Whether `cf build` accepts a prebuilt
  workers-rs entrypoint (`index.js` has `import source X from "./index_bg.wasm"`) is the first thing to
  find out; see below.
* **The built-Worker path through the asset layer.** `compare.mjs` ran against `wrangler dev`, whose
  asset emulation matches Cloudflare's but is not it. `run_worker_first` behaviour for the blog
  routes is exactly as `CLAUDE.md` warns about and should be rechecked on a preview deploy with
  `Sec-Fetch-Mode: navigate`.
* **Real adventures.** There are none. Real cover images, long bodies and edge-case Portable Text
  (deeply overlapping marks, unusual list nesting) are exercised only by unit tests and fixtures.
  Mark nesting is a re-derivation of `@portabletext/toolkit`'s algorithm, not a port, and agrees on the
  cases tested.
* **Edge caching.** `s-maxage=60` means nothing unless something caches. A Worker's response is not
  cached by Cloudflare's CDN by default, in the Astro Worker or in this one (that needs the Cache API).
  This is unchanged behaviour, not a regression, but the comment in `client.ts` reads as if it were
  happening.
* **Load.** The breaker and stale cache are per isolate. Under many isolates a dead Sanity is still
  probed once per isolate per cooldown.
* **Panics.** The release profile is `panic = "abort"` (as the tools workspace is). A panic anywhere
  would kill the isolate and answer 500. The handler path has no `unwrap` on request-controlled data
  and a malformed-shape test, but that is a review claim, not a proof.

## Size

Release build (`opt-level = "z"`, LTO, `wasm-opt`) via `worker-build --release`:

| | raw | gzip |
| --- | --- | --- |
| `build/index_bg.wasm` | 525,054 B (513 KB) | 174,742 B (171 KB) |
| `build/index.js` (glue) | 25,348 B | 6,714 B |

For scale, the existing Astro server bundle (excluding source maps, 17 files) is 752,563 B raw,
176,573 B gzip, and that already includes the components WebAssembly (163,730 B raw). The Rust Worker is
well inside Cloudflare's Worker size limits (3 MB compressed on the free plan). Startup was not
measured on the edge.

## What switching over would take

None of this has been done, and none of it should be without the owner approving the Cloudflare
build-command change.

**1. Commit the build output.** Cloudflare's build image has no Rust, so, like the deck's
`prebuilt-worker/`, the compiled Worker must be committed: `crates/site-worker/build/index.js` and
`index_bg.wasm` (currently git-ignored) or a `prebuilt-worker/` copy, refreshed by a `release.sh`-style
script (`worker-build --release` then copy), with a `--check` mode in CI like `rust:wasm:check`. The
repo would need `worker-build` and a pinned `wasm-bindgen`/binaryen in CI.

**2. Choose how the Rust Worker meets the asset layer.**

* **A. Rust Worker as the site Worker** (the deck's pattern). `cloudflare.config.ts`
  `worker.entrypoint` stops being `@astrojs/cloudflare/entrypoints/server` and becomes the committed
  `index.js` (`with { type: 'cf-worker' }`); `assets.runWorkerFirst` stays the same four patterns;
  `env.ASSETS` stays `bindings.assets()` (the Worker already reads it as `ASSETS`); the
  `SANITY_ORIGIN` var is not set in production (the default is the real endpoint). The Astro side
  deletes `src/pages/adventures/`, `src/pages/zh/adventures/`, the two views and `src/sanity/`, drops
  `prerender = false` and `session: false`, and every route becomes prerendered. The sitemap code in
  `astro.config.mjs` that asks Sanity for slugs at build time stays. This is the smaller change and
  the one the prototype is shaped for. Risk: it depends on `cf` accepting the wasm import.
* **B. Two Workers.** Deploy the Rust Worker on its own routes (`bryanfawcett.com/adventures*`,
  `/zh/adventures*`) and give it a **service binding named `ASSETS`** to the site Worker so its shell
  fetch (`/404`) and non-blog fallthrough still work. No change to how `cf` builds the site, but it
  needs a second Worker, route configuration and a second deploy path, which `CLAUDE.md` warns against
  ("adding one back would mean two things racing for the same Worker").

**3. `wrangler.toml` in `crates/site-worker/` is for local runs only.** It documents the intended
`assets` block (same `run_worker_first` list, `not_found_handling = "404-page"`). Wrangler 4.16.1 (the
installed global) rejects an array for `run_worker_first`; use `npx wrangler@4.163.0`.

**4. Keep the chrome from drifting.** The header and footer come from `tools/components` and the strings
from `src/data/generated/{site,ui}.json`, `include_str!`'d at compile time. They change whenever the
nav, strings or components change. A real deployment needs the Worker rebuilt and re-committed in the
same step as `pnpm fragments` and `pnpm rust:wasm` (and a `:check` for it), or it ships a stale header.
The build-dependent parts (hashed stylesheet and script URLs, inlined tokens) are not compiled in: the
Worker reads them out of the prerendered `/404` at runtime (`src/shell.rs`), which is why it
survives a new Astro build without a Rust rebuild. If that page cannot be read it serves an unstyled
but complete document.

**5. Decide the policy changes in "Deliberate differences"**, notably 4: the list's 503, which is a
behaviour change of the Astro site too.

To run it locally:

```bash
export PATH=/opt/homebrew/opt/rustup/bin:$HOME/.cargo/bin:$PATH
pnpm build                                              # the asset tree the Worker reads
cargo test --manifest-path crates/site-worker/Cargo.toml
cd crates/site-worker && npx wrangler@4.163.0 dev --port 8787   # real Sanity
# fixtures: node fixtures/server.mjs &  then add --var SANITY_ORIGIN:http://127.0.0.1:4399
```

## Findings: gaps in `mzizi-resilience` 0.7.0 and `mzizi-discovery` 0.7.0

These came out of using the crates for a real site, and are the upstream issues to file.

### `mzizi-resilience`

1. **`chain::run` is synchronous.** Its stages are `FnOnce() -> Result<T, E>`, and a fetch is a future,
   so on Workers (the crate's stated first target) a stage cannot be the call itself. The only
   option is to await the I/O first and let stages close over the outcome, which keeps the
   `stage`/`degraded` bookkeeping but not the sequencing; the second stage cannot be skipped when the
   first succeeds (here it is cheap, but a real stage that costs something is wasted). Wanted: an async
   `run` (or a stage-by-stage `Chain` state machine in the crate's own sans-IO style: `next() ->
   Option<StageIndex>`, `record(outcome)`).
2. **No way to see why a stage failed, by design.** The privacy rule (counts, not messages) is right, but
   `AllFailed` gives only a stage count, so a page cannot tell "breaker open" from "timed out" from
   "Sanity answered 5xx" without the caller keeping its own record. An opaque per-stage reason enum the
   caller supplies (`Copy`, no payload) would keep the guarantee.
3. **`Breaker` has no notion of an outcome that is neither success nor failure** except
   `release(permit)`, which only does anything for a probe. The 4xx-is-our-bug case works (do nothing
   for a closed circuit, `release` for a probe) but is easy to get wrong, and `Permit` has no `Drop`
   or `#[must_use]` nudge: a probe permit that is neither resolved nor released wedges the circuit in
   `ProbeInFlight` forever. Wanted: `#[must_use]` on `Permit`/`Admission`, and a documented
   `outcome(permit, Outcome::{Success, Failure, Ignored})` entry point.
4. **No shared host state story.** A breaker is a value the host must keep alive across requests; on
   Workers that means a `thread_local!` leaked box. The README should say so, and say that it is per
   isolate. A per-key map (one breaker per dependency name) is the obvious next type.
5. **`Deadline` has no composition.** There is no `child(budget)`/`min` to give a sub-call the lesser of
   "what is left" and "what this call deserves", which is the thing deadlines are for.
6. **No stale cache.** The "serve the last good answer" half of the chain is entirely the host's
   (here ~25 lines). It is the most common first fallback, and a bounded-TTL, size-capped store with
   an injected clock would belong next to `chain`.
7. `ConfigError` carries `&'static str`, so tests cannot match on the field; a small enum would do.
   Minor.

### `mzizi-discovery`

1. **It is Mukoko's, not generic.** `BASE_URL`, `SITE_NAME` and `DEFAULT_OG_IMAGE` are `const`s
   (`https://mukoko.com`, `Mukoko`, `/og-default.png`); `generate_metadata` appends ` — Mukoko` to
   every title; `to_head_html` writes `og:site_name` from the constant. A second site has to override
   every field after the fact and rewrite one line of the rendered string (this crate's `head.rs`
   does, and has a test that fails if the line it rewrites stops being emitted). Wanted: a `Site {
   base_url, name, default_image, title_suffix }` passed in (or a builder).
2. **`alternates` cannot express a translation with its own slug.** It builds `{BASE_URL}/{locale}{path}`
   from a bare locale list. Bilingual content with per-language slugs (this blog) needs
   `Vec<(locale, url)>`; `Metadata.alternates` is public so it can be overwritten, but `SeoConfig`
   cannot carry it. Also: no `x-default`, and no `og:locale:alternate` (the crate's docs say the
   former is deliberate; it should be opt-in).
3. **No `article:published_time`, `article:author` or `datePublished`-style fields** on `SeoConfig`; an
   `OgType::Article` page cannot say when it was published except through hand-built JSON-LD.
4. **`generate_schema_ld` has no `BlogPosting`/`Blog`/`Person`/`WebSite` templates.** `SchemaOrg::new` is
   generic and works (used here), but the crate ships templates for jobs and products only. `@id`
   cross-references (`{"@id": …}`) need `Json::obj` by hand.
5. **`to_head_html` ends lines with `\n` and escapes `'` as `&#39;`**, a different spelling from
   most Rust templating (`maud`: `&#x27;` is not emitted at all); harmless, but a byte comparison
   against another renderer needs to normalise it. It also cannot emit `theme-color`, `color-scheme`,
   `twitter:creator`, `<link rel=icon|manifest|sitemap>`; the host adds them.
6. **`Metadata.image_alt` is the page title**, with no field to give the image its own alt (here it is
   overwritten).
7. The good: the `</script>` escape in JSON-LD (`<`) is correct and a test here relies on it. The
   crate's own docs note the TypeScript sibling still lacks it, which should be back-ported.

### `worker` / tooling (not Mzizi, but cost time)

* The globally installed wrangler (4.16.1) cannot read an array `run_worker_first`; 4.163.0 can.
* A wedged `wrangler dev` / Astro dev server is easy to clear with `pkill workerd`, which also kills every other workerd on the machine; kill by wrangler's pid instead.
* `worker-build` writes `build/` next to the crate and `wrangler.toml`'s `main` must point at
  `build/index.js` (or the `shim.mjs` it leaves for compatibility).
