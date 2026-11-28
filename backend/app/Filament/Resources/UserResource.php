<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\User;
use App\Models\Woreda;
use Illuminate\Support\Facades\Auth;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Staff & Woreda accounts';

    public static function canViewAny(): bool
    {
        return Bi::isAdmin();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')->required()->maxLength(120),
            Forms\Components\TextInput::make('email')->email()->required()->unique(ignoreRecord: true),

            Forms\Components\Select::make('role')
                ->options(User::ROLES)
                ->required()
                ->default('editor')
                ->native(false)
                ->live()
                ->disabled(fn (?User $record) => $record?->is(Auth::user()))
                ->dehydrated()
                ->helperText('Woreda accounts can submit reports and view plans for their woreda.'),

            // Show woreda picker only for the 'woreda' role
            Forms\Components\Select::make('woreda_id')
                ->label('Assigned Woreda')
                ->options(fn () => Woreda::orderBy('name_en')->pluck('name_en', 'id'))
                ->searchable()
                ->native(false)
                ->visible(fn (Get $get) => $get('role') === 'woreda')
                ->required(fn (Get $get) => $get('role') === 'woreda')
                ->helperText('The woreda this account belongs to.'),

            Forms\Components\TextInput::make('password')
                ->password()
                ->revealable()
                ->minLength(12)
                ->required(fn (string $operation) => $operation === 'create')
                ->dehydrated(fn ($state) => filled($state))
                ->helperText(fn (string $operation) => $operation === 'edit' ? 'Leave empty to keep the current password.' : 'At least 12 characters.'),

            Forms\Components\Toggle::make('is_active')
                ->label('Can sign in')
                ->default(true)
                ->disabled(fn (?User $record) => $record?->is(Auth::user()))
                ->dehydrated(),

            Forms\Components\Select::make('locale')
                ->label('Admin UI Language')
                ->options(['en' => '🇬🇧 English', 'am' => '🇪🇹 አማርኛ (Amharic)'])
                ->default('en')
                ->native(false)
                ->helperText('The language this user sees in the admin panel.'),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('role')
                    ->badge()
                    ->formatStateUsing(fn ($state) => User::ROLES[$state] ?? $state)
                    ->color(fn ($state) => match ($state) {
                        'admin'   => 'danger',
                        'editor'  => 'info',
                        'notices' => 'warning',
                        'woreda'  => 'success',
                        default   => 'gray',
                    }),
                Tables\Columns\TextColumn::make('woreda.name_en')
                    ->label('Woreda')
                    ->placeholder('—')
                    ->searchable(),
                Tables\Columns\IconColumn::make('is_active')->label('Active')->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->options(User::ROLES)
                    ->native(false),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()->hidden(fn (User $record) => $record->is(Auth::user())),
            ]);
    }

    public static function getPages(): array
    {
        return ['index' => UserResource\Pages\ManageUsers::route('/')];
    }
}
