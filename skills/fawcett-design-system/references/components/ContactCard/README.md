The contact card: the portrait, the particulars, and a QR that opens the 30-minute booking page, because booking is the one action the site asks for. A "Download .vcf" link sits beneath it.

**You provide** the language, an optional portrait width and `eager` for above-the-fold use. The QR is rendered to SVG at build time.

**Variants**

| Variant | Use when |
|---|---|
| Dark QR | Light ink on Mzizi's cobalt container: an inverted code the iOS Camera and Google Lens read. |
| Light QR | The light ink on white: a conventional code every scanner reads. One of the two is shown per theme (`--show-dark-only`, `--show-light-only`). |

**States**

| State | How it looks and behaves |
|---|---|
| Default | Panel surface with portrait, name, roles, email and the QR. |
| Download link | Hover underlines; focus draws the `ring`. |
| Disabled / loading | Not applicable. |

**Accessibility.** The QR is decorative to assistive tech and the booking link is also a plain link. The vCard stays English in both languages: one canonical record.

**Do.** Re-verify any change to the QR by decoding a real screen capture.

**Don't.** Put the QR over the blueprint ruling (a phone will not lock onto it) or make the vCard differ by language.

**Tokens.** `sheet-wash`, `ink`, `ink-soft`, `radius-lg`, `mineral-cobalt-container`.
