<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sector extends Model
{
    use Bilingual;

    /** Icons available in the site (lucide-react names). */
    public const ICONS = ['Sprout' => 'Sprout (agriculture)', 'Beef' => 'Beef (livestock)', 'Factory' => 'Factory (processing)', 'Fish' => 'Fish (fisheries)', 'Binoculars' => 'Binoculars (tourism)', 'Sun' => 'Sun (energy)'];

    protected $guarded = ['id'];

    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class);
    }

    public function toPortal(): array
    {
        return ['id' => $this->slug, 'icon' => $this->icon, 'image' => self::imageRef($this->photo ?: $this->image), 'title' => $this->bi('title'), 'text' => $this->bi('text')];
    }
}
