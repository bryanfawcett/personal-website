# Rust components, natively in Astro (spike)

```astro
---
import Hero from 'rust:hero';
---
<Hero solid="Digital" drafted="Craftsman" eyebrow="…" lang={lang} showByline>
  <a class="btn" href={book}>Book a call</a>
</Hero>
```

`rust:hero` is a Rust component (`tools/components/src/hero.rs`, a plain function returning
maud `Markup`) used like any Astro component: typed props, a real default slot, no fragment
file, no `%PLACEHOLDER%`, no `fill`/`splitSlot`. `Hero` is the one component converted here.
`Hero.astro` is deleted and so is any fragment for it.

## How it works

```
tools/components            maud components (unchanged API; `canon`/scraper is now an optional feature)
tools/components-wasm       cdylib: render(name, props_json, slot_html) + props structs (serde + ts-rs)
        │  scripts/build-rust-wasm.mjs  (cargo → wasm-bindgen --target web → wasm-opt -Oz)
        ▼
src/integrations/rust/pkg/  components_wasm.js + components_wasm_bg.wasm   (committed)
src/integrations/rust/components.d.ts                                       (generated, committed)
src/integrations/rust/index.ts   Astro integration: one Vite plugin
```

- The plugin turns every `rust:<name>` import into an Astro component made with
  `createComponent`. It renders the default slot to a string (`renderSlotToString`), calls
  `render(name, JSON.stringify(props), slot)` in the wasm module and returns the HTML unescaped.
- A `rust:runtime` virtual module imports the `.wasm` (an import, not a fetch: workerd forbids
  compiling wasm at runtime) and calls `initSync` once per isolate.
- The site data the components read (`site.json`, `ui.json`) is `include_str!`-ed into the module,
  because a Worker has no filesystem. `Site::from_json` is the new constructor; `Site::load` (disk)
  stays for the native binaries.
- Typed props: `HeroProps` is a serde struct with `#[derive(TS)]`; the `typings` bin prints a
  `declare module 'rust:hero'` block, so `astro check` type-checks the call site from the Rust.
- The integration is generic: `rust({ glue, wasm })` takes the two paths and nothing else. It does
  not know which components exist; the crate decides, and an unknown name is a render-time error.

## What was verified

| Requirement | Result |
|---|---|
| `astro dev` | Works (on-demand probe route rendered with slot, `zh`, byline, note, and no-slot variants). |
| `astro build` | Works; home and `/zh` use the wasm during prerender. |
| Inside workerd, on-demand route | A temporary on-demand page (`prerender = false`, under `/adventures/`) using two `<Hero>` calls built, emitted the module as a `type: "wasm"` entry in the bundle manifest (`_astro/components_wasm_bg.<hash>.wasm`) and returned 200 with `Sec-Fetch-Mode: navigate` from `astro preview` (the built output in workerd) and from `astro dev`. The probe was removed afterwards. Not tested: an actual Cloudflare deploy, and `cf dev` itself. |
| No Rust on Cloudflare | Module, glue and `.d.ts` are committed. `pnpm rust:wasm` regenerates, `pnpm rust:wasm:check` fails if stale (rebuilds and compares bytes; it also catches a changed `site.json`/`ui.json`). Wired into CI. |
| Output identical | `pnpm verify:components:rs` (canonical-HTML parity) passes: hero on `/` and `/zh`, 276 components, 12/12 footers. A raw comparison against a build of `main` (old `Hero.astro`) differs by exactly one character: the Rust hero emits a space between the two `<span>`s of the `h1`, which the Astro one dropped. Both spans are `display: block`, so nothing changes on screen; the h1 text now reads "Digital Craftsman" rather than "DigitalCraftsman". The design-system skill's Hero preview was regenerated for that one space. |
| Size | 156.8 kB wasm (Rust 1.100.0, profile `wasm`: opt-level z, LTO, codegen-units 1, panic abort, then `wasm-opt -Oz`); about 68 kB gzip, 57 kB brotli. About 43 kB of that is the embedded site data. Glue is 10 kB. |
| `pnpm check` | 0 errors. |

### Where the wasm ends up

Only where an on-demand route uses a Rust component. `Hero` is on the prerendered home page only,
so **today the Worker bundle contains no wasm at all**; prerender runs it at build time. The Worker
would first carry the module when the header and footer (used by the blog routes) are converted; that
is the case the probe stood in for, and it is the next thing to confirm for real.

## What does not work yet (honest list)

