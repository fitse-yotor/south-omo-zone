<?php

namespace App\Models;

use App\Support\ContentCache;
use Illuminate\Database\Eloquent\Model;

/** Author and licence of a built-in photo. Shown on the photo and on the Photo credits page. */
class PhotoCredit extends Model
{
    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::saved(fn () => ContentCache::flush());
        static::deleted(fn () => ContentCache::flush());
    }

    public function toPortal(): array
    {
        return ['id' => $this->photo_id, 'title' => $this->title, 'author' => $this->author, 'license' => (string) $this->license, 'source' => $this->source_url];
    }
}
