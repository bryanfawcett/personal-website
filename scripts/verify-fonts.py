#!/usr/bin/env python3
"""Fail if src/styles/fonts.css points at a font file that isn't vendored.

Several of the families are variable fonts where Google serves one file per
subset covering every weight, which makes it easy to generate CSS referencing
filenames that were never downloaded. This catches that in CI rather than as a
silent fallback-font regression in production.
"""

from __future__ import annotations

import pathlib
import re
import sys


def main() -> int:
    root = pathlib.Path(__file__).resolve().parent.parent
    css = root / "src" / "styles" / "fonts.css"
    fonts = root / "public" / "fonts"

    referenced = set(re.findall(r"url\(/fonts/([^)]+)\)", css.read_text()))
    on_disk = {f.name for f in fonts.glob("*.woff2")}

    missing = sorted(referenced - on_disk)
    if missing:
        print(f"fonts.css references files that do not exist: {missing}", file=sys.stderr)
        return 1

    unused = sorted(on_disk - referenced)
    if unused:
        print(f"warning: unreferenced font files: {unused}")

    print(f"{len(referenced)} font references all resolve")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
