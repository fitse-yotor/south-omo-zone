<?php

namespace App\Filament\Resources\AttractionResource\Pages;

use App\Filament\Resources\AttractionResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageAttractions extends ManageRecords
{
    protected static string $resource = AttractionResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
