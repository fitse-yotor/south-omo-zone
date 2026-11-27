<?php

namespace App\Filament\Resources\CircularResource\Pages;

use App\Filament\Resources\CircularResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCirculars extends ListRecords
{
    protected static string $resource = CircularResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->label('New circular')->icon('heroicon-o-megaphone')];
    }
}
