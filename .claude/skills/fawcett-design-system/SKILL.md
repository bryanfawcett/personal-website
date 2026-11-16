---
name: fawcett-design-system
description: Use when building or restyling UI for any Bryan Fawcett, Nyuchi, Bundu, Mukoko or Mzizi property, or any repo that should share the bryanfawcett.com look (the drafted sheet, the 21 Mzizi colour families keyed with data-mineral, Noto Serif/Sans and JetBrains Mono, light and dark). Provides the tokens, fonts, the site's component stylesheet, documented components with every state, the rules (minerals are marks not text, cards are hairlines, buttons are pills, no shadows), and a script that adopts all of it into another repo.
---

# Bryan Fawcett design system

The look of bryanfawcett.com, packaged so another repo can adopt it and adapt it. It is the Mzizi and Bundu standard as that site implements it: a drafted sheet, light and dark following the device, colour carried by minerals.

## What is here

| Path | What |
|---|---|
| `references/brand-book.md` | The rules: content fundamentals, visual foundations, iconography. **Read first.** |
| `references/tokens.json` | Every token with a usage note, light and dark (62 colours, spacing, radius, marks, the type scale). |
| `references/components/<Name>/README.md` | One per component: variants, states, accessibility, do and don't, tokens used. |
| `references/components/<Name>/preview.html` | A live preview of each component in every state, from the markup the site ships. |
| `assets/tokens.css` | Self-contained CSS custom properties, light and dark, plus `data-mineral` keying for all 21 families. |
| `assets/fonts.css`, `assets/fonts/` | The self-hosted faces (Noto Serif, Noto Sans, JetBrains Mono, Caveat) and the OFL licence. |
| `assets/components.css` | The site's own component stylesheet. Adapt it; do not reinvent it. |
| `scripts/adopt.sh <repo>` | Copy the assets into another repo and print what to link. |
| `scripts/install.sh` | Install this skill for Claude Code (user or project). |

Components: Button, Panel, LinkPanel, Eyebrow, PullQuote, PaletteKey, Journey, Header, LanguageSwitcher, SkipLink, PageHeader, Hero, Portrait, ContactCard, WorkshopStrip, Schematics, Footer.

## Adopting it in a new repo

1. Run `scripts/adopt.sh <path-to-repo> [dir]`. It copies `tokens.css`, `fonts.css`, `fonts/` and `components.css` to `<dir>` (default `src/design`).
2. Load them in this order, before the project's own CSS: `tokens.css`, `fonts.css`, `components.css`.
3. Set `data-mineral="<name>"` on anything that carries a mineral; the stylesheet turns it into `--mineral`. Never write an inline style to colour something.
4. Add a theme switch if the project needs one: set `data-theme="light"` or `"dark"` on `<html>`; with none set, the device preference applies.
5. Build the page from the components in `references/components/`: copy the markup from a preview, not from memory.
6. Run an APCA check over the rendered pages in both themes before shipping. The system's whole accessibility case rests on it.

## The rules that matter most

- **A raw mineral is never the colour of text.** The word is `ink`; the mineral is the 3px rule under it or the swatch beside it. This holds on hover too.
- **One primary colour:** `brand` (heritage river). Do not add a second accent.
- **Cards are hairlines.** `radius-lg`, `ink-hair`, heading in `ink`, mineral as the rule under it. No thick left bar, no shadow, no lift, no corner brackets unless the panel frames something larger.
- **Buttons, the skip link, toggles and the control bar are pills** (`radius-full`). 48px tall; 56px once per page.
- **Mono labels are `label` at weight 600.** Dropping to 400 fails APCA.
- **Prose fills its container** (`--measure` is 100%).
- **Every interactive target is at least 44px**, and focus is a 2px `ring` with a 2px offset, never removed.
- **Spacing is the `--space-N` scale.** Hardcode a value only when it should look deliberately off the scale.
- **Link only to public pages.**

## Adapting it to a different brand

Change, in this order: `brand` and `on-brand` (check APCA at the button size), the display and sans families, the mineral subset (keep the keying mechanism), the content fundamentals in `brand-book.md`. Keep: the surface ladder, the hairline and pill language, the state model (hover draws the ring, focus ring, disabled neutral, loading ring), the rule that a mineral is a mark, and the contrast gate. A property that changes the palette should say so plainly: it is a derivative of the standard, not the standard.

## Keeping it current

The source of truth is the bryanfawcett.com repository. `pnpm build && pnpm design-system` regenerates this folder from `src/brand/tokens.ts`, `palette.ts`, `minerals.ts`, `src/styles/global.css` and the built pages, so a token or component change flows here by regeneration, never by hand. The same generator can also write the Claude design-system artifact (`--artifact DIR`).
