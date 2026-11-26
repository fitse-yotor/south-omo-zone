<?php

namespace App\Filament\Resources\RouteStopResource\Pages;

use App\Filament\Resources\RouteStopResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageRouteStops extends ManageRecords
{
    protected static string $resource = RouteStopResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
