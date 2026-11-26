<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\Attraction;

class AttractionResource extends Resource
{
    protected static ?string $model = Attraction::class;
    protected static ?string $navigationIcon = 'heroicon-o-camera';
    protected static ?string $navigationGroup = 'Zone & tourism';
    protected static ?int $navigationSort = 2;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('slug')->label('ID')->required()->alphaDash()->unique(ignoreRecord: true),
            Forms\Components\Select::make('journey_slug')->label('"Plan this trip" opens the journey')
                ->options(fn () => \App\Models\Journey::orderBy('sort')->pluck('name_en', 'slug'))->native(false),
            Bi::tabs(['title' => ['Title'], 'tag' => ['Label (e.g. "Wildlife & savanna")', 'text', ['optional' => true]], 'text' => ['Description', 'textarea', ['rows' => 5]]]),
            Bi::photo('attractions'),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort')->reorderable('sort')
            ->columns([
                Tables\Columns\TextColumn::make('title_en')->label('Attraction')->description(fn ($record) => $record->title_am),
                Tables\Columns\TextColumn::make('tag_en')->label('Label')->badge()->color('gray'),
            ])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => AttractionResource\Pages\ManageAttractions::route('/')];
    }
}
