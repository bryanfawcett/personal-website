One row of a colour key: an index, the mineral as a 4px swatch bar stood on end, the name in `ink` with its meaning, origin and use, and the hex with its measured contrast on the ground.

**You provide** a `data-mineral`, a name and the definition list. Every figure is computed from the same tokens the swatch is drawn with, so the page cannot drift from the palette.

**Variants**

| Variant | Use when |
|---|---|
| Rows | A set that has an origin, a meaning and a use: the seven minerals and the heritage tones. |
| Compact (`key--compact`) | A set with a colour and a name and nothing else: the experimental seven. |

**States**

| State | How it looks and behaves |
|---|---|
| Default | Panel surface; swatch bar in the mineral; name in `ink`; hex and `AAA`/`AA` grade in mono. |
| Hover / focus / disabled | Not interactive. |

**Accessibility.** The swatch is `aria-hidden`; the name and figures carry the information. Contrast is printed so the colour is judged by number, not by eye.

**Do.** Print the contrast figure and grade next to every swatch.

**Don't.** Print a mineral's name in its own colour: sodalite measures Lc 24.6 as lettering.

**Tokens.** `mineral-<name>`, `ink`, `ink-soft`, `label`, `mineral-weight`, `radius-lg`.
