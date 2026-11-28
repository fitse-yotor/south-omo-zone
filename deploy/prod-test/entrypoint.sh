#!/usr/bin/env bash
# First start: the "Install" steps from deploy/DEPLOY.md. Later starts: the "Updating" steps.
set -euo pipefail
cd /var/www/southomo
art() { su -s /bin/sh www-data -c "php artisan $*"; }
state=storage/app/private/.prod-test
mkdir -p "$state" && chown -R www-data:www-data storage public/uploads

[ -f "$state/app_key" ] || php -r 'echo "base64:".base64_encode(random_bytes(32));' > "$state/app_key"

# .env from the shipped example, changed only where a local test must differ from the live site.
cp .env.example .env
set_env() { sed -i "s|^$1=.*|$1=$2|" .env; }
set_env APP_KEY "$(cat "$state/app_key")"
set_env APP_URL "${PORTAL_URL}"
set_env SESSION_SECURE_COOKIE false     # local test runs on http; keep true on the live https site
set_env DB_HOST db
set_env DB_DATABASE southomo
set_env DB_USERNAME portal
set_env DB_PASSWORD "${DB_PASSWORD}"
chown www-data:www-data .env

echo "Waiting for the database..."
for i in $(seq 1 60); do
  php -r 'new PDO("mysql:host=db;dbname=southomo", "portal", getenv("DB_PASSWORD"));' 2>/dev/null && break
  if [ "$i" = 60 ]; then echo "The database did not answer."; exit 1; fi
  sleep 2
done

art migrate --force
if [ ! -f "$state/installed" ]; then
  su -s /bin/sh www-data -c "ADMIN_EMAIL='${TEST_ADMIN_EMAIL}' ADMIN_PASSWORD='${TEST_ADMIN_PASSWORD}' php artisan db:seed --force"
  if [ "${SAMPLE_DATA:-1}" = 1 ]; then
    art "db:seed --class=WoredaTestUserSeeder --force"
    art "db:seed --class=WoredaReportSeeder --force"
  fi
  touch "$state/installed"
else
  art "db:seed --class=SiteContentSeeder --force"
fi
art optimize
art filament:optimize
echo "Portal ready at ${PORTAL_URL}"
exec docker-php-entrypoint "$@"
