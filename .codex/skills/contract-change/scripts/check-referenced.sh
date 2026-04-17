#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: check-referenced.sh <symbol-or-event>"
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$repo_root"

needle="$1"
echo "[contract-change] Searching references for: $needle"
rg -n --hidden --glob '!old/**' --glob '!.codex/skills/**' "$needle" apps packages docs
