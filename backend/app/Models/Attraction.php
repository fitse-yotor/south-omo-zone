<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;

class Attraction extends Model
{
    use Bilingual;

    protected $guarded = ['id'];

    public function toPortal(): array
    {
        return ['id' => $this->slug, 'journey' => $this->journey_slug, 'image' => $this->photoRef(), 'title' => $this->bi('title'), 'tag' => $this->bi('tag'), 'text' => $this->bi('text')];
    }
}
