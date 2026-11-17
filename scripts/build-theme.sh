#!/usr/bin/env bash
# Build the theme toggle (tools/theme-client, Rust to WebAssembly) into src/theme/.
#
# Cloudflare's build image has no Rust, so the compiled module and its JS glue are
# committed and served as static assets. Run after any change to tools/theme-client.
#
#   scripts/build-theme.sh            # rebuild src/theme/ and record the source stamp
#   scripts/build-theme.sh --check    # fail if the Rust source changed since the last build (CI)
#
# The check does not rebuild: compiled bytes depend on the host's rustc, wasm-bindgen and
# binaryen, so a laptop and a CI runner never agree byte for byte. Instead the build records
# a hash of the Rust source (src/theme/SOURCE.sha256) and CI recomputes it. That proves the
# output was rebuilt after the last source change, with no Rust toolchain needed in CI.
set -euo pipefail
cd "$(dirname "$0")/.."
out=src/theme

source_hash() {
  { find tools/theme-client -type f -not -path '*/target/*' | LC_ALL=C sort; echo rust-toolchain.toml; } \
    | while read -r f; do printf '%s\n' "$f"; cat "$f"; done | shasum -a 256 | cut -d' ' -f1
}

if [ "${1:-}" = "--check" ]; then
  if [ -s "$out/theme_client_bg.wasm" ] && [ "$(cat "$out/SOURCE.sha256" 2>/dev/null)" = "$(source_hash)" ]; then
    echo "src/theme/ is up to date"
  else
    echo "src/theme/ is stale: the Rust source changed since it was built. Run pnpm theme and commit." >&2
    exit 1
  fi
  exit 0
fi

cargo build -q --manifest-path tools/Cargo.toml -p theme-client --target wasm32-unknown-unknown --release
wasm-bindgen --target web --out-dir "$out" tools/target/wasm32-unknown-unknown/release/theme_client.wasm
if command -v wasm-opt >/dev/null; then
  wasm-opt -Oz --all-features --disable-compact-imports -o "$out/theme_client_bg.wasm" "$out/theme_client_bg.wasm"
fi
source_hash > "$out/SOURCE.sha256"
echo "src/theme/: theme_client_bg.wasm $(wc -c < "$out/theme_client_bg.wasm" | tr -d ' ') bytes"
