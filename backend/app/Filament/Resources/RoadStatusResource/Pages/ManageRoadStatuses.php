<?php

namespace App\Filament\Resources\RoadStatusResource\Pages;

use App\Filament\Resources\RoadStatusResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageRoadStatuses extends ManageRecords
{
    protected static string $resource = RoadStatusResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
