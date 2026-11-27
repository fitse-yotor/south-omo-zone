<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

/** A directive or memo from the zone to some or all woredas, with read / acknowledgement tracking per woreda. */
class Circular extends Model
{
    public const PRIORITIES = ['normal' => 'Normal', 'urgent' => 'Urgent'];

    protected $guarded = ['id'];

    protected $casts = ['requires_acknowledgement' => 'boolean', 'respond_by' => 'date'];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function woredas(): BelongsToMany
    {
        return $this->belongsToMany(Woreda::class)
            ->withPivot(['read_at', 'acknowledged_at', 'acknowledged_by', 'response'])
            ->orderBy('sort');
    }

    /** Circulars addressed to the given woreda. */
    public function scopeForWoreda(Builder $query, int $woredaId): Builder
    {
        return $query->whereHas('woredas', fn ($q) => $q->where('woredas.id', $woredaId));
    }

    /** The current woreda account's row (read / acknowledged), or null for zone staff. */
    public function receiptFor(?int $woredaId = null): ?object
    {
        $woredaId ??= Auth::user()?->woreda_id;

        return $woredaId ? $this->woredas->firstWhere('id', $woredaId)?->pivot : null;
    }

    /** Served through the access-checked file route; stored on the private disk like report files. */
    public function attachmentUrl(): ?string
    {
        return $this->attachment ? route('filament.admin.private-file', ['type' => 'circular', 'id' => $this->id, 'index' => 0]) : null;
    }

    protected static function booted(): void
    {
        static::updated(function (self $circular) {
            $old = $circular->getRawOriginal('attachment');
            if ($circular->wasChanged('attachment') && $old) {
                Storage::disk(WoredaReport::FILES_DISK)->delete($old);
            }
        });
        static::deleted(fn (self $circular) => $circular->attachment && Storage::disk(WoredaReport::FILES_DISK)->delete($circular->attachment));
    }
}
