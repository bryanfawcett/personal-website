#!/usr/bin/env bash
# The Rust contact card against the TypeScript one.
#   vCard: must be byte-identical.
#   QR:    two correct encoders may pick different mask patterns, so compare what
#          matters: every code (TypeScript and Rust, both themes) must decode to
#          BOOKING_URL. Does not prove an inverted code scans off a screen.
set -euo pipefail
cd "$(dirname "$0")/.."
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
cargo build -q --manifest-path tools/Cargo.toml -p contact-card
B=tools/target/debug/contact-card

cat > "$T/ref.mjs" <<JS
import { writeFileSync } from 'node:fs';
import { vcard } from '$PWD/src/brand/vcard.ts';
import { bookingQr } from '$PWD/src/brand/qr.ts';
writeFileSync('$T/ref.vcf', vcard());
writeFileSync('$T/ref-dark.svg', await bookingQr('dark'));
writeFileSync('$T/ref-light.svg', await bookingQr('light'));
JS
node --experimental-strip-types --import ./scripts/ts-specifier-hook.mjs "$T/ref.mjs"

fail=0
$B vcard > "$T/rs.vcf"
if cmp -s "$T/ref.vcf" "$T/rs.vcf"; then echo "✓ vCard byte-identical"; else echo "✗ vCard differs"; fail=1; fi

want=$(node -e "console.log(JSON.parse(require('fs').readFileSync('src/data/generated/site.json','utf8')).booking_url)")
$B qr dark > "$T/rs-dark.svg"; $B qr light > "$T/rs-light.svg"
for f in ref-dark ref-light rs-dark rs-light; do
  got=$($B decode "$T/$f.svg" 2>&1 || true)
  if [ "$got" = "$want" ]; then echo "✓ $f decodes to the booking URL"; else echo "✗ $f decoded '$got'"; fail=1; fi
done
exit $fail
