<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A town on the tourism map. Its key and position are fixed by the map data; everything else is editable. */
class RouteStop extends Model
{
    use Bilingual;

    public const SERVICES = ['fuel' => 'Fuel', 'bank' => 'Bank', 'health' => 'Health centre', 'gate' => 'Park gate'];

    protected $guarded = ['id'];

    protected $casts = ['services' => 'array'];

    public function stays(): HasMany
    {
        return $this->hasMany(Stay::class)->orderBy('sort');
    }
}
