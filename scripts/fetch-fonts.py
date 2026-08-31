#!/usr/bin/env python3
"""Vendor the site's webfonts from Google Fonts into public/fonts.

Run from the repo root after changing the type stack in src/brand/tokens.ts:

    python3 scripts/fetch-fonts.py

Downloads the Latin and Latin Extended subsets only, writes the files into
public/fonts/, and regenerates src/styles/fonts.css pointing at them.
"""

from __future__ import annotations

import pathlib
import re
import subprocess
import sys
import urllib.parse

# Cormorant is display only. Its x-height is 0.386 em — measured off the
# vendored file, against 0.46–0.53 for a face built for running text — so at a
# 17px body size its lowercase renders about 6.6px tall and reads as thin and
# small however much weight you add. It is still the right face for the big
# drafted lockups, where that delicacy is the point. Everything a reader
# actually reads is IBM Plex Serif, which sits at 0.52 and is the sibling of
# the Plex Mono already carrying every label on the site.
FAMILIES = [
    "Cormorant Garamond:ital,wght@0,500;0,600;0,700;1,500",
    "IBM Plex Serif:ital,wght@0,400;0,600;0,700;1,400",
    "IBM Plex Mono:wght@400;500;600",
    "Caveat:wght@500;600",
]

# Google serves modern woff2 only to a browser-shaped User-Agent.
UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120 Safari/537.36"
)

# The content carries African names and place-names, so Latin Extended stays.
KEEP_SUBSETS = {"latin", "latin-ext"}

HEADER = """/*
 * Self-hosted webfonts.
 *
 * Vendored rather than linked to fonts.googleapis.com so the site makes no
 * third-party request on load: one less round trip, no external dependency
 * for a page that is otherwise entirely on Cloudflare's edge, and nothing
 * about a visitor leaks to a font CDN.
 *
 * Latin and Latin Extended only — Latin Extended matters here because the
 * content carries African names and place-names with diacritics.
 *
 * Regenerate with scripts/fetch-fonts.py when the type stack changes.
 */

"""


def main() -> int:
    root = pathlib.Path(__file__).resolve().parent.parent
    outdir = root / "public" / "fonts"
    outdir.mkdir(parents=True, exist_ok=True)

    query = "&".join(f"family={urllib.parse.quote(f)}" for f in FAMILIES)
    url = f"https://fonts.googleapis.com/css2?{query}&display=swap"

    result = subprocess.run(
        ["curl", "-sSfL", "-A", UA, url], capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"could not fetch the stylesheet: {result.stderr}", file=sys.stderr)
        return 1

    blocks = re.findall(
        r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{.*?\})", result.stdout, re.S
    )
    if not blocks:
        print("no @font-face blocks found — did the API shape change?", file=sys.stderr)
        return 1

    kept: list[str] = []
    files: dict[str, str] = {}

    for subset, block in blocks:
        if subset not in KEEP_SUBSETS:
            continue

        family = re.search(r"font-family:\s*'([^']+)'", block)
        weight = re.search(r"font-weight:\s*(\d+)", block)
        source = re.search(r"src:\s*url\(([^)]+)\)", block)
        if not (family and weight and source):
            continue

        # Italic is a separate file at the same family and weight, so the
        # filename has to carry the style too — otherwise the roman and the
        # italic collide and one of them silently never downloads.
        style = "italic" if re.search(r"font-style:\s*italic", block) else "normal"

        # Several of these families are variable fonts: Google serves one file
        # per subset covering every weight. Key the filename off the URL so
        # each shared file is named and downloaded exactly once, and so every
        # @font-face that references it points at the same real filename.
        url_key = source.group(1)
        if url_key not in files:
            slug = family.group(1).lower().replace(" ", "-")
            suffix = "-italic" if style == "italic" else ""
            files[url_key] = f"{slug}-{weight.group(1)}{suffix}-{subset}.woff2"

        kept.append(block.replace(url_key, f"/fonts/{files[url_key]}"))

    for source, name in files.items():
        destination = outdir / name
        if destination.exists():
            continue
        download = subprocess.run(
            ["curl", "-sSfL", source, "-o", str(destination)], capture_output=True
        )
        if download.returncode != 0:
            print(f"could not download {source}", file=sys.stderr)
            return 1

    (root / "src" / "styles" / "fonts.css").write_text(
        HEADER + "\n\n".join(kept) + "\n"
    )

    payload = sum(f.stat().st_size for f in outdir.glob("*.woff2"))
    print(f"{len(kept)} faces across {len(files)} files, {payload / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
