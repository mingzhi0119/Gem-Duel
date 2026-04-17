#!/usr/bin/env bash
set -euo pipefail

TOPIC="${1:-}"

if [ -z "${TOPIC}" ]; then
  echo "Usage: scripts/find-legacy-topic.sh <topic>"
  exit 1
fi

echo "Existing extraction notes:"
rg --line-number --glob 'extracted-*.md' "${TOPIC}" docs/99-legacy || true

echo
echo "Git history candidates:"
git log --oneline --all -S"${TOPIC}" -- . || true
