#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: scripts/check-buff-governance.sh <buff-id>"
  exit 1
fi

BUFF_ID="$1"

echo "Checking Buff governance references for: ${BUFF_ID}"
rg --line-number --glob '!old/**' --glob '!.codex/skills/**' "${BUFF_ID}" packages docs || true

echo
echo "Expected follow-up:"
echo "- registry entry"
echo "- docs note with hook point and stacking"
echo "- replay reference or replay plan"
