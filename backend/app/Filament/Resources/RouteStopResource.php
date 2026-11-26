<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\RouteStop;

class RouteStopResource extends Resource
{
    protected static ?string $model = RouteStop::class;
    protected static ?string $navigationIcon = 'heroicon-o-map-pin';
    protected static ?string $navigationGroup = 'Tourism map';
    protected static ?string $navigationLabel = 'Towns & places to stay';
    protected static ?string $modelLabel = 'town';
    protected static ?int $navigationSort = 1;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function canCreate(): bool
    {
        return false; // towns are fixed by the map's road data
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('key')->label('Map ID')->disabled()->dehydrated(false)
                ->helperText('Fixed: the town\'s position and roads come from the map data.'),
            Forms\Components\CheckboxList::make('services')->options(RouteStop::SERVICES)->columns(4),
            Bi::tabs(['name' => ['Name']]),
            Bi::photo('towns'),
            Forms\Components\Repeater::make('stays')->label('Places to stay')->relationship()->orderColumn('sort')
                ->schema([
                    Forms\Components\TextInput::make('name_en')->label('Name (English)')->required(),
                    Forms\Components\TextInput::make('name_am')->label('Name (አማርኛ)'),
                    Forms\Components\TextInput::make('type_en')->label('Type (English)')->placeholder('Lodge, Hotel, Camping…'),
                    Forms\Components\TextInput::make('type_am')->label('Type (አማርኛ)'),
                ])->columns(2)->addActionLabel('Add a place to stay')->collapsible()
                ->itemLabel(fn (array $state) => $state['name_en'] ?? null)->columnSpanFull(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort')
            ->columns([
                Tables\Columns\TextColumn::make('name_en')->label('Town')->description(fn ($record) => $record->name_am)->weight('bold'),
                Tables\Columns\TextColumn::make('services')->badge()->formatStateUsing(fn ($state) => RouteStop::SERVICES[$state] ?? $state),
                Tables\Columns\TextColumn::make('stays_count')->counts('stays')->label('Places to stay'),
            ])
            ->actions([Tables\Actions\EditAction::make()->slideOver()]);
    }

    public static function getPages(): array
    {
        return ['index' => RouteStopResource\Pages\ManageRouteStops::route('/')];
    }
}
