#!/usr/bin/env bash
# Install this skill for Claude Code.
#   install.sh            into ~/.claude/skills/ (all projects)
#   install.sh --project  into ./.claude/skills/ (this project only)
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
NAME="$(basename "$HERE")"
if [ "${1:-}" = "--project" ]; then TARGET="$PWD/.claude/skills"; else TARGET="$HOME/.claude/skills"; fi
mkdir -p "$TARGET"
rm -rf "$TARGET/$NAME"
cp -R "$HERE" "$TARGET/$NAME"
echo "Installed $NAME into $TARGET"
