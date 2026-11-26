<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\People;

class PeopleResource extends Resource
{
    protected static ?string $model = People::class;
    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationGroup = 'Zone & tourism';
    protected static ?string $navigationLabel = 'Peoples';
    protected static ?string $modelLabel = 'people';
    protected static ?string $pluralModelLabel = 'peoples';
    protected static ?int $navigationSort = 5;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name_en')->label('Name (English)')->required()->maxLength(120),
            Forms\Components\TextInput::make('name_am')->label('Name (አማርኛ)')->maxLength(120),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort')->reorderable('sort')
            ->columns([
                Tables\Columns\TextColumn::make('name_en')->label('English')->searchable(),
                Tables\Columns\TextColumn::make('name_am')->label('አማርኛ'),
            ])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => PeopleResource\Pages\ManagePeoples::route('/')];
    }
}
