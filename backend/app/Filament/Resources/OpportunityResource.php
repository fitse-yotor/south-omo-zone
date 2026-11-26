<?php

namespace App\Filament\Resources;

use App\Filament\Support\Bi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Models\Opportunity;

class OpportunityResource extends Resource
{
    protected static ?string $model = Opportunity::class;
    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';
    protected static ?string $navigationGroup = 'Investment';
    protected static ?int $navigationSort = 1;

    public static function canViewAny(): bool
    {
        return Bi::canEditContent();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('woreda_id')->relationship('woreda', 'name_en')->required()->native(false)->preload(),
            Forms\Components\Select::make('sector_id')->relationship('sector', 'title_en')->required()->native(false)->preload(),
            Bi::tabs(['title' => ['Title'], 'summary' => ['Summary', 'textarea', ['rows' => 3]]]),
            Forms\Components\TextInput::make('land_ha')->label('Land (hectares)')->numeric()->minValue(0)->default(0),
            Forms\Components\TextInput::make('investment_usd_m')->label('Investment (million USD)')->numeric()->minValue(0)->step(0.1)->default(0),
            Forms\Components\TextInput::make('jobs')->label('Jobs created')->numeric()->minValue(0)->default(0),
            Forms\Components\TextInput::make('sort')->numeric()->default(0)->helperText('Lower numbers show first.'),
            Forms\Components\Toggle::make('is_published')->label('Published on the site')->default(true),
            Forms\Components\Toggle::make('is_sample')->label('Sample (example data)')
                ->helperText('Switch off when this has been replaced with real, confirmed information.'),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('sort')
            ->reorderable('sort')
            ->columns([
                Tables\Columns\TextColumn::make('title_en')->label('Title')->searchable(['title_en', 'title_am'])->wrap(),
                Tables\Columns\TextColumn::make('woreda.name_en')->label('Woreda')->sortable(),
                Tables\Columns\TextColumn::make('sector.title_en')->label('Sector')->badge(),
                Tables\Columns\TextColumn::make('land_ha')->label('Land (ha)')->numeric(),
                Tables\Columns\TextColumn::make('investment_usd_m')->label('M USD')->numeric(1),
                Tables\Columns\TextColumn::make('jobs')->numeric(),
                Tables\Columns\ToggleColumn::make('is_published')->label('Published'),
                Tables\Columns\TextColumn::make('is_sample')->label('')->badge()->color('warning')
                    ->formatStateUsing(fn ($state) => $state ? 'Sample' : null)->placeholder(''),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_sample')->label('Samples')->trueLabel('Samples only')->falseLabel('Real only'),
                Tables\Filters\SelectFilter::make('woreda')->relationship('woreda', 'name_en'),
                Tables\Filters\SelectFilter::make('sector')->relationship('sector', 'title_en'),
            ])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => OpportunityResource\Pages\ManageOpportunities::route('/')];
    }
}
