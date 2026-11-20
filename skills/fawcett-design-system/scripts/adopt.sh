#!/usr/bin/env bash
# Copy the design system's assets into another repo.
#   adopt.sh <repo> [dir]     dir defaults to src/design
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${1:?usage: adopt.sh <repo> [dir]}"
DIR="${2:-src/design}"
DEST="$REPO/$DIR"
mkdir -p "$DEST/fonts"
cp "$HERE/assets/tokens.css" "$HERE/assets/fonts.css" "$HERE/assets/components.css" "$DEST/"
cp "$HERE/assets/fonts/"* "$DEST/fonts/"
echo "Copied the design system into $DEST"
echo
echo "Next:"
echo "  1. Load, in this order, before your own CSS:"
echo "       $DIR/tokens.css   $DIR/fonts.css   $DIR/components.css"
echo "  2. Key anything that carries a mineral with data-mineral=\"cobalt\" (any of the 21 families)."
echo "  3. Copy markup from references/components/<Name>/preview.html; read references/brand-book.md first."
echo "  4. Run an APCA contrast check over the rendered pages in light and dark."
