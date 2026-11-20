Three faint line drawings laid over the ground, held to 9–13% opacity so they read as drawings and cost the text nothing.

**You provide** nothing: it is decorative and positions itself (`.schematics__1`, `__2`, `__3`).

**Variants**

| Variant | Use when |
|---|---|
| Schematics | The page ground, behind everything. |

**States**

| State | How it looks and behaves |
|---|---|
| Default | Absolute over the document (they travel with the sheet), in `ink`. |

**Accessibility.** The whole group is `aria-hidden` and `pointer-events: none`.

**Do.** Keep them behind content and under 13% opacity.

**Don't.** Raise their opacity or put text over a drawing without re-running the contrast gate.

**Tokens.** `ink`.