- **Slots are strings, default slot only.** Named slots (`<Fragment slot="x">`) are not passed; they
  could be, as a `{name: html}` map. A component cannot render a slot twice or conditionally inside
  Rust-owned structure beyond "here is the HTML".
- **Props are JSON.** Functions, class instances and `Date`s do not cross. Fine for content
  components; a limit for anything handing callbacks in.
- **Rust edits are not hot-reloaded.** Run `pnpm rust:wasm` after changing Rust; Vite then reloads.
  A `cargo watch`-style hook would be a small addition to the integration.
- **Reproducibility is verified on one machine** (two builds, same bytes). Linux CI producing the same
  bytes is the assumption behind `--check`; paths are remapped (`--remap-path-prefix`) to help, but
  the CI job is unrun. If it flakes, check a hash of the Rust sources and data instead.
- **Tool pins are not in a lockfile.** `wasm-bindgen` is pinned in `Cargo.toml` (`=0.2.130`) and must
  match the CLI exactly; `wasm-opt` (binaryen) was version 133 locally and is unpinned.
- `astro build` runs no Rust; only the committed output is used. Forgetting `pnpm rust:wasm` is
  caught by CI, not by the build.
- `Astro.slots.has('default')` semantics are approximated by "a default slot function was passed".
- The Rust `Hero` is still the old, non-fragment one in `tools/components`; the fragment wiring for
  Hero in `feat/rust-fragments-2` is superseded by this and can be dropped when that PR is reconciled.

## Adding the next component

1. Write (or already have) the component in `tools/components/src/<name>.rs`.
2. Add `tools/components-wasm/src/<name>.rs` with a `#[derive(Deserialize, TS)]` props struct
   (`#[serde(rename_all = "camelCase")]`, `Option<T>` + `#[ts(optional)]` for optional props),
   `props_type()` and `render(call: Call) -> Result<String, String>` (see `hero.rs`).
3. Add `mod <name>;` and one line `"<name>" => <name>,` to `registry!` in `components-wasm/src/lib.rs`.
4. `pnpm rust:wasm`, then `import X from 'rust:<name>'`. Delete the `.astro` original and any fragments.
5. Add its parity case to `tools/components/src/bin/parity.rs` if it is not there.

Components that depend on the route (header, footer) take the route as a prop (`path`), which
replaces the per-route fragment files and their `%SWITCH%`/`%SHEET%`/`%YEAR%` placeholders with
ordinary props. That conversion is the real prize and is not attempted here.

## Publishing as a reusable package

Nothing site-specific is in the integration; what is site-specific is the crate. Split into:

- `@mzizi/astro-rust` (npm): `src/integrations/rust/index.ts`, built to JS, with `rust({ glue, wasm })`.
  It depends on `astro` as a peer.
- A crate template (`components-wasm`'s `lib.rs` macro, `LangProp`, `Call`) as a Rust crate, e.g.
  `mzizi-astro` on crates.io, so a project's wasm crate only writes props structs and a `registry!`.
- The build script as a bin of that package (`astro-rust build|check --crate <path> --out <dir>`),
  taking the data files to embed as arguments rather than the hard-coded `site.json`/`ui.json`.

## Plugging into Mzizi's toolchain

What the registry (via the `mzizi_*` tools) says today:

- Mzizi already writes this as a design direction: for its infrastructure components, "Astro renders
  the HTML on the server (natively at build time, or as WASM in the Cloudflare Worker during SSR),
  and WASM goes to the browser only for behaviour ... Static components ship zero WASM". This
  integration is that for the build-time and Worker-SSR half. Release 4.0.39 declares "Rust WASM for
  all non-UI nodes".
- Roots crates exist (`mzizi-ui`, `mzizi-brand`, `mzizi-shell`, `mzizi-discovery`) with Rust APIs such as
  `MziziAvatarStack` / `StatusBadge` and props structs, alongside Astro and React builds under one contract.
- I found nothing in the registry describing a CLI that builds Roots to wasm or wires them into Astro
  (the search tools surface components, conventions and releases, not the CLI). So I cannot say what
  the Mzizi CLI already provides or whether it overlaps; that needs someone with the CLI docs.

How it would plug in, if it does not already exist: a Roots crate's `Props` structs get `TS` derives,
a `registry!` over `mzizi-ui`/`mzizi-brand` components compiles to one wasm module, and
`mzizi add <component> --target astro-rust` (or the CLI's existing add flow) writes the `rust:<name>`
import and the generated `components.d.ts`, replacing the Astro twin that today ships beside the
Rust build. The contract (`data-slot`, tokens) is already shared, so the Rust build can stand in for
the `.astro` build under the same contract.
