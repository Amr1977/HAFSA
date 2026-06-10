#!/bin/bash
set -e
cd "$(dirname "$0")/.."

LOCKFILE="/tmp/hafsa-autofix.lock"

if [ -f "$LOCKFILE" ] && kill -0 "$(cat $LOCKFILE)" 2>/dev/null; then
    exit 0
fi
echo $$ > "$LOCKFILE"
trap 'rm -f "$LOCKFILE"' EXIT

NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
fi

echo "[AUTO-FIX] $(date) Starting..."
node scripts/log-analyzer.js 2>&1
echo "[AUTO-FIX] $(date) Done."
