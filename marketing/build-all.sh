#!/usr/bin/env bash
# Rebuilds screenshots, brochures and promo video from the current site.
# Optional: SITE_URL=https://your-domain bash marketing/build-all.sh
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
npx vite preview --port 4173 --strictPort >/dev/null 2>&1 &
PREVIEW=$!
trap 'kill $PREVIEW 2>/dev/null || true' EXIT
for i in $(seq 1 30); do curl -sf http://localhost:4173 >/dev/null && break; sleep 0.5; done
node marketing/capture.cjs
node marketing/brochure.mjs
node marketing/video.mjs
ffmpeg -loglevel error -y -ss 3 -i marketing/output/south-omo-promo.mp4 -frames:v 1 -q:v 3 marketing/output/south-omo-promo-thumbnail.jpg
echo "Done. See marketing/output and marketing/screenshots."
