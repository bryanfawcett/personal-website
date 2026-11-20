A card that links to somewhere else: the same panel, plus a mono `Visit` line and a mineral rule under the heading that rules itself longer on hover.

**You provide** a heading, a sentence, an `href` and a `data-mineral`. It opens in a new tab with `rel="noopener noreferrer"`.

**Variants**

| Variant | Use when |
|---|---|
| Link | The ecosystem grid, where each tile names a project and points at its own site. |
| Static (`link-panel--static`) | A project with nothing public to visit (a private repository): a plain tile with no link, no `Visit` line and no hover answer. |

**States**

| State | How it looks and behaves |
|---|---|
| Default | Panel surface, 2rem mineral rule under the heading, mono `Visit`. |
| Hover | The wash deepens to `sheet-raised` and the mineral rule lengthens to 3.5rem. Not a lift. |
| Focus | The `ring`; the rule lengthens as on hover. |
| Static | Does not respond to the pointer at all. |

**Accessibility.** The whole card is one link, named by its heading. Link only to public pages; a link to a 404 is worse than no link.

**Do.** Link to the project's own site or a public repository.

**Don't.** Lift the card, add a shadow, or link a tile to a private repository.

**Tokens.** `sheet-wash`, `sheet-raised`, `mineral-weight`, `ink-soft`, `label`, `radius-lg`.
