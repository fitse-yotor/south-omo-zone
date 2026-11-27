<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Health checks for the System status page. Each check: [label, status, detail, fix].
 * status: ok | warn | fail | info. "info" = fine as it is in this environment.
 */
class SystemChecks
{
    /** @return array<string, array<int, array{label:string,status:string,detail:string,fix:?string}>> */
    public static function all(): array
    {
        $live = app()->environment('production');

        return [
            'Speed' => [
                self::opcache(),
                self::cache('Configuration cache', app()->configurationIsCached(), $live),
                self::cache('Route cache', app()->routesAreCached(), $live),
                self::cache('Event cache', app()->eventsAreCached(), $live),
                self::cache('Admin panel components cache', is_file(base_path('bootstrap/cache/filament/panels/admin.php')), $live),
                self::cache('Icon cache', is_file(base_path('bootstrap/cache/blade-icons.php')), $live),
            ],
            'Configuration' => [
                self::check('PHP version', version_compare(PHP_VERSION, '8.2.0', '>=') ? 'ok' : 'fail', 'PHP '.PHP_VERSION,
                    'The portal needs PHP 8.2 or newer: choose it in cPanel → Select PHP Version.'),
                self::check('Environment', $live ? 'ok' : 'info', app()->environment(),
                    $live ? null : 'Set APP_ENV=production in .env on the live server.'),
                config('app.debug')
                    ? self::check('Debug mode', $live ? 'fail' : 'info', 'On — error pages show code and settings',
                        $live ? 'Set APP_DEBUG=false in .env now: on a live site this exposes secrets.' : 'Fine on a developer PC; must be off on the live server.')
                    : self::check('Debug mode', 'ok', 'Off', null),
                self::database(),
                self::check('Website build', is_file(public_path('index.html')) ? 'ok' : ($live ? 'fail' : 'info'),
                    is_file(public_path('index.html')) ? 'The public site is installed' : 'Not installed in backend/public',
                    is_file(public_path('index.html')) ? null : 'Run bash deploy/build-release.sh (on a PC, “npm run dev” serves the site instead).'),
            ],
            'Notifications and email' => [
                config('queue.default') === 'sync'
                    ? self::check('Notifications', 'ok', 'Sent immediately (QUEUE_CONNECTION=sync)', null)
                    : self::check('Notifications', 'warn', 'Queued on “'.config('queue.default').'”',
                        'Notifications wait for a queue worker. Add a cron job: php artisan queue:work --stop-when-empty, or set QUEUE_CONNECTION=sync.'),
                in_array(config('mail.default'), ['log', 'array'], true)
                    ? self::check('Email', $live ? 'fail' : 'warn', 'Not sent (MAIL_MAILER='.config('mail.default').')',
                        'Contact-form messages and password resets are only written to the log. Set the MAIL_* settings from cPanel → Email Accounts.')
                    : self::check('Email', 'ok', 'Sent with '.config('mail.default'), null),
            ],
            'Storage' => [
                self::writable('Storage folder', storage_path()),
                self::writable('Cache folder', base_path('bootstrap/cache')),
                self::uploads(),
                self::uploadLimit(),
            ],
        ];
    }

    /** @return array{ok:int, warn:int, fail:int, info:int} */
    public static function summary(array $groups): array
    {
        $counts = ['ok' => 0, 'warn' => 0, 'fail' => 0, 'info' => 0];
        foreach ($groups as $checks) {
            foreach ($checks as $c) {
                $counts[$c['status']]++;
            }
        }

        return $counts;
    }

    private static function check(string $label, string $status, string $detail, ?string $fix): array
    {
        return compact('label', 'status', 'detail', 'fix');
    }

