<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    use Bilingual;

    protected $guarded = ['id'];

    public function toPortal(): array
    {
        return ['id' => $this->photoRef(), 'caption' => $this->bi('caption')];
    }
}
