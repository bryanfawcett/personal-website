# EmDash policy plugins

Three publish-time policy plugins for [EmDash](https://emdashcms.com), and the dependency-free
core they share. Written to be adopted by other sites (Nyuchi's, anything built on Mzizi): nothing
in here knows about bryanfawcett.com, and no package is tied to this repository's paths beyond a
relative import of `core` that the build step resolves.

| Package | What it stops | Capabilities |
|---|---|---|
| [`core`](core/README.md) | nothing by itself: pure rule functions and the language-neutral test vectors | none |
| [`a11y-policy`](a11y-policy/README.md) | publishing images without alt text, wrong headings, vague link text | `hooks.content-policy:register` |
| [`link-policy`](link-policy/README.md) | publishing links that are not web, mail, phone, on-site paths or fragments | `hooks.content-policy:register` |
| [`translation-policy`](translation-policy/README.md) | publishing a translation with no published source entry, or a clashing slug | `hooks.content-policy:register`, `content:read` |

This is **not a pnpm workspace** (the repo deliberately has no workspace file). Each package has its
own `package.json` and is `"private": true`. Licence and publisher are TODOs for the owner.

## How they are built

A sandboxed plugin cannot import repository code, so `core` is **bundled into each plugin** by
`build.mjs` (esbuild). One source, no copy to drift. `dist/plugin.mjs` is committed because
Cloudflare's build does not run this step; `pnpm plugins:check` fails when a bundle is stale.

```bash
pnpm plugins:build     # rebuild dist/ for all three
pnpm plugins:check     # CI: committed bundles match the source
pnpm test:plugins      # core vectors, then the BUILT plugins against the same vectors
```

`core` is written in TypeScript with no dependencies and no build of its own: Node 22.18+ runs it as
is (`--experimental-strip-types` before that), and the bundler compiles it into the plugins.

## Registering

```js
// astro.config.mjs
import { a11yPolicy } from './packages/emdash-plugins/a11y-policy/src/index.ts';
import { linkPolicy } from './packages/emdash-plugins/link-policy/src/index.ts';
import { translationPolicy } from './packages/emdash-plugins/translation-policy/src/index.ts';

emdash({ /* ... */ plugins: [a11yPolicy(), linkPolicy(), translationPolicy()] });
```

They are `format: "standard"` plugins, which EmDash accepts in either `plugins: []` (in process) or
`sandboxed: []` (an isolate, which needs `sandboxRunner: sandbox()` and a Worker Loader binding on
Cloudflare). Capabilities are enforced in both. Move them to `sandboxed` when that binding exists.

## Why sandboxed and not native (link-policy included)

The spike assumed a link policy had to be a native plugin so that it could import the site's own
`classifyLink`. With the shared bundle that is no longer true: the rule is compiled into the plugin, so
it needs only `hooks.content-policy:register` and nothing else. A native plugin runs with the site's
full authority and cannot be published to the registry; sandboxed is the smaller grant and the portable
form. The site's render-time check (`src/blog/portable-text.ts`) imports the same `core`, so publish and
render share one rule.

## Becoming Mzizi N4 registry components

Mzizi's registry ships components with a Rust (Roots) implementation as the lead. What each piece
needs, in order of effort:

1. **The rules (`core`) are the contract.** `core/vectors/*.json` are language-neutral: an `input` and the
   exact `expected` findings (rule id, severity, path and message). A Rust crate is "equivalent" when it
   passes every vector unchanged; port `classifyLink`/`linkProblem`, `checkAccessibility`, `checkLinks`,
   `checkTranslations`, `hreflangAlternates` and `formatReason`. The regex classes are simple (`regex`
   and `url` crates); the only judgement call is that `\s` is Unicode in both engines. Add vectors, not
   prose, when a rule changes.
2. **The EmDash adapters are the part that stays TypeScript.** `plugin.ts` is ~20 lines per plugin. A
   registry entry would ship the crate (rules) plus the TypeScript shell, or compile the crate to WASM and
   call it from the shell (this repo already does that for its components, see `src/integrations/rust`).
3. **Registry metadata** still to be written by the owner: licence, publisher identity (the
   `emdash-plugin.jsonc` placeholders), a component manifest, accessible-name and message-language
   conventions (messages are English; a `zh` message table is the obvious next vector set).
4. **Doctrine fit.** The findings are plain, specific and say how to fix, never a bare code; the rules
   refuse rather than rewrite content; capabilities are the minimum. Those are the properties to keep
   when porting.
