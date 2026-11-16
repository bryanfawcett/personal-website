/**
 * Compile `tools/components-wasm` to the committed WebAssembly module Astro imports.
 *
 *   node scripts/build-rust-wasm.mjs           write src/integrations/rust/pkg/ and components.d.ts
 *   node scripts/build-rust-wasm.mjs --check   fail if what is committed is not what the Rust builds
 *
 * Cloudflare's build image has no Rust, so the module and its glue are committed, as the
 * fragments are. Needs: rustup (the pinned toolchain and the wasm32 target come from
 * rust-toolchain.toml), `wasm-bindgen` CLI at the version pinned in the crate's Cargo.toml,
 * and `wasm-opt` (binaryen).
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = join(root, 'tools/Cargo.toml');
const outDir = join(root, 'src/integrations/rust');
const check = process.argv.includes('--check');

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

  if (check) {
    const stale = [];
    for (const f of readdirSync(pkg)) {
      const mine = join(outDir, 'pkg', f);
      if (!existsSync(mine) || !readFileSync(mine).equals(readFileSync(join(pkg, f)))) stale.push(`pkg/${f}`);
    }
    const dts = join(outDir, 'components.d.ts');
    if (!existsSync(dts) || readFileSync(dts, 'utf8') !== typings) stale.push('components.d.ts');
    if (stale.length) {
      console.error(`stale: ${stale.join(', ')}\nthe committed WebAssembly no longer matches the Rust; run \`pnpm rust:wasm\``);
      process.exit(1);
    }
    console.log('rust wasm is up to date');
  } else {
    mkdirSync(join(outDir, 'pkg'), { recursive: true });
    cpSync(pkg, join(outDir, 'pkg'), { recursive: true });
    cpSync(join(staging, 'components.d.ts'), join(outDir, 'components.d.ts'));
    const bytes = readFileSync(join(outDir, 'pkg/components_wasm_bg.wasm')).length;
    console.log(`wrote src/integrations/rust/pkg (${(bytes / 1024).toFixed(1)} kB wasm)`);
  }
} finally {
  rmSync(staging, { recursive: true, force: true });
}
