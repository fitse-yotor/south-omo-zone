<?php

namespace App\Filament\Widgets;

use App\Models\WoredaReport;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Widgets\TableWidget;
use Illuminate\Support\Facades\Auth;

class LatestReports extends TableWidget
{
    use \App\Filament\Widgets\Concerns\ReadsDashboardFilters;

    protected static ?int $sort = 5;

    protected static ?string $heading = 'Latest Woreda Reports';

    protected int|string|array $columnSpan = 'full';

    public static function canView(): bool
    {
        return Auth::user()?->is_active ?? false;
    }

    protected function getTableQuery(): \Illuminate\Database\Eloquent\Builder
    {
        $query = WoredaReport::query()->with('woreda')->latest();

        // Follows the dashboard's scope (woreda accounts are always limited to their own woreda).
        if ($woredaId = $this->scopeWoredaId()) {
            $query->where('woreda_id', $woredaId);
        }

        return $query->limit(10);
    }

    protected function getTableColumns(): array
    {
        return [
            TextColumn::make('woreda.name_en')->label('Woreda')->searchable()->hidden(fn () => Auth::user()?->isWoredaUser()),
            TextColumn::make('title')->searchable()->limit(60),
            TextColumn::make('period')->badge()->color('gray'),
            TextColumn::make('status')
                ->badge()
                ->formatStateUsing(fn ($state) => WoredaReport::STATUSES[$state] ?? $state)
                ->color(fn ($record) => $record->statusColor()),
            TextColumn::make('created_at')->label('Submitted')->date()->sortable(),
        ];
    }

    protected function isTablePaginationEnabled(): bool
    {
        return false;
    }
}
