<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;

/** Current condition of one road leg on the Tourism page map (e.g. "dimeka-turmi"). */
class RoadStatus extends Model
{
    use Bilingual;

    public const STATUSES = ['open' => 'Open', 'slow' => 'Slow / difficult', 'closed' => 'Closed'];

    protected $guarded = ['id'];
}
