<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\Market;
use App\Models\Woreda;

class MarketResource extends Resource
{
    protected static ?string $model = Market::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationGroup = 'Zone & tourism';
    protected static ?string $navigationLabel = 'Weekly markets';
    protected static ?int $navigationSort = 4;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Bi::tabs(['place' => ['Market town']]),
            Forms\Components\Select::make('woreda_slug')->label('Woreda')->options(fn () => Woreda::orderBy('sort')->pluck('name_en', 'slug'))->native(false),
            Forms\Components\Select::make('stop_key')->label('Town on the tourism map')->options(fn () => Bi::stopOptions())->native(false)
                ->helperText('Choose the map town so trips show the market on the right day. Leave empty if the town is not on the map.'),
            Forms\Components\CheckboxList::make('days')->label('Market days')->options(Market::DAYS)->columns(4)->required()->columnSpanFull(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort')->reorderable('sort')
            ->description('Shown on the Tourism page calendar and used by the trip planner on the map.')
            ->columns([
                Tables\Columns\TextColumn::make('place_en')->label('Market')->description(fn ($record) => $record->place_am)->weight('bold'),
                Tables\Columns\TextColumn::make('days')->label('Days')->badge()
                    ->formatStateUsing(fn ($state) => Market::DAYS[(int) $state] ?? $state),
                Tables\Columns\TextColumn::make('woreda_slug')->label('Woreda')->formatStateUsing(fn ($state) => Woreda::where('slug', $state)->value('name_en') ?? $state),
            ])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => MarketResource\Pages\ManageMarkets::route('/')];
    }
}
