<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;

class Fact extends Model
{
    use Bilingual;

    protected $guarded = ['id'];

    public function toPortal(): array
    {
        return ['value' => $this->value, 'label' => $this->bi('label')];
    }
}
