<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\Sector;

class SectorResource extends Resource
{
    protected static ?string $model = Sector::class;
    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';
    protected static ?string $navigationGroup = 'Investment';
    protected static ?int $navigationSort = 2;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('slug')->label('ID')->required()->alphaDash()->unique(ignoreRecord: true)->helperText('Short id, e.g. "agriculture". Do not change after publishing.'),
            Forms\Components\Select::make('icon')->options(Sector::ICONS)->required()->native(false),
            Bi::tabs(['title' => ['Title'], 'text' => ['Description', 'textarea']]),
            Bi::photo('sectors'),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort')->reorderable('sort')
            ->columns([
                Tables\Columns\TextColumn::make('title_en')->label('Sector')->description(fn ($record) => $record->title_am),
                Tables\Columns\TextColumn::make('icon')->badge()->color('gray'),
                Tables\Columns\TextColumn::make('opportunities_count')->counts('opportunities')->label('Opportunities'),
            ])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => SectorResource\Pages\ManageSectors::route('/')];
    }
}
