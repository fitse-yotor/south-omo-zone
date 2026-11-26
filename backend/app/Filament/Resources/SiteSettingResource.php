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
    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';
    protected static ?string $navigationGroup = 'Home page';
    protected static ?string $navigationLabel = 'Zone texts & contact';
    protected static ?string $modelLabel = 'zone texts & contact';
    protected static ?string $pluralModelLabel = 'zone texts & contact';
    protected static ?int $navigationSort = 0;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Zone name and home page')->schema([
                Bi::tabs([
                    'name' => ['Zone name'],
                    'admin' => ['Administration name'],
                    'region' => ['Region'],
                    'capital' => ['Capital'],
                    'tagline' => ['Home page headline'],
                    'intro' => ['Home page introduction', 'textarea', ['rows' => 4]],
                ]),
            ]),
            Forms\Components\Section::make('Contact details')->schema([
                Forms\Components\TextInput::make('phone')->tel()->maxLength(40),
                Forms\Components\TextInput::make('email')->label('General email')->email(),
                Forms\Components\TextInput::make('invest_email')->label('Investment desk email')->email(),
                Forms\Components\TextInput::make('tourism_email')->label('Tourism office email')->email(),
                Bi::tabs(['address' => ['Address'], 'hours' => ['Office hours']]),
            ])->columns(2),
            Forms\Components\Section::make('Tourism map')->schema([
                Forms\Components\CheckboxList::make('rainy_months')->label('Rainy-season months (gravel roads may be slow)')
                    ->options([0 => 'Jan', 1 => 'Feb', 2 => 'Mar', 3 => 'Apr', 4 => 'May', 5 => 'Jun', 6 => 'Jul', 7 => 'Aug', 8 => 'Sep', 9 => 'Oct', 10 => 'Nov', 11 => 'Dec'])
                    ->columns(6),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('tagline_en')->label('Headline')->wrap(),
                Tables\Columns\TextColumn::make('phone'),
                Tables\Columns\TextColumn::make('email'),
                Tables\Columns\TextColumn::make('invest_email')->label('Investment desk'),
                Tables\Columns\TextColumn::make('address_en')->label('Address')->wrap(),
            ])
            ->actions([Tables\Actions\EditAction::make()->slideOver()])
            ->paginated(false);
    }

    public static function getPages(): array
    {
        return ['index' => SiteSettingResource\Pages\ManageSiteSettings::route('/')];
    }
}
