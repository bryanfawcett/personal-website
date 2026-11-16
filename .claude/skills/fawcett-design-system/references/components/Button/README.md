The action: a pill, 48px tall (56px for a page's one hero action), filled `brand` with `on-brand` text at 700. A ghost variant sits beside it for the quieter second choice.

**You provide** a label that says what happens ("Book a call") and an `href` for a link or a `type="button"` for an action. Add `is-ghost` for the secondary.

**Variants**

| Variant | Use when |
|---|---|
| Primary | The one action a page asks of its visitor. |
| Ghost (`is-ghost`) | A second, quieter choice next to the primary, or a back/see-more action. |
| Hero size | The single most important action on a page: 56px. |

**States**

| State | How it looks and behaves |
|---|---|
| Default | `brand` fill, `on-brand` text, border in `brand`. Ghost: transparent, `ink-soft` border, `ink` text. |
| Hover | The border draws in `ink`. Ghost also fills `sheet-raised`. No tint, no lift, no shadow. |
| Focus | The `ring` outline: 2px, 2px offset. Never removed. |
| Active | Pressed: the fill darkens toward `ink` and the border is `ink`. Ghost fills `sheet-wash-light`. |
| Disabled | Use the `disabled` attribute (or `aria-disabled="true"` on a link). Neutral `sheet-wash-light` fill, `ink-soft` label, no pointer response. |
| Loading | Set `aria-busy="true"`. The button keeps its size, stops taking clicks and shows a ring beside the label. The ring stops under reduced motion. |

**Accessibility.** Use a real `<button>` or `<a>`. Targets are at least 44px. Say what is happening in the label while loading ("Booking"), and announce completion in a live region you provide.

**Do.** Keep one primary per view; use the hero size once; keep the radius `radius-full`.

**Don't.** Add a drop shadow, lift the button on hover, change the weight below 700 (dark text on river asks 15px at 700 but 16.5px at 600), or add a second accent colour.

**Tokens.** `brand`, `on-brand`, `ink`, `ink-soft`, `sheet-raised`, `sheet-wash-light`, `ink-hair`, `ring`, `radius-full`, `space-6`, `space-2`.
