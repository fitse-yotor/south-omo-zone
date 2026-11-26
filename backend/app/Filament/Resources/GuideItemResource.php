<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\GuideItem;

class GuideItemResource extends Resource
{
    protected static ?string $model = GuideItem::class;
    protected static ?string $navigationIcon = 'heroicon-o-list-bullet';
    protected static ?string $navigationGroup = 'Home page';
    protected static ?string $navigationLabel = 'Steps, commitments & tips';
    protected static ?string $modelLabel = 'item';
    protected static ?int $navigationSort = 4;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('group')->label('Where it appears')->options(GuideItem::GROUPS)->required()->native(false),
            Bi::tabs(['title' => ['Title'], 'text' => ['Text', 'textarea', ['rows' => 3]]]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('sort')->reorderable('sort')
            ->defaultGroup(Tables\Grouping\Group::make('group')->getTitleFromRecordUsing(fn ($record) => GuideItem::GROUPS[$record->group] ?? $record->group)->collapsible())
            ->columns([
                Tables\Columns\TextColumn::make('title_en')->label('Title')->description(fn ($record) => $record->title_am)->weight('bold'),
                Tables\Columns\TextColumn::make('text_en')->label('Text')->limit(90)->wrap(),
            ])
            ->filters([Tables\Filters\SelectFilter::make('group')->options(GuideItem::GROUPS)])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => GuideItemResource\Pages\ManageGuideItems::route('/')];
    }
}
