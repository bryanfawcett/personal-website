A pull quote: `display` at `pull-quote` size, weight 400, in `ink`, set off by a `mineral-weight` rule down its inside edge in the section's mineral.

**You provide** the sentence and a `data-mineral`.

**Variants**

| Variant | Use when |
|---|---|
| Pull quote | Once or twice on a long page, to land the sentence a section exists for. The one place the system uses a thick edge rule. |

**States**

| State | How it looks and behaves |
|---|---|
| Default | `ink` serif against a 3px mineral rule. |
| Hover / focus / disabled | Not interactive. |

**Accessibility.** Use a `<blockquote>`. If it quotes a person, cite them in the surrounding prose.

**Do.** Use it sparingly; match the rule to the section's mineral.

**Don't.** Use the same edge rule on a card (cards take the rule under the heading) or set the quote in a mineral colour.

**Tokens.** `ink`, `mineral-weight`, `display`, `space-6`.
