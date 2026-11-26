<?php

namespace App\Models\Concerns;

use App\Support\ContentCache;
use Illuminate\Support\Facades\Storage;

/** Helpers to present bilingual columns in the shape the React site expects: { en, am }. */
trait Bilingual
{
    protected static function bootBilingual(): void
    {
        // Any change to portal content refreshes the cached API response.
        static::saved(fn () => ContentCache::flush());
        static::deleted(fn () => ContentCache::flush());
    }

    public function bi(string $field): ?array
    {
        $en = $this->{$field.'_en'};
        $am = $this->{$field.'_am'};

        return ($en === null && $am === null) ? null : ['en' => (string) $en, 'am' => (string) ($am ?: $en)];
    }

    /** One item per line → { en: [...], am: [...] } */
    public function biLines(string $field): array
    {
        $split = fn ($v) => array_values(array_filter(array_map('trim', preg_split('/\R/u', (string) $v)), 'strlen'));

        return ['en' => $split($this->{$field.'_en'}), 'am' => $split($this->{$field.'_am'})];
    }

    /** Paragraphs separated by a blank line → { en: [...], am: [...] } */
    public function biParagraphs(string $field): array
    {
        $split = fn ($v) => array_values(array_filter(array_map('trim', preg_split('/\R\s*\R/u', (string) $v)), 'strlen'));

        return ['en' => $split($this->{$field.'_en'}), 'am' => $split($this->{$field.'_am'})];
    }

    /**
     * Images are either a built-in photo id shipped with the site (e.g. "turmi-hills")
     * or a file uploaded through the admin panel (stored on the "uploads" disk).
     */
    /** The photo shown for this record: an upload if there is one, otherwise the built-in photo id. */
    public function photoRef(): ?string
    {
        return self::imageRef($this->photo ?: $this->image);
    }

    /** Credit entry for an uploaded photo, so the site can show "© …" for it like the built-in ones. */
    public function uploadedPhotoCredit(): ?array
    {
        if (! $this->photo || ! $this->photo_credit) {
            return null;
        }

        return ['id' => self::imageRef($this->photo), 'title' => null, 'author' => $this->photo_credit, 'license' => '', 'source' => null];
    }

    public static function imageRef(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        return str_contains($value, '/') ? Storage::disk('uploads')->url($value) : $value;
    }
}
