<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;

class Market extends Model
{
    use Bilingual;

    public const DAYS = [1 => 'Monday', 2 => 'Tuesday', 3 => 'Wednesday', 4 => 'Thursday', 5 => 'Friday', 6 => 'Saturday', 0 => 'Sunday'];

    protected $guarded = ['id'];

    protected $casts = ['days' => 'array'];

    public function toPortal(): array
    {
        return ['place' => $this->bi('place'), 'woreda' => $this->woreda_slug, 'stop' => $this->stop_key,
            'days' => collect($this->days)->map(fn ($d) => (int) $d)->sort()->values()->all()];
    }
}
