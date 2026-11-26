<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\Sector;
use App\Models\Woreda;

class WoredaResource extends Resource
{
    protected static ?string $model = Woreda::class;
    protected static ?string $navigationIcon = 'heroicon-o-map';
    protected static ?string $navigationGroup = 'Zone & tourism';
    protected static ?int $navigationSort = 1;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('slug')->label('ID')->required()->alphaDash()->unique(ignoreRecord: true)->helperText('Used in the page address, e.g. "hamer". Do not change after publishing.'),
            Forms\Components\TextInput::make('sort')->numeric()->default(0),
            Bi::tabs([
                'name' => ['Name'],
                'seat' => ['Administrative seat', 'text', ['optional' => true]],
                'peoples' => ['Peoples'],
                'tagline' => ['Tagline'],
                'about' => ['About', 'textarea', ['rows' => 5]],
                'highlights' => ['Highlights', 'lines'],
            ]),
            Forms\Components\CheckboxList::make('sector_slugs')->label('Key sectors')->options(fn () => Sector::orderBy('sort')->pluck('title_en', 'slug'))->columns(3)->columnSpanFull(),
            Bi::photo('woredas'),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort')->reorderable('sort')
            ->columns([
                Tables\Columns\TextColumn::make('name_en')->label('Woreda')->description(fn ($record) => $record->name_am)->searchable(['name_en', 'name_am']),
                Tables\Columns\TextColumn::make('seat_en')->label('Seat')->placeholder('Not confirmed'),
                Tables\Columns\TextColumn::make('opportunities_count')->counts('opportunities')->label('Opportunities'),
            ])
            ->actions([Tables\Actions\EditAction::make()->slideOver(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => WoredaResource\Pages\ManageWoredas::route('/')];
    }
}
