<?php

namespace App\Support;

/**
 * Built-in photos (images/*.jpg) and the emblem (brand/*) belong to the React site.
 * deploy/build-release.sh copies them into backend/public, where the web server serves them directly.
 * On a developer PC that copy has not happened, so these helpers find them in the site's own public/ folder.
 */
class SiteAssets
{
    public const FOLDERS = ['images', 'brand'];

    /** Absolute path of a built-in asset, or null if it is not a plain file in an allowed folder. */
    public static function path(string $folder, string $file): ?string
    {
        if (! in_array($folder, self::FOLDERS, true) || $file !== basename($file)
            || ! preg_match('/^[A-Za-z0-9._-]+\.(jpe?g|png|webp|svg|ico)$/i', $file)) {
            return null;
        }

        foreach ([public_path("{$folder}/{$file}"), self::sourceRoot()."/{$folder}/{$file}"] as $candidate) {
            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    public static function exists(string $folder, string $file): bool
    {
        return self::path($folder, $file) !== null;
    }

    /** The React site's public/ folder (next to backend/), overridable with SITE_PUBLIC_PATH. */
    public static function sourceRoot(): string
    {
        return rtrim((string) config('app.site_public_path', dirname(base_path()).'/public'), '/\\');
    }
}
