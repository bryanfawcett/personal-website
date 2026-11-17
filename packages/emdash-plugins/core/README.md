# emdash-policy-core

Pure, zero-dependency TypeScript rules over EmDash content: link safety, accessibility of Portable Text,
translation pairing. No I/O, no EmDash import, no Node API. Every function takes plain data and returns
plain data, so the same rules run in a sandboxed plugin, in site render code, in a test, or (ported) in Rust.

## Install

Not published (`"private": true`). Inside a repo, import it by path:

```ts
import { classifyLink, checkAccessibility } from './packages/emdash-plugins/core/src/index.ts';
```

To publish later: add a `license` (TODO for the owner), compile `src/` to JS with `tsc` or esbuild, point
`exports` at the output, and drop `"private": true`.

## Capabilities

None. It does nothing but compute.

## Findings

Every rule returns `{ rule, severity, path, message }`. `rule` is a stable id (`a11y.image-alt`), `path`
locates the problem (`body[3]`, `cover`, `slug`), and `message` is written for the editor.

| Rule | Message an editor sees (example) |
|---|---|
| `a11y.cover-alt` | The cover image has no alt text. Open the cover image and describe what it shows in a short sentence, for people who cannot see it. |
| `a11y.image-alt` | Block 2: this image has no alt text. Select the image and describe what it shows in a short sentence. |
| `a11y.heading-h1` | Block 1 (heading "Big"): the page title is already the only top-level heading. Change this to Heading (h2). |
| `a11y.heading-deep` | Block 3 (heading "C"): this site uses only Heading (h2) and Subheading (h3) inside a post. Change it to one of those. |
| `a11y.heading-start` | Block 1 (heading "Sub"): the first heading in a post must be Heading (h2), not h3. Change it to h2. |
| `a11y.link-text-vague` | Block 1, link "click here": "click here" does not say where the link goes. Rewrite the link text to name its destination. |
| `a11y.link-text-url` | Block 1, link "https://example.org/a/b": a web address is read out letter by letter by screen readers. Replace the link text with words that say where it goes. |
| `a11y.link-text-empty` | Block 1: a link has no visible words. Select the words that describe where it goes and link those. |
| `link.scheme` | Block 1: the link address "javascript:alert(1)" is not allowed (only web, mail and phone links are). Use an https:// or http:// address, mailto: or tel:, a path starting with a single "/", or a "#section" anchor. |
| `link.protocol-relative` | Block 1: the link address "//evil.example" starts with "//", which can point to another site. Write the full https:// address instead. |
| `link.whitespace` | Block 1: the link address "/\evil.example" contains a space, backslash or hidden character. Remove it and paste the address again. |
| `link.empty` | Block 1: a link has no address. Add the address or remove the link. |
| `link.malformed` | Block 1: the link address "example" is not a valid address. (then the same advice as `link.scheme`) |
| `translation.orphan` | This is a "zh" entry but it is not linked to a "en" entry, so readers could never reach it from its original. Create it from the "en" entry's Translations panel (Add translation), or move its content into one made that way, then publish. |
| `translation.source-unpublished` | The "en" entry this translates is not published yet, so this "zh" entry would not appear in any list. Publish the "en" entry first, then publish this one. |
| `translation.slug-duplicate` | Another "en" entry already uses the address "a". Change this entry's slug to something unique before publishing. |

"Skipped heading level" is covered by two rules rather than a third: bodies may only use h2 and h3, so the
only ways to skip are starting at h3 (`heading-start`) or reaching h4 or deeper (`heading-deep`).

Vague link text (compared lower case, ignoring trailing punctuation) is the list in `VAGUE_LINK_TEXT`:
English ("click here", "here", "read more", "learn more", "link", ...) and Chinese ("点击这里", "阅读更多",
"了解更多", "详情", ...). A phrase that merely contains one ("read more about Mana Pools") is fine.

## Link rule

`classifyLink(href, { ownHosts })` returns `null` (refused) or `{ external }`. Allowed: `http:`, `https:`,
`mailto:`, `tel:`, a path starting with a single `/`, a `#fragment`, a `?query`. Refused: any other scheme
(`javascript:`, `data:`, `vbscript:`, `file:` ...), `//host`, a backslash, any space, control or zero-width
character anywhere (browsers drop tabs and newlines inside a URL, which turns `java<tab>script:` and
`/<tab>/evil.example` into something else), an empty or unparseable value. "This site" is an **exact**
hostname match against `ownHosts`; there is no prefix or suffix test, so `bryanfawcett.com.evil.example`
is external.

## Vectors

`vectors/*.json` hold `{ name, input, expected }` cases and nothing language-specific: `link`,
`accessibility`, `body-links`, `translation`, `hreflang`, `reason`. They include every hostile case from
this repo's original link-safety script plus more. `test/vectors.test.ts` runs them with `node --test` (no
framework); a Rust crate or any other port passes the same files.

```bash
node --experimental-strip-types --test test/vectors.test.ts
```

## Also exported

`formatReason(findings)` builds the single message EmDash shows on a refused publish, within the host's
500-code-point limit (it counts the problems, lists as many as fit, then says how many more). Warnings never
block. `hreflangAlternates(entry, siblings, defaultLocale)` returns alternates only for a published
translation in another locale, so an untranslated entry declares none.
