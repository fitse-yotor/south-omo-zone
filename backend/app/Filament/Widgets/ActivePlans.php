<?php

namespace App\Filament\Widgets;

use App\Models\ZonePlan;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Widgets\TableWidget;
use Illuminate\Support\Facades\Auth;

class ActivePlans extends TableWidget
{
    protected static ?int $sort = 6;

    protected static ?string $heading = 'Active Zone Plans';

    protected int|string|array $columnSpan = 'full';

    public static function canView(): bool
    {
        return Auth::user()?->is_active ?? false;
    }

    protected function getTableQuery(): \Illuminate\Database\Eloquent\Builder
    {
        $query = ZonePlan::query()->with('woredas')->where('status', 'active');

        if (Auth::user()?->isWoredaUser()) {
            $query->whereHas('woredas', fn ($q) => $q->where('woredas.id', Auth::user()->woreda_id));
        }

        return $query->orderBy('due_date');
    }

    protected function getTableColumns(): array
    {
        return [
            TextColumn::make('title')->searchable()->limit(60),
            TextColumn::make('period')->badge()->color('gray'),
            TextColumn::make('due_date')
                ->label('Due')
                ->date()
                ->color(fn ($record) => $record->due_date?->isPast() ? 'danger' : null),
            // Overall progress
            TextColumn::make('id')
                ->label('Overall Progress')
                ->formatStateUsing(fn ($record) => $record->overallProgress().'%')
                ->badge()
                ->color(fn ($record) => match (true) {
                    $record->overallProgress() >= 80 => 'success',
                    $record->overallProgress() >= 50 => 'warning',
                    default                           => 'danger',
                }),
            TextColumn::make('woredas_count')
                ->counts('woredas')
                ->label('Woredas'),
        ];
    }

    protected function isTablePaginationEnabled(): bool
    {
        return false;
    }

    protected function getTableActions(): array
    {
        return [
            Tables\Actions\Action::make('view')
                ->url(fn (ZonePlan $record) => \App\Filament\Resources\ZonePlanResource::getUrl('view', ['record' => $record]))
                ->icon('heroicon-o-eye'),
            Tables\Actions\Action::make('update_progress')
                ->label('Update Progress')
                ->icon('heroicon-o-pencil-square')
                ->color('info')
                ->visible(fn (ZonePlan $record) => Auth::user()?->isWoredaUser())
                ->url(fn (ZonePlan $record) => \App\Filament\Resources\ZonePlanResource::getUrl('progress', ['record' => $record])),
        ];
    }
}
