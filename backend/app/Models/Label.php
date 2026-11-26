<?php

namespace App\Models;

use App\Support\ContentCache;
use Illuminate\Database\Eloquent\Model;

/** An interface label (menu item, button, heading) in English and Amharic. Keys are fixed by the website code. */
class Label extends Model
{
    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::saved(fn () => ContentCache::flush());
    }
}
