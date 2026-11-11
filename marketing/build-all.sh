#!/usr/bin/env bash
# Rebuilds screenshots, brochures (EN + AM) and promo videos (EN + AM) from the current site.
# Needs: node, ffmpeg, python3 with numpy, Playwright's Chromium.
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
rm -f marketing/output/music.wav
node marketing/video.mjs en am
echo "Done. See marketing/output and marketing/screenshots."
