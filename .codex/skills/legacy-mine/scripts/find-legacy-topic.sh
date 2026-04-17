#!/usr/bin/env bash
set -euo pipefail

TOPIC="${1:-}"

if [ -z "${TOPIC}" ]; then
  echo "Usage: scripts/find-legacy-topic.sh <topic>"
  exit 1
fi

echo "Existing extraction notes:"
rg --line-number "${TOPIC}" docs/99-legacy || true

echo
echo "Legacy source candidates:"
rg --line-number "${TOPIC}" old/legacy-vite-electron || true
