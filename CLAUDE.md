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
Zimbabwean company limited by guarantee researching the open agricultural data
commons and the standards it will run on, under the Ubuntu philosophy ("I am
because we are"). Research comes first there; the governance layer itself is not
yet fully built. Nyuchi Africa, Mukoko and Shamwari AI are the Foundation's three
pillars; StationKit and Mukoko Weather are how the commons gets filled and put to
use once it exists.

| Platform | URL | Description |
|----------|-----|-------------|
| **The Bundu Foundation** | bundu.org | Research, open standards, and the agricultural data commons — in progress |
| **Nyuchi Africa** | nyuchi.com | Community-focused business platform for African entrepreneurship |
| **Nyuchi StationKit** | nyuchi.com/stationkit | Open-source solar-powered weather + soil station, from $25 |
| **Nyuchi Learning** | learning.nyuchi.com | Open-source K-12 digital transformation frameworks for African schools |
| **Nyuchi Lingo** | lingo.nyuchi.com | Language learning platform for African languages |
| **Mukoko** | mukoko.com | Privacy-focused social platform with 6 apps (ID, Clips, Pulse, Connect, Novels, Events) |
| **Mukoko Weather** | weather.mukoko.com | AI-powered hyperlocal forecasts for farming, mining and travel |
| **Mukoko News** | news.mukoko.com | Pan-African news aggregation from trusted regional sources |
| **Nhimbe** | nhimbe.com | Community events and gatherings platform (part of Mukoko ecosystem) |
| **Shamwari AI** | shamwari.ai | Open-source, culturally-grounded AI model for low-bandwidth African hardware |
| **Zimbabwe Travel Info** | travel-info.co.zw | Comprehensive travel guide for Zimbabwe |
| **Iconic Expeditions** | iconic-expeditions.com | Luxury bespoke safaris across Southern and Eastern Africa |
| **Workspace Tools** | (internal) | Gmail signature management for Google Workspace |

The Foundation also directly maintains six open-source technical projects (Neural
Transfer Layer, Nyuchi Honeycomb, SiafuDB, SiafuDB-Kuzu, Harare Metro and Mzizi
itself) across the `bundu-labs`, `openNTL` and `siafuDB` GitHub organizations. None
of those are showcased individually on this site — Mzizi is, as the branding layer
this site is built on.

### GitHub Organizations

- **Personal:** [github.com/bryanfawcett](https://github.com/bryanfawcett)
- **Nyuchitech:** [github.com/nyuchitech](https://github.com/nyuchitech) - 13+ public repos
- **SAS Tech Innovation:** [github.com/SAS-Technology-Innovation](https://github.com/SAS-Technology-Innovation) - 5 public repos

### Social Links (Canonical)

- **LinkedIn:** linkedin.com/in/bryandavidfawcett
- **GitHub:** github.com/bryanfawcett
- **Twitter/X:** @bryanfawcett
- **Website:** bryanfawcett.com

## Quick Reference

```bash
pnpm dev        # dev server at localhost:4321
pnpm check      # astro check (TypeScript under `strictest`) — must stay at 0 errors
pnpm build      # production build to dist/
pnpm preview    # run the built site in workerd via wrangler
pnpm deploy     # build and deploy the Worker
pnpm og         # re-render the social card (only after the portrait changes)
pnpm nav-portrait   # re-render the masthead portrait (same — only after it changes)
pnpm verify:images  # pin the hand-rolled Sanity image URL format
pnpm verify:contrast # APCA: every text block, every route, desktop and phone
```

**Requirements:** Node.js 22.12+ (Astro 7's floor), pnpm 10+.

## Project Overview

bryanfawcett.com, built with:

- **Astro 7** — no client framework, no React
- **TypeScript 6** under `astro/tsconfigs/strictest`
- **Cloudflare Workers** via `@astrojs/cloudflare`
- **Mzizi design system** for colour, surfaces and semantics
- **Dark only** — no light ramp, no theme toggle. The site is a cyanotype, but
  a print rather than a wash: matte board with a blue cast, line work in white.
  The sheet is `#18202C`; panels are wells cut *into* it at `#05090F`; the ink
  is `#FBFCFE`.
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
  styles/         fonts.css (generated), global.css
bryans-adventures/  The blog's Sanity Studio. React, and NOT part of the build
scripts/          fetch-fonts.py, verify-fonts.py, build-og-card.mjs
public/fonts/     Self-hosted woff2, Latin + Latin Extended
```

## Architecture

Almost every route is prerendered and served straight from static assets. The four
blog routes under `/adventures` are not: they read Sanity per request, so publishing
a post is live without a rebuild. That one exception is why `wrangler.jsonc` has a
`main` — `@astrojs/cloudflare/entrypoints/server`, the adapter's own entrypoint, not
a file in this repo. `@astrojs/cloudflare` emits the static tree to `dist/client` and
the server bundle to `dist/server`.

Three things about that split bite, and all three cost real debugging time:

- **`run_worker_first` is load-bearing.** Assets are matched before the Worker runs,
  and a browser *navigation* — `Sec-Fetch-Mode: navigate`, which only a browser
  sends — gets answered from the asset tree or from 404.html. Without the blog
  routes listed in `assets.run_worker_first`, `/adventures` 404s for every real
  visitor while `curl` returns a clean 200 from the same URL. Always test navigation
  with the header set.
- **The adapter bakes the assets config into `dist/server/wrangler.json` at build
  time,** and that is what takes effect. Editing `wrangler.jsonc` alone changes
  nothing until `pnpm build` runs again — including under `wrangler dev`.
- **`session: false`** in `astro.config.mjs`. With a server entrypoint the adapter
  otherwise declares a KV binding for Astro's session store, which then has to exist
  in Cloudflare before a deploy goes through. Nothing here has a session.

This repo is the main site. Satellite properties are their own Workers in their own
repos, sharing the branding layer rather than this codebase.

## Conventions

### Everything is Astro and TypeScript

No React, no client framework, no UI library. The only client JavaScript is the
scroll-reveal observer in `BaseLayout.astro` and the deferred Cal.com loader on
`/book`. Reach for a `<script>` in an `.astro` file before reaching for a dependency.

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

The **mineral rail** is the brand signature — seven segments, one per mineral, running
vertically down the binding edge of the sheet. It is the one place saturated colour
appears on an otherwise monochrome cyanotype. Everywhere else colour is a reward — a
mineral bar under a heading, a swatch beside a name, a rule under a reference
number — not a default. That restraint is the design; adding colour to more surfaces
breaks it.

**One mineral property, one weight.** Everything keyed to a mineral reads
`--mineral`, set by the `mineral` prop on `<Panel>` or by `keyedTo()` for plain
elements, and every mineral mark is `--mineral-weight` thick. It used to be
eight property names for one idea — `--panel-mineral`, `--row-mineral`,
`--stop-mineral`, `--m` and four more — so changing how a mineral is expressed
meant finding all eight.

**A mineral is never the colour of text.** Set on a near-black ground the seven
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

### Surfaces go down, not up

The sheet is the matte board and panels are wells cut into it. Panels used to
sit *above* a near-black ground, which left one direction for separation — up,
toward the light — so every panel read as a bright rectangle floating on black.
Now the near-black is the *panel*, which is where the reading happens, so ink
sits on the darkest surface on the page rather than the lightest.

Judge a surface step in CIE L\*, not APCA: APCA clamps to 0 between two
near-black surfaces and cannot see this end of the range at all. Sheet to panel
is dL\* 9.7. The pairing readers complained about was dL\* 0.6.

The ground is matte, and that is a budget rather than a look: the lighting
radials run at about a quarter of their old alpha with most of the blue out of
them, the base gradient is nearly flat, and the paper grain is turned up to meet
them. Raising the radials is how the gloss comes back.

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

The mineral rail is `transition:persist` so it does not re-mount and
re-animate on every navigation.

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
  edges. Nav, main and the title block are sibling shells inside `.page`, so
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

A column that *looks* right is routinely wrong, and by a different amount for
each face: Cormorant runs about 6.8px per character at 18px and IBM Plex Serif
about 8.9px, so the same 33rem holds 77 characters of the one and 58 of the
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

**The masthead portrait is not astro:assets.** `SiteNav` uses a plain `<img>` at
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

`ContactCard.astro` carries the portrait, the particulars and a QR. The QR holds
the **whole vCard**, not a link to one, so scanning it saves the contact with no
network — the case that matters standing in a room at a conference. Rendered to
SVG at build time by `src/brand/vcard.ts`; nothing about it ships as JavaScript.
`/bryan-fawcett.vcf` is a prerendered static endpoint serving the same card.

vCard **3.0**, not 4.0: both mobile platforms read 3.0 without complaint, and
older Android scanners still choke on 4.0's `KIND` and typed URLs. Lines are
escaped and folded per RFC 6350 §3.4 — an unfolded long line is the usual reason
a card imports with a truncated title on one platform and not another.

The QR needs its own opaque ground (`--sheet-deep`). A code sitting over the
blueprint ruling is a code a phone will not lock onto. If you change the payload
or the styling, re-verify by decoding a real screen capture, not by eye.

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
  Nhimbe, the school names — Latin script in both, with a short Chinese gloss in
  parentheses where a reader needs the handhold. The vCard and its QR stay
  English in both languages: it is one canonical contact record, and a card that
  differs by which page it was scanned from is a duplicate contact waiting to
  happen.
- **`path` props are language-neutral.** Pass `/experience`; `localizePath` adds
  the prefix. Hard-coding `/zh/…` anywhere is a bug waiting for the next locale.

### Chinese typography

**Every face in `--cjk` is a serif, and that matters more than it sounds.** The
stack used to end `'Songti SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft
YaHei', sans-serif` — the first entries serifs, the last four sans — so which
one a reader got depended on their platform. A Mac found Songti and set the body
in a serif; a Windows machine fell past it to Microsoft YaHei and set the same
paragraph in a sans, beside Latin that was serif either way. `STSong` and
`SimSun` are the Mac and Windows serifs and the generic is `serif`, so the
pairing is the same everywhere now.

Nothing is self-hosted, and the numbers are why. An exact subset of the 880 Han
characters this site currently sets costs 149 kB per weight in Noto Serif SC —
but it would have to be re-cut on every build, and the blog renders from Sanity
per request, so a post published without a rebuild falls outside the subset
mid-sentence. The content-independent alternative, GB2312 Level 1, is 699 kB per
weight; Google's own unicode-range chunking delivers about 1.6 MB to a Chinese
reader. Against three woff2 families totalling 480 kB, none of those is a trade
worth making for a face every platform already ships a good version of. `--cjk`
and `--cjk-mono` list the Latin face *first*, so a proper noun inside a Chinese
sentence still sets in Plex.

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
  `local()` only and sitting in `--cjk-mono` *after* IBM Plex Mono — so Han in a
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

Three jobs, three faces, and the split between the first two is load-bearing:

- **Cormorant Garamond — display only.** The big drafted lockups and nothing
  else. Its x-height is 0.386 em, measured off the vendored file against
  0.46–0.53 for a face cut for running text, so at a 17px body size its
  lowercase renders about 6.6px tall. That is what readers meant when they said
  the text was too thin: not the weight, but letters a third smaller than the
  size implies. At 4rem in a two-word lockup, the same delicacy is the point.
- **IBM Plex Serif — everything anyone reads.** x-height 0.516, and the sibling
  of the Plex Mono already carrying every label, so the voice stays industrial
  rather than literary. Its italic is load-bearing (the lede, the pull quotes),
  so the vendoring script keeps roman and italic as separate files.
- **IBM Plex Mono** for figure tags, dimension labels and the title block;
  **Caveat** for margin notes and the signature — written marks rather than set
  ones.

`--display` and `--serif` are separate tokens for exactly this reason. Setting
body copy in `--display` puts it back under the floor.

### Fonts are self-hosted

`public/fonts/` plus generated `src/styles/fonts.css`. No request to fonts.googleapis.com.
Regenerate with `python3 scripts/fetch-fonts.py` after changing the type stack.

Several families are variable fonts where Google serves one file per subset covering
every weight — key generated filenames off the URL, not the weight, or the CSS ends up
referencing files that were never downloaded. `scripts/verify-fonts.py` guards this in CI.

## Accessibility Requirements

- **APCA on every text block** — `pnpm verify:contrast`, and a CI job. Nothing
  ships under the minimum size APCA gives for its contrast at its weight, at
  either 1280px or 390px. This is the check; the rules below are how the design
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
- **Focus rings** are the stamp red at 2px with 3px offset; never remove them.
  6.5:1 against the sheet, well over the 3:1 that WCAG 2.2 (1.4.11) asks of them
- **`--stamp` draws, `--stamp-ink` letters.** A 2px rule and a 15px word have
  different floors — Lc 45 against Lc 75 — and the approval stamp is both at
  once. One colour for both means either an illegible stamp or a washed-out
  focus ring.
- **`prefers-reduced-motion`** disables reveals, the mineral rail animation and smooth
  scrolling — already handled in `global.css`, keep it that way for new animation
- Decorative elements (the rail, the sheet layers, the schematics) are `aria-hidden`

## Common Pitfalls

1. **All CSS is in `src/styles/global.css`; components carry no `<style>`.**
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
16. **Editing `wrangler.jsonc` and re-running `wrangler dev`.** The adapter
    baked the old assets config into `dist/server/wrangler.json`. Rebuild.
17. **Auditing against `wrangler dev` after editing source.** It serves
    `dist/`, so an un-rebuilt change measures the previous build and reports
    the previous numbers. `astro dev` is the one that reflects an edit.
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
To push a build by hand, `npx wrangler deploy` with `CLOUDFLARE_API_TOKEN` in
the environment.

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
nothing it measures depends on the Workers asset layer, and `wrangler dev` does
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

### Projects Listed

`src/data/work.ts` (`nyuchiProjects`) is the single source of truth for the ecosystem
grid on `/` — The Bundu Foundation, Mzizi, Nyuchi Africa, Nyuchi StationKit, Nyuchi
Learning, Nyuchi Lingo, Mukoko, Mukoko Weather, Mukoko News, Nhimbe, Shamwari AI,
Zimbabwe Travel Info and Iconic Expeditions. Add new ecosystem projects there — the
homepage section-head text describes the Foundation/pillar relationship in general
terms rather than naming each project, so it should not need to change alongside it.

The grid is grouped rather than one flat run of thirteen tiles: `foundation`,
`pillars`, `commons`, `community`, `travel`, in that order, from the `group` field
on each project. A new project needs a group, and its Chinese in the same record.

### Internal Tools (Not Listed on the Website)

- **Workspace Tools** — Gmail signature management for Google Workspace (9 brands)

### Role Title

The site uses "Technology & Innovation Coordinator" throughout, matching the JSON-LD
in `BaseLayout.astro` and the experience data. Note that the About section above says
"Associate Technology & Innovation Coordinator" — if that is the correct current title,
update `src/data/profile.ts` and `src/data/experience.ts` together.

## Tech Stack Across Nyuchi Projects

For context, the broader ecosystem uses:

- **Frontend:** Astro, TypeScript
- **Backend:** Hono on Cloudflare Workers
- **Database:** Supabase PostgreSQL
- **Storage:** Cloudflare R2
- **AI:** DeepSeek via Cloudflare AI Gateway
- **Payments:** Stripe
- **Deployment:** Cloudflare Workers
- **Design system:** Mzizi (mzizi.dev)
