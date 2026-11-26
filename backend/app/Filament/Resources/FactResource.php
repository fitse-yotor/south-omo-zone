<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\Fact;

class FactResource extends Resource
{
    protected static ?string $model = Fact::class;
    protected static ?string $navigationIcon = 'heroicon-o-hashtag';
    protected static ?string $navigationGroup = 'Home page';
    protected static ?string $navigationLabel = 'Key facts';
    protected static ?int $navigationSort = 2;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('value')->label('Number or short value')->required()->maxLength(40)->placeholder('233,000'),
            Bi::tabs(['label' => ['Label']]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort')->reorderable('sort')
            ->description('Shown under the home-page slideshow and on The Zone page. Four facts fit best.')
            ->columns([
                Tables\Columns\TextColumn::make('value')->weight('bold')->size('lg'),
                Tables\Columns\TextColumn::make('label_en')->label('Label')->description(fn ($record) => $record->label_am)->wrap(),
            ])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => FactResource\Pages\ManageFacts::route('/')];
    }
}
