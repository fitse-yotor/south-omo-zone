<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\Label;

class LabelResource extends Resource
{
    protected static ?string $model = Label::class;
    protected static ?string $navigationIcon = 'heroicon-o-language';
    protected static ?string $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Interface labels';
    protected static ?string $modelLabel = 'label';
    protected static ?int $navigationSort = 3;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function canCreate(): bool
    {
        return false; // keys are used by the website code
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('key')->disabled()->dehydrated(false),
            Forms\Components\Textarea::make('en')->label('English')->rows(3)->required(),
            Forms\Components\Textarea::make('am')->label('አማርኛ')->rows(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->defaultSort('key')->paginated([25, 50, 100, 'all'])
            ->description('Menus, buttons and headings. Edit directly in the table; changes appear on the site within a minute. Placeholders like {date} must be kept.')
            ->columns([
                Tables\Columns\TextColumn::make('key')->searchable()->fontFamily('mono')->size('sm')->color('gray'),
                Tables\Columns\TextInputColumn::make('en')->label('English')->searchable()->rules(['required', 'max:2000']),
                Tables\Columns\TextInputColumn::make('am')->label('አማርኛ')->searchable()->rules(['nullable', 'max:2000']),
            ])
            ->filters([
                Tables\Filters\Filter::make('missing_am')->label('Missing Amharic')
                    ->query(fn ($query) => $query->where(fn ($q) => $q->whereNull('am')->orWhere('am', ''))),
                Tables\Filters\Filter::make('same_as_en')->label('Amharic same as English (likely untranslated)')
                    ->query(fn ($query) => $query->whereColumn('am', 'en')),
            ])
            ->actions([Tables\Actions\EditAction::make()->label('Long text')]);
    }

    public static function getPages(): array
    {
        return ['index' => LabelResource\Pages\ManageLabels::route('/')];
    }
}
