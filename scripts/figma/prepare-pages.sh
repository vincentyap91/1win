#!/usr/bin/env bash
# Serialise local pages and render their content as SVG for Figma import (scripts/figma/*).
# Usage: bash scripts/figma/prepare-pages.sh "<page>:<Title>[:<root selector>]" ...   (local server on :4174)
cd "$(dirname "$0")/../.." || exit 1
O=qa/figma-pages-2026-10-15
for item in "$@"; do
  IFS=':' read -r page title sel <<< "$item"
  script=scripts/figma/serialize.js
  if [ -n "$sel" ]; then script="$O/.serialize-$page.js"; { printf 'const FIGMA_ROOT = %s;\n' "$(printf '%s' "$sel" | python -c 'import json,sys;print(json.dumps(sys.stdin.read()))')"; cat scripts/figma/serialize.js; } > "$script"; fi
  MSYS_NO_PATHCONV=1 node --experimental-websocket scripts/figma/local-run.mjs --route "/$page.html" --script "$script" --out "$O/$page.json" --sizes 1440x900,390x844 2>&1 | grep -v -i experimental | sed "s|^|$page |"
  python scripts/figma/spec-to-svg.py "$O/$page.json" --size 1440x900 --out "$O/$title content 1440.svg" --name "$title content"
  python scripts/figma/spec-to-svg.py "$O/$page.json" --size 390x844 --out "$O/$title content 390.svg" --name "$title content"
done
