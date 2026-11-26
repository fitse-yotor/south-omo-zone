<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Staff accounts';

    public static function canViewAny(): bool
    {
        return Bi::isAdmin();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')->required()->maxLength(120),
            Forms\Components\TextInput::make('email')->email()->required()->unique(ignoreRecord: true),
            Forms\Components\Select::make('role')->options(User::ROLES)->required()->default('editor')->native(false)
                ->disabled(fn (?User $record) => $record?->is(Auth::user()))->dehydrated(),
            Forms\Components\TextInput::make('password')->password()->revealable()->minLength(12)
                ->required(fn (string $operation) => $operation === 'create')
                ->dehydrated(fn ($state) => filled($state))
                ->helperText(fn (string $operation) => $operation === 'edit' ? 'Leave empty to keep the current password.' : 'At least 12 characters.'),
            Forms\Components\Toggle::make('is_active')->label('Can sign in')->default(true)
                ->disabled(fn (?User $record) => $record?->is(Auth::user()))->dehydrated(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('role')->badge()->formatStateUsing(fn ($state) => User::ROLES[$state] ?? $state),
                Tables\Columns\IconColumn::make('is_active')->label('Active')->boolean(),
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
