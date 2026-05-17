#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[$(date '+%Y-%m-%d %H:%M:%S')] npm run build..."
npm run build

echo "[$(date '+%Y-%m-%d %H:%M:%S')] pm2 restart autowax-detail..."
pm2 restart autowax-detail --update-env

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Listo."
