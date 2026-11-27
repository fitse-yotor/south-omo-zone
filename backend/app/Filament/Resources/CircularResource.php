<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use App\Models\Circular;
use Carbon\Carbon;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\HtmlString;

/** Zone circulars: directives and memos to woredas, with read and acknowledgement tracking. */
class CircularResource extends Resource
{
    protected static ?string $model = Circular::class;

    protected static ?string $navigationIcon = 'heroicon-o-megaphone';

    protected static ?string $navigationGroup = 'Woreda Portal';

    protected static ?string $navigationLabel = 'Circulars';

    protected static ?int $navigationSort = 3;

    public static function canViewAny(): bool
    {
        return (bool) Auth::user()?->is_active;
    }

    public static function canCreate(): bool
    {
        return Bi::canEditContent();
    }

    public static function canEdit(Model $record): bool
    {
        return Bi::canEditContent();
    }

    public static function canDelete(Model $record): bool
    {
        return Bi::isAdmin();
    }

    public static function canDeleteAny(): bool
    {
        return Bi::isAdmin();
    }

    /** Woreda accounts only see circulars addressed to their woreda. */
    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery()->with(['woredas', 'createdBy'])->withCount([
            'woredas as recipients_count',
            'woredas as acknowledged_count' => fn ($q) => $q->whereNotNull('circular_woreda.acknowledged_at'),
        ]);
        $user = Auth::user();
        if ($user?->isWoredaUser()) {
            $query->forWoreda((int) $user->woreda_id);
        }

