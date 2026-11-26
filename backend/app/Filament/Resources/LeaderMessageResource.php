<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\LeaderMessage;

class LeaderMessageResource extends Resource
{
    protected static ?string $model = LeaderMessage::class;
    protected static ?string $navigationIcon = 'heroicon-o-user-circle';
    protected static ?string $navigationGroup = 'Zone & tourism';
    protected static ?string $navigationLabel = "Leader's message";
    protected static ?string $modelLabel = "leader's message";
    protected static ?int $navigationSort = 0;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function canCreate(): bool
    {
        return LeaderMessage::count() === 0;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\FileUpload::make('photo')->label('Portrait photo')->disk('uploads')->directory('leader')->image()
                ->imageCropAspectRatio('4:5')->imageResizeTargetWidth('1000')->maxSize(6144),
            Forms\Components\TextInput::make('video_url')->label('Video message link')->url()->maxLength(255)
                ->helperText('A YouTube link (recommended) or a direct .mp4 link. Do not upload video files to shared hosting.'),
            Bi::tabs([
                'name' => ['Name'],
                'title' => ['Title'],
                'excerpt' => ['Short quote (home page)', 'textarea', ['rows' => 3]],
                'message' => ['Full message', 'paragraphs'],
            ]),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('photo')->disk('uploads')->circular()->defaultImageUrl(fn () => asset('brand/logo.png')),
                Tables\Columns\TextColumn::make('name_en')->label('Name')->description(fn ($record) => $record->title_en),
                Tables\Columns\IconColumn::make('video_url')->label('Video')->boolean()->getStateUsing(fn ($record) => (bool) $record->video_url),
                Tables\Columns\TextColumn::make('updated_at')->label('Last updated')->since(),
            ])
            ->actions([Tables\Actions\EditAction::make()->slideOver()])
            ->paginated(false);
    }

    public static function getPages(): array
    {
        return ['index' => LeaderMessageResource\Pages\ManageLeaderMessages::route('/')];
    }
}
