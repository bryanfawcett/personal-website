/**
 * Compile `tools/components-wasm` to the committed WebAssembly module Astro imports.
 *
 *   node scripts/build-rust-wasm.mjs           write src/integrations/rust/pkg/ and components.d.ts
 *   node scripts/build-rust-wasm.mjs --check   fail if the Rust source changed since the last build
 *
 * Cloudflare's build image has no Rust, so the module and its glue are committed, as the
 * fragments are. Needs: rustup (the pinned toolchain and the wasm32 target come from
 * rust-toolchain.toml), `wasm-bindgen` CLI at the version pinned in the crate's Cargo.toml,
 * and `wasm-opt` (binaryen).
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = join(root, 'tools/Cargo.toml');
const outDir = join(root, 'src/integrations/rust');
const check = process.argv.includes('--check');

/**
 * A hash of everything the module is compiled from. The check compares this stamp instead of
 * rebuilding: compiled bytes depend on the host's rustc, wasm-bindgen and binaryen, so a laptop
 * and a CI runner never agree byte for byte, and CI would need the whole toolchain. The stamp
 * proves the module was rebuilt after the last source change, which is what drifts in practice.
 */
function sourceHash() {
  const files = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'target') walk(p); } else files.push(p);
    }
  };
  walk(join(root, 'tools/components-wasm'));
  walk(join(root, 'tools/components/src'));
  files.push(join(root, 'tools/components/Cargo.toml'), join(root, 'src/data/generated/site.json'),
    join(root, 'src/data/generated/ui.json'), join(root, 'rust-toolchain.toml'));
  const h = createHash('sha256');
  for (const f of files.sort()) h.update(f.slice(root.length)).update('\0').update(readFileSync(f));
  return h.digest('hex');
}
const stampFile = join(outDir, 'SOURCE.sha256');

if (check) {
  const ok = existsSync(stampFile) && readFileSync(stampFile, 'utf8').trim() === sourceHash()
    && existsSync(join(outDir, 'pkg/components_wasm_bg.wasm'));
  if (!ok) {
    console.error('the Rust source changed since the WebAssembly was built; run `pnpm rust:wasm` and commit');
    process.exit(1);
  }
  console.log('rust wasm is up to date');
  process.exit(0);
}

/** Run a command; stdout is returned, stderr passes through, a failure is fatal. */
function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...opts });
  if (r.error?.code === 'ENOENT') {
    console.error(`${cmd}: not found. See the header of scripts/build-rust-wasm.mjs for what to install.`);
    process.exit(2);
  }
  if (r.status !== 0) process.exit(r.status ?? 1);
  return r.stdout;
}

// Paths baked into a panic message would differ between machines; remap them so a build
// on a laptop and a build in CI produce the same bytes.
const home = process.env.HOME ?? '';
const rustflags = [
  `--remap-path-prefix=${root}=/repo`,
  home && `--remap-path-prefix=${home}=/home`,
].filter(Boolean).join(' ');
const env = { ...process.env, RUSTFLAGS: rustflags };

const staging = mkdtempSync(join(tmpdir(), 'rust-wasm-'));
try {
  run('cargo', ['build', '-q', '--manifest-path', manifest, '-p', 'components-wasm', '--lib',
    '--profile', 'wasm', '--target', 'wasm32-unknown-unknown'], { env });
  const raw = join(root, 'tools/target/wasm32-unknown-unknown/wasm/components_wasm.wasm');

  const pkg = join(staging, 'pkg');
  run('wasm-bindgen', ['--target', 'web', '--out-dir', pkg, '--out-name', 'components_wasm', raw]);
  const wasm = join(pkg, 'components_wasm_bg.wasm');
  run('wasm-opt', ['-Oz', '--enable-bulk-memory', '--enable-nontrapping-float-to-int', '-o', wasm, wasm]);

  const typings = run('cargo', ['run', '-q', '--manifest-path', manifest, '-p', 'components-wasm', '--bin', 'typings']);
  writeFileSync(join(staging, 'components.d.ts'), typings);

  {
    mkdirSync(join(outDir, 'pkg'), { recursive: true });
    cpSync(pkg, join(outDir, 'pkg'), { recursive: true });
    cpSync(join(staging, 'components.d.ts'), join(outDir, 'components.d.ts'));
    const bytes = readFileSync(join(outDir, 'pkg/components_wasm_bg.wasm')).length;
    writeFileSync(stampFile, sourceHash() + '\n');
    console.log(`wrote src/integrations/rust/pkg (${(bytes / 1024).toFixed(1)} kB wasm)`);
  }
} finally {
  rmSync(staging, { recursive: true, force: true });
}
