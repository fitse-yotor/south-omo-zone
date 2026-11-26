<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\SiteSetting;

class SiteSettingResource extends Resource
{
    protected static ?string $model = SiteSetting::class;
    protected static ?string $navigationIcon = 'heroicon-o-phone';
    protected static ?string $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Contact details';
    protected static ?string $modelLabel = 'contact details';
    protected static ?string $pluralModelLabel = 'contact details';

    public static function canViewAny(): bool
    {
        return Bi::isAdmin();
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('phone')->tel()->maxLength(40),
            Forms\Components\TextInput::make('email')->label('General email')->email(),
            Forms\Components\TextInput::make('invest_email')->label('Investment desk email')->email(),
            Forms\Components\TextInput::make('tourism_email')->label('Tourism office email')->email(),
            Bi::tabs(['address' => ['Address'], 'hours' => ['Office hours']]),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('phone'),
                Tables\Columns\TextColumn::make('email'),
                Tables\Columns\TextColumn::make('invest_email')->label('Investment desk'),
                Tables\Columns\TextColumn::make('address_en')->label('Address')->wrap(),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->paginated(false);
    }

    public static function getPages(): array
    {
        return ['index' => SiteSettingResource\Pages\ManageSiteSettings::route('/')];
    }
}
