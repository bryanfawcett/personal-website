The title block that opens every page except the home page: an eyebrow, the page title in `title` (uppercase `display`, 700), a lede, and an optional margin note.

**You provide** an `eyebrow`, a `title`, a `lede`, an optional `note` and, in the slot, optional actions.

**Variants**

| Variant | Use when |
|---|---|
| Page header | Every inner page. One per page, and it carries the page's only `h1`. |

**States**

| State | How it looks and behaves |
|---|---|
| Default | Title in `ink` at `title`; lede in `ink-body`, filling its container. |
| Hover / focus / disabled | Not interactive; actions in the slot follow Button. |

**Accessibility.** The title is the page's single `h1`. Heading order must not skip: sections beneath start at `h2`.

**Do.** Keep the title short and uppercase-friendly.

**Don't.** Add a second `h1`, or set the lede narrower than its container (text fills its column).

**Tokens.** `ink`, `ink-body`, `title`, `lede`, `eyebrow`, `margin-note`.
