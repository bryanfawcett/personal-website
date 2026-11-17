# How we built bryanfawcett.com

This is the build story: what the site is made of, why each piece is there, what
broke along the way, and where it is going. `CLAUDE.md` is the rulebook; this is
the narrative behind it.

## The shape of it

A content site with one owner, one visitor and one action: an organisation decides
whether to hire Nyuchi, and books a call. Everything else is in service of that, and
of showing the Mzizi standard working in public.

- **Astro 7**, no client framework. Almost every route is prerendered and served as
  static assets. The four blog routes under `/adventures` are the exception: they
  read EmDash (D1) per request, so publishing a post is live without a rebuild.
- **Cloudflare Workers**, driven by the `cf` CLI and `cloudflare.config.ts`
  (not wrangler). The Worker exists for the blog; `run_worker_first` makes sure a
  browser navigation to `/adventures` reaches it instead of the asset 404.
- **Vite+** (`vp`) as the task runner, **pnpm** as the package manager, **TypeScript
  6** under `strictest`.
- **One stylesheet**, `src/styles/global.css`, and **one source of design truth**,
  `src/brand/tokens.ts`, which generates `tokens.css`.
- **Two languages**, English at the root and Chinese under `/zh`, each route written
  once as a view and wrapped twice.

## The design system came first

The look is the Mzizi standard, from the Mzizi registry: 21 colour families keyed
with `data-mineral`, Noto Serif / Noto Sans / JetBrains Mono, pill buttons, hairline
cards, no shadows, light and dark following the device.

Rules that came from getting it wrong:

- **A raw mineral is never the colour of text.** On a near-black ground the seven
  measure Lc 25-48, which APCA forbids. The mineral goes under the word or beside it.
- **Markup names things, the stylesheet colours them.** No inline `style` for colour,
  so the page keeps `style-src 'self'`.
- **Everything is gated.** `verify:contrast` measures every text block on every route
  at 1280px and 390px in both themes, by rendering each viewport with the ink on and
  off and scoring the glyph pixels against the ground actually painted under them.
  Two stylesheet verifiers (JavaScript and Rust) catch the things pixels cannot see:
  a `var()` that resolves to nothing, and a base rule that outranks a class.
- The site generates its own **design-system skill**
  (`.claude/skills/fawcett-design-system/`) and a Claude artifact from the built pages.

## Fonts, images and the card

- Fonts are self-hosted and licensed (`public/fonts/OFL.txt` travels with them). The
  Han heading subset is cut with `pnpm cjk` (GB2312 Level 1, two weights) and gated
  by `unicode-range` so an English page downloads 0 kB of Chinese.
- The portrait is the only raster. `astro:assets` resizes it at build, except in the
  masthead, which is a plain pre-rendered WebP because `/_image` does not exist on
  on-demand routes.
- The contact card's QR opens the booking page; the card downloads as a vCard 3.0.
  Both are produced at build time with no client JavaScript.

## The blog (and why it stays in TypeScript)

Content lives in EmDash (D1 for entries, R2 for media). The read side in
`src/blog/emdash.ts` returns a `Result` and never throws, because an uncaught throw
on an on-demand route takes down the whole document. Three states are kept
distinct: empty, missing (404) and unreachable (503 with `Retry-After`).
Translations are entry-level through EmDash's i18n.

The blog is the one part that keeps its JavaScript: EmDash, its admin (React) and
the portable-text pipeline are the ecosystem's own, and porting them gains
nothing. Everything else is moving.

## Moving to Rust

The goal: **Rust renders and runs; Astro is only the router, the static prerenderer
and the image pipeline; the CMS stays the CMS.**

What is done:

| Piece | State |
|---|---|
| All ten components (`MziziFooter`, `MziziHeader`, `LanguageSwitcher`, `PageHeader`, `Hero`, `Portrait`, `ContactCard`, `WorkshopStrip`, `Schematics`, `Panel`) | Ported to Rust (`tools/components`, maud), each proven identical to Astro's output |
| Header, footer, schematics | Rendered by Rust, inserted by Astro as committed fragments |
| Stylesheet and image-URL verifiers | Rust crates beside the JS ones |
| The deck's Worker (origins-deck.bryanfawcett.com) | A workers-rs Worker, live |

How the proof works: `pnpm verify:components:rs` finds each component as Astro
shipped it in the built pages, reads its inputs back out of the markup, renders the
Rust version, and compares both as canonical HTML. A port is not done until it
passes on every page in both languages.

Why the output is committed: Cloudflare's build image has no Rust toolchain. So the
compiled or rendered results (fragments, prebuilt Workers) are checked in and CI
fails if they are stale (`fragments:check`, `release.sh --check`).

What is next, in order:

1. The remaining Astro-rendered components (`Hero`, `Portrait`, `ContactCard`,
   `WorkshopStrip`, `PageHeader`) go through the same fragment path.
2. The theme toggle as a WebAssembly module. The pre-paint snippet that sets
   `data-theme` stays synchronous and inline, because an async load would flash the
   wrong theme.
3. The nav portrait and social card renderers.
4. The site Worker. Anything that is not the CMS moves to a workers-rs Worker; the
   EmDash read side stays in TypeScript behind it. Changing the Cloudflare build
   command is a dashboard decision and is made deliberately, not as a side effect.

## What cost real debugging time

- `/adventures` returned 200 to `curl` and 404 to every browser, because assets are
  matched before the Worker for navigations. Fix: `run_worker_first`. Test with
  `Sec-Fetch-Mode: navigate`.
- The assets config is baked at build time; editing it does nothing until `cf build`.
- A header that looked fine on a desktop collided with the nav at 56rem. The links
  now drop to a scrolling second row below 68rem. Never a hamburger.
- `Can't modify immutable headers` in the deck Worker: responses from the assets
  binding must be copied before their headers are set.
- A fixed ground slid under the content on scroll; the sheet ground is absolute so
  it travels with the page.
- Every CI step exists because something once shipped without it.

## Releases

Versions are tagged on `main` and published as GitHub releases. A release is a
point at which the checks above all pass and the committed Rust output matches the
source.
