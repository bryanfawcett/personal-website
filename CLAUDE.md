# CLAUDE.md - AI Assistant Guide

This document provides essential context for AI assistants working on this Astro portfolio website.

## About Bryan Fawcett

**Current Role:** Associate Technology & Innovation Coordinator at Singapore American School (SAS)
- Focuses on integrating technology within educational practices and operational efficiencies
- Previous SAS roles: Privacy & Governance Manager, IT Infrastructure Manager, Application System Engineer

**Background:**
- 10+ years in EdTech across Africa and Asia
- Previously Technology Coordinator at Osaka YMCA International School
- Teaching and administrative roles across schools in Zimbabwe
- Expertise: Cybersecurity, process optimization, IT governance, system architecture

**Location:** Singapore | **Email:** bryan@nyuchi.com

### The Bundu Ecosystem (Passion Project)

Bryan is Founder & CEO of Nyuchi Africa and Founder of **The Bundu Foundation** — a
Zimbabwean research foundation, a company limited by guarantee, whose main activity
is research into infrastructure gaps in African and emerging markets, under the
Ubuntu philosophy ("I am because we are"). It researches and builds for informal and
formal markets. Research comes first, and its governance is in place
(bundu.org/governance): it governs four pillars — Bundu Labs (research), Nyuchi Africa
(commercial), Mukoko (consumer) and Shamwari AI (community) — and its own open-source
projects. The platform tokens are a future phase and stay out of the framing. StationKit and Mukoko Weather are how the open data commons gets
filled and put to use.

The live sites are the source of truth for all of this, and they move faster than
this file. Check bundu.org, nyuchi.com, mukoko.com and mzizi.dev before repeating a
description from here.

| Platform | URL | Description |
|----------|-----|-------------|
| **The Bundu Foundation** | bundu.org | Research foundation (Zimbabwe CLG): research first, governing four pillars and its open-source projects |
| **Mzizi** | mzizi.dev | Programming-language research project (Phase 0); publishes every benchmark run, including negative ones. Its brand system supplies this site's minerals |
| **Bundu Labs** | bundu.org/research | Research pillar: open standards, benchmarks and frameworks |
| **Nyuchi Africa** | nyuchi.com | Commercial pillar, founded in Harare in 2018: Web Services, Weather Stations, API Platform; Pay and Masasa coming |
| **Nyuchi StationKit** | nyuchi.com/stationkit | Open-source solar weather + soil station, from $25 for the basic kit (indicative) |
| **Nyuchi Learning** | learning.nyuchi.com | Training, the open Bundu Education frameworks, and classroom tools for schools |
| **Toddle Enhancement Extension** | learning.nyuchi.com/toddle-enhancement-extension | Nyuchi Learning's paid Chrome extension for Toddle schools, launched Oct 2026. Built by Nyuchi independently — not an SAS tool; SAS helps maintain it and uses it free |
| **Mukoko** | mukoko.com | Consumer pillar: super-app with a single identity across its mini-apps. Sovereign, self-held identity is a later phase — do not describe it as live |
| **Mukoko Weather** | weather.mukoko.com | Forecasts and frost alerts for farming, mining, border posts and travel |
| **Mukoko News** | news.mukoko.com | Pan-African news aggregation from trusted regional sources |
| **Mukoko Lingo** | lingo.mukoko.com | African language learning, Shona and Ndebele first (was Nyuchi Lingo) |
| **Mukoko Events** | events.mukoko.com | Community events and gatherings (was Nhimbe; nhimbe.com no longer resolves) |
| **Shamwari AI** | shamwari.ai | Community pillar: a companion answering in Shona, Ndebele and English, citing sources |
| **Zimbabwe Information Platform** | travel-info.co.zw | Foundation initiative: verified directories, travel and business information |
| **Iconic Expeditions** | iconic-expeditions.com | Luxury bespoke safaris across Southern and Eastern Africa |
| **Workspace Tools** | (internal) | Gmail signature management for Google Workspace |

The Foundation also directly maintains six open-source technical projects (Neural
Transfer Layer, Nyuchi Honeycomb, SiafuDB, SiafuDB-Kuzu, Harare Metro and Mzizi
itself) across the `bundu-labs`, `openNTL` and `siafuDB` GitHub organizations. None
of those are showcased individually on this site except Mzizi, which appears on the
home page as proof of how the work is done: measured, and published either way.

### GitHub Organizations