        return $query->latest();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Circular')->schema([
                Forms\Components\TextInput::make('title')->required()->maxLength(255)->columnSpanFull(),
                Forms\Components\TextInput::make('reference_no')->label('Reference number')->maxLength(60)
                    ->placeholder('e.g. SOZ/ADM/1234/19'),
                Forms\Components\Select::make('priority')->options(Circular::PRIORITIES)->default('normal')->native(false)->required(),
                Forms\Components\Textarea::make('body')->label('Message')->required()->rows(10)->columnSpanFull(),
                Forms\Components\FileUpload::make('attachment')->label('Attachment (the signed letter, PDF or image)')
                    ->disk(\App\Models\WoredaReport::FILES_DISK)->directory('circulars')->visibility('private')
                    ->acceptedFileTypes(['application/pdf', 'image/jpeg', 'image/png'])->maxSize(\App\Support\UploadLimits::maxKilobytes())
                    ->openable()->downloadable()->columnSpanFull(),
            ])->columns(2),

            Forms\Components\Section::make('Recipients and response')->schema([
                Forms\Components\CheckboxList::make('woredas')
                    ->relationship('woredas', 'name_en', fn ($query) => $query->orderBy('sort'))
                    ->columns(4)->bulkToggleable()
                    ->helperText('Leave empty to send to every woreda. Each woreda’s accounts are notified when you save.')
                    ->columnSpanFull(),
                Forms\Components\Toggle::make('requires_acknowledgement')->label('Woredas must acknowledge')->default(true)->live(),
                Forms\Components\DatePicker::make('respond_by')->label('Acknowledge by')->native(false)
                    ->visible(fn (Forms\Get $get) => $get('requires_acknowledgement')),
            ])->columns(2),
        ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        $isWoreda = fn () => (bool) Auth::user()?->isWoredaUser();

        return $infolist->schema([
            Infolists\Components\Section::make()->schema([
                Infolists\Components\TextEntry::make('reference_no')->label('Reference')->placeholder('—'),
                Infolists\Components\TextEntry::make('priority')->badge()
                    ->formatStateUsing(fn ($state) => Circular::PRIORITIES[$state] ?? $state)
                    ->color(fn ($state) => $state === 'urgent' ? 'danger' : 'gray'),
                Infolists\Components\TextEntry::make('created_at')->label('Sent')->dateTime('j M Y, H:i'),
                Infolists\Components\TextEntry::make('createdBy.name')->label('From'),
                Infolists\Components\TextEntry::make('respond_by')->label('Acknowledge by')->date('j M Y')
                    ->placeholder(fn ($record) => $record->requires_acknowledgement ? 'No deadline' : 'For information only'),
                Infolists\Components\TextEntry::make('attachment')->label('Attachment')->placeholder('None')
                    ->formatStateUsing(fn () => 'Open the attachment')
                    ->url(fn ($record) => $record->attachmentUrl(), shouldOpenInNewTab: true)->color('primary'),
            ])->columns(3),

            Infolists\Components\Section::make('Message')->schema([
                Infolists\Components\TextEntry::make('body')->hiddenLabel()
                    ->formatStateUsing(fn ($state) => new HtmlString('<div class="soz-prose">'.nl2br(e($state)).'</div>')),
            ]),

            Infolists\Components\Section::make('Your acknowledgement')
                ->visible($isWoreda)
                ->schema([
                    Infolists\Components\TextEntry::make('my_status')->hiddenLabel()
                        ->state(function (Circular $record) {
                            $r = $record->receiptFor();
                            if (! $record->requires_acknowledgement) {
                                return 'For information only — no acknowledgement needed.';
                            }

                            return $r?->acknowledged_at
                                ? 'Acknowledged on '.Carbon::parse($r->acknowledged_at)->format('j M Y, H:i').($r->response ? ' — “'.$r->response.'”' : '')
                                : 'Not acknowledged yet. Use “Acknowledge” at the top of the page.';
                        }),
                ]),

            Infolists\Components\Section::make('Woreda responses')
                ->visible(fn () => ! $isWoreda())
                ->schema([
                    Infolists\Components\ViewEntry::make('woredas')->hiddenLabel()->view('filament.infolists.circular-receipts'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        $isWoreda = (bool) Auth::user()?->isWoredaUser();

        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')->searchable()->limit(60)->weight('semibold')
                    ->description(fn (Circular $record) => $record->reference_no),
                Tables\Columns\TextColumn::make('priority')->badge()
                    ->formatStateUsing(fn ($state) => Circular::PRIORITIES[$state] ?? $state)
                    ->color(fn ($state) => $state === 'urgent' ? 'danger' : 'gray'),
                Tables\Columns\TextColumn::make('created_at')->label('Sent')->date('j M Y')->sortable(),
                Tables\Columns\TextColumn::make('respond_by')->label('Acknowledge by')->date('j M Y')->placeholder('—')
                    ->color(fn (Circular $record) => $record->respond_by?->isPast() && $record->acknowledged_count < $record->recipients_count ? 'danger' : null),
                // Zone: how many woredas acknowledged. Woreda: its own status.
                Tables\Columns\TextColumn::make('acknowledged_count')->label('Acknowledged')
                    ->visible(! $isWoreda)
                    ->formatStateUsing(fn ($state, Circular $record) => $record->requires_acknowledgement ? "{$state} / {$record->recipients_count}" : 'Info only')
                    ->badge()
                    ->color(fn ($state, Circular $record) => ! $record->requires_acknowledgement ? 'gray' : ($state >= $record->recipients_count ? 'success' : 'warning')),
                Tables\Columns\TextColumn::make('my_status')->label('Status')
                    ->visible($isWoreda)
                    ->state(fn (Circular $record) => self::woredaStatus($record))
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'New' => 'danger', 'Acknowledged', 'Read' => 'success', default => 'warning'
                    }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('priority')->options(Circular::PRIORITIES)->native(false),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()]),
            ])
            ->emptyStateHeading('No circulars yet')
            ->emptyStateDescription($isWoreda ? 'Directives and memos from the zone will appear here.' : 'Send directives and memos to the woredas and see who has read and acknowledged them.');
    }

    /** New (not opened) · To acknowledge (opened) · Acknowledged · Read (information only). */
    public static function woredaStatus(Circular $record): string
    {
        $r = $record->receiptFor();

        return match (true) {
            (bool) $r?->acknowledged_at => 'Acknowledged',
            ! $r?->read_at => 'New',
            $record->requires_acknowledgement => 'To acknowledge',
            default => 'Read',
        };
    }

    public static function getNavigationBadge(): ?string
    {
        $user = Auth::user();
        if (! $user?->isWoredaUser() || ! $user->woreda_id) {
            return null;
        }
        $count = Circular::forWoreda((int) $user->woreda_id)
            ->whereHas('woredas', fn ($q) => $q->where('woredas.id', $user->woreda_id)
                ->where(fn ($q) => $q->whereNull('circular_woreda.read_at')
                    ->orWhere(fn ($q) => $q->whereNull('circular_woreda.acknowledged_at')->where('circulars.requires_acknowledgement', true))))
            ->count();

        return $count ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function getPages(): array
    {
        return [
            'index' => CircularResource\Pages\ListCirculars::route('/'),
            'create' => CircularResource\Pages\CreateCircular::route('/create'),
            'view' => CircularResource\Pages\ViewCircular::route('/{record}'),
            'edit' => CircularResource\Pages\EditCircular::route('/{record}/edit'),
        ];
    }
}
