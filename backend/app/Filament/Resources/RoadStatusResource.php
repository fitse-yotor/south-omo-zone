<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\RoadStatus;
use App\Models\SiteSetting;
use Filament\Notifications\Notification;

class RoadStatusResource extends Resource
{
    protected static ?string $model = RoadStatus::class;
    protected static ?string $navigationIcon = 'heroicon-o-truck';
    protected static ?string $navigationGroup = 'Zone & tourism';
    protected static ?string $navigationLabel = 'Road status';
    protected static ?string $modelLabel = 'road';
    protected static ?int $navigationSort = 3;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function canCreate(): bool
    {
        return false; // road legs are fixed by the map
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('status')->options(RoadStatus::STATUSES)->required()->native(false),
            Bi::tabs(['note' => ['Note for travellers (optional)', 'text', ['optional' => true]]]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->heading('Roads on the Tourism page map')
            ->description(fn () => 'Last confirmed: '.(SiteSetting::current()->road_status_checked_on?->format('d M Y') ?? 'never: the site shows "not yet confirmed"'))
            ->columns([
                Tables\Columns\TextColumn::make('leg')->label('Road')->formatStateUsing(fn ($state) => collect(explode('-', $state))->map(fn ($x) => ucfirst($x))->join(' → ')),
                Tables\Columns\SelectColumn::make('status')->options(RoadStatus::STATUSES)->selectablePlaceholder(false),
                Tables\Columns\TextColumn::make('note_en')->label('Note')->placeholder('—')->wrap(),
                Tables\Columns\TextColumn::make('updated_at')->label('Changed')->since(),
            ])
            ->headerActions([
                Tables\Actions\Action::make('confirm')->label('Mark all as checked today')->icon('heroicon-o-check-badge')
                    ->action(function () {
                        SiteSetting::current()->update(['road_status_checked_on' => today()]);
                        Notification::make()->title('Road status confirmed for today')->success()->send();
                    }),
            ])
            ->actions([Tables\Actions\EditAction::make()->label('Note')]);
    }

    public static function getPages(): array
    {
        return ['index' => RoadStatusResource\Pages\ManageRoadStatuses::route('/')];
    }
}
