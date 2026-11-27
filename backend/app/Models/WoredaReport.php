<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class WoredaReport extends Model
{
    public const STATUSES = [
        'submitted' => 'Submitted',
        'reviewed' => 'Under Review',
        'approved' => 'Approved',
        'rejected' => 'Needs Revision',
    ];

    public const PERIOD_TYPES = [
        'monthly' => 'Monthly',
        'quarterly' => 'Quarterly',
        'annual' => 'Annual',
        'custom' => 'Custom',
    ];

    protected $guarded = ['id'];

    protected $casts = ['reviewed_at' => 'datetime', 'period_start' => 'date', 'attachments' => 'array', 'attachment_names' => 'array'];

    protected static function booted(): void
    {
        // A monthly report covers a whole month: store its first day, whatever day was picked.
        static::saving(function (self $report) {
            if ($report->period_start) {
                $report->period_start = $report->period_start->copy()->startOfMonth();
            }
        });

        // Files removed in the form, or with the report, are deleted from disk (Filament leaves them otherwise).
        static::updated(function (self $report) {
            if ($report->wasChanged('attachments')) {
                $before = json_decode((string) $report->getRawOriginal('attachments'), true) ?: [];
                $gone = array_diff($before, $report->attachments ?? []);
                if ($gone) {
                    Storage::disk(self::FILES_DISK)->delete(array_values($gone));
                }
            }
        });
        static::deleted(function (self $report) {
            if ($report->attachments) {
                Storage::disk(self::FILES_DISK)->delete($report->attachments);
            }
        });
    }

    /** Reports whose figures count on the dashboard: monthly, month set, not sent back. See App\Support\Indicators. */
    public function scopeCountable(Builder $query): Builder
    {
        return $query->where('period_type', 'monthly')
            ->whereNotNull('period_start')
            ->where('status', '!=', 'rejected');
    }

    public function woreda(): BelongsTo
    {
        return $this->belongsTo(Woreda::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ReportComment::class)->oldest();
    }

    /** Woreda accounts may change a report only while the zone has not accepted it yet. */
    public function isEditableByWoreda(): bool
    {
        return in_array($this->status, ['submitted', 'rejected'], true);
    }

    /** Private disk for report files: storage/app/private, never directly reachable from the web. */
    public const FILES_DISK = 'local';

    /**
     * The report's files, in upload order, with what the report page needs to list them.
     *
     * @return Collection<int, array{index:int, path:string, name:string, size:?int, extension:string, isImage:bool, url:string}>
     */
    public function files(): Collection
    {
        $disk = Storage::disk(self::FILES_DISK);
        $names = $this->attachment_names ?? [];

        return collect($this->attachments ?? [])->values()->map(function (string $path, int $i) use ($disk, $names) {
            $name = $names[$path] ?? basename($path);
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

            return [
                'index' => $i,
                'path' => $path,
                'name' => $name,
                'size' => $disk->exists($path) ? $disk->size($path) : null,
                'extension' => $ext,
                'isImage' => in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true),
                'url' => route('filament.admin.private-file', ['type' => 'report', 'id' => $this->id, 'index' => $i]),
            ];
        });
    }

    public function statusColor(): string
    {
        return match ($this->status) {
            'approved' => 'success',
            'rejected' => 'danger',
            'reviewed' => 'warning',
            default => 'info',
        };
    }
}
