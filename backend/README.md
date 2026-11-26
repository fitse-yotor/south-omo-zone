# South Omo Zone portal: backend

Laravel 12 + Filament 3 admin panel + MySQL. It serves the React website (built into `public/`), the content API and the admin panel.

- Setup, deployment to cPanel and updates: [`../deploy/DEPLOY.md`](../deploy/DEPLOY.md)
- Create an admin user: `php artisan portal:admin`
- Content API: `GET /api/content`, `POST /api/contact`

| Where | What |
|---|---|
| `database/migrations/2026_11_26_000001_create_portal_tables.php` | all portal tables (English `_en` and Amharic `_am` columns) |
| `database/data/content.json` | the website's built-in content, loaded by `php artisan db:seed` (regenerate with `node scripts/export-content.mjs`) |
| `app/Models/` | each model's `toPortal()` returns the exact shape the website expects |
| `app/Filament/Resources/` | admin panel sections; access per role is in each `canViewAny()` |
| `app/Http/Controllers/Api/` | content (cached) and contact form (validated, rate-limited, honeypot) |
| `config/filesystems.php` → `uploads` | uploaded photos and PDFs go to `public/uploads` (no symlink needed); override with `UPLOADS_PATH` |
