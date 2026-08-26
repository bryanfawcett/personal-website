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
```

**Requirements:** Node.js 22.12+ (Astro 7's floor), pnpm 10+.

## Project Overview

bryanfawcett.com, built with:

- **Astro 7** — no client framework, no React
- **TypeScript 6** under `astro/tsconfigs/strictest`
- **Cloudflare Workers** via `@astrojs/cloudflare`
- **Mzizi design system** for colour, surfaces and semantics
- **Dark only** — no light ramp, no theme toggle

TypeScript is pinned to 6.x because `@astrojs/check` peers on `^5 || ^6`; TypeScript 7
is published but not yet supported by the Astro tooling.

## Directory Structure

```
src/
  brand/          Design tokens — the single source of truth for the look
    minerals.ts   The seven Mzizi minerals, with origin and meaning
    tokens.ts     Surfaces, ink, lines, semantics, type, radii → CSS custom properties
  components/     Astro components
  data/           Content as typed TypeScript
  layouts/        BaseLayout — head, JSON-LD, nav, footer, scroll reveal
  pages/          One file per route
  styles/         fonts.css (generated), global.css
scripts/          fetch-fonts.py, verify-fonts.py
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
properties at build time; use `var(--mineral-cobalt)`, `var(--surface)`, `var(--muted)`.
`MineralName` is a union type derived from the mineral list, so a typo in a component
prop fails `astro check`.

The **mineral bar** is the brand signature — seven segments, one per mineral, across
the top of every page and above the footer. It is the one place colour runs at full
strength. Everywhere else colour is a reward (a hover edge, a timeline node), not a
default. That restraint is the design; adding colour to more surfaces breaks it.

### Content lives in `src/data/`

Typed, so pages stay markup. A copy edit should never mean touching layout.

### Type identity

Dancing Script wordmark, Noto Serif headings, Poppins body, JetBrains Mono for eyebrow
labels and metadata. Noto Serif and JetBrains Mono are shared with Mzizi; the display
and body faces are what distinguish this site from the rest of the ecosystem. Mzizi's
own sans is Noto Sans — deliberately not used here.

### Fonts are self-hosted

`public/fonts/` plus generated `src/styles/fonts.css`. No request to fonts.googleapis.com.
Regenerate with `python3 scripts/fetch-fonts.py` after changing the type stack.

Several families are variable fonts where Google serves one file per subset covering
every weight — key generated filenames off the URL, not the weight, or the CSS ends up
referencing files that were never downloaded. `scripts/verify-fonts.py` guards this in CI.

## Accessibility Requirements

- **44px minimum** on every interactive target
- **Semantic HTML** — real `section`/`nav`/`header`/`footer`, correct heading order,
  exactly one `h1` per page
- **`aria-labelledby`** on every section, pointing at its heading
- **Focus rings** are cobalt at 2px with 2px offset; never remove them
- **`prefers-reduced-motion`** disables reveals, the mineral bar animation and smooth
  scrolling — already handled in `global.css`, keep it that way for new animation
- Decorative elements (the mineral bar, timeline nodes) are `aria-hidden`

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

## Git Workflow

### Commit Prefixes

`feat:` · `fix:` · `chore:` · `docs:` · `refactor:`

### CI (every push and PR)

1. `pnpm check` — TypeScript under `strictest`
2. `pnpm build` — production build
3. `scripts/verify-fonts.py` — every font reference resolves
4. `pnpm audit --audit-level high`

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

- **Frontend:** Astro, Next.js, React, Tailwind CSS
- **Backend:** Hono on Cloudflare Workers
- **Database:** Supabase PostgreSQL
- **Storage:** Cloudflare R2
- **AI:** DeepSeek via Cloudflare AI Gateway
- **Payments:** Stripe
- **Deployment:** Cloudflare Workers
- **Design system:** Mzizi (mzizi.dev)
