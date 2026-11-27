<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use App\Models\Woreda;
use App\Models\WoredaReport;
use App\Support\Indicators;
use App\Support\PortalNotifier;
use App\Support\UploadLimits;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\HtmlString;

class WoredaReportResource extends Resource
{
    protected static ?string $model = WoredaReport::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-chart-bar';

    protected static ?string $navigationGroup = 'Woreda Portal';

    protected static ?string $navigationLabel = 'Reports';

    protected static ?int $navigationSort = 1;

    public const MAX_FILES = 10;

    /** Checked on the server against the file's content, not just its name. */
    public const FILE_TYPES = [
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/csv', 'text/plain',
        'image/jpeg', 'image/png', 'image/webp',
    ];

    public static function canViewAny(): bool
    {
        // Zone staff (admin/editor/notices) see all; woreda users see their own
        return Auth::user()?->is_active ?? false;
    }

    /** Zone reviewers (admin, editor) and woreda accounts; not the vacancies-only role. */
    public static function canCreate(): bool
    {
        $user = Auth::user();

        return (bool) ($user?->canEditContent() || $user?->isWoredaUser());
    }

    /** Reviewers edit any report; a woreda account only its own, and only until the zone accepts it. */
    public static function canEdit(Model $record): bool
    {
        $user = Auth::user();
        if ($user?->canEditContent()) {
            return true;
        }

        return (bool) $user?->isWoredaUser() && $record->woreda_id === $user->woreda_id && $record->isEditableByWoreda();
    }

    public static function canDelete(Model $record): bool
    {
        return Bi::isAdmin();
    }

    public static function canDeleteAny(): bool
    {
        return Bi::isAdmin();
    }

    public static function canReview(): bool
    {
        return Bi::canEditContent();
    }

    /** Approve: optional note. Shared by the table and the report page. */
    public static function approveAction(string $class): mixed
    {
        return $class::make('approve')
            ->label('Approve')
            ->icon('heroicon-o-check-circle')
            ->color('success')
            ->visible(fn (WoredaReport $record) => self::canReview() && $record->status !== 'approved')
            ->form([Forms\Components\Textarea::make('note')->label('Note to the woreda (optional)')->rows(3)])
            ->modalSubmitActionLabel('Approve')
            ->action(function (WoredaReport $record, array $data) {
                $record->update(['status' => 'approved', 'reviewed_at' => now(), 'reviewed_by' => Auth::id()]
                    + (filled($data['note'] ?? null) ? ['zone_feedback' => $data['note']] : []));
                if (filled($data['note'] ?? null)) {
                    $record->comments()->create(['user_id' => Auth::id(), 'body' => $data['note']]);
                }
                PortalNotifier::reportReviewed($record, $data['note'] ?? null);
                Notification::make()->title('Report approved')->success()->send();
            });
    }

    /** Send back: the reason is required, saved as feedback and in the discussion, and sent to the woreda. */
    public static function sendBackAction(string $class): mixed
    {
        return $class::make('request_revision')
            ->label('Send back')
            ->icon('heroicon-o-arrow-uturn-left')
            ->color('danger')
            ->visible(fn (WoredaReport $record) => self::canReview() && $record->status !== 'rejected')
            ->form([Forms\Components\Textarea::make('reason')->label('What needs to change?')->required()->rows(4)])
            ->modalSubmitActionLabel('Send back to the woreda')
            ->action(function (WoredaReport $record, array $data) {
                $record->update(['status' => 'rejected', 'zone_feedback' => $data['reason'], 'reviewed_at' => now(), 'reviewed_by' => Auth::id()]);
                $record->comments()->create(['user_id' => Auth::id(), 'body' => $data['reason']]);
                PortalNotifier::reportReviewed($record, $data['reason']);
                Notification::make()->title('Sent back for revision')->warning()->send();
            });
    }

    /** Post a message in the report's discussion. */
    public static function commentAction(string $class): mixed
    {
        return $class::make('comment')
            ->label('Add comment')
            ->icon('heroicon-o-chat-bubble-left-right')
            ->color('gray')
            ->form([Forms\Components\Textarea::make('body')->label('Message')->required()->maxLength(4000)->rows(4)])
            ->modalSubmitActionLabel('Post')
            ->action(function (WoredaReport $record, array $data) {
                $record->comments()->create(['user_id' => Auth::id(), 'body' => $data['body']]);
                PortalNotifier::commentAdded($record, $data['body']);
                Notification::make()->title('Comment posted')->success()->send();
            });
    }

    /** Woreda users only see their own woreda's reports. */
    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery()->with(['woreda', 'submittedBy']);

        if (Auth::user()?->isWoredaUser()) {
            $query->where('woreda_id', Auth::user()->woreda_id);
        }

