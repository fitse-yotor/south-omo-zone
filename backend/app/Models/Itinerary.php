<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;

/** A ready-made trip of several days. Each day is a drive; "night" is where visitors sleep. */
class Itinerary extends Model
{
    use Bilingual;

    public const WEEKDAYS = [0 => 'Sunday', 1 => 'Monday', 2 => 'Tuesday', 3 => 'Wednesday', 4 => 'Thursday', 5 => 'Friday', 6 => 'Saturday'];

    protected $guarded = ['id'];

    protected $casts = ['days' => 'array'];

    public function toPortal(): array
    {
        return [
            'id' => $this->slug, 'start' => (int) $this->start_weekday, 'image' => $this->photoRef(),
            'name' => $this->bi('name'), 'sub' => $this->bi('sub'),
            'days' => collect($this->days ?? [])->map(fn ($d) => [
                'stops' => array_values($d['stops'] ?? []),
                'night' => $d['night'] ?? null ?: null,
                'note' => ['en' => (string) ($d['note_en'] ?? ''), 'am' => (string) (($d['note_am'] ?? '') ?: ($d['note_en'] ?? ''))],
            ])->values()->all(),
        ];
    }
}
