<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ZonePlan extends Model
{
    public const STATUSES = [
        'draft'  => 'Draft',
        'active' => 'Active',
        'closed' => 'Closed',
    ];

    public const PERIOD_TYPES = [
        'monthly'   => 'Monthly',
        'quarterly' => 'Quarterly',
        'annual'    => 'Annual',
        'custom'    => 'Custom',
    ];

    protected $guarded = ['id'];

    protected $casts = [
        'start_date' => 'date',
        'due_date'   => 'date',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function woredas(): BelongsToMany
    {
        return $this->belongsToMany(Woreda::class, 'zone_plan_woreda');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(PlanTask::class)->orderBy('sort');
    }

    /** Overall progress across all tasks and all assigned woredas (0-100). */
    public function overallProgress(): int
    {
        $taskIds = $this->tasks()->pluck('id');
        if ($taskIds->isEmpty()) {
            return 0;
        }

        $avg = PlanTaskProgress::whereIn('plan_task_id', $taskIds)->avg('progress');

        return (int) round($avg ?? 0);
    }

    public function statusColor(): string
    {
        return match ($this->status) {
            'active' => 'success',
            'closed' => 'gray',
            default  => 'warning',
        };
    }
}
