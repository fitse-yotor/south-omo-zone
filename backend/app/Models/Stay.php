<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stay extends Model
{
    use Bilingual;

    protected $guarded = ['id'];

    public function routeStop(): BelongsTo
    {
        return $this->belongsTo(RouteStop::class);
    }

    public function toPortal(): array
    {
        return ['name' => $this->bi('name'), 'type' => $this->bi('type')];
    }
}
