<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanTask extends Model
{
    protected $guarded = ['id'];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(ZonePlan::class, 'zone_plan_id');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(PlanTaskProgress::class);
    }

    /** Average progress across all woredas (0-100). */
    public function averageProgress(): int
    {
        $avg = $this->progress()->avg('progress');

        return (int) round($avg ?? 0);
    }

    /** Progress for a specific woreda (0-100). */
    public function progressFor(int $woredaId): int
    {
        $p = $this->progress()->where('woreda_id', $woredaId)->first();

        return $p ? (int) $p->progress : 0;
    }
}
