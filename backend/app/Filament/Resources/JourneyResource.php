<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\Journey;

class JourneyResource extends Resource
{
    protected static ?string $model = Journey::class;
    protected static ?string $navigationIcon = 'heroicon-o-arrow-trending-up';
    protected static ?string $navigationGroup = 'Tourism map';
    protected static ?string $navigationLabel = 'Journeys from Jinka';
    protected static ?int $navigationSort = 2;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('slug')->label('ID')->required()->alphaDash()->unique(ignoreRecord: true),
            Forms\Components\Repeater::make('stops')->label('Route (in driving order, starting at Jinka)')
                ->simple(Forms\Components\Select::make('stop')->options(fn () => Bi::stopOptions())->required()->native(false))
                ->minItems(2)->reorderable()->addActionLabel('Add town')->rules([Bi::routeRule()])->columnSpanFull(),
            Bi::tabs([
                'name' => ['Name'],
                'sub' => ['Subtitle'],
                'tip' => ['Travel tip', 'textarea', ['rows' => 3]],
                'stay_note' => ['Where to stay (advice)', 'textarea', ['rows' => 2, 'optional' => true]],
            ]),
            Forms\Components\CheckboxList::make('stay_at')->label('Suggested towns to stay in')->options(fn () => Bi::stopOptions())->columns(4)->columnSpanFull(),
            Bi::photo('journeys'),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort')->reorderable('sort')
            ->columns([
                Tables\Columns\TextColumn::make('name_en')->label('Journey')->description(fn ($record) => $record->sub_en)->weight('bold'),
                Tables\Columns\TextColumn::make('stops')->label('Route')->formatStateUsing(fn ($state) => Bi::stopOptions()[$state] ?? $state)->separator(' → ')->listWithLineBreaks(false),
            ])
            ->actions([Tables\Actions\EditAction::make()->slideOver(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => JourneyResource\Pages\ManageJourneys::route('/')];
    }
}
