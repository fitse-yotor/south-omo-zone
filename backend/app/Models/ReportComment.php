<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One message in the discussion on a woreda report (zone ↔ woreda). */
class ReportComment extends Model
{
    protected $guarded = ['id'];

    public function report(): BelongsTo
    {
        return $this->belongsTo(WoredaReport::class, 'woreda_report_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
