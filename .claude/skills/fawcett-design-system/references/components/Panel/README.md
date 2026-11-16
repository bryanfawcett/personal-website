A hairline-bordered card at `radius-lg` on `sheet-wash`, with an ink heading and the card's mineral as a rule under it.

**You provide** a heading (`h3`, `card-title`), a paragraph (`card-body`, `ink-body`) and a `data-mineral` naming one of the 21 families. Put cards in a grid (`.aptitudes`, `.work-list`, `.questions`: `repeat(auto-fit, minmax(16rem, 1fr))`, gap `space-3`).

**Variants**

| Variant | Use when |
|---|---|
| Card (default) | Every card: aptitudes, work items, questions, journey stops. |
| Link card | See LinkPanel. |
| Framed (`.panel__rule`) | Only for something that frames something larger, such as an embedded deck or a portrait. Brackets are opt-in, never the default. |

**States**

| State | How it looks and behaves |
|---|---|
| Default | `sheet-wash` fill, 1px `ink-hair` border, padding `space-5` by `space-6`. |
| Hover | The hairline strengthens to `ink-faint`. A framed panel also closes its brackets into the full rule. |
| Focus | Only when it is a link: the `ring`. |
| Disabled / loading | Not applicable: a card is a surface, not a control. |

**Accessibility.** Use the right element: `li` inside a list, `article` for a standalone card, `a` for a link card. The mineral is decoration; never the only way to tell cards apart.

**Do.** Let the mineral appear only as the rule under the heading (`mineral-weight`, 3px); keep radius at `radius-lg`.

**Don't.** Set text in a mineral colour (raw minerals fail APCA as lettering), put a thick bar down the left edge, add a shadow or lift on hover, or draw corner brackets on an ordinary card.

**Tokens.** `sheet-wash`, `ink-hair`, `ink-faint`, `ink`, `ink-body`, `mineral-weight`, `radius-lg`, `space-3`, `space-5`, `space-6`.
