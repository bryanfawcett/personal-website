#!/usr/bin/env bash
# Build the theme toggle (tools/theme-client, Rust to WebAssembly) into src/theme/.
#
# Cloudflare's build image has no Rust, so the compiled module and its JS glue are
# committed and served as static assets. Run after any change to tools/theme-client.
#
#   scripts/build-theme.sh            # rebuild src/theme/
#   scripts/build-theme.sh --check    # fail if src/theme/ is stale (CI)
set -euo pipefail
cd "$(dirname "$0")/.."
out=src/theme
if [ "${1:-}" = "--check" ]; then out="$(mktemp -d)"; fi
cargo build -q --manifest-path tools/Cargo.toml -p theme-client --target wasm32-unknown-unknown --release
wasm-bindgen --target web --out-dir "$out" tools/target/wasm32-unknown-unknown/release/theme_client.wasm
if command -v wasm-opt >/dev/null; then
  wasm-opt -Oz --all-features --disable-compact-imports -o "$out/theme_client_bg.wasm" "$out/theme_client_bg.wasm"
fi
if [ "${1:-}" = "--check" ]; then
  # The glue is generated from the module's imports and exports, so it changes whenever
  # the Rust's browser surface does. The .wasm itself is not compared byte for byte: its
  # bytes depend on the host's rustc and binaryen, which differ between a laptop and CI.
  if diff -q "$out/theme_client.js" src/theme/theme_client.js >/dev/null && [ -s src/theme/theme_client_bg.wasm ]; then echo "src/theme/ is up to date"; else echo "src/theme/ is stale; run pnpm theme" >&2; exit 1; fi
else
  echo "src/theme/: theme_client_bg.wasm $(wc -c < "$out/theme_client_bg.wasm" | tr -d ' ') bytes"
fi
