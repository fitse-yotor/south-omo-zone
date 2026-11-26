<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;

/** Short titled texts: investment steps, investor commitments and travel etiquette. */
class GuideItem extends Model
{
    use Bilingual;

    public const GROUPS = ['step' => 'How to invest (steps)', 'principle' => 'Our commitments (investment)', 'etiquette' => 'Travel responsibly (tourism)'];

    protected $guarded = ['id'];

    /** { en: [[title, text], …], am: [[title, text], …] } — the shape the website uses. */
    public static function portalGroup(string $group): array
    {
        $items = static::where('group', $group)->orderBy('sort')->get();

        return [
            'en' => $items->map(fn ($i) => [$i->title_en, $i->text_en])->all(),
            'am' => $items->map(fn ($i) => [$i->title_am ?: $i->title_en, $i->text_am ?: $i->text_en])->all(),
        ];
    }
}