- **Personal:** [github.com/bryanfawcett](https://github.com/bryanfawcett)
- **Nyuchitech:** [github.com/nyuchitech](https://github.com/nyuchitech) - 13+ public repos
- **SAS Technology:** [github.com/sas-technology](https://github.com/sas-technology) - renamed from SAS-Technology-Innovation; most repos are private (4 public: knowledge, sas-knowledge, sas-default-app, .github). Link only to a public repo. Educator Eval is now Educator Compass.

### Social Links (Canonical)

- **LinkedIn:** linkedin.com/in/bryandavidfawcett
- **GitHub:** github.com/bryanfawcett
- **Twitter/X:** @bryanfawcett
- **Website:** bryanfawcett.com

## Quick Reference

All scripts run through Vite+ (`vp run <script>`, or `pnpm <script>`, which calls the same
thing). `vp build` itself cannot build Astro (it fails with `Cannot resolve entry module
index.html`), so `build`, `dev` and `check` call `vp exec astro …`.

```bash
pnpm dev        # dev server at localhost:4321
pnpm check      # astro check (TypeScript under `strictest`) — must stay at 0 errors
pnpm build      # production build to dist/
pnpm preview    # cf dev (delegates to astro dev; no asset layer)
pnpm deploy     # build and deploy the Worker
pnpm og         # re-render the social card (only after the portrait changes)
pnpm nav-portrait   # re-render the masthead portrait (same — only after it changes)
pnpm verify:images  # pin the hand-rolled Sanity image URL format
pnpm verify:contrast # APCA: every text block, every route, desktop and phone
pnpm verify:stylesheet # every var() resolves; no base rule outranks a class
pnpm verify:images:rs     # Rust port of verify:images (needs `rustup`; see tools/)
pnpm tokens         # regenerate src/styles/tokens.css from src/brand/tokens.ts
pnpm verify:stylesheet:rs # Rust port of verify:stylesheet (lightningcss); stricter than the JS one
pnpm cjk            # re-cut the vendored Han subset (rarely; see below)
```

**Requirements:** Node.js 22.12+ (Astro 7's floor), pnpm 10+.

## Project Overview

bryanfawcett.com, built with:

- **Astro 7** — no client framework, no React
- **TypeScript 6** under `astro/tsconfigs/strictest`
- **Cloudflare Workers** via `@astrojs/cloudflare`
- **The Mzizi standard** for colour, type, radius and semantics, from the Mzizi
  registry (Mzizi is a programming-language research project; its components
  and brand system support it). The site is a showcase for it.
- **The Bundu standard, from `@bundu/ui`** (pinned, MIT): its `styles/tokens.css`
  loads first in `BaseLayout` and supplies all 21 Mzizi colour families, the
  surface ladder, the radius scale and `--ring`; its `MineralStrip.astro` is the
  rail. Its Button/Card/Section components are written in Tailwind utilities,
  which this site does not run, so they are not used.
- **Light and dark, following the device.** `@bundu/ui`'s `color-scheme.css`
  and the site's own tokens switch on `prefers-color-scheme`; the header's
  theme toggle stores an explicit choice in `localStorage('theme')`, which an
  inline head script applies as `data-theme` before first paint and again on
  `astro:after-swap` (the router replaces `<html>`'s attributes). Every themed
  token in `tokens.ts` has a `*_LIGHT` twin; `tokensToCss()` emits light on
  `:root`, dark under the media query unless `data-theme="light"`, and dark
  whenever `data-theme="dark"`. Surfaces are Mzizi's ladder — dark: page `base`
  `#0E0D0C`, panels `surface` `#131211`, ink `#F0EFE9`; light: page `#F3F3F1`,
  cards white, ink `#1A1A17`. `--show-dark-only` / `--show-light-only` swap
  per-theme elements (the toggle's sun and moon, the two QR codes).
- **One primary colour: heritage river** (Bryan's choice from the heritage and
  experimental families) — `#4DD0E1` with Mzizi `base` text in dark, its light
  tone `#006064` with white text in light. It fills the primary buttons and
  underlines links, at weight 700: dark measures Lc 69.3, which APCA clears at
  15px for 700 but asks 16.5px of 600. Do not mix it or add a second accent;
  the pillar cards keep their own brand minerals.
- **Header and footer are the Mzizi registry's `mzizi-header` and
  `mzizi-footer`, built for Astro** in `src/components/mzizi/`. The registry
  ships them in React (and the footer in Rust) only, so these are written
  against the contract — same `data-slot`, `data-portal` and anatomy — with no
  framework. The header is laid out as Nyuchi Learning's (learning.nyuchi.com):
  sticky, 64px (80px from 64rem); portrait and serif name, text links in the
  middle, the language switcher, a ghost theme toggle and the "Book a Call"
  pill. **On a phone (below 68rem) the links drop to a second row that scrolls
  sideways, ending in the language switcher — never a hamburger.** Every
  destination stays visible and one tap away, and a row needs no script to be
  accessible where a disclosure would. The bar keeps brand, toggle and pill;
  the name goes below 22.5rem. The contrast gate clears the sticky header's
  height and scrolls the row to each link before measuring — a taller header
  without that scores whatever sits under it as invisible. The footer is the canonical navigation: Site, Ecosystem, Connect,
  "© year Bryan Fawcett. All rights reserved.", the title-block line and the
  mineral dots.
- **Nothing on the page edge but the mineral rail.** There used to be a sheet
  frame there. It went, and it should not come back.

TypeScript is pinned to 6.x because `@astrojs/check` peers on `^5 || ^6`; TypeScript 7
is published but not yet supported by the Astro tooling.

## Directory Structure

```
src/
  assets/         bryan-fawcett.png — the portrait, resized by sharp at build
  brand/          Design tokens — the single source of truth for the look
    minerals.ts   The seven Mzizi minerals, with origin and meaning
    tokens.ts     Sheet, ground, ink, measure, marks, grid, type → CSS props
  components/     Astro components
  data/           Content as typed TypeScript, English with its Chinese beside it
  i18n/           ui.ts (chrome strings), routing.ts (paths), localize.ts
  sanity/         The blog's read side — client, queries, image URLs, body
  layouts/        BaseLayout — head, JSON-LD, nav, footer, scroll reveal
  pages/          Thin wrappers: one per route per language, `zh/` for Chinese
  views/          The sheets themselves — one per route, both languages
  styles/         fonts.css and tokens.css (both generated), global.css
bryans-adventures/  The blog's Sanity Studio. React, and NOT part of the build
scripts/          fetch-fonts.py, verify-fonts.py, build-og-card.mjs
public/fonts/     Self-hosted woff2, Latin + Latin Extended
```

## Architecture

Almost every route is prerendered and served straight from static assets. The four
blog routes under `/adventures` are not: they read Sanity per request, so publishing
a post is live without a rebuild. That one exception is why `cloudflare.config.ts` has an
`entrypoint` — `@astrojs/cloudflare/entrypoints/server`, the adapter's own entrypoint, not
a file in this repo. `@astrojs/cloudflare` emits the static tree and the server bundle. With
`cloudflare.config.ts` in place that is `.cloudflare/output/v0/workers/default/`
(`assets/` and `bundle/`), not `dist/`.

Three things about that split bite, and all three cost real debugging time:

- **`run_worker_first` is load-bearing.** Assets are matched before the Worker runs,
  and a browser *navigation* — `Sec-Fetch-Mode: navigate`, which only a browser
  sends — gets answered from the asset tree or from 404.html. Without the blog
  routes listed in `assets.run_worker_first`, `/adventures` 404s for every real
  visitor while `curl` returns a clean 200 from the same URL. Always test navigation
  with the header set.
- **The assets config is baked in at build time.** `cloudflare.config.ts`
  (`worker.assets`) is the Cloudflare CLI (`cf`) config and replaces
  `wrangler.jsonc`; `cf build` writes it to `.cloudflare/output/`. Editing it
  changes nothing until the build runs again.
- **`session: false`** in `astro.config.mjs`. With a server entrypoint the adapter
  otherwise declares a KV binding for Astro's session store, which then has to exist
  in Cloudflare before a deploy goes through. Nothing here has a session.

This repo is the main site. Satellite properties are their own Workers in their own
repos, sharing the branding layer rather than this codebase.

## Conventions

### Everything is Astro and TypeScript

No React, no client framework. The one UI package is `@bundu/ui`, used for its
tokens and its Astro `MineralStrip` — no client JavaScript and no Tailwind. The only client JavaScript is the
scroll-reveal observer and the Google Analytics tag in `BaseLayout.astro`, and the
deferred Cal.com loader on `/book`. Reach for a `<script>` in an `.astro` file before
reaching for a dependency.

**Analytics is GA4, and it counts navigations itself.** `gtag` is configured
`send_page_view: false` and the `page_view` is sent from `astro:page-load`. The
ClientRouter swaps the document without a reload, so gtag's own automatic page view
fires only for the sheet a reader lands on and every later navigation goes uncounted;
leaving it on *and* sending from the router double-counts the first one, because
`astro:page-load` fires on the initial load too. Both tags are byte-identical on every
page, which is what stops the router re-running them and re-initialising gtag on each
navigation — an interpolated nonce or a per-page value in either would break that.

**Outbound clicks on the ecosystem grid (on `/experience`) are counted, keyed to the English name.**
Each tile carries `data-track-project` and `data-track-group`; one delegated
listener on `document` turns a click into an `ecosystem_click` event. Three things
about it are load-bearing:

- **The key is the English title, not the rendered one.** `nyuchiProjectsByGroup`
  returns a `key` alongside the localized record, because two projects carry a
  Chinese gloss — a reader on `/zh` sees "The Bundu Foundation（本都基金会）" and
  "Mzizi（编程语言研究）". Keying on link text would file those under two names and
  split their row in every report.
- **The event is not called `click`.** GA4's Enhanced Measurement emits its own
  `click` for outbound links and is on by default, so that name would double-count.
- **The listener is delegated from `document`,** so it survives the router's
  document swaps without re-binding and without stacking. Binding per link in an
  `astro:page-load` handler would add a second listener to every tile on every
  return visit to `/`.

The parameters (`project`, `project_group`, `link_url`, `site_language`) only
appear in GA reports once they are registered under Admin → Custom definitions.
Until then the event count shows up and the breakdown does not.

### Colour, spacing and size come from `src/brand/`

Never hard-code a hex value outside `src/brand/`, and reach for a token before a
literal for spacing too: `--space-1` … `--space-10` is the scale. There wasn't
one — padding, margin and gap had drifted to twenty-seven distinct values with
`1.1rem` next to `1.125rem` next to `1.25rem` — and a scale nobody can name is a
scale nobody can adjust. Genuine one-offs stay literals; a number deliberately
off the scale should look like one. `tokens.ts` generates CSS custom
properties at build time; use `var(--mineral-cobalt)`, `var(--sheet)`, `var(--ink-soft)`.
`MineralName` is a union type derived from the mineral list, so a typo in a component
prop fails `astro check`.

### The site follows the Mzizi standard, and is a showcase for it

Mzizi (mzizi.dev, doctrine v4.1.0) is the standard here, not an inspiration.
Read it from the registry (`mzizi_get_tokens`, the `mzizi:nyuchi-design` skill)
before adding a colour, a radius or a face, and prefer its names:
`--color-<mineral>`, `--container-<mineral>`, `--on-container-<mineral>`,
`--radius-<name>` and `--ring` are all emitted by `tokens.ts`. In practice:

- **Type:** Noto Serif for H1–H3 and the display lockups, Noto Sans for body
  and UI, JetBrains Mono for the technical marks (figure tags, dimensions, the
  title block). Caveat stays for the margin notes and signature; it is the one
  face that is not Mzizi's.
- **Buttons are pills** (`--radius-full`), 48px, 56px for the hero's action;
  no drop shadows — rings over shadows. The primary fill is `--brand`, river;
  Mzizi's own `--primary` points at it too.
- **Panels take `--radius-lg` (14px).** The corner brackets follow the curve.
- **Focus is a 2px cobalt ring, 2px offset** (`--ring`).
- **Theme a surface in its brand's mineral.** The system and audience cards sit
  on their mineral's dark container (`data-mineral` sets `--mineral-container`
  and `--mineral-on` alongside `--mineral`); Nyuchi is gold, Bundu copper,
  Mukoko tanzanite, Shamwari sodalite.

Colour is welcome — this site is meant to show the Mzizi palette working — but
it still has to clear APCA, which is why the rule below stands.

The **mineral rail** is still the signature — seven segments, one per mineral,
running vertically down the binding edge of the sheet.

**One mineral property, one weight.** Everything keyed to a mineral reads
`--mineral`, set by a `data-mineral="gold"` attribute (the `mineral` prop on
`<Panel>` writes it; on a plain element write it yourself), and every mineral mark is `--mineral-weight` thick. It used to be
eight property names for one idea — `--panel-mineral`, `--row-mineral`,
`--stop-mineral`, `--m` and four more — so changing how a mineral is expressed
meant finding all eight.

**A raw mineral is never the colour of text; its on-container tone may be.**
Mzizi's `--on-container-<mineral>` values are cut for lettering on that
mineral's container, and the system cards use them for labels. The raw
mineral is not: set on a near-black ground the seven
measure Lc 25–48 as lettering, which APCA puts at a 27px minimum or forbids
outright. The aptitude headings, the mineral key's own names and hex values, and
the schedule reference numbers were all set that way and all failed. The mineral
goes *under* the word, as a 3px rule, or beside it, as a swatch; the word is ink.
The result carries the same identity and can be read. That holds for hover
states too, which the contrast gate cannot see: a link that turns a mineral
colour under the pointer is a link that cannot be read under the pointer, so the
mineral underlines it instead. The one exception is `::marker` — a bullet is a
mark, so it answers to the non-text floor.

**The ruling has its own ink.** `--rule-major` and `--rule-minor` paint the
blueprint grid; `--ink-faint` and `--ink-hair` paint the column rules, the panel
borders and the section rules. They used to be the same two tokens, and that
coupling was the single worst contrast problem on the site: the ink alphas exist
to make *line work* read, and under `plus-lighter` a major grid crossing was
compositing to `rgb(106 112 120)` over a `rgb(5 9 15)` ground. Every text block
that happened to cross one was scored against a ground twenty times brighter than
the sheet. Painting the grid in `--ink-*` again re-couples them.

### Surfaces follow Mzizi's ladder

The page is Mzizi `base`, and cards and panels sit on `surface`, one step up;
inset chips take `container`, menus and the title block `overlay` and
`raised`. The step between base and surface is small (judge it in CIE L\*, not
APCA, which clamps to 0 between two near-blacks), so panels carry their hairline
and corner brackets to separate them. The system and audience cards sit on their
mineral's dark container instead, which is where the colour on the page lives.

The ground is matte and neutral: the lighting radials carry no blue, and the
blueprint grid and grain are line work on warm stone. Raising the radials is how
the gloss comes back.

### The ground travels with the sheet

`.sheet-ground`, `.blueprint` and `.schematics` are `position: absolute` over
the document, not `fixed` to the viewport. A fixed ground slides underneath the
content as you scroll, which is the one thing paper never does.

Two consequences to keep in mind:

- The lighting radials are sized `100% 140vh` and pinned top and bottom. Sized
  as a percentage of a 6000px document they stop being a fall of light and
  become a flat tint.
- Fall-off is on the left and right edges only. An inset box-shadow on all four
  reads as a vignette on a fixed ground and as a horizontal band every
  screenful on a scrolling one.

### Pages unroll

`ClientRouter` plus the `unroll` animation in `src/brand/transitions.ts`: the
outgoing sheet rolls away and the incoming one unrolls, `clip-path` doing the
work with a small `scaleY` off `transform-origin: top` for the spring.

Two things this breaks if you forget them:

- **Anything that initialises on load must bind to `astro:page-load`.** The
  router swaps the document without a reload, so a one-shot script only ever
  sees the first page — the scroll-reveal observer would leave every later page
  at opacity 0. Disconnect the previous observer before making a new one.
- **`prefers-reduced-motion` needs naming explicitly.** The blanket override at
  the top of global.css selects `*` and its two pseudo-elements, which never
  matches `::view-transition-old(root)`.

The mineral rail (`@bundu/ui`'s `MineralStrip`) is `transition:persist` so it
does not re-mount on every navigation. It is fixed, 6px, full viewport height,
on every page. A full-page screenshot draws a fixed element once at the top, so
it looks like the rail stops after one screen; check it in a viewport capture.

### One stylesheet

Every rule lives in `src/styles/global.css`. Components and views have no
`<style>` blocks — the whole of the site's styling is one file with one order,
so changing how something looks is one edit in one place.

Three things this makes load-bearing:

- **Order replaces scoping.** Base rules first, component rules after, so at
  equal specificity the component wins. Add new component rules at the end of
  the components section, not the top.
- **Pair a class with an element only inside `:where()`.** `.panel p` is
  specificity 0-1-1 and beats any single class. Under scoping that did not
  matter, because Astro added a `data-astro-cid-*` attribute selector to every
  component rule and quietly pushed it to 0-2-0; take the scoping away and
  fifteen rules silently lost — `.caption` jumped from 15px to 18px and the
  workshop captions started wrapping. `.panel :where(p)` lands at 0-1-0, which
  makes it a default a class can override by being a class.
- **Duplication is now visible, which is the point.** `.eyebrow` and
  `.section-head` had each been written twice, identically, in two views —
  scoping hid it. There is one of each now.

### Containers are the drawing, not boxes on it

The ground and the containers share one line vocabulary — the same hairline, the
same ink, the same dashed rule. Nothing is a card.

- **Column rules.** `.shell` draws a dashed rule down each of its border-box
  edges. Main is a shell inside `.page` under the sticky header, so
  those rules run continuously from the masthead to the foot of the sheet. The
  shell uses `width: min(67.5rem, 100% - 4rem)` rather than `max-width`, so it
  always keeps a margin — that margin is what stops the column rules colliding
  with the sheet frame on a phone.
- **Bands.** `.section` rules itself off at the foot and drops a 5px node square
  where that rule crosses each column rule (`--shell-pad` reaches back out from
  the section's box to the shell's edge). `:last-of-type` skips both.
- **Corner brackets.** `.panel__rule` carries a complete 1px rule and then masks
  it back to eight short segments, two per corner. `--corner` is registered with
  `@property` (`syntax: '<length-percentage>'`) so it can be *transitioned*; a
  plain custom property is an untyped token stream and would snap. Hover grows
  it to `50%`, closing the segments into the full rule — the hover finishes the
  drawing rather than lifting the panel off the sheet. If a browser ignores
  `mask`, the full rule simply shows: a safe degradation, so no `@supports`
  guard is needed.

Do not reintroduce drop shadows, `transform` lifts on hover, or heavy solid
borders on panels. That was the earlier treatment and it made every container
read as a card floating over the sheet instead of part of it.

### Measure is a token, not a guess

> **Current decision (16 November 2026): text fills its container.** `--measure` and
> `--measure-wide` are both `100%`. The owner found every lede, paragraph and pull quote
> stopping halfway across its column. The reasoning below is the readability case for a
> cap and is kept because the tokens are still how a cap would be reintroduced: one edit
> to `MEASURE` in `tokens.ts`. Expect 100+ characters per line at desktop width.

A column that *looks* right is routinely wrong, and by a different amount for
each face: Cormorant ran about 6.8px per character at 18px and IBM Plex Serif
about 8.9px (both since replaced by Noto), so the same 33rem holds 77 characters of the one and 58 of the
other. Both sit inside the 45–85 band; neither number could have been guessed.
Anything holding running prose takes `--measure` (33rem); larger type takes
`--measure-wide`. Set a new max-width by running the readability pass and
reading the number, never by eye — and re-run it after any change of face.

Measure characters per line from the column width and the face's own advance,
not from `text.length / lines`. A three-line paragraph with a half-full last
line under-reports its measure by a sixth that way, which is enough to make a
comfortable column look far too narrow.

### The portrait

`src/assets/bryan-fawcett.png` is the only raster on the site. It goes through
`astro:assets` with `imageService: 'compile'`, so sharp resizes it at build
time — 1470 kB of source becomes four WebP variants, the largest 24 kB. Keep it
in `src/assets/`, not `public/`: a file in `public/` is copied verbatim.

`Portrait.astro` frames it like every other container — hairline, corner
brackets, ruled caption — and desaturates it halfway, enough to belong to the
drawing without the face going muddy.

**The masthead portrait is not astro:assets.** `MziziHeader` uses a plain `<img>` at
`/nav-portrait.webp`, rendered by `pnpm nav-portrait`. Under `imageService:
'compile'` the adapter emits a `/_image?…` URL for on-demand routes with no service
behind it, so an `<Image>` in the nav renders perfectly on every prerendered page
and 404s on all four blog pages. The alternatives were provisioning Cloudflare
Images to resize one 46px avatar, or `passthrough` shipping the 1.5 MB source.
Anything shared by the nav or the footer has the same constraint.

The social card is separate: `pnpm og` renders `public/og-bryan-fawcett.jpg`
from the same source with the site's own faces. It is not a build step, because
`og:image` needs a stable unhashed URL that scrapers can cache. Rerun it when
the portrait or the wording changes. librsvg reads fontconfig rather than
woff2, so install the vendored fonts as TTF into `~/.fonts` first or the card
silently falls back to a system sans.

### The contact card

`ContactCard.astro` carries the portrait, the particulars and a QR. The QR opens
the **30-minute booking page** (`BOOKING_URL` in `src/data/booking.ts`, the same
constant the `/book` embed reads), because booking is the one action the site
asks for. It used to hold the whole vCard; that is now the "Download .vcf" link
beneath it. Rendered to SVG at build time by `src/brand/qr.ts`; nothing about it
ships as JavaScript. `/bryan-fawcett.vcf` is a prerendered static endpoint
serving the card, built by `src/brand/vcard.ts`.

vCard **3.0**, not 4.0: both mobile platforms read 3.0 without complaint, and
older Android scanners still choke on 4.0's `KIND` and typed URLs. Lines are
escaped and folded per RFC 6350 §3.4 — an unfolded long line is the usual reason
a card imports with a truncated title on one platform and not another.

There are two QR codes, one per theme, and the tokens show the matching one.
Dark: ink on Mzizi's cobalt container (`#001F3F`), an inverted code the iOS
Camera and Google Lens read. Light: the light ink on white, a conventional code
every scanner reads. Colours are written into each SVG, so a saved or printed
code keeps its ground.
If you change the payload or the styling, re-verify by decoding a real screen
capture, not by eye.

### Content lives in `src/data/`

Typed, so pages stay markup. A copy edit should never mean touching layout.

### The site is bilingual: English at the root, Chinese under `/zh`

Astro's own i18n routing with `prefixDefaultLocale: false`, so every English
URL is exactly where it always was and nothing redirects. Every route exists in
both languages — five sheets each, plus one 404 — which is what lets the
language switcher point at the *current page's* counterpart instead of dumping
the reader back on the home page.

- **A page is never written twice.** `src/pages/experience.astro` and
  `src/pages/zh/experience.astro` are four-line wrappers around
  `src/views/ExperienceView.astro`, which takes `lang` and renders both. Copying
  the markup into `pages/zh/` would mean every future change had to be made
  twice, and it would drift the first time somebody forgot.
- **Chrome strings live in `src/i18n/ui.ts`** — nav, section labels, figure
  tags, buttons, page metadata. Both dictionaries are checked against each other
  at compile time: a key present in `ui.en` and missing from `ui.zh` fails
  `astro check`.
- **Subject prose stays in `src/data/`,** next to the record it belongs to, in a
  `zh` block holding only the translated fields (`Bilingual<T, K>` in
  `src/i18n/localize.ts`). `work.ts` stays the single source of truth for the
  ecosystem grid; splitting project copy into the chrome dictionary would give
  it two.
- **Proper nouns are never translated.** Nyuchi, Mukoko, Bundu, Shamwari, Mzizi,
  the school names — Latin script in both, with a short Chinese gloss in
  parentheses where a reader needs the handhold. The vCard and its QR stay
  English in both languages: it is one canonical contact record, and a card that
  differs by which page it was scanned from is a duplicate contact waiting to
  happen.
- **`path` props are language-neutral.** Pass `/experience`; `localizePath` adds
  the prefix. Hard-coding `/zh/…` anywhere is a bug waiting for the next locale.

### Chinese typography

**Body Han is a sans; heading Han is a serif — and neither stack mixes the two.**
Mzizi sets body in Noto Sans and H1–H3 in Noto Serif, so `--cjk` (body) lists
only sans faces (Noto Sans for Latin, then PingFang, YaHei, Noto Sans CJK) and
`--cjk-display` (H1–H3 and the lockups) only serifs. A stack that mixed them
once set the same paragraph in Songti on a Mac and YaHei on Windows. Body Han
is not vendored at all — every platform ships a good Chinese sans — so most of
a `/zh` page costs no font download.

**Heading Han is vendored: Noto Serif SC, GB2312 Level 1, two weights.** Build it with
`pnpm cjk`, never by hand. Level 1 is the 3,755 most common characters and
covers ~99.9% of running modern Chinese; the rare tail falls through to the
system face, which is where all of it used to land. An exact subset of the text
the site sets today would be 149 kB per weight instead of 690 — and wrong: the
blog renders from Sanity per request, so a post published without a rebuild
would reach characters the last build never saw and fall back mid-sentence.

Two things about the `unicode-range` on those faces, and both cost real bytes
to get wrong:

- **It gates the download, so it names Han and nothing else.** The first version
  also covered `U+2010-201F` for the dashes and quotes the subset does contain —
  and every English page here uses an em dash, so every English reader
  downloaded 690 kB of Chinese to draw one.
- **The switcher is chrome, and takes `--cjk-chrome`.** `中文` appears on every
  English page; pointing it at `--cjk` put the vendored face back on the English
  routes for two glyphs. `--cjk-chrome` deliberately omits the vendored face.

An English route must fetch **0 kB** of Han. `--cjk` and `--cjk-mono` list the
Latin face *first*, so a proper noun inside a Chinese sentence sets in Noto Sans
or JetBrains Mono.

Two things that follow, and that new work has to keep:

- **Display leading is set for Latin caps.** `.stack`, `.page-header__title` and
  `.split__big` run at 0.92–0.95, which works because Latin caps sit well inside
  the em box. A Han glyph fills that box and the same figure runs the lines into
  each other. Each has a `:lang(zh)` twin; a new display lockup needs one too.
  The global `:lang(zh) h1` rule will not do it — a scoped class outranks it.
- **The label floor is higher for Han.** The mono labels run 10–11px, fine for
  uppercase Latin and not for Han, where the strokes stop separating at 1x.
  Rather than a `:lang(zh)` twin for each of ~35 label classes, `global.css`
  declares a `Mzizi CJK Label` `@font-face` with `size-adjust: 120%`, sourced
  `local()` only and sitting in `--cjk-mono` *after* JetBrains Mono — so Han in a
  label scales and the Latin beside it does not. Add labels normally; they
  inherit the floor.

### The blog: Bryan's Adventures, out of Sanity

`/adventures` and `/zh/adventures`, plus a page per post in each language. The
content lives in the Sanity project `zsx9erk1`, dataset `production`, and the
Studio that edits it is in `bryans-adventures/`.

- **Server-rendered, not prerendered.** Publishing in Sanity is live without a
  build, because Workers Builds only triggers on a git push and has no deploy
  hook a CMS webhook could pull. The trade is documented in `BLOG_CACHE_CONTROL`:
  the edge holds a render for 60s and will serve it stale for ten minutes if
  Sanity is unreachable.
- **No token, anywhere.** The dataset is public-read, so `src/sanity/client.ts`
  fetches `apicdn.sanity.io` unauthenticated and the project id and dataset are
  constants rather than environment variables. There is nothing to configure in
  Cloudflare and nothing that can differ between preview and production. Keep it
  that way: the moment a query needs a token, the deploy needs a secret.
- **Three states, not two.** An empty blog and an unreachable Sanity are
  different things and the pages say different things about each — collapsing
  them tells a reader the writing is gone when the service is merely down. A
  missing post is a real 404; an unreachable Sanity is a 503 with `Retry-After`,
  and neither is cacheable.
- **`groq()` never throws.** On an on-demand route an uncaught throw is a 500
  for the whole document, masthead and all. It returns a `Result` instead.
- **Translations are document-level, via `@sanity/document-internationalization`.**
  A Chinese adventure is its own document. Neither side points at the other:
  the pairing lives in a `translation.metadata` document the plugin maintains,
  which is what gives the Studio its Translations menu and keeps an
  English-only adventure an ordinary document rather than one with an empty
  field. Queries join through it with `references(^._id)` — an indexed filter.
- **The language is on `translations[].language`, not `_key`.** Plugin v6 moved
  it, because `_key` is what Sanity uses for array identity and diffing.
  Filtering `translations[_key == "zh"]` matches nothing, silently.
- **`language` is written by the plugin, not by hand** — `readOnly` and
  `hidden` on the schema, as the plugin asks. `sanity.config.ts` also replaces
  the auto-generated "New document" entry with a base-language template: a new
  adventure created without `language` would match neither list and read as
  lost.
- **The Chinese list is built from the *English* records** so every adventure
  appears to a Chinese reader — translated where a translation exists, marked
  `仅有英文` where it does not, linking to the English page. An untranslated
  post lists no `hreflang="zh-Hans"` alternate, because pointing one at a page
  that is not a translation is a lie told to a search engine; its switcher
  falls back to the Chinese list.
- **Pages with a language-specific slug pass `alternates` to `BaseLayout`.** The
  derived-from-path default cannot know that a translation has its own slug.
- **The image URL builder is hand-rolled** and therefore pinned by
  `pnpm verify:images`. A wrong URL fails as a broken image on a live page, not
  as a build error — same reason `verify-fonts.py` exists.
- **Body headings start at `h2`.** The adventure title is the page's only `h1`,
  so the editor's "Heading" renders `h2` and "Subheading" `h3`. Jumping straight
  to `h3` is a heading-order violation, and axe catches it.
- **`bryans-adventures/` is not part of the build.** It is a Sanity Studio, which means
  React. It has its own `package.json` and `package-lock.json`, the root
  `tsconfig.json` excludes it, and there is no pnpm workspace file — so
  `pnpm install` and `pnpm build` at the root never see it, and neither does
  Cloudflare. It runs npm and Sanity 6; the site runs pnpm and Astro 7, and the
  two never meet.

### Type identity

Mzizi's three faces, plus one hand:

- **Noto Serif** — H1–H3 and the big drafted lockups (`--display`).
- **Noto Sans** — everything anyone reads, H4 and below, and buttons (`--sans`).
  Its italic is load-bearing (the lede, the pull quotes), so the vendoring
  script keeps roman and italic as separate files.
- **JetBrains Mono** — figure tags, dimension labels, the title block (`--mono`).
- **Caveat** — margin notes and the signature: written marks, not set ones.

Noto is Mzizi's choice for its coverage of African names and diacritics, and
Noto Serif SC is the same design for the Chinese headings.

### Fonts are self-hosted, and licensed

`public/fonts/` plus generated `src/styles/fonts.css`. No request to fonts.googleapis.com.
Regenerate with `python3 scripts/fetch-fonts.py` after changing the type stack.

**`public/fonts/OFL.txt` is not optional.** All five families are under the SIL
Open Font License 1.1, which requires the copyright notice and the licence to
travel with the Font Software — and the vendored Han face is a *modified*
version, which makes that an obligation rather than a courtesy.
`verify-fonts.py` fails the build if the file goes missing.

**The Han subset keeps the name "Noto Serif SC", deliberately.** The OFL would
permit renaming — none of these families declares a Reserved Font Name — but
the design is Adobe's and nothing here was redrawn. `build-cjk-subset.mjs`
removes glyphs; it does not draw any. A house name on someone else's outlines
would misstate where they came from, which is the opposite of what the mineral
page argues for everywhere else on this site. If a Bundu type identity is ever
wanted, it is a commission, not a rename.

Several families are variable fonts where Google serves one file per subset covering
every weight — key generated filenames off the URL, not the weight, or the CSS ends up
referencing files that were never downloaded. `scripts/verify-fonts.py` guards this in CI.

## Accessibility Requirements

- **APCA on every text block, in both themes** — `pnpm verify:contrast`, and a
  CI job. Nothing ships under the minimum size APCA gives for its contrast at
  its weight, at 1280px or 390px, light or dark. The gate focuses the skip link
  only while measuring the skip link: left focused, it sits over the sticky
  header and every header label under it was scored against it. This is the check; the rules below are how the design
  stays on the right side of it.
- **44px minimum** on every interactive target, except links inside a sentence,
  which WCAG 2.2 target size (2.5.8) exempts and which 44px would visibly break
- **Labels take `--label` and `--label-weight`,** 15px at 600 — not a 10px
  floor, which is what this used to say and what put roughly 35 label classes
  under the line at once. Size and weight trade against each other in APCA: at
  the ink these labels use, weight 400 asks for 16.5px and weight 600 asks for
  14.6px. Dropping a label to 400 is a contrast regression, not a styling choice.
- **Semantic HTML** — real `section`/`nav`/`header`/`footer`, correct heading order,
  exactly one `h1` per page
- **`aria-labelledby`** on every section, pointing at its heading
- **Focus rings** are Mzizi's: `--ring` (cobalt `#00B0FF`), 2px with a 2px
  offset; never remove them. Well over the 3:1 that WCAG 2.2 (1.4.11) asks.
- **`--stamp` draws, `--stamp-ink` letters.** A 2px rule and a 15px word have
  different floors — Lc 45 against Lc 75 — and the approval stamp is both at
  once. One colour for both means an illegible stamp.
- **`prefers-reduced-motion`** disables reveals, the mineral rail animation and smooth
  scrolling — already handled in `global.css`, keep it that way for new animation
- Decorative elements (the rail, the sheet layers, the schematics) are `aria-hidden`

## Common Pitfalls

1. **All CSS is in `src/styles/global.css`; components carry no `<style>`.**
   The one exception is `@bundu/ui`'s `MineralStrip`, which styles itself.
   See *One stylesheet* below. Adding a scoped block back puts one rule
   somewhere nobody will look for it, and re-arms the specificity trap.
2. **`threshold: 0` on IntersectionObserver reveals.** A section taller than the
   viewport can never reach a meaningful intersection ratio, so a non-zero threshold
   leaves long sections invisible forever on a phone.
3. **Cap grid track minimums with `min()`** — `minmax(min(20rem, 100%), 1fr)`. A bare
   `minmax(20rem, 1fr)` forces horizontal scroll on a 390px screen.
4. **Hard-coded colours.** Use the custom properties.
5. **Adding a client framework.** Don't; this is a content site.
6. **Node < 22.12** will not run Astro 7.
7. **`mix-blend-mode: multiply` on the sheet layers.** On a cyanotype the ruling
   is lighter than the ground, so the grid needs `plus-lighter` and the grain
   needs `soft-light`. Multiply makes both vanish.
8. **`color: transparent` for outline type.** Guard it behind
   `@supports (-webkit-text-stroke: ...)`; without the guard, a browser that
   lacks the property renders the text invisible rather than solid.
9. **Transitioning a custom property.** Register it with `@property` first.
   `transition: --corner` on an unregistered property is a no-op that snaps.
10. **`.shell` with `max-width`.** Use `width: min(…, 100% - 4rem)`. With
    `max-width` the shell goes full-bleed on a phone and its column rules land
    underneath the sheet frame.
11. **Editing a page under `src/pages/`.** Those are wrappers. The markup is in
    `src/views/`, and editing one language's wrapper only changes that language.
12. **A newline inside Chinese markup.** Astro collapses it to a space, and a
    space in front of a full-width comma is a typographic error. Keep
    `{a}{comma}{b}` on one line.
13. **Probing rendered colour with a screenshot.** The nav links transition
    colour over 0.2s, so a probe that screenshots immediately reads the ink
    mid-fade as the ground. Disable transitions first.
14. **Testing an on-demand route with `curl`.** Without `Sec-Fetch-Mode:
    navigate` you are not testing what a browser does, and the asset layer
    answers differently. This hid a blog that 404'd for every real visitor.
15. **`<Image>` in anything the blog pages render.** See *The portrait* — it
    resolves to a `/_image` endpoint that does not exist on on-demand routes.
16. **Editing `cloudflare.config.ts` without rebuilding.** The assets config is
    baked into the build output. Rebuild.
17. **`cf` rewrites `tsconfig.json`.** `cf build` adds
    `.cloudflare/types/index.d.ts` to `include`, which breaks `pnpm check` with
    three `ImageMetadata` errors in `Portrait.astro`. Revert that line.
18. **Painting the blueprint grid in `--ink-*`.** See *Colour comes from
    `src/brand/`* — the ruling gets `--rule-*`, and re-coupling them is the
    site's worst contrast regression, not a tint.
19. **A mineral as the colour of text.** Also above: under the word, or beside
    it. Never in it.
20. **`opacity` on something with words on it.** The approval stamp ran at
    `0.82`, which took an already marginal red down to Lc 34 — a 67px minimum
    for a 15px label. Opacity multiplies against the ground, and on a near-black
    ground that is nearly all of the contrast.

## Git Workflow

### Commit Prefixes

`feat:` · `fix:` · `chore:` · `docs:` · `refactor:`

### Deployment

Cloudflare's GitHub app deploys the Worker; the repo has no deploy workflow of
its own, and adding one back would mean two things racing for the same Worker.
To push a build by hand, `cf deploy` (or `pnpm deploy`) with `CLOUDFLARE_API_TOKEN`
in the environment.

### CI (every push and PR)

1. `pnpm check` — TypeScript under `strictest`
2. `pnpm build` — production build
3. `scripts/verify-fonts.py` — every font reference resolves
4. `pnpm verify:images` — the hand-rolled Sanity image URL format still holds
5. `pnpm verify:contrast` — APCA over the rendered page (its own job)
6. `pnpm audit --audit-level high`

`scripts/verify-contrast.mjs` is the contrast gate, and it is worth knowing how
it decides what the ground is, because two obvious approaches are both wrong:

- Hiding only the target element's ink reads its *parent's* ink as ground
  whenever the target is an inline run inside a painted block — an `<em>` inside
  a `<p>`. Same colour both sides, so an ordinary emphasis scores Lc 0.
- Hiding every element's ink at once fixes that and breaks something else: the
  element's box also holds its border, its mineral bar, its `::after` rule, none
  of it under a glyph. A chip scored Lc 7.8 against its own hairline.

So it shoots each viewport twice, ink on and ink off, treats the pixels that
differ as the glyphs, and takes the worst-case ground *inside that mask* —
discarding any colour that fewer than half a percent of a block's glyph pixels
touch, or a single antialiased pixel of a button's rim decides the button's
score.

It runs against `astro dev`, not the built Worker: it reads rendered pixels, so
nothing it measures depends on the Workers asset layer, and a built-Worker server does
not reliably survive a couple of minutes of browser-driven load. A server that
dies mid-run is the one failure mode a gate must not have, which is why a
navigation error is fatal there while a 5xx from an unreachable Sanity only
skips the route.

Two passes are still run by hand and are not gated:

- **axe-core** (WCAG 2.2 AA + best-practice) — 0 violations across all 13
  routes at both widths. It reports a gradient parent as `incomplete` rather
  than testing it, which is the gap `verify:contrast` fills.
- **Readability** — rendered size, leading, and characters per line. Targets
  are ≥16px and ≥1.5 leading for prose and 45–85 characters at desktop width. A
  390px phone cannot hold 45 characters of 18px prose, so the character band is
  a desktop guideline; size and leading hold everywhere.

## Content Notes

### The home page has one visitor and one action

The visitor is an organisation deciding whether to hire Nyuchi; the action is
booking a call on `/book`. Bryan chose this over schools and over funders because
revenue is the priority. Everything on `/` serves that:

- **Identity:** "Digital Craftsman, builder of communities", with systems thinking
  as the thread — how people, data, tools and constraints connect. Shown through
  the work, never claimed in an adjective.
- **At most three featured systems** (`systems()` in `work.ts`): SAS, Nyuchi's
  weather chain, and the Bundu Foundation with Mzizi.
- **The Toddle Enhancement Extension is Nyuchi's, not SAS's.** Bryan built it
  through Nyuchi in his own time to solve problems he saw at SAS; SAS did not
  commission it and does not own it, though SAS helps maintain it, and SAS uses
  it free of charge — it has never paid for a licence. Say exactly
  that and no more: it is never presented as an SAS tool, and it does not go on
  the SAS system card. It lives on `/experience` as a Nyuchi Learning tile. Each answers the same three
  questions in order: who it is for, how the parts connect, what changed. A fourth
  means one comes off.
- **Do not frame Bryan around AI.** No "AI-powered" in copy. Shamwari AI appears
  as a pillar's name and nothing more.
- **No number without proof.** Every figure on the page is one a live site states
  today. User counts, client names and quotes go in when they exist, not before.
  The call is a free 30-minute one, and `/book` embeds that event directly
  (`bryanfawcett/book-a-call`), not the profile with every event type on it.
- **Tokens stay out of the framing** (MIT, MXT, NST, NHC). They are a future phase,
  and to a buyer they read as risk. So does calling Mukoko's identity sovereign: one
  identity across its apps is live, sovereign identity is not.

### Projects Listed

`src/data/work.ts` (`nyuchiProjects`) is the single source of truth for the ecosystem
grid, which lives on `/experience` (`#ecosystem`), not on `/` — The Bundu Foundation,
Mzizi, Bundu Labs, Nyuchi Africa, Mukoko, Shamwari AI, Nyuchi StationKit, Mukoko
Weather, Mukoko News, Nyuchi Learning, Mukoko Lingo, Mukoko Events, the Zimbabwe
Information Platform and Iconic Expeditions. Add new ecosystem projects there — the
section lede describes the Foundation/pillar relationship in general terms rather
than naming each project, so it should not need to change alongside it.

The grid is grouped rather than one flat run of tiles: `foundation`,
`pillars`, `commons`, `community`, `travel`, in that order, from the `group` field
on each project. A new project needs a group, and its Chinese in the same record.

### Internal Tools (Not Listed on the Website)

- **Workspace Tools** — Gmail signature management for Google Workspace (9 brands)

### Role Title

The site uses "Associate Technology & Innovation Coordinator" throughout — that is what
`src/data/profile.ts` carries and what the JSON-LD in `BaseLayout.astro` emits, so the
About section above and the rendered site agree. `public/llms.txt` states it too, and
names it explicitly as the correct title, because a stale copy of a job title is the
single most likely thing for a language model to repeat wrongly.

## Tech Stack Across Nyuchi Projects

For context, the broader ecosystem uses:

- **Frontend:** Astro, TypeScript
- **Backend:** Hono on Cloudflare Workers
- **Database:** Supabase PostgreSQL
- **Storage:** Cloudflare R2
- **AI:** DeepSeek via Cloudflare AI Gateway
- **Payments:** Stripe
- **Deployment:** Cloudflare Workers
- **Brand system:** Mzizi (mzizi.dev)

### Tokens are a generated file

`src/styles/tokens.css` is written by `pnpm tokens` from `src/brand/tokens.ts` and
inlined by `BaseLayout` (`?raw`). `dev` and `build` regenerate it, and CI fails if
the committed copy is stale (`pnpm tokens --check`). It exists so tools that are not
TypeScript, the Rust verifiers, can read the same CSS the page ships. Edit
`tokens.ts`, never `tokens.css`.

`verify:stylesheet:rs` parses the CSS rather than matching lines, and is stricter
than the JS script: that one only checks the last selector of a multi-line selector
list, so `.panel a,` followed by `.other {` slipped past its base-rule check. The JS
script stays until the Rust one has run in CI for a while.

### Markup names things, the stylesheet colours them

No component writes an inline `style` to colour something. A mineral is keyed with
`data-mineral="<name>"`, and the rules that turn the name into `--mineral` (plus the
container and on-container for the seven minerals) are generated into `tokens.css`
from `minerals.ts` and `palette.ts`: all 21 Mzizi families, so a heritage tone or an
experimental family keys a surface the same way a mineral does. The Panel's `mineral`
prop is typed `ToneName`, so a typo fails `astro check`.

Positioning that used to be inline lives in classes too (`.schematics__1`–`3`), and the
footer's mineral dots are `<span data-mineral>` coloured by `var(--mineral)`. This is the
same pattern `@bundu/ui`'s own mineral strip uses, and it means a page can keep
`style-src 'self'` with no inline-style allowance. Do not reintroduce `keyedTo()` or a
`style={}` for colour.

**Corner brackets are opt-in.** `<Panel frame>` draws them, for something that frames
something larger (the deck embed). A card is a hairline at `--radius-lg` and nothing else.

### Components in Rust are proven against Astro, not eyeballed

`tools/components` is the Rust port of the site's components. Each one renders the same
HTML as its Astro original from the exported data (`src/data/generated/site.json` and
`ui.json`, written by `pnpm site-data`), and `pnpm verify:components:rs` proves it: it
finds the component as Astro shipped it in the built pages, reads the render's inputs
(language, sheet, year) back out of that markup, renders the Rust version from them, and
compares both as canonical HTML (attribute and class order and whitespace are ignored;
elements, attribute values and text must match). It exits non-zero on any difference and
prints the first differing lines. A port is not done until it passes on every page in both
languages. Ported so far, all ten components: `MziziFooter`, `MziziHeader`, `LanguageSwitcher`, `PageHeader`, `Hero`, `Portrait`, `ContactCard`, `WorkshopStrip`, `Schematics` and the `Panel` primitive (a typed `Tag` enum and the `data-mineral` contract). Mzizi's own Rust primitives are Dioxus with Tailwind class strings, which this site does not run; we port against the contract (see mzizi-dev/mzizi-registry#702).

### The design system is a skill, generated from the site

`pnpm design-system` (after `pnpm build`) writes `.claude/skills/fawcett-design-system/`:
tokens, fonts, components.css, 18 documented components with previews, and `adopt.sh`
for other repos. `design-system:check` runs in CI. Tokens added for it: `--text-*`,
`--motion-*` (`fast/normal/slow/page`), `--z-*`, `--radius-xs`, half-step spacing. The
grid columns are `.col-4`/`.col-6`; `prefers-contrast: more` and `forced-colors` are
handled at the end of `global.css`. Edit the site, then regenerate; never edit the skill.

### The chrome is Rust, Astro inserts it

`MziziHeader`, `MziziFooter` and `Schematics` are Rust (`tools/components`). `pnpm fragments`
renders them to `src/data/generated/fragments/` (one file per language and top-level route,
with `%SWITCH%`, `%SHEET%` and `%YEAR%` placeholders), and the `.astro` files only insert the
fragment (`src/components/fragments.ts`). The fragments are committed because Cloudflare's
build image has no Rust; CI runs `fragments:check` and the parity check. Edit the Rust, then
`pnpm fragments`; never the fragment. Still Astro: `Hero`, `Portrait`, `ContactCard`,
`WorkshopStrip` and `PageHeader` (their inputs are per-page or content-hashed), and the router.

### Rust components can also be called natively (WebAssembly)

`Hero` is no longer a fragment: `import Hero from 'rust:hero'` in an `.astro` file calls the Rust component
through a committed wasm module (`src/integrations/rust/pkg/`, built by `pnpm rust:wasm`, checked by
`pnpm rust:wasm:check`), with real props and a real default slot. Edit `tools/components` or
`tools/components-wasm`, then `pnpm rust:wasm`; never the generated files. See `docs/native-rust-in-astro.md`.
