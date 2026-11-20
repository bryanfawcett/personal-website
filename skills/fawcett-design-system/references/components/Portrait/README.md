The portrait as a framed plate: a hairline, corner brackets and a ruled caption, desaturated halfway so the face belongs to the drawing.

**You provide** a width and an optional caption. The image goes through `astro:assets` on prerendered pages; anything shared by the nav or the footer uses a plain `<img>` instead.

**Variants**

| Variant | Use when |
|---|---|
| Plate | The one place the corner brackets are part of the default treatment, because it frames a photograph. |

**States**

| State | How it looks and behaves |
|---|---|
| Default | Image at 50% saturation inside the bracketed frame, caption in the mono label. |
| Hover / focus / disabled | Not interactive. |

**Accessibility.** The image carries meaningful `alt`. The brackets are `aria-hidden`.

**Do.** Use one portrait per page.

**Don't.** Use `<Image>` from `astro:assets` in anything the on-demand blog routes render: it resolves to an endpoint that does not exist there.

**Tokens.** `ink`, `ink-hair`, `radius-lg`, `label`.
