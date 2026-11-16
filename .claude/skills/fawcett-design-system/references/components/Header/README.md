The sticky header, laid out as Nyuchi Learning's: a portrait and serif name, text links in the middle, the language switcher, a ghost theme toggle and the "Book a Call" pill. 64px, 80px from 64rem. Its markup is the Mzizi registry's `mzizi-header` contract without a framework.

**You provide** the language and the current route. The links, strings and portrait come from the site's data.

**Variants**

| Variant | Use when |
|---|---|
| Desktop | Brand, links, language switcher, theme toggle and CTA in one bar. |
| Phone (below 56rem) | The bar keeps brand, toggle and pill; the links drop to a second row that scrolls sideways, ending in the language switcher. Never a hamburger: every destination stays one tap away. The name hides below 22.5rem. |

**States**

| State | How it looks and behaves |
|---|---|
| Link default | `ink-soft`, 44px target. |
| Link hover | Underlines in `ink`. |
| Link current | `is-current` with `aria-current="page"`: underlined in `brand`. |
| Link focus | The `ring`. |
| Theme toggle | Shows the sun or moon (`--show-light-only`, `--show-dark-only`); stores an explicit choice in `localStorage("theme")`, applied as `data-theme` before first paint. |
| Disabled / loading | Not applicable. |

**Accessibility.** `<header>` landmark, `nav` with an `aria-label`, a skip link before it, `aria-current="page"` on the current link, the toggle labelled and `aria-pressed`. Every target is at least 44px.

**Do.** Keep every destination visible and one tap away on a phone.

**Don't.** Hide the navigation behind a menu, shrink targets below 44px, or add a second accent.

**Tokens.** `sheet`, `ink`, `ink-soft`, `ink-hair`, `brand`, `radius-full`, `space-3`, `space-5`.
