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

### Nyuchi Africa Ecosystem (Passion Project)

Bryan founded Nyuchi Africa, building digital solutions for African communities under the Ubuntu philosophy ("I am because we are").

| Platform | URL | Description |
|----------|-----|-------------|
| **Nyuchi Africa** | nyuchi.com | Community-focused business platform for African entrepreneurship |
| **Nyuchi Learning** | learning.nyuchi.com | Open-source K-12 digital transformation frameworks for African schools |
| **Nyuchi Lingo** | lingo.nyuchi.com | Language learning platform for African languages |
| **Mukoko** | mukoko.com | Privacy-focused social platform with 6 apps (ID, Clips, Pulse, Connect, Novels, Events) |
| **Mukoko News** | news.mukoko.com | Pan-African news aggregation from trusted regional sources |
| **Nhimbe** | nhimbe.com | Community events and gatherings platform (part of Mukoko ecosystem) |
| **Zimbabwe Travel Info** | travel-info.co.zw | Comprehensive travel guide for Zimbabwe |
| **Iconic Expeditions** | iconic-expeditions.com | Luxury bespoke safaris across Southern and Eastern Africa |
| **Workspace Tools** | (internal) | Gmail signature management for Google Workspace |

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
```

**Requirements:** Node.js 22.12+ (Astro 7's floor), pnpm 10+.

## Project Overview

bryanfawcett.com, built with:

- **Astro 7** — no client framework, no React
- **TypeScript 6** under `astro/tsconfigs/strictest`
- **Cloudflare Workers** via `@astrojs/cloudflare`
- **Mzizi design system** for colour, surfaces and semantics
- **Dark only** — no light ramp, no theme toggle. The site is a cyanotype, but
  a print rather than a wash: near-black ground with a blue cast, line work in
  white. The ground is `#05090F`; the ink is `#F2F6FB`.
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
  data/           Content as typed TypeScript
  layouts/        BaseLayout — head, JSON-LD, nav, footer, scroll reveal
  pages/          One file per route
  styles/         fonts.css (generated), global.css
scripts/          fetch-fonts.py, verify-fonts.py, build-og-card.mjs
public/fonts/     Self-hosted woff2, Latin + Latin Extended
```

## Architecture

The site is fully prerendered and served from an **assets-only Worker** — there is no
`main` in `wrangler.jsonc` because no route needs a server. `@astrojs/cloudflare` emits
to `dist/client`; `dist/server` stays empty while every route is static. Adding one
non-prerendered route changes that and `wrangler.jsonc` will need a `main`.

This repo is the main site. Satellite properties are their own Workers in their own
repos, sharing the branding layer rather than this codebase.

## Conventions

### Everything is Astro and TypeScript

No React, no client framework, no UI library. The only client JavaScript is the
scroll-reveal observer in `BaseLayout.astro` and the deferred Cal.com loader on
`/book`. Reach for a `<script>` in an `.astro` file before reaching for a dependency.

### Colour comes from `src/brand/`

Never hard-code a hex value outside `src/brand/`. `tokens.ts` generates CSS custom
properties at build time; use `var(--mineral-cobalt)`, `var(--sheet)`, `var(--ink-soft)`.
`MineralName` is a union type derived from the mineral list, so a typo in a component
prop fails `astro check`.

The **mineral rail** is the brand signature — seven segments, one per mineral, running
vertically down the binding edge of the sheet. It is the one place saturated colour
appears on an otherwise monochrome cyanotype. Everywhere else colour is a reward (a
mineral bar under a heading, a schedule reference number), not a default. That
restraint is the design; adding colour to more surfaces breaks it.

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

Cormorant is an unusually narrow face — about 6.8px per character at 18px — so
a column that *looks* right runs far past a comfortable line. A 37rem column
measured 87 characters. Anything holding running prose takes `--measure`
(33rem, ~77 characters); larger type takes `--measure-wide`. Set a new
max-width by running the readability pass and reading the number, never by eye.

### The portrait

`src/assets/bryan-fawcett.png` is the only raster on the site. It goes through
`astro:assets` with `imageService: 'compile'`, so sharp resizes it at build
time — 1470 kB of source becomes four WebP variants, the largest 24 kB. Keep it
in `src/assets/`, not `public/`: a file in `public/` is copied verbatim.

`Portrait.astro` frames it like every other container — hairline, corner
brackets, ruled caption — and desaturates it halfway, enough to belong to the
drawing without the face going muddy.

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

### Type identity

Cormorant Garamond for display and body, IBM Plex Mono for figure tags, dimension
labels and the title block, Caveat for margin notes and the signature — written marks
rather than set ones. Cormorant's italic is load-bearing (the lede, the pull quotes),
so the vendoring script has to keep roman and italic as separate files.

### Fonts are self-hosted

`public/fonts/` plus generated `src/styles/fonts.css`. No request to fonts.googleapis.com.
Regenerate with `python3 scripts/fetch-fonts.py` after changing the type stack.

Several families are variable fonts where Google serves one file per subset covering
every weight — key generated filenames off the URL, not the weight, or the CSS ends up
referencing files that were never downloaded. `scripts/verify-fonts.py` guards this in CI.

## Accessibility Requirements

- **44px minimum** on every interactive target, except links inside a sentence,
  which WCAG 2.2 target size (2.5.8) exempts and which 44px would visibly break
- **10px floor** on label text — mono uppercase below that is needless work to read
- **Semantic HTML** — real `section`/`nav`/`header`/`footer`, correct heading order,
  exactly one `h1` per page
- **`aria-labelledby`** on every section, pointing at its heading
- **Focus rings** are the stamp red at 2px with 3px offset; never remove them.
  6.5:1 against the sheet, well over the 3:1 that WCAG 2.2 (1.4.11) asks of them
- **`prefers-reduced-motion`** disables reveals, the mineral rail animation and smooth
  scrolling — already handled in `global.css`, keep it that way for new animation
- Decorative elements (the rail, the sheet layers, the schematics) are `aria-hidden`

## Common Pitfalls

1. **Astro scopes styles to the template.** Elements created at runtime by a
   `<script>` do not match a scoped selector — use `:global()` for those rules.
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
4. `pnpm audit --audit-level high`

Accessibility is checked with axe-core (WCAG 2.2 AA + best-practice), plus two
passes axe cannot do:

- **Contrast** — composites text over the painted ground. axe reports a
  gradient parent as `incomplete` rather than testing it.
- **Readability** — for every text block: composited contrast, rendered size,
  leading, and characters per line taken from the real line boxes. Targets are
  ≥16px and ≥1.5 leading for prose, ≥10px for mono uppercase labels, and 45–85
  characters. Count lines as `height / line-height`: `getClientRects()` merges
  adjacent line boxes in Chromium and under-reports, which inflates
  chars-per-line by the same factor.

All three must stay clean.

## Content Notes

### Projects Listed

The Nyuchi Africa Ecosystem section includes Nyuchi Africa, Nyuchi Learning, Nyuchi
Lingo, Mukoko, Mukoko News, Nhimbe, Zimbabwe Travel Info and Iconic Expeditions.

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
