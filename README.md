# bryanfawcett.com

Personal site for Bryan Fawcett — Technology & Innovation Coordinator at Singapore
American School, founder of Nyuchi Africa.

**Astro 7 · TypeScript · Cloudflare Workers · Mzizi branding · dark only.**

## Quick reference

```bash
pnpm dev        # dev server at localhost:4321
pnpm check      # astro check (TypeScript, under `strictest`)
pnpm build      # production build to dist/
pnpm preview    # run the built site in workerd via wrangler
pnpm deploy     # build and deploy the Worker
```

**Requirements:** Node.js 22.12+ (Astro 7's floor), pnpm 10+.

## Architecture

The site is fully prerendered and served from an assets-only Cloudflare Worker —
there is no `main` script in `wrangler.jsonc` because no route needs a server.
`@astrojs/cloudflare` emits the deployable tree to `dist/client`; `dist/server`
stays empty while every route is static. Add one non-prerendered route and the
adapter starts populating it, at which point `wrangler.jsonc` needs a `main`.

This repo is the main site. Satellite properties — the Origins presentation, and
whatever comes next — are their own Workers with their own repos, sharing this
branding layer rather than this codebase.

```
src/
  brand/          Design tokens. The single source of truth for the look.
    minerals.ts   The seven Mzizi minerals, with origin and meaning.
    tokens.ts     Surfaces, ink, lines, semantics, type, radii → CSS custom properties.
  components/     Astro components. No client framework anywhere.
  data/           Content as typed TypeScript, so pages stay markup.
  layouts/        BaseLayout — head, JSON-LD, nav, footer, scroll reveal.
  pages/          One file per route.
  styles/
    fonts.css     Generated. Self-hosted @font-face rules.
    global.css    Reset, layout primitives, shared utilities.
scripts/
  fetch-fonts.py  Regenerates fonts.css and public/fonts.
  verify-fonts.py Fails CI if fonts.css references a file that isn't vendored.
```

## Branding

Colour, surfaces and semantics come from the [Mzizi design system](https://mzizi.dev):
seven minerals named for where they are mined and what they stand for, plus a warm
dark ramp. Mirrored into `src/brand/` rather than fetched at build time, so a build
never depends on a network call and the two can only drift when someone edits the file.

The typographic identity stays the site's own — Dancing Script wordmark, Noto Serif
headings, Poppins body — with JetBrains Mono for eyebrow labels and metadata. Noto
Serif and JetBrains Mono are shared with Mzizi; the display and body faces are what
make this site look like this site rather than any other property in the ecosystem.

The **mineral bar** is the brand signature: seven segments, one per mineral, pinned
across the top of every page and repeated above the footer. It is the one place
colour appears at full strength on an otherwise monochrome site, which is what stops
it reading as decoration.

Everything else uses colour as a reward rather than a default — a card's edge on
hover, a timeline node, a link. To change the whole palette, edit `src/brand/`;
nothing downstream hard-codes a hex value.

### Dark only

There is no light ramp and no theme toggle, by design. `color-scheme: dark` is
declared so form controls and scrollbars follow.

## Fonts

Self-hosted. `scripts/fetch-fonts.py` downloads the Latin and Latin Extended subsets
into `public/fonts/` and regenerates `src/styles/fonts.css`. Latin Extended matters
here because the content carries African names and place-names with diacritics.

Several families are variable fonts where Google serves one file per subset covering
every weight — `scripts/verify-fonts.py` runs in CI to catch CSS that references a
file which was never downloaded.

Re-run after changing the type stack in `src/brand/tokens.ts`:

```bash
python3 scripts/fetch-fonts.py
```

## Deployment

Push to `main`. CI type-checks and builds; the Worker deploys via `pnpm deploy`.

## Conventions

- **Everything is Astro and TypeScript.** No React, no client framework. The only
  client JavaScript is the scroll-reveal observer and the deferred Cal.com loader.
- **`astro check` runs under `strictest`** and must stay at zero errors.
- **Content lives in `src/data/`,** typed, so pages stay markup and copy edits do
  not mean touching layout.
- **No hard-coded colours** outside `src/brand/`. Use the custom properties.
- **44px minimum touch targets** on anything interactive.
- **Third-party scripts load on request,** never on page load.

## Commit prefixes

`feat:` · `fix:` · `chore:` · `docs:` · `refactor:`
