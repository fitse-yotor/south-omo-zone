<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;

class People extends Model
{
    use Bilingual;

    protected $table = 'peoples';

    protected $guarded = ['id'];
}
