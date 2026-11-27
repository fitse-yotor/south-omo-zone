<?php

namespace App\Filament\Resources\ZonePlanResource\Pages;

use App\Filament\Resources\ZonePlanResource;
use App\Models\PlanTaskProgress;
use App\Models\ZonePlan;
use Filament\Actions\Action;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Illuminate\Support\Facades\Auth;

class UpdatePlanProgress extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string $resource = ZonePlanResource::class;

    protected static string $view = 'filament.pages.update-plan-progress';

    public ZonePlan $record;

    public ?array $data = [];

    public function mount(): void
    {
        $woredaId = Auth::user()->woreda_id;

        $tasks = $this->record->tasks->map(function ($task) use ($woredaId) {
            $existing = $task->progress()->where('woreda_id', $woredaId)->first();

            return [
                'task_id'   => $task->id,
                'title'     => $task->title,
                'target'    => "{$task->target_value} {$task->target_unit}",
                'progress'  => $existing?->progress ?? 0,
                'note'      => $existing?->note ?? '',
            ];
        });

        $this->form->fill(['tasks' => $tasks->toArray()]);
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Update Your Progress')
                ->description("Update progress for each task in the plan. Your woreda: {$this->record->title}")
                ->schema([
                    Repeater::make('tasks')
                        ->schema([
                            Hidden::make('task_id'),
                            TextInput::make('title')
                                ->disabled()
                                ->dehydrated(false)
                                ->label('Task'),
                            TextInput::make('target')
                                ->disabled()
                                ->dehydrated(false)
                                ->label('Target'),
                            TextInput::make('progress')
                                ->label('Progress %')
                                ->numeric()
                                ->minValue(0)
                                ->maxValue(100)
                                ->required(),
                            Textarea::make('note')
                                ->label('Note / Comment')
                                ->rows(2),
                        ])
                        ->columns(4)
                        ->deletable(false)
                        ->addable(false)
                        ->reorderable(false)
                        ->columnSpanFull(),
                ]),
        ])->statePath('data');
    }

    public function save(): void
    {
        $woredaId = Auth::user()->woreda_id;

        foreach ($this->data['tasks'] as $row) {
            PlanTaskProgress::updateOrCreate(
                [
                    'plan_task_id' => $row['task_id'],
                    'woreda_id'    => $woredaId,
                ],
                [
                    'progress'   => (int) $row['progress'],
                    'note'       => $row['note'] ?? null,
                    'updated_by' => Auth::id(),
                ]
            );
        }

        Notification::make()->title('Progress saved successfully')->success()->send();

        $this->redirect(ZonePlanResource::getUrl('view', ['record' => $this->record]));
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('back')
                ->label('Back to Plan')
                ->url(ZonePlanResource::getUrl('view', ['record' => $this->record]))
                ->color('gray'),
        ];
    }

    public function getTitle(): string
    {
        return 'Update Progress: '.$this->record->title;
    }
}
