<?php

namespace App\Filament\Widgets\Concerns;

use App\Models\Woreda;
use App\Support\Indicators;
use Filament\Widgets\Concerns\InteractsWithPageFilters;
use Illuminate\Support\Facades\Auth;

/** Dashboard scope for widgets. Woreda accounts always see their own woreda, whatever the request says. */
trait ReadsDashboardFilters
{
    use InteractsWithPageFilters;

    protected function scopeWoredaId(): ?int
    {
        $user = Auth::user();
        if ($user?->isWoredaUser()) {
            return $user->woreda_id ? (int) $user->woreda_id : -1; // -1: account without a woreda sees nothing
        }

        $id = $this->filters['woreda_id'] ?? null;

        return $id ? (int) $id : null;
    }

    protected function scopeName(): string
    {
        $id = $this->scopeWoredaId();

        return $id ? (Woreda::find($id)?->name_en ?? 'Woreda').' woreda' : 'Whole zone';
    }

    protected function fiscalYear(): int
    {
        $year = (int) ($this->filters['fiscal_year'] ?? 0);

        return $year >= 2000 && $year <= 2100 ? $year : Indicators::fiscalYearStart()->year;
    }
}
