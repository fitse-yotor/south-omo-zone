<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Opportunity extends Model
{
    use Bilingual;

    protected $guarded = ['id'];

    protected $casts = ['is_published' => 'boolean', 'investment_usd_m' => 'float'];

    public function woreda(): BelongsTo
    {
        return $this->belongsTo(Woreda::class);
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function toPortal(): array
    {
        return [
            'id' => 'opp-'.$this->id,
            'woreda' => $this->woreda->slug,
            'sector' => $this->sector->slug,
            'title' => $this->bi('title'),
            'summary' => $this->bi('summary'),
            'landHa' => (int) $this->land_ha,
            'investmentUsdM' => (float) $this->investment_usd_m,
            'jobs' => (int) $this->jobs,
        ];
    }
}