        return $query->latest();
    }

    public static function form(Form $form): Form
    {
        $user = Auth::user();

        return $form->schema([
            Forms\Components\Section::make('Report Details')->schema([
                // Woreda accounts never see or send these two: the pages set them on the server
                // (a disabled-but-dehydrated field could be changed by tampering with the request).
                Forms\Components\Select::make('woreda_id')
                    ->label('Woreda')
                    ->options(fn () => Woreda::orderBy('name_en')->pluck('name_en', 'id'))
                    ->searchable()
                    ->native(false)
                    ->required()
                    ->hidden($user?->isWoredaUser())
                    ->columnSpan(1),

                Forms\Components\Select::make('period_type')
                    ->options(WoredaReport::PERIOD_TYPES)
                    ->default('monthly')
                    ->native(false)
                    ->required()
                    ->live()
                    ->columnSpan(1),

                Forms\Components\DatePicker::make('period_start')
                    ->label('Month covered')
                    ->native(false)
                    ->displayFormat('F Y')
                    ->closeOnDateSelection()
                    ->maxDate(now()->endOfMonth())
                    ->required(fn (Forms\Get $get) => $get('period_type') === 'monthly')
                    ->visible(fn (Forms\Get $get) => $get('period_type') === 'monthly')
                    ->helperText('Pick any day in the month. Figures in monthly reports add up on the dashboard.')
                    ->columnSpan(1),

                Forms\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255)
                    ->placeholder('e.g. October 2026 Monthly Report')
                    ->columnSpanFull(),

                Forms\Components\TextInput::make('period')
                    ->label('Reporting Period')
                    ->required()
                    ->maxLength(100)
                    ->placeholder('e.g. October 2026, Q1 FY2026/27')
                    ->columnSpan(1),

                Forms\Components\Select::make('status')
                    ->options(WoredaReport::STATUSES)
                    ->default('submitted')
                    ->native(false)
                    ->required()
                    ->hidden($user?->isWoredaUser())
                    ->columnSpan(1),
            ])->columns(2),

            Forms\Components\Section::make('Figures for this month')
                ->description('Numbers for this month only, not running totals. The dashboard adds them up for the fiscal year. Leave a box empty if it does not apply.')
                ->schema(self::indicatorInputs())
                ->columns(3)
                ->visible(fn (Forms\Get $get) => $get('period_type') === 'monthly')
                ->collapsible(),

            Forms\Components\Section::make('Report Content')->schema([
                Forms\Components\Textarea::make('summary')
                    ->label('Executive Summary')
                    ->rows(3)
                    ->columnSpanFull(),

                Forms\Components\Textarea::make('achievements')
                    ->label('Key Achievements')
                    ->rows(5)
                    ->helperText('List the main accomplishments during this period.')
                    ->columnSpanFull(),

                Forms\Components\Textarea::make('challenges')
                    ->label('Challenges & Issues')
                    ->rows(4)
                    ->helperText('Describe any obstacles encountered.')
                    ->columnSpanFull(),

                Forms\Components\Textarea::make('next_steps')
                    ->label('Planned Next Steps')
                    ->rows(4)
                    ->columnSpanFull(),
            ]),

            Forms\Components\Section::make('Files')
                ->description('Signed report, data tables, photos from the field. Only the zone and your woreda can open them.')
                ->icon('heroicon-o-paper-clip')
                ->schema([
                    Forms\Components\FileUpload::make('attachments')
                        ->hiddenLabel()
                        ->multiple()
                        ->maxFiles(self::MAX_FILES)
                        ->disk(WoredaReport::FILES_DISK)
                        ->directory('reports')
                        ->visibility('private')
                        ->storeFileNamesIn('attachment_names')
                        ->acceptedFileTypes(self::FILE_TYPES)
                        ->maxSize(UploadLimits::maxKilobytes())
                        ->reorderable()
                        ->appendFiles()
                        ->openable()
                        ->downloadable()
                        ->panelLayout('grid')
                        ->helperText(fn () => 'Up to '.self::MAX_FILES.' files, '.UploadLimits::label().' each: PDF, Word, Excel, PowerPoint, CSV, or JPG / PNG photos.')
                        ->columnSpanFull(),
                ]),

            // Zone feedback (zone staff only)
            Forms\Components\Section::make('Zone Feedback')
                ->schema([
                    Forms\Components\Textarea::make('zone_feedback')
                        ->label('Feedback / Notes')
                        ->rows(4)
                        ->columnSpanFull(),
                ])
                ->visible(fn () => ! Auth::user()?->isWoredaUser())
                ->collapsible(),
        ]);
    }

    /** One number box per indicator, with a small sector heading above each group. */
    protected static function indicatorInputs(): array
    {
        $fields = [];
        foreach (Indicators::bySector() as $sector => $keys) {
            $fields[] = Forms\Components\Placeholder::make("sector_{$sector}")->hiddenLabel()
                ->content(new HtmlString('<span class="soz-sector-label">'.e($sector).'</span>'))->columnSpanFull();
            foreach ($keys as $key) {
                $d = Indicators::get($key);
                $fields[] = Forms\Components\TextInput::make($key)->label($d['label'])->numeric()->minValue(0)
                    ->step($d['decimals'] ? 0.1 : 1)->suffix($d['unit']);
            }
        }

        return $fields;
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        $figures = collect(Indicators::all())->map(fn ($d, $key) => Infolists\Components\TextEntry::make($key)
            ->label($d['label'])
            ->formatStateUsing(fn ($state) => Indicators::format($state, $key, withUnit: true))
            ->placeholder('Not reported'))->values()->all();

        return $infolist->schema([
            Infolists\Components\Section::make('Figures for the month')
                ->schema($figures)
                ->columns(3)
                ->visible(fn ($record) => $record->period_type === 'monthly'),

            Infolists\Components\Section::make('Report Details')->schema([
                Infolists\Components\TextEntry::make('woreda.name_en')->label('Woreda'),
                Infolists\Components\TextEntry::make('period')->label('Period'),
                Infolists\Components\TextEntry::make('submittedBy.name')->label('Submitted By'),
                Infolists\Components\TextEntry::make('status')
                    ->badge()
                    ->color(fn ($record) => $record->statusColor()),
                Infolists\Components\TextEntry::make('created_at')->label('Submitted On')->dateTime(),
                Infolists\Components\TextEntry::make('reviewed_at')->label('Reviewed On')->dateTime()->placeholder('Not yet reviewed'),
            ])->columns(3),

            Infolists\Components\Section::make('Content')->schema([
                Infolists\Components\TextEntry::make('summary')->label('Executive Summary')->columnSpanFull(),
                Infolists\Components\TextEntry::make('achievements')->label('Key Achievements')->columnSpanFull(),
                Infolists\Components\TextEntry::make('challenges')->label('Challenges')->columnSpanFull(),
                Infolists\Components\TextEntry::make('next_steps')->label('Next Steps')->columnSpanFull(),
            ]),

            Infolists\Components\Section::make('Files')
                ->icon('heroicon-o-paper-clip')
                ->visible(fn (WoredaReport $record) => ! empty($record->attachments))
                ->schema([
                    Infolists\Components\ViewEntry::make('attachments')->hiddenLabel()
                        ->view('filament.infolists.report-files'),
                ]),

            Infolists\Components\Section::make('Zone Feedback')
                ->schema([
                    Infolists\Components\TextEntry::make('zone_feedback')->columnSpanFull()->placeholder('No feedback yet.'),
                ])
                ->collapsed(fn ($record) => ! $record->zone_feedback),

            Infolists\Components\Section::make('Discussion')
                ->description('Questions and answers between the zone and the woreda about this report. Use “Add comment” above.')
                ->icon('heroicon-o-chat-bubble-left-right')
                ->schema([
                    Infolists\Components\ViewEntry::make('comments')->hiddenLabel()
                        ->view('filament.infolists.report-discussion'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('woreda.name_en')
                    ->label('Woreda')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->limit(50),
                Tables\Columns\TextColumn::make('period')
                    ->label('Period')
                    ->badge()
                    ->color('gray'),
                Tables\Columns\TextColumn::make('period_start')
                    ->label('Month')
                    ->date('M Y')
                    ->sortable()
                    ->placeholder('—')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('attachments')
                    ->label('Files')
                    ->state(fn (WoredaReport $record) => count($record->attachments ?? []) ?: null)
                    ->icon('heroicon-m-paper-clip')
                    ->placeholder('—')
                    ->tooltip(fn (WoredaReport $record) => collect($record->attachment_names ?? [])->values()->join(', ') ?: null)
                    ->alignCenter()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('submittedBy.name')
                    ->label('Submitted By')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn ($state) => WoredaReport::STATUSES[$state] ?? $state)
                    ->color(fn ($record) => $record->statusColor()),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Date')
                    ->date()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('woreda_id')
                    ->label('Woreda')
                    ->relationship('woreda', 'name_en')
                    ->visible(fn () => ! Auth::user()?->isWoredaUser()),
                Tables\Filters\SelectFilter::make('status')
                    ->options(WoredaReport::STATUSES)
                    ->native(false),
                Tables\Filters\SelectFilter::make('period_type')
                    ->options(WoredaReport::PERIOD_TYPES)
                    ->native(false),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),

                // Quick review for zone reviewers (the woreda is notified either way)
                Tables\Actions\ActionGroup::make([
                    self::approveAction(Tables\Actions\Action::class),
                    self::sendBackAction(Tables\Actions\Action::class),
                ])->visible(fn () => self::canReview()),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->visible(fn () => Bi::isAdmin()),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => WoredaReportResource\Pages\ListWoredaReports::route('/'),
            'create' => WoredaReportResource\Pages\CreateWoredaReport::route('/create'),
            'view' => WoredaReportResource\Pages\ViewWoredaReport::route('/{record}'),
            'edit' => WoredaReportResource\Pages\EditWoredaReport::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        if (Auth::user()?->isZoneStaff()) {
            $count = WoredaReport::where('status', 'submitted')->count();

            return $count > 0 ? (string) $count : null;
        }

        return null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }
}
