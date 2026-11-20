A pill that links to the *current page* in the other language, so the reader lands on its counterpart, not the home page. The label is the other language's name in its own script (`中文`, `English`).

**You provide** the current language and the page's language-neutral path; a page whose translation has its own slug passes where to go.

**Variants**

| Variant | Use when |
|---|---|
| Link | Always: it is a link, not a toggle that reloads in place. |

**States**

| State | How it looks and behaves |
|---|---|
| Default | Hairline pill with the label in `ink`, set in the chrome face (`--cjk-chrome`) so English pages never fetch a Chinese font. |
| Hover | Border draws in `ink`. |
| Focus | The `ring`. |
| Disabled / loading | Not applicable. |

**Accessibility.** Carries `hreflang` and `lang` for the target. A page with no translation falls back to the other language's list page, and its `hreflang` alternate is omitted.

**Do.** Point at the real counterpart page.

**Don't.** Send the reader to the home page, or list an `hreflang` alternate for a page that is not a translation.

**Tokens.** `ink`, `ink-hair`, `radius-full`, `label`, `cjk-chrome`.
