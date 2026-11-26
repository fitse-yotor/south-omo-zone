<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;

/** Single row holding the zone's contact details and the road-status check date. */
class SiteSetting extends Model
{
    use Bilingual;

    protected $guarded = ['id'];

    protected $casts = ['road_status_checked_on' => 'date', 'rainy_months' => 'array'];

    public static function current(): self
    {
        return static::query()->firstOrCreate([]);
    }

    /** Zone name and home-page texts. */
    public function zoneTexts(): array
    {
        return collect(['name', 'admin', 'region', 'capital', 'tagline', 'intro'])
            ->mapWithKeys(fn ($f) => [$f => $this->bi($f)])->filter()->all();
    }

    public function toPortal(): array
    {
        return [
            'address' => $this->bi('address'),
            'phone' => $this->phone,
            'email' => $this->email,
            'invest' => $this->invest_email,
            'tourism' => $this->tourism_email,
            'hours' => $this->bi('hours'),
        ];
    }
}
