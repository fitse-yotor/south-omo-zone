<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\Announcement;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class AnnouncementResource extends Resource
{
    protected static ?string $model = Announcement::class;
    protected static ?string $navigationIcon = 'heroicon-o-megaphone';
    protected static ?string $navigationGroup = 'Notice board';
    protected static ?string $navigationLabel = 'Vacancies & tenders';
    protected static ?int $navigationSort = 1;

    public static function canViewAny(): bool
    {
        return Bi::isZoneStaff(); // every zone role including "notices", but NOT woreda accounts
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('type')->options(Announcement::TYPES)->required()->native(false)->live(),
            Forms\Components\TextInput::make('reference')->label('Reference no.')->placeholder('SOZ/NCB/W/014/2026')->maxLength(100),
            Forms\Components\DatePicker::make('posted_on')->label('Posted on')->default(now())->required()->native(false),
            Forms\Components\DatePicker::make('deadline')->required()->native(false)->afterOrEqual('posted_on'),
            Bi::tabs([
                'title' => ['Title'],
                'organization' => ['Office / department'],
                'location' => ['Location', 'text', ['optional' => true]],
                'summary' => ['Summary', 'textarea', ['rows' => 3]],
                'details' => ['Requirements / details', 'lines', ['optional' => true]],
            ]),
            Forms\Components\FileUpload::make('attachment')->label('Attachment (PDF: full notice or bid document)')->disk('uploads')->directory('notices')
                ->acceptedFileTypes(['application/pdf'])->maxSize(10240)->downloadable()->openable()->columnSpanFull(),
            Forms\Components\Toggle::make('is_published')->label('Published on the site')->default(true),
            Forms\Components\Toggle::make('is_sample')->label('Sample (example data)')
                ->helperText('Switch off when this has been replaced with real, confirmed information.'),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('deadline', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('type')->badge()->formatStateUsing(fn ($state) => Announcement::TYPES[$state] ?? $state)
                    ->color(fn ($state) => $state === 'tender' ? 'warning' : 'primary'),
                Tables\Columns\TextColumn::make('title_en')->label('Title')->searchable(['title_en', 'title_am', 'reference'])->wrap()->description(fn ($record) => $record->reference),
                Tables\Columns\TextColumn::make('organization_en')->label('Office')->toggleable()->wrap(),
                Tables\Columns\TextColumn::make('deadline')->date('d M Y')->sortable()
                    ->color(fn ($record) => $record->deadline->isPast() ? 'gray' : ($record->deadline->diffInDays(today()) <= 7 ? 'danger' : 'success'))
                    ->description(fn ($record) => $record->deadline->isPast() ? 'Closed' : $record->deadline->diffForHumans()),
                Tables\Columns\IconColumn::make('attachment')->label('PDF')->boolean()->getStateUsing(fn ($record) => (bool) $record->attachment),
                Tables\Columns\ToggleColumn::make('is_published')->label('Published'),
                Tables\Columns\TextColumn::make('is_sample')->label('')->badge()->color('warning')
                    ->formatStateUsing(fn ($state) => $state ? 'Sample' : null)->placeholder(''),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_sample')->label('Samples')->trueLabel('Samples only')->falseLabel('Real only'),
                Tables\Filters\SelectFilter::make('type')->options(Announcement::TYPES),
                Tables\Filters\TernaryFilter::make('open')->label('Status')->placeholder('All')->trueLabel('Open')->falseLabel('Closed')
                    ->queries(true: fn (Builder $q) => $q->whereDate('deadline', '>=', today()), false: fn (Builder $q) => $q->whereDate('deadline', '<', today())),
            ])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
            ->bulkActions([Tables\Actions\DeleteBulkAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => AnnouncementResource\Pages\ManageAnnouncements::route('/')];
    }
}
