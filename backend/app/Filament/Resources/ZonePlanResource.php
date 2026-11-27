<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use App\Models\PlanTask;
use App\Models\PlanTaskProgress;
use App\Models\Woreda;
use App\Models\ZonePlan;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class ZonePlanResource extends Resource
{
    protected static ?string $model = ZonePlan::class;
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?string $navigationGroup = 'Woreda Portal';
    protected static ?string $navigationLabel = 'Zone Plans';
    protected static ?int $navigationSort = 2;

    public static function canViewAny(): bool
    {
        return Auth::user()?->is_active ?? false;
    }

    public static function canCreate(): bool
    {
        return Bi::canEditContent();
    }

    public static function canEdit($record): bool
    {
        return Bi::canEditContent();
    }

    public static function canDelete($record): bool
    {
        return Bi::isAdmin();
    }

    /** Woreda users only see active/closed plans assigned to their woreda. */
    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery()->with(['woredas', 'tasks', 'createdBy']);

        if (Auth::user()?->isWoredaUser()) {
            $query->whereHas('woredas', fn ($q) => $q->where('woredas.id', Auth::user()->woreda_id))
                ->whereIn('status', ['active', 'closed']);
        }

        return $query->latest();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Plan Details')->schema([
                Forms\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255)
                    ->columnSpanFull(),

                Forms\Components\Select::make('period_type')
                    ->options(ZonePlan::PERIOD_TYPES)
                    ->default('quarterly')
                    ->native(false)
                    ->required(),

                Forms\Components\TextInput::make('period')
                    ->label('Period Label')
                    ->required()
                    ->maxLength(100)
                    ->placeholder('e.g. Q1 FY2026/27'),

                Forms\Components\DatePicker::make('start_date')->native(false),
                Forms\Components\DatePicker::make('due_date')->label('Due Date')->native(false),

                Forms\Components\Select::make('status')
                    ->options(ZonePlan::STATUSES)
                    ->default('draft')
                    ->native(false)
                    ->required(),

                Forms\Components\Textarea::make('description')
                    ->rows(4)
                    ->columnSpanFull(),
            ])->columns(2),

            Forms\Components\Section::make('Assigned Woredas')
                ->description('Select which woredas this plan applies to. Leave empty to assign to all.')
                ->schema([
                    Forms\Components\CheckboxList::make('woredas')
                        ->relationship('woredas', 'name_en')
                        ->columns(3)
                        ->columnSpanFull(),
                ])
                ->collapsible(),

            Forms\Components\Section::make('Plan Tasks / Targets')
                ->description('Add the specific tasks or targets within this plan.')
                ->schema([
                    Forms\Components\Repeater::make('tasks')
                        ->relationship()
                        ->schema([
                            Forms\Components\TextInput::make('title')
                                ->required()
                                ->maxLength(255)
                                ->columnSpan(3),
                            Forms\Components\TextInput::make('target_value')
                                ->label('Target')
                                ->numeric()
                                ->default(100)
                                ->minValue(1)
                                ->maxValue(1000),
                            Forms\Components\TextInput::make('target_unit')
                                ->label('Unit')
                                ->default('%')
                                ->maxLength(20),
                            Forms\Components\Textarea::make('description')
                                ->rows(2)
                                ->columnSpanFull(),
                        ])
                        ->columns(5)
                        ->orderColumn('sort') // saves the dragged order (reorderable('sort') only switched dragging on)
                        ->addActionLabel('Add Task')
                        ->columnSpanFull(),
                ])
                ->collapsible(),
        ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Section::make('Plan Overview')->schema([
                Infolists\Components\TextEntry::make('title')->columnSpanFull(),
                Infolists\Components\TextEntry::make('period')->badge()->color('gray'),
                Infolists\Components\TextEntry::make('status')
                    ->badge()
                    ->color(fn ($record) => $record->statusColor()),
                Infolists\Components\TextEntry::make('start_date')->date(),
                Infolists\Components\TextEntry::make('due_date')->date(),
                Infolists\Components\TextEntry::make('createdBy.name')->label('Created By'),
                Infolists\Components\TextEntry::make('description')->columnSpanFull(),
            ])->columns(3),

            Infolists\Components\Section::make('Assigned Woredas')->schema([
                Infolists\Components\TextEntry::make('woredas.name_en')
                    ->label('Woredas')
                    ->badge()
                    ->color('info')
                    ->columnSpanFull(),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->limit(50),
                Tables\Columns\TextColumn::make('period')
                    ->badge()
                    ->color('gray'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => ZonePlan::STATUSES[$state] ?? $state)
                    ->color(fn ($record) => $record->statusColor()),
                Tables\Columns\TextColumn::make('due_date')
                    ->label('Due')
                    ->date()
                    ->sortable()
                    ->color(fn ($record) => $record->due_date?->isPast() && $record->status === 'active' ? 'danger' : null),
                Tables\Columns\TextColumn::make('woredas_count')
                    ->counts('woredas')
                    ->label('Woredas'),
                Tables\Columns\TextColumn::make('tasks_count')
                    ->counts('tasks')
                    ->label('Tasks'),
                // Overall progress bar column
                Tables\Columns\TextColumn::make('id')
                    ->label('Progress')
                    ->formatStateUsing(function ($record) {
                        $pct = $record->overallProgress();

                        return "{$pct}%";
                    })
                    ->badge()
                    ->color(fn ($record) => match (true) {
                        $record->overallProgress() >= 80 => 'success',
                        $record->overallProgress() >= 50 => 'warning',
                        default                           => 'danger',
                    }),
                Tables\Columns\TextColumn::make('createdBy.name')
                    ->label('Created By')
                    ->toggleable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(ZonePlan::STATUSES)
                    ->native(false),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make()
                    ->visible(fn () => Bi::canEditContent()),
                // Update progress action (for woreda users)
                Tables\Actions\Action::make('update_progress')
                    ->label('Update Progress')
                    ->icon('heroicon-o-chart-bar')
                    ->color('info')
                    ->visible(fn (ZonePlan $record) => Auth::user()?->isWoredaUser() && $record->status === 'active')
                    ->url(fn (ZonePlan $record) => static::getUrl('progress', ['record' => $record])),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->visible(fn () => Bi::isAdmin()),
                ]),
            ]);
    }

    public static function getRelationManagers(): array
    {
        return [
            ZonePlanResource\RelationManagers\TasksProgressRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'    => ZonePlanResource\Pages\ListZonePlans::route('/'),
            'create'   => ZonePlanResource\Pages\CreateZonePlan::route('/create'),
            'view'     => ZonePlanResource\Pages\ViewZonePlan::route('/{record}'),
            'edit'     => ZonePlanResource\Pages\EditZonePlan::route('/{record}/edit'),
            'progress' => ZonePlanResource\Pages\UpdatePlanProgress::route('/{record}/progress'),
        ];
    }
}
