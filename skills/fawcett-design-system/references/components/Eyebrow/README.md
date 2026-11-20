The mono line above a section title: `eyebrow` (JetBrains Mono, 600, uppercase, `0.28em` tracking), in `ink-soft`, with a hairline rule running out from it.

**You provide** the text. Keep it short and uppercase-friendly. The Chinese pages scale it through a gloss-sized face automatically.

**Variants**

| Variant | Use when |
|---|---|
| Eyebrow | Names where a section sits ("Sheet 05 · The heritage seven"), as a figure tag does on a drawing. |
| Margin note | A handwritten aside in `pencil`, set at a slight angle, pinned in a margin. |

**States**

| State | How it looks and behaves |
|---|---|
| Default | `ink-soft` mono label with a running rule. |
| Hover / focus / disabled | Not interactive. |

**Accessibility.** It is a label, not a heading: the title beneath it is the `h2`. Do not put it inside the heading.

**Do.** Keep the weight at 600 and the size at `label-lg`.

**Don't.** Drop the weight to 400 (the size and weight are one decision) or set it in a mineral colour.

**Tokens.** `ink-soft`, `ink-faint`, `label-lg`, `label-weight`, `pencil`, `hand`.
