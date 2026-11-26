<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\PhotoCredit;

class PhotoCreditResource extends Resource
{
    protected static ?string $model = PhotoCredit::class;
    protected static ?string $navigationIcon = 'heroicon-o-camera';
    protected static ?string $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Photo credits';
    protected static ?int $navigationSort = 4;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function canCreate(): bool
    {
        return false; // built-in photos ship with the site; uploaded photos carry their own credit field
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('photo_id')->label('Photo')->disabled()->dehydrated(false),
            Forms\Components\TextInput::make('author')->label('Photographer / author')->required()->maxLength(255),
            Forms\Components\TextInput::make('license')->label('Licence')->maxLength(100)->placeholder('CC BY-SA 2.0'),
            Forms\Components\TextInput::make('source_url')->label('Source page')->url()->maxLength(255),
            Forms\Components\TextInput::make('title')->maxLength(255)->columnSpanFull(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('photo_id')
            ->description('Licences such as CC BY-SA require the photographer to be credited. Do not remove credits for photos still in use.')
            ->columns([
                Tables\Columns\ImageColumn::make('preview')->getStateUsing(fn ($record) => asset('images/'.$record->photo_id.'.jpg'))->height(48),
                Tables\Columns\TextColumn::make('photo_id')->label('Photo')->searchable(),
                Tables\Columns\TextColumn::make('author')->searchable(),
                Tables\Columns\TextColumn::make('license')->badge()->color('gray'),
            ])
            ->actions([Tables\Actions\EditAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => PhotoCreditResource\Pages\ManagePhotoCredits::route('/')];
    }
}
