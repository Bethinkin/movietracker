#!/bin/bash
set -euo pipefail

# Web-only: skip on local sessions.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# Idempotent; prefer `npm install` over `npm ci` so the cached
# container layer is reused across sessions.
npm install
