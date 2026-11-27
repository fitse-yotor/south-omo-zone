<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Woreda extends Model
{
    use Bilingual;

    protected $guarded = ['id'];

    protected $casts = ['sector_slugs' => 'array'];

    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(WoredaReport::class);
    }

    public function circulars(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Circular::class)->withPivot(['read_at', 'acknowledged_at', 'acknowledged_by', 'response']);
    }

    public function planProgress(): HasMany
    {
        return $this->hasMany(PlanTaskProgress::class);
    }

    public function toPortal(): array
    {
        return [
            'id' => $this->slug,
            'image' => $this->photoRef(),
            'name' => $this->bi('name'),
            'seat' => $this->seat_en ? $this->bi('seat') : null,
            'peoples' => $this->bi('peoples'),
            'tagline' => $this->bi('tagline'),
            'about' => $this->bi('about'),
            'highlights' => $this->biLines('highlights'),
            'sectors' => array_values($this->sector_slugs ?? []),
        ];
    }
}
