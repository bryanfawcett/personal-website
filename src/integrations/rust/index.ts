/**
 * Rust components, natively: `import Hero from 'rust:hero'` in any `.astro` file, used like
 * any other component, with real props and a real default slot.
 *
 * Generic and package-shaped: nothing here names this site. Point it at a wasm-bindgen
 * `--target web` build of any crate that exports `render(name, propsJson, slotHtml)` and every
 * name that crate registers becomes a `rust:<name>` import. The component set and the props
 * types come from the crate (see `tools/components-wasm`), not from this file.
 *
 * The one piece of glue is a Vite plugin: each `rust:<name>` specifier becomes an Astro
 * component whose render calls the module. There is no fragment file, no placeholder, no `fill`.
 * Props cross as JSON and the default slot as already-rendered HTML, which keeps the wasm API
 * to one function; the costs (no named slots, JSON-only props) are in docs/native-rust-in-astro.md.
 */
import { resolve } from 'node:path';
import type { AstroIntegration } from 'astro';

export interface RustOptions {
  /** The wasm-bindgen glue (`--target web`), relative to the project root. */
  glue: string;
  /** The module itself (`*_bg.wasm`), relative to the project root. */
  wasm: string;
}

const PREFIX = 'rust:';
const VIRTUAL = '\0rust:';
const RUNTIME = '\0rust-runtime';

function rustComponents(opts: RustOptions, root: string) {
  const glue = resolve(root, opts.glue);
  const wasm = resolve(root, opts.wasm);
  return {
    name: 'astro-rust-components',
    enforce: 'pre' as const,
    resolveId(id: string) {
      if (id === `${PREFIX}runtime`) return RUNTIME;
      return id.startsWith(PREFIX) ? VIRTUAL + id.slice(PREFIX.length) : null;
    },
    load(id: string) {
      // `.wasm` is imported, not fetched or compiled from bytes: Workers forbid compiling
      // WebAssembly at runtime, and an import is how workerd (and Vite's prerender) hands
      // over a ready module.
      if (id === RUNTIME) {
        return `
import wasm from ${JSON.stringify(wasm)};
import { initSync, render } from ${JSON.stringify(glue)};
initSync({ module: wasm });
export function renderRust(name, props, slot) {
  return render(name, JSON.stringify(props ?? {}), slot);
}
`;
      }
      if (!id.startsWith(VIRTUAL)) return null;
      const name = id.slice(VIRTUAL.length);
      return `
import { createComponent, render, renderSlotToString, unescapeHTML } from 'astro/runtime/server/index.js';
import { renderRust } from 'rust:runtime';

export default createComponent(async (result, props, slots) => {
  const slot = slots && slots.default ? String(await renderSlotToString(result, slots.default)) : undefined;
  return render\`\${unescapeHTML(renderRust(${JSON.stringify(name)}, props, slot))}\`;
});
`;
    },
  };
}

export default function rust(opts: RustOptions): AstroIntegration {
  return {
    name: 'astro-rust',
    hooks: {
      'astro:config:setup': ({ updateConfig, config }) => {
        updateConfig({ vite: { plugins: [rustComponents(opts, config.root.pathname)] } });
      },
    },
  };
}
