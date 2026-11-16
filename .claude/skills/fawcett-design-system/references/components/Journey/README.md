An ordered list of stops, each one a dated place and a role, keyed to its own mineral: used for a career path or any sequence where the order matters.

**You provide** a list of stops with a period, a place, a role and a detail, each with a `data-mineral`.

**Variants**

| Variant | Use when |
|---|---|
| Journey | Only where the order is information the reader needs. |

**States**

| State | How it looks and behaves |
|---|---|
| Default | Each stop: a mono period and place with the mineral as a rule, then the role in `display` and the detail. |
| Hover / focus / disabled | Not interactive. |

**Accessibility.** An `ol`, so the order is announced. The period and place read as the stop's first line.

**Do.** Use it for a real sequence.

**Don't.** Number things that are not a sequence.

**Tokens.** `ink`, `ink-body`, `ink-soft`, `mineral-weight`, `label`, `display`.
