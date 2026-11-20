The canonical navigation: Site, Ecosystem and Connect, the copyright line, the title block ("Drawn by B.D.F. · Sheet 01 / 06 · Rev A") and the seven mineral dots, under a 3px strip of the seven minerals. Its markup is the Mzizi registry's `mzizi-footer` contract, written without a framework.

**You provide** the language, the sheet number and the year; the links, strings and ecosystem list come from the site's data.

**Variants**

| Variant | Use when |
|---|---|
| Footer | The foot of every page. |

**States**

| State | How it looks and behaves |
|---|---|
| Link default | `ink` text, 44px target. |
| Link hover / focus | Hover underlines; focus draws the `ring`. |
| Disabled / loading | Not applicable. |

**Accessibility.** `<footer role="contentinfo">` with one `nav` per section, each labelled by its title. The mineral strip and dots are `aria-hidden`. Links to other sites open with `rel="noopener noreferrer"`.

**Do.** Keep the strip and dots as `<span data-mineral>`, coloured by `--mineral`.

**Don't.** Colour the strip or dots with an inline style, or add a fourth section.

**Tokens.** `ink`, `ink-soft`, `ink-hair`, `sheet`, `label`, `mineral-<name>`.
