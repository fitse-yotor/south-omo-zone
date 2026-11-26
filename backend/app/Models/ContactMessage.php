<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    public const DESKS = ['general' => 'General enquiry', 'invest' => 'Investment desk', 'tourism' => 'Tourism office'];

    protected $guarded = ['id'];

    protected $casts = ['read_at' => 'datetime'];
}