    private static function opcache(): array
    {
        $status = function_exists('opcache_get_status') ? @opcache_get_status(false) : false;
        if (! $status || empty($status['opcache_enabled'])) {
            return self::check('PHP OPcache', 'fail', 'Off — every page recompiles the whole application (about 8× slower)',
                'cPanel: Select PHP Version → Extensions → tick “opcache”. On a PC (XAMPP): in php.ini set zend_extension=opcache, opcache.enable=1 and opcache.enable_cli=1, then restart.');
        }
        $mem = $status['memory_usage'] ?? [];
        $used = ($mem['used_memory'] ?? 0) / max(1, ($mem['used_memory'] ?? 0) + ($mem['free_memory'] ?? 0)) * 100;
        $hit = $status['opcache_statistics']['opcache_hit_rate'] ?? 0;
        $scripts = $status['opcache_statistics']['num_cached_scripts'] ?? 0;
        $full = $used > 90;

        return self::check('PHP OPcache', $full ? 'warn' : 'ok',
            sprintf('On · %s files cached · %.0f%% hit rate · %.0f%% of memory used', number_format($scripts), $hit, $used),
            $full ? 'OPcache memory is nearly full: raise opcache.memory_consumption (e.g. 256).' : null);
    }

    private static function cache(string $label, bool $on, bool $live): array
    {
        if ($on) {
            return self::check($label, 'ok', 'Built', null);
        }

        return $live
            ? self::check($label, 'warn', 'Not built', 'Use “Rebuild caches” above (or php artisan optimize && php artisan filament:optimize).')
            : self::check($label, 'info', 'Not built — normal while developing, so changes show at once', null);
    }

    private static function database(): array
    {
        try {
            DB::select('select 1');
            $driver = DB::connection()->getDriverName();
            $size = $driver === 'sqlite' && is_file($path = DB::connection()->getDatabaseName()) ? ' · '.self::bytes(filesize($path)) : '';

            return self::check('Database', 'ok', "Connected ({$driver}){$size}", null);
        } catch (\Throwable $e) {
            return self::check('Database', 'fail', 'Cannot connect', 'Check the DB_* settings in .env.');
        }
    }

    private static function writable(string $label, string $path): array
    {
        return is_writable($path)
            ? self::check($label, 'ok', 'Writable', null)
            : self::check($label, 'fail', 'Not writable: '.$path, 'In cPanel File Manager, set the folder permissions to 755 (or 775).');
    }

    private static function uploads(): array
    {
        $disk = Storage::disk('uploads');
        $root = config('filesystems.disks.uploads.root');
        if (! is_dir($root)) {
            return is_writable(dirname($root))
                ? self::check('Uploads folder', 'ok', 'Created on the first upload', null)
                : self::check('Uploads folder', 'fail', 'Cannot be created: '.$root, 'Create public/uploads and make it writable (755).');
        }
        $files = collect($disk->allFiles())->take(5000);
        $bytes = $files->sum(fn ($f) => $disk->size($f));

        return self::check('Uploads folder', is_writable($root) ? 'ok' : 'fail',
            number_format($files->count()).' files · '.self::bytes($bytes).' — back this folder up with the database',
            is_writable($root) ? null : 'Make public/uploads writable (755).');
    }

    private static function uploadLimit(): array
    {
        $limit = UploadLimits::maxKilobytes(PHP_INT_MAX);
        $detail = 'Largest file PHP accepts: '.UploadLimits::label($limit)
            .' (upload_max_filesize '.ini_get('upload_max_filesize').', post_max_size '.ini_get('post_max_size').')';

        return $limit >= UploadLimits::TARGET_KB
            ? self::check('Upload size limit', 'ok', $detail, null)
            : self::check('Upload size limit', 'warn', $detail,
                'Report files over '.UploadLimits::label($limit).' are refused. Raise it to 20 MB: cPanel → Select PHP Version → Options (upload_max_filesize = 20M, post_max_size = 25M); on XAMPP the same two lines in php.ini, then restart.');
    }

    private static function bytes(int|float $bytes): string
    {
        return $bytes >= 1048576 ? number_format($bytes / 1048576, 1).' MB' : number_format($bytes / 1024, 0).' KB';
    }
}
