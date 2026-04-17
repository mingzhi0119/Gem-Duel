#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-}"

if [ -z "${TARGET}" ]; then
  echo "Usage: scripts/check-exhaustiveness.sh <phase-or-command>"
  exit 1
fi

echo "Searching transition surfaces for: ${TARGET}"
rg --line-number --glob '!old/**' --glob '!.codex/skills/**' "${TARGET}" packages docs || true

echo
echo "Review all hits for:"
echo "- contracts"
echo "- state machine"
echo "- guard tests"
echo "- replay docs"
