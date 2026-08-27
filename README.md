# bryanfawcett.com

Personal site for Bryan Fawcett — Associate Technology & Innovation Coordinator at
Singapore American School, founder and CEO of Nyuchi Africa, founder of The Bundu
Foundation.

**Astro 7 · TypeScript · Cloudflare Workers · Mzizi branding · dark only.**

The site is a cyanotype, but a print rather than a wash: a near-black ground with
a blue cast, line work in white. The containers are drawn in the same line
vocabulary as the ground — column rules down the measure, section rules with a
node at each crossing, corner brackets that close into a full rule on hover.
Nothing is a card, and nothing sits on the page edge but the mineral rail.

## Quick reference

```bash
pnpm dev        # dev server at localhost:4321
pnpm check      # astro check (TypeScript, under `strictest`)
pnpm build      # production build to dist/
pnpm preview    # run the built site in workerd via wrangler
pnpm deploy     # build and deploy the Worker
pnpm og         # re-render the social card (only after the portrait changes)
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
  assets/           bryan-fawcett.png — the portrait, resized by sharp at build.
  brand/            Design tokens. The single source of truth for the look.
    contrast.ts     WCAG 2.2 ratios, so /minerals prints measured numbers.
    minerals.ts     The seven Mzizi minerals, with origin and meaning.
    tokens.ts       Sheet, ground, ink, measure, marks, type → CSS custom properties.
    transitions.ts  The unroll animation used between pages.
    vcard.ts        The contact card, as vCard 3.0 and as a QR.
  components/       Astro components. No client framework anywhere.
  data/             Content as typed TypeScript, English with its Chinese beside it.
  i18n/
    ui.ts           Chrome strings, en and zh, checked against each other.
    routing.ts      /experience ⇄ /zh/experience, and the hreflang set.
    localize.ts     Bilingual<T, K> — a record plus its translated fields.
  sanity/           The blog's read side.
    client.ts       Unauthenticated GROQ against the public dataset.
    queries.ts      Every query the blog runs, in one place.
    image.ts        Sanity CDN URLs, hand-rolled and pinned by a check.
    portable-text.ts  Body → the site's own markup.
  layouts/          BaseLayout — head, JSON-LD, nav, title block, scroll reveal.
  pages/            Wrappers: one per route per language. zh/ holds the Chinese.
                    Plus bryan-fawcett.vcf.ts.
  views/            The sheets themselves. One per route, rendering either language.
bryans-adventures/  The blog's Sanity Studio. React — and not part of this build.
  styles/
    fonts.css       Generated. Self-hosted @font-face rules.
    global.css      Reset, layout primitives, shared utilities.
scripts/
  fetch-fonts.py    Regenerates fonts.css and public/fonts.
  verify-fonts.py   Fails CI if fonts.css references a file that isn't vendored.
  build-og-card.mjs Renders the social card. Run by hand, not in the build.
```

## Branding

