#!/usr/bin/env bash
# Arranque seguro: build completo ANTES de levantar app + watcher
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[$(date '+%Y-%m-%d %H:%M:%S')] npm run build..."
npm run build

echo "[$(date '+%Y-%m-%d %H:%M:%S')] pm2 start ecosystem.watch.config.cjs..."
pm2 start ecosystem.watch.config.cjs

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Listo. pm2 list"
