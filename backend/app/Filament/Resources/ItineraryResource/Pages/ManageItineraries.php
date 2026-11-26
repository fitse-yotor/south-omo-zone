<?php

namespace App\Filament\Resources\ItineraryResource\Pages;

use App\Filament\Resources\ItineraryResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageItineraries extends ManageRecords
{
    protected static string $resource = ItineraryResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