Colour, surfaces and semantics come from the [Mzizi design system](https://mzizi.dev):
seven minerals named for where they are mined and what they stand for, plus a warm
dark ramp. Mirrored into `src/brand/` rather than fetched at build time, so a build
never depends on a network call and the two can only drift when someone edits the file.

The typographic identity is a draughtsman's: Cormorant Garamond for display and body,
IBM Plex Mono for figure tags, dimension labels and the title block, and Caveat for
the margin notes and the signature — written marks rather than set ones.

The **mineral rail** is the brand signature: seven segments, one per mineral, running
vertically down the binding edge of the sheet. It is the one place saturated colour
appears on an otherwise monochrome cyanotype, which is what stops it reading as
decoration.

Everything else uses colour as a reward rather than a default — a card's edge on
hover, a timeline node, a link. To change the whole palette, edit `src/brand/`;
nothing downstream hard-codes a hex value.

### The ground travels with the sheet

The ground layers are `position: absolute` over the document, not `fixed` to the
viewport. A fixed ground slides underneath the content as you scroll, which is
the one thing paper never does.

Two consequences worth knowing before editing them: the lighting radials are
sized `100% 140vh` and pinned top and bottom, because a radial sized as a
percentage of a 6000px document is a flat tint rather than a fall of light; and
the fall-off is on the left and right edges only, because an inset shadow on all
four reads as a band every screenful once the ground moves.

### Pages unroll

`ClientRouter` with the `unroll` animation in `src/brand/transitions.ts`: the
outgoing sheet rolls away, the incoming one unrolls. Two things this constrains:

- Anything that initialises on load must bind to `astro:page-load`. The router
  swaps the document without a reload, so a one-shot script only ever sees the
  first page.
- `prefers-reduced-motion` has to name the view-transition pseudo-elements
  explicitly. A blanket `*` rule never matches `::view-transition-old(root)`.

### Dark only

There is no light ramp and no theme toggle, by design. `color-scheme: dark` is
declared so form controls and scrollbars follow.

On a cyanotype the ruling is *lighter* than the ground, so the layer blend modes
matter: the grid uses `plus-lighter` and the paper grain uses `soft-light`.
`multiply` — correct on paper — makes both disappear here.

`src/brand/minerals.ts` carries each mineral twice: `hex` is the value this site
draws in, `onLight` is Mzizi's paper-readable value, kept so the same file can
serve a light property (StationKit, bundu.org) without a second source of truth.

## The mineral rail, and `/minerals`

The rail is the brand signature and, until recently, nothing said what it was.
`/minerals` is the key: the seven stones, where each is mined, what it stands
for, and what it is used for.

Every contrast ratio on that page is computed at build time by
`src/brand/contrast.ts` from the same tokens the rail draws with, so the page
cannot drift from the rail. All seven clear AAA against the ground, well past
the 3:1 that WCAG 2.2 SC 1.4.11 asks of a non-text mark — which is what they
are here. Colour never carries meaning alone: the rail is `aria-hidden`, each
segment names itself on hover, and that page is the text alternative.

Mzizi ships its own accessibility tooling — contrast against its APCA and AAA
floors plus colour-vision simulation, in the toolkit at
[mzizi.dev](https://mzizi.dev) and over its MCP server — so an agent building
against the system can verify a pairing before shipping it.

## The contact card

`ContactCard.astro` carries the portrait, the particulars and a QR. The QR holds
the **whole vCard**, not a link to one, so scanning it saves the contact with no
network — the case that matters standing in a room at a conference.
`/bryan-fawcett.vcf` is a prerendered static endpoint serving the same card.

vCard 3.0 rather than 4.0: both mobile platforms read 3.0 without complaint, and
older Android scanners still choke on 4.0's `KIND` and typed URLs. Lines are
escaped and folded per RFC 6350 §3.4 — an unfolded long line is the usual reason
a card imports with a truncated title on one platform but not another.

The QR sits on its own opaque ground. A code over the blueprint ruling is a code
a phone will not lock onto. Verify changes by decoding a real screen capture,
not by eye.

## Two languages

English at the root, Chinese under `/zh`, using Astro's own i18n routing with
`prefixDefaultLocale: false` — so every English URL is exactly where it always
was and nothing redirects. Every route exists in both, which is what lets the
switcher point at the current page's counterpart rather than the home page.
Each page declares the pair as `hreflang` alternates plus an `x-default`.

No CJK webfont is vendored. The three families the site ships are Latin and
Latin Extended only, and a Han subset would cost several megabytes against a
sub-megabyte total — a bad trade on the connections much of this ecosystem is
built for. Han falls to the reader's own system face, with the Latin face listed
first in the stack so a proper noun inside a Chinese sentence still sets in
Cormorant. A `size-adjust: 120%` fallback face raises the small mono labels,
where 10px Han stops separating its strokes and 10px Latin caps do not.

## The blog

`/adventures` is *Bryan's Adventures*, written in Sanity and rendered on demand
rather than at build time. Publishing a post puts it live without a rebuild,
which matters because Cloudflare's Workers Builds only triggers on a git push —
there is no deploy hook a CMS webhook could pull.

The dataset is public-read, so the Worker queries it with no token: the project
id and dataset are constants, not environment variables, and there is nothing
about the blog to configure in Cloudflare. Everything else on the site is still
prerendered and served straight from static assets.

Translations are document-level, handled by
`@sanity/document-internationalization`. A Chinese adventure is its own
document, and the pairing lives in a `translation.metadata` document rather
than a field on either side — so a post can exist in English alone, which is
the normal case, and the Studio gets a Translations menu for making the other.
The Chinese list shows every adventure either way, translated where a
translation exists and marked `仅有英文` where it does not.

The Studio lives in `bryans-adventures/` — the folder is the Studio, not a
wrapper around one. It keeps its own dependencies and is not part of this build.

## Accessibility

Audited with axe-core (WCAG 2.0/2.1/2.2 A + AA, plus best-practice) across all
sixteen routes — nine English, seven Chinese — at 1280x900 and 390x844:
**0 violations**.

axe cannot resolve contrast against the gradient ground, so two further passes
run independently:

- **Contrast** — composites every text-bearing element over the real painted
  ground. Lowest is 9.7:1 against a 4.5:1 requirement.
- **Readability** — per text block: composited contrast, rendered size, leading,
  and characters per line from the real line boxes. Prose is ≥16px at ≥1.5
  leading, labels ≥10px, measure 33–65 characters.

Line length is a token (`--measure`) rather than a guess, because Cormorant runs
about 6.8px per character: a 44rem column that looked right was carrying 87
characters a line.

Also verified: 2px focus rings on every stop, `prefers-reduced-motion` disabling
the rail animation, the reveals and the page transition, and reflow at 320px with
no horizontal scroll.

Two inline links sit under 24x24 — WCAG 2.2 target size (2.5.8) exempts targets
inside a sentence, which these are. Every standalone control carries 44px.

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

**Live at https://bryanfawcett.com** (and `www.`), served by the
`bryanfawcett-site` Worker in the Nyuchi Web Services account
(`125a2dfbc21f76a25c980609609e8218`). Both hostnames are Worker Custom Domains
on the `bryanfawcett.com` zone, so Cloudflare manages their DNS records
directly — you will see a proxied `AAAA 100::` placeholder for each rather than
anything you can edit.

Cloudflare's GitHub app handles deploys. The repo has no deploy workflow of its
own on purpose: two things deploying the same Worker only race each other.

To push a build by hand:

```bash
CLOUDFLARE_API_TOKEN=… npx wrangler deploy
```

### Routing

`build.format: 'file'` in `astro.config.mjs` emits `minerals.html` rather than
`minerals/index.html`. With the directory format an assets-only Worker can only
serve that page at `/minerals/`, so every internal link — all of which are
written without a trailing slash — 307s before it resolves. No `html_handling`
value in `wrangler.jsonc` fixes that, because the file really does live at the
slashed path; the build format is what decides it.

### Vercel is switched off deliberately

The domain used to point at a Vercel deployment of the old Next.js app. The apex
`A` record and the `www` `CNAME` were replaced by the Worker Custom Domains
above; the old values are in this repo's history if a rollback is ever needed.

The repo is also still Git-connected to the `bryanfawcett-portfolio` Vercel
project. That app no longer exists here, so every push failed that deployment.
`vercel.json` sets `git.deploymentEnabled: false` to stop Vercel building a
project it can no longer build. Disconnecting the Git integration in the Vercel
dashboard would be tidier, but that is a dashboard setting rather than something
the repo can control.

## Conventions

- **Everything is Astro and TypeScript.** No React, no client framework. The only
  client JavaScript is the scroll-reveal observer and the deferred Cal.com loader.
- **`astro check` runs under `strictest`** and must stay at zero errors.
- **Content lives in `src/data/`,** typed, so pages stay markup and copy edits do
  not mean touching layout.
- **No hard-coded colours** outside `src/brand/`. Use the custom properties.
- **44px minimum touch targets** on anything interactive.
- **Third-party scripts load on request,** never on page load.
- **Line length comes from `--measure`,** never from a hand-picked `max-width`.
  Set it by running the readability pass and reading the number.
- **Nothing on the page edge but the mineral rail.** There used to be a sheet
  frame with ruler graduations. It went, and it should not come back.
- **Test on-demand routes the way a browser asks for them** — with
  `Sec-Fetch-Mode: navigate`. The asset layer answers differently without it.
- **A page is never written twice.** The files under `src/pages/` are wrappers;
  the markup lives once in `src/views/` and renders in either language.
- **Proper nouns are never translated.** Nyuchi, Mukoko, Bundu, Shamwari, Mzizi,
  Nhimbe and the school names stay in Latin script in both, with a short Chinese
  gloss in parentheses where a reader needs one.

## Commit prefixes

`feat:` · `fix:` · `chore:` · `docs:` · `refactor:`
