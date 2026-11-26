<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\Itinerary;

class ItineraryResource extends Resource
{
    protected static ?string $model = Itinerary::class;
    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';
    protected static ?string $navigationGroup = 'Tourism map';
    protected static ?string $navigationLabel = 'Itineraries';
    protected static ?string $modelLabel = 'itinerary';
    protected static ?int $navigationSort = 3;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('slug')->label('ID')->required()->alphaDash()->unique(ignoreRecord: true),
            Forms\Components\Select::make('start_weekday')->label('Best day to start')->options(Itinerary::WEEKDAYS)->required()->native(false)
                ->helperText('Chosen so the trip reaches the weekly markets on their market day.'),
            Bi::tabs(['name' => ['Name'], 'sub' => ['Subtitle']]),
            Forms\Components\Repeater::make('days')->label('Days')
                ->schema([
                    Forms\Components\Repeater::make('stops')->label('Drive (in order)')
                        ->simple(Forms\Components\Select::make('stop')->options(fn () => Bi::stopOptions())->required()->native(false))
                        ->minItems(2)->reorderable()->addActionLabel('Add town')->rules([Bi::routeRule()]),
                    Forms\Components\Select::make('night')->label('Night in')->options(fn () => Bi::stopOptions())->placeholder('Last day: fly home')->native(false),
                    Forms\Components\Textarea::make('note_en')->label('Plan for the day (English)')->rows(2)->required(),
                    Forms\Components\Textarea::make('note_am')->label('Plan for the day (አማርኛ)')->rows(2),
                ])
                ->minItems(1)->reorderable()->collapsible()->addActionLabel('Add day')
                ->itemLabel(fn (array $state) => 'Day: '.collect($state['stops'] ?? [])->map(fn ($k) => is_array($k) ? ($k['stop'] ?? null) : $k)->filter()->map(fn ($k) => Bi::stopOptions()[$k] ?? $k)->join(' → '))
                ->columnSpanFull(),
            Bi::photo('itineraries'),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort')->reorderable('sort')
            ->columns([
                Tables\Columns\TextColumn::make('name_en')->label('Itinerary')->description(fn ($record) => $record->sub_en)->weight('bold'),
                Tables\Columns\TextColumn::make('days')->label('Days')->getStateUsing(fn ($record) => count($record->days ?? [])),
                Tables\Columns\TextColumn::make('start_weekday')->label('Starts')->formatStateUsing(fn ($state) => Itinerary::WEEKDAYS[(int) $state] ?? $state),
            ])
            ->actions([Tables\Actions\EditAction::make()->slideOver(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ItineraryResource\Pages\ManageItineraries::route('/')];
    }
}
