#!/usr/bin/env bash
# Builds an upload-ready package for shared hosting (cPanel):
#   1. builds the React site with the API enabled and copies it into backend/public/
#   2. installs production PHP dependencies
#   3. zips everything except secrets, the local database and logs → release/south-omo-portal-<date>.zip
# Needs: node 18+, PHP 8.2+, Composer.  Usage: bash deploy/build-release.sh
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$(pwd)

echo "→ Building the website"
npm ci --no-audit --no-fund
VITE_API_URL=./api npm run build

echo "→ Copying the website into backend/public"
rm -rf backend/public/assets backend/public/images backend/public/brand backend/public/index.html
cp -r dist/index.html dist/assets backend/public/
[ -d dist/images ] && cp -r dist/images backend/public/
[ -d dist/brand ] && cp -r dist/brand backend/public/

echo "→ Installing production PHP packages"
cd backend
composer install --no-dev --optimize-autoloader --no-interaction
php artisan filament:upgrade
cd "$ROOT"

echo "→ Packaging"
mkdir -p release
OUT="release/south-omo-portal-$(date +%Y%m%d-%H%M).zip"
(cd backend && zip -qr "$ROOT/$OUT" . \
  -x ".env" "database/database.sqlite" "storage/logs/*" "storage/framework/cache/data/*" \
     "storage/framework/sessions/*" "storage/framework/views/*" "public/uploads/*" "node_modules/*" "tests/*" ".git*")
echo "✓ $OUT  — follow deploy/DEPLOY.md to upload it"
