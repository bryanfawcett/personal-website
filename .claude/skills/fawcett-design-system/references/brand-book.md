The Bryan Fawcett design system is the look of bryanfawcett.com: a drafted sheet in the Mzizi and Bundu standard, light and dark following the device. It is a showcase for that standard, so it uses the standard's names (`--mineral-<name>`, `--radius-<name>`, `--ring`) and does not invent colours.

## Content fundamentals

- **Write in the first person, plainly.** "I craft dynamic ecosystems that unite and empower communities." Short, direct sentences. Show the work; never claim an adjective.
- **Never frame the work around AI.** No "AI-powered". An AI product is named once, as a pillar, and nothing more.
- **No number without proof.** Print a figure only where a live site states it today. Leave out counts, client names and quotes until they exist.
- **Name things by what people recognise.** A project is its own name ("Mukoko Weather"); say who it is for before how it is built.
- **Proper nouns are never translated.** Nyuchi, Mukoko, Bundu, Shamwari, Mzizi and the school names stay in Latin script in both languages, with a short Chinese gloss in parentheses where a reader needs the handhold ("The Bundu Foundation（本都基金会）").
- **Attribute precisely.** Mzizi, the open standards, the Weather Commons and the Zimbabwe Information Platform are Bundu Foundation work; Nyuchi Africa operates some of them; Mukoko is its own pillar. Do not call Bundu work Nyuchi's.
- **Say exactly what a button does.** "Book a call", then the call is free and thirty minutes.
- **Link only to public pages.** A tile for something private is a plain tile; mention it by name, do not link it.

## Visual foundations

**Ground.** The page is `sheet`; cards and panels sit one step up on `sheet-wash`; inset chips take `sheet-wash-light`; menus and the control bar take `sheet-raised`. The step between `sheet` and `sheet-wash` is small, so panels carry a `ink-hair` hairline. The ground is matte and neutral, with a faint blueprint grid in `rule-minor` and `rule-major` that travels with the sheet and is never painted behind text.

**One primary colour.** `brand` (heritage river) fills the primary button and underlines links, with `on-brand` text at weight 700. Do not mix it with a second accent. Colour lives in the minerals.

**Minerals.** There are 21 families in three sets: the seven minerals (cobalt, tanzanite, malachite, gold, terracotta, sodalite, copper), the seven heritage tones (indigo, savanna, baobab, sunset, river, hematite, kalahari) and seven experimental families. Key anything to one with `data-mineral="<name>"`; the stylesheet sets `--mineral`. A mineral is a mark: a 3px rule (`mineral-weight`) under a heading, a swatch bar beside a word, a dot. **A raw mineral is never the colour of text**, because set on the ground the seven measure Lc 25–48 as lettering. The word is `ink`; the mineral goes under it or beside it. The same holds on hover: a link underlines in its mineral, it does not turn that colour. Surfaces themed in a mineral use `--mineral-container` with `--mineral-on-container` text.

**Type.** Noto Serif (`display`) for H1 to H3 and the big lockups; Noto Sans (`sans`) for everything people read; JetBrains Mono (`mono`) for labels, figure tags and the title block; Caveat (`hand`) only for margin notes and the signature. Mono labels are `label` at `label-weight`, 15px at 600: size and weight trade against each other in APCA, so dropping to 400 is a regression. Prose fills its container (`measure` is 100%).

**Radius and lines.** Cards and panels take `radius-lg` (14px) with a 1px `ink-hair` border. Buttons, the skip link, toggles and the control bar are always pills (`radius-full`). Buttons are 48px tall (56px for a page's one hero action). Use rings and rules, never shadows: no drop shadows, no lift on hover. Hover on a card strengthens its hairline to `ink-faint`.

**Cards.** The card is the aptitude card: a grid of panels, the heading in `ink`, the mineral as a rule under it, padding `space-5` by `space-6`. There is no thick bar down the left edge of a card. A pull quote is the only place a mineral rule runs down an edge. Corner brackets are opt-in for something that frames something larger.

**Space.** Use `space-1` to `space-10` (4px to 64px); a value off the scale should look deliberately off it. Padding and gaps are never `1.1rem`.

**States.** Every interactive component has a default, hover, focus, active, disabled and loading state where they apply. Hover draws the ink ring or deepens the surface; focus is a 2px `ring` with a 2px offset and is never removed; disabled uses the `disabled` attribute and a neutral surface; loading is `aria-busy="true"` and a ring beside the label. None of them lifts a control or adds a shadow. Every interactive target is at least 44px, except a link inside a sentence.

**Motion.** Small and honest: a hairline strengthens, a mineral rule lengthens, a page unrolls. Everything respects `prefers-reduced-motion`.

**Contrast.** Every text block clears APCA for its size and weight in both themes. Opacity on a block of words multiplies against the ground and is not allowed.

## Iconography

There is no icon set. Arrows are the glyphs `←` and `→`; a status is a word. Marks are minerals: a rule, a swatch bar, a dot. Do not add emoji or a third-party icon font. The site has no logo: the name is set in `display`.

## Components

`Button`, `Panel`, `LinkPanel`, `Eyebrow`, `PullQuote`, `PaletteKey`, `Journey`, `Header`, `LanguageSwitcher`, `SkipLink`, `PageHeader`, `Hero`, `Portrait`, `ContactCard`, `WorkshopStrip`, `Schematics` and `Footer`. Each has a README (variants, states, accessibility, do and don't, tokens) and a live preview taken from the markup the site ships. Their styles are the site's own stylesheet in `components/bundle.css`.
