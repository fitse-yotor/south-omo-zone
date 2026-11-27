<?php

namespace App\Support;

/** The largest file this server really accepts, so forms never promise more than PHP allows. */
class UploadLimits
{
    /** What the portal aims to allow per file. */
    public const TARGET_KB = 10240;

    /** Per-file limit in KB: the smaller of the target and PHP's upload_max_filesize / post_max_size. */
    public static function maxKilobytes(int $target = self::TARGET_KB): int
    {
        $php = min(self::iniKilobytes('upload_max_filesize'), self::iniKilobytes('post_max_size'));

        return max(1, min($target, $php > 0 ? $php : $target));
    }

    public static function label(?int $kb = null): string
    {
        $kb ??= self::maxKilobytes();

        return $kb >= 1024 ? rtrim(rtrim(number_format($kb / 1024, 1), '0'), '.').' MB' : $kb.' KB';
    }

    /** "2M" → 2048, "512K" → 512, "1G" → 1048576, "0"/"-1" (no limit) → PHP_INT_MAX. */
    public static function iniKilobytes(string $key): int
    {
        $value = trim((string) ini_get($key));
        if ($value === '' || $value === '0' || $value === '-1') {
            return PHP_INT_MAX;
        }
        $number = (float) $value;

        return (int) match (strtoupper(substr($value, -1))) {
            'G' => $number * 1024 * 1024,
            'M' => $number * 1024,
            'K' => $number,
            default => $number / 1024,
        };
    }
}
