<?php

namespace App\Filament\Resources\ZonePlanResource\RelationManagers;

use App\Models\PlanTask;
use App\Models\PlanTaskProgress;
use App\Models\Woreda;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

/**
 * Lists every task in the plan with the average progress across all assigned woredas.
 * Zone staff can also record progress per woreda from here.
 */
class TasksProgressRelationManager extends RelationManager
{
    protected static string $relationship = 'tasks';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('title')->required(),
        ]);
    }

    public function table(Table $table): Table
    {
        $woredaUser = Auth::user()?->isWoredaUser();

        return $table
            ->recordTitleAttribute('title')
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->description(fn (PlanTask $record) => $record->description)
                    ->wrap(),
                Tables\Columns\TextColumn::make('target_value')
                    ->label('Target')
                    ->formatStateUsing(fn (PlanTask $record) => "{$record->target_value} {$record->target_unit}"),
                Tables\Columns\TextColumn::make('averageProgress')
                    ->label('Avg Progress')
                    ->formatStateUsing(fn (PlanTask $record) => $woredaUser
                        ? $record->progressFor(Auth::user()->woreda_id).'% (my woreda)'
                        : $record->averageProgress().'% (all woredas)')
                    ->badge()
                    ->color(fn (PlanTask $record) => match (true) {
                        ($woredaUser ? $record->progressFor(Auth::user()->woreda_id) : $record->averageProgress()) >= 80 => 'success',
                        ($woredaUser ? $record->progressFor(Auth::user()->woreda_id) : $record->averageProgress()) >= 50 => 'warning',
                        default => 'danger',
                    }),
            ])
            ->headerActions([
                // Zone staff: record progress for a woreda
                Tables\Actions\Action::make('record_progress')
                    ->label('Record Progress')
                    ->icon('heroicon-o-pencil-square')
                    ->visible(fn () => ! $woredaUser)
                    ->form([
                        Forms\Components\Select::make('plan_task_id')
                            ->label('Task')
                            ->options(fn (RelationManager $livewire) => $livewire->getOwnerRecord()->tasks->pluck('title', 'id'))
                            ->required()
                            ->native(false),
                        Forms\Components\Select::make('woreda_id')
                            ->label('Woreda')
                            ->options(fn (RelationManager $livewire) => $livewire->getOwnerRecord()->woredas->pluck('name_en', 'id'))
                            ->required()
                            ->native(false)
                            ->helperText('Only woredas assigned to this plan.'),
                        Forms\Components\TextInput::make('progress')
                            ->label('Progress %')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->default(0)
                            ->required(),
                        Forms\Components\Textarea::make('note')
                            ->rows(2),
                    ])
                    ->action(function (array $data) {
                        PlanTaskProgress::updateOrCreate(
                            [
                                'plan_task_id' => $data['plan_task_id'],
                                'woreda_id'    => $data['woreda_id'],
                            ],
                            [
                                'progress'   => $data['progress'],
                                'note'       => $data['note'] ?? null,
                                'updated_by' => Auth::id(),
                            ]
                        );
                        \Filament\Notifications\Notification::make()->title('Progress recorded')->success()->send();
                    }),
            ])
            ->actions([
                // Edit a single task (zone staff)
                Tables\Actions\EditAction::make()
                    ->visible(fn () => ! $woredaUser),

                // Woreda users update their own progress
                Tables\Actions\Action::make('update_own_progress')
                    ->label('Update Progress')
                    ->icon('heroicon-o-arrow-up-on-square')
                    ->color('success')
                    ->visible(fn () => $woredaUser)
                    ->form([
                        Forms\Components\TextInput::make('progress')
                            ->label('Progress %')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->default(fn (PlanTask $record) => $record->progressFor(Auth::user()->woreda_id))
                            ->required(),
                        Forms\Components\Textarea::make('note')
                            ->label('Note')
                            ->rows(2)
                            ->default(fn (PlanTask $record) => $record->progress()->where('woreda_id', Auth::user()->woreda_id)->value('note')),
                    ])
                    ->action(function (PlanTask $record, array $data) {
                        PlanTaskProgress::updateOrCreate(
                            [
                                'plan_task_id' => $record->id,
                                'woreda_id'    => Auth::user()->woreda_id,
                            ],
                            [
                                'progress'   => $data['progress'],
                                'note'       => $data['note'] ?? null,
                                'updated_by' => Auth::id(),
                            ]
                        );
                        \Filament\Notifications\Notification::make()->title('Your progress has been saved')->success()->send();
                    }),
            ])
            ->bulkActions([]);
    }
}
