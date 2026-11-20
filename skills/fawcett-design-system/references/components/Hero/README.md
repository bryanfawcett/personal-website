The home page opener: the drafted two-word lockup (the first word solid, the second outlined), a one-line proposition, two actions, a byline and a margin note.

**You provide** two words (`solid`, `drafted`), an `eyebrow`, a `sub` line, a `note` and the action buttons.

**Variants**

| Variant | Use when |
|---|---|
| Hero | The home page only. A page has one hero, and its action is the only 56px button. |

**States**

| State | How it looks and behaves |
|---|---|
| Default | Uppercase display lockup at `display-xl`; the second word is stroked in `ink` and filled `ink-drafted`. |
| Actions | Follow Button: primary at the hero size, ghost beside it. |

**Accessibility.** The lockup is one `h1` split into two spans. The outline uses `-webkit-text-stroke` behind an `@supports` guard, so a browser without it shows solid text, never invisible text.

**Do.** Show the work, not an adjective; keep to one proposition.

**Don't.** Use `color: transparent` without the `@supports` guard, or add a second hero elsewhere.

**Tokens.** `ink`, `ink-drafted`, `display-xl`, `lede`, `pencil`, `brand`.
