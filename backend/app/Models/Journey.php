<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;

/** A one-day drive from Jinka Airport, drawn on the tourism map. */
class Journey extends Model
{
    use Bilingual;

    protected $guarded = ['id'];

    protected $casts = ['stops' => 'array', 'stay_at' => 'array'];

    public function toPortal(): array
    {
        return [
            'id' => $this->slug, 'image' => $this->photoRef(), 'stops' => array_values($this->stops ?? []),
            'name' => $this->bi('name'), 'sub' => $this->bi('sub'), 'tip' => $this->bi('tip'),
            'stayAt' => array_values($this->stay_at ?? []), 'stayNote' => $this->bi('stay_note'),
        ];
    }
}
