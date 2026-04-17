#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$repo_root"

echo "[contract-change] Running contract tests and type checks"
corepack pnpm --filter @gem-duel/contracts test
corepack pnpm --filter @gem-duel/contracts typecheck

echo "[contract-change] If snapshots changed intentionally, update them explicitly after review."
echo "[contract-change] Suggested command: corepack pnpm --filter @gem-duel/contracts test -- --update"

