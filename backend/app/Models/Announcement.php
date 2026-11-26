<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Announcement extends Model
{
    use Bilingual;

    public const TYPES = ['vacancy' => 'Vacancy', 'tender' => 'Tender'];

    protected $guarded = ['id'];

    protected $casts = ['posted_on' => 'date', 'deadline' => 'date', 'is_published' => 'boolean'];

    public function scopeOpen(Builder $q): Builder
    {
        return $q->where('is_published', true)->whereDate('deadline', '>=', today());
    }

    public function toPortal(): array
    {
        return [
            'id' => 'a'.$this->id,
            'type' => $this->type,
            'ref' => $this->reference,
            'posted' => $this->posted_on->toDateString(),
            'deadline' => $this->deadline->toDateString(),
            'title' => $this->bi('title'),
            'org' => $this->bi('organization'),
            'location' => $this->bi('location'),
            'summary' => $this->bi('summary'),
            'details' => $this->biLines('details'),
            'attachment' => $this->attachment ? Storage::disk('uploads')->url($this->attachment) : null,
        ];
    }
}
