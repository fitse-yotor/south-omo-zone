<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\HeroSlide;

class HeroSlideResource extends Resource
{
    protected static ?string $model = HeroSlide::class;
    protected static ?string $navigationIcon = 'heroicon-o-photo';
    protected static ?string $navigationGroup = 'Home page';
    protected static ?string $navigationLabel = 'Slideshow';
    protected static ?string $modelLabel = 'slide';
    protected static ?int $navigationSort = 1;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Bi::photo('slides', required: true),
            Bi::tabs(['caption' => ['Caption']]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort')->reorderable('sort')
            ->description('Photos rotate every 7 seconds at the top of the home page. Drag to reorder.')
            ->columns([
                Tables\Columns\ImageColumn::make('preview')->getStateUsing(fn ($record) => $record->photoRef() && str_contains($record->photoRef(), '/') ? $record->photoRef() : asset('images/'.$record->image.'.jpg'))->height(56),
                Tables\Columns\TextColumn::make('caption_en')->label('Caption')->description(fn ($record) => $record->caption_am)->wrap(),
            ])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => HeroSlideResource\Pages\ManageHeroSlides::route('/')];
    }
}
