<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

class ContentCache
{
    public const KEY = 'portal.content.v1';

    public static function flush(): void
    {
        Cache::forget(self::KEY);
    }
}
