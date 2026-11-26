<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\ContactMessage;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Illuminate\Support\Facades\Auth;

class ContactMessageResource extends Resource
{
    protected static ?string $model = ContactMessage::class;
    protected static ?string $navigationIcon = 'heroicon-o-envelope';
    protected static ?string $navigationGroup = 'Notice board';
    protected static ?string $navigationLabel = 'Messages';
    protected static ?int $navigationSort = 2;

    public static function canViewAny(): bool
    {
        return (bool) Auth::user();
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getNavigationBadge(): ?string
    {
        $n = ContactMessage::whereNull('read_at')->count();

        return $n ? (string) $n : null;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\TextEntry::make('name'),
            Infolists\Components\TextEntry::make('email')->copyable()->url(fn ($record) => 'mailto:'.$record->email),
            Infolists\Components\TextEntry::make('desk')->formatStateUsing(fn ($state) => ContactMessage::DESKS[$state] ?? $state)->badge(),
            Infolists\Components\TextEntry::make('created_at')->label('Received')->dateTime('d M Y, H:i'),
            Infolists\Components\TextEntry::make('message')->columnSpanFull()->prose(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\IconColumn::make('read_at')->label('')->boolean()->getStateUsing(fn ($record) => $record->read_at !== null)
                    ->trueIcon('heroicon-o-envelope-open')->falseIcon('heroicon-s-envelope')->falseColor('warning')->trueColor('gray'),
                Tables\Columns\TextColumn::make('name')->searchable()->weight(fn ($record) => $record->read_at ? null : 'bold'),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('desk')->badge()->formatStateUsing(fn ($state) => ContactMessage::DESKS[$state] ?? $state),
                Tables\Columns\TextColumn::make('message')->limit(60)->wrap(),
                Tables\Columns\TextColumn::make('created_at')->label('Received')->since()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('desk')->options(ContactMessage::DESKS),
                Tables\Filters\TernaryFilter::make('read_at')->label('Read')->nullable(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()->after(fn (ContactMessage $record) => $record->read_at ?: $record->update(['read_at' => now()])),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([Tables\Actions\DeleteBulkAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ContactMessageResource\Pages\ManageContactMessages::route('/')];
    }
}
