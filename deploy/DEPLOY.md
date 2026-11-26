# Deploying the South Omo Zone portal on shared hosting (cPanel)

The portal is one Laravel application. It serves:

| Address | What |
|---|---|
| `/` | the public website (React, English and Amharic) |
| `/api/content`, `/api/contact` | the data the website reads, and the contact form |
| `/admin` | the admin panel where staff update content |

## 1. What the hosting plan needs

Ask the host to confirm these before you buy or renew:

- **PHP 8.2 or newer** with these extensions: `pdo_mysql`, `mbstring`, `intl`, `fileinfo`, `gd`, `zip`, `openssl`, `tokenizer`, `xml`, `ctype`, `bcmath`
  (cPanel → *Select PHP Version* → *Extensions*)
- **MySQL 8 or MariaDB 10.4+**
- **Terminal or SSH access** (cPanel → *Terminal*). Strongly recommended; section 7 covers the case without it.
- **Free SSL** (AutoSSL / Let's Encrypt)
- About **500 MB** of disk to start, plus room for uploaded photos and PDFs

## 2. Build the upload package (on your computer)

Needs Node 18+, PHP 8.2+ and Composer.

```bash
bash deploy/build-release.sh
```

This creates `release/south-omo-portal-<date>.zip`: the website, the backend and its production packages.
The package contains no passwords, database or logs.

## 3. Create the database

cPanel → *MySQL Databases*:

1. Create a database, e.g. `southomo` (cPanel names it `cpaneluser_southomo`).
2. Create a user with a long random password.
3. Add the user to the database with **All privileges**.

## 4. Upload the files

1. cPanel → *File Manager*. In your **home folder** (not inside `public_html`), create a folder `southomo`.
2. Upload the zip into it and choose **Extract**.
3. Make `storage/` and `bootstrap/cache/` writable: right-click → *Change Permissions* → `775`.

### Point the domain at `southomo/public`

**Option A (recommended):** cPanel → *Domains* → *Manage* for your domain → set **Document Root** to `southomo/public`.

**Option B:** if the host only allows `public_html`:

1. Move **everything inside** `southomo/public/` (including the hidden `.htaccess`) into `public_html/`.
2. Replace the content of `public_html/index.php` with:

   ```php
   <?php

   use Illuminate\Http\Request;

   define('LARAVEL_START', microtime(true));

   if (file_exists($maintenance = __DIR__.'/../southomo/storage/framework/maintenance.php')) {
       require $maintenance;
   }

   require __DIR__.'/../southomo/vendor/autoload.php';

   $app = require_once __DIR__.'/../southomo/bootstrap/app.php';
   $app->usePublicPath(__DIR__);
   $app->handleRequest(Request::capture());
   ```
3. In `.env` (next step), add the full path of the upload folder, for example:
   `UPLOADS_PATH=/home/cpaneluser/public_html/uploads`
4. After every update, copy `southomo/public/` into `public_html/` again (except `index.php`).

## 5. Configure

In `southomo/`, copy `.env.example` to `.env` and edit it:

- `APP_URL`: your full address with `https://`
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`: from step 3
- Optional: the `MAIL_*` settings from cPanel → *Email Accounts* → *Connect Devices*, so contact messages are also emailed to the right desk

Keep `APP_DEBUG=false` on the live site.

## 6. Install (cPanel → Terminal)

```bash
cd ~/southomo
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --force
php artisan portal:admin
php artisan optimize
php artisan filament:optimize
```

- `db:seed` loads the current website content into the database: zone texts, slideshow, facts, woredas, sectors,
  opportunities, attractions, sample notices, the leader's message, markets, peoples, guide texts, tourism towns and stays,
  roads, journeys, itineraries, interface labels and photo credits. Run it **once**, on the first install only.
- `portal:admin` asks for a name, email, role and password for the first administrator.

Open `https://your-domain/admin` and sign in. The dashboard shows a **Launch checklist** of everything still left
from the original content, with a link to fix each item:

- upload the zone emblem, and replace the placeholder phone and emails (*Home page → Zone texts & contact*)
- complete the leader's message: name, portrait and YouTube link
- replace the sample vacancies, tenders and opportunities. Each has a *Sample* badge, and *Delete all samples* removes them in one click.
- turn off the "sample listing" notes on the website
- add the missing woreda seats
- fill in missing Amharic. Then have a native speaker review it and switch on *Amharic reviewed*.
  On *Settings → Interface labels*, the *Missing Amharic* and *Same as English* filters show what still needs translating.

Add staff under *Settings → Staff accounts*. Use the role *Vacancies & tenders only* for HR and procurement officers.

If the host runs PHP through a different command in Terminal (for example `ea-php82`), use that instead of `php`.

## 7. If there is no Terminal

cPanel → *Cron Jobs* can run each command once. Add a job set to run every minute with:

```
cd ~/southomo && php artisan migrate --force && php artisan db:seed --force >> storage/logs/install.log 2>&1
```

Wait two minutes, check `storage/logs/install.log`, then **delete the cron job**.
To create the first administrator this way, put `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` before seeding, then remove both lines from `.env`.

## 8. Security checklist

- [ ] `APP_DEBUG=false` and `APP_ENV=production`
- [ ] HTTPS works (cPanel → *SSL/TLS Status* → *Run AutoSSL*), and `http://` redirects to `https://`
- [ ] The domain points at `public/`, so `https://your-domain/.env` returns *404 Not Found*
- [ ] `ADMIN_PASSWORD` is not left in `.env`
- [ ] Every staff account has its own login. Don't share the administrator account.

## 9. Backups

Back up weekly, and before every update:

- the database (cPanel → *Backup* → *Download a MySQL Database Backup*)
- the uploaded files in `public/uploads/` (or `public_html/uploads/`)
- the `.env` file

## 10. Updating

1. Build a new package (step 2) and upload it.
2. Extract it over the old files. Keep `.env` and `public/uploads/`.
3. Run:

   ```bash
   php artisan migrate --force
   php artisan db:seed --class=SiteContentSeeder --force
   php artisan optimize && php artisan filament:optimize
   ```

   `SiteContentSeeder` only fills sections that are still empty and adds new interface labels.
   It never overwrites anything staff have edited, so it is safe to run on every update.
   Do **not** run plain `php artisan db:seed` on a live site: it resets the sample notices and opportunities.

## Development (local)

```bash
cd backend
cp .env.local.example .env      # local settings: SQLite file database, debug on, plain http
touch database/database.sqlite  # Windows PowerShell: New-Item database/database.sqlite
composer install
php artisan key:generate
php artisan migrate --seed
php artisan portal:admin
php artisan serve               # http://127.0.0.1:8000 (website) and http://127.0.0.1:8000/admin
```

To work on the website with instant reload, run this in a second terminal from the repository root:

```bash
npm ci
VITE_API_URL=http://127.0.0.1:8000/api npm run dev    # http://localhost:5173
```

(Windows PowerShell: `$env:VITE_API_URL="http://127.0.0.1:8000/api"; npm run dev`)

Without `VITE_API_URL`, the website uses its built-in content (`src/data/content.js`), so `npm run dev` also works with no backend.
To refresh the seed data after editing `src/data/content.js`, run `node scripts/export-content.mjs`.
