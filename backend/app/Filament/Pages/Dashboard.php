<?php

namespace App\Filament\Pages;

use App\Models\Woreda;
use App\Support\Indicators;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Form;
use Filament\Pages\Dashboard as BaseDashboard;
use Filament\Pages\Dashboard\Concerns\HasFiltersForm;
use Illuminate\Support\Facades\Auth;

/**
 * Cumulative zone / woreda dashboard. The filters (scope + fiscal year) are read by every
 * widget through InteractsWithPageFilters; woreda accounts are always scoped to their own woreda.
 */
class Dashboard extends BaseDashboard
{
    use HasFiltersForm;

    protected static ?string $navigationIcon = 'heroicon-o-chart-pie';

    public function getTitle(): string
    {
        $user = Auth::user();

        return $user?->isWoredaUser() && $user->woreda ? "{$user->woreda->name_en} woreda dashboard" : 'Zone dashboard';
    }

    public function getSubheading(): ?string
    {
        return 'Figures from monthly woreda reports, added up from the start of the fiscal year (July).';
    }

    public function filtersForm(Form $form): Form
    {
        $woredaUser = Auth::user()?->isWoredaUser();

        return $form->schema([
            Section::make()->schema([
                Select::make('woreda_id')
                    ->label('Scope')
                    ->placeholder('Whole zone (all woredas)')
                    ->options(fn () => Woreda::orderBy('sort')->pluck('name_en', 'id'))
                    ->native(false)
                    ->hidden($woredaUser),
                Select::make('fiscal_year')
                    ->label('Fiscal year')
                    ->options(fn () => Indicators::fiscalYearOptions())
                    ->default(Indicators::fiscalYearStart()->year)
                    ->selectablePlaceholder(false)
                    ->native(false),
            ])->columns($woredaUser ? 1 : 2)->compact(),
        ]);
    }

    public function getColumns(): int|string|array
    {
        return ['md' => 2, 'xl' => 2];
    }
}
