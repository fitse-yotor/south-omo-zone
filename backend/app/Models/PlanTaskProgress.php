<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanTaskProgress extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['progress' => 'integer'];

    public function task(): BelongsTo
    {
        return $this->belongsTo(PlanTask::class, 'plan_task_id');
    }

    public function woreda(): BelongsTo
    {
        return $this->belongsTo(Woreda::class);
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
