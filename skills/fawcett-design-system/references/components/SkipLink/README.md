A pill that is the first focusable element on every page and slides into view on focus, so a keyboard user can jump past the header.

**You provide** the label and the id of the main landmark.

**Variants**

| Variant | Use when |
|---|---|
| Skip link | Every page. |

**States**

| State | How it looks and behaves |
|---|---|
| Hidden | Translated off-screen, still in the tab order. |
| Focus | Slides into view with the `ring`. |

**Accessibility.** It must stay reachable: never `display: none`. Targets `#main`.

**Do.** Keep it first in the document.

**Don't.** Remove it, hide it with `display: none`, or leave it focused while measuring contrast: it would sit over the header.

**Tokens.** `sheet-raised`, `ink`, `radius-full`, `label-lg`, `ring`.
