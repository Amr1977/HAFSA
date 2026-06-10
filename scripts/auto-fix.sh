#!/bin/bash
# Auto-fix script — runs log analyzer and applies fixes
# Called by cron every 30 minutes

set -e
cd "$(dirname "$0")/.."

LOCKFILE="/tmp/hafsa-autofix.lock"

# Prevent concurrent runs
if [ -f "$LOCKFILE" ] && [ -d "/proc/$(cat $LOCKFILE)" ]; then
    exit 0
fi

echo $$ > "$LOCKFILE"
trap 'rm -f "$LOCKFILE"' EXIT

export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"

echo "[AUTO-FIX] $(date) — Starting..."
node scripts/log-analyzer.js 2>&1

# Also try opencode for complex bugs not covered by patterns
LATEST_ERROR=$(tail -5 backend/logs/error-*-$(date +%Y-%m-%d).log 2>/dev/null | grep -v 'client.*true' | grep -v 'HTTP Request' | tail -1)
if [ -n "$LATEST_ERROR" ]; then
    echo "$LATEST_ERROR" | grep -qE 'CORS|ECONNREFUSED|Cannot set headers|Invalid namespace' && exit 0
    echo "[AUTO-FIX] Complex error detected — would invoke opencode analyze here"
fi

echo "[AUTO-FIX] $(date) — Done."
