#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Parar la app mientras .next se regenera (evita middleware-manifest.json missing)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] pm2 stop autowax-detail..."
pm2 stop autowax-detail 2>/dev/null || true

echo "[$(date '+%Y-%m-%d %H:%M:%S')] npm run build..."
npm run build

echo "[$(date '+%Y-%m-%d %H:%M:%S')] pm2 start autowax-detail..."
pm2 start autowax-detail --update-env 2>/dev/null || pm2 restart autowax-detail --update-env

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Listo."
