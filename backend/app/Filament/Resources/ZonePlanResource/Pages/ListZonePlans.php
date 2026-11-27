<?php

namespace App\Filament\Resources\ZonePlanResource\Pages;

use App\Filament\Resources\ZonePlanResource;
use Filament\Resources\Pages\ListRecords;

class ListZonePlans extends ListRecords
{
    protected static string $resource = ZonePlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            \Filament\Actions\CreateAction::make()
                ->visible(fn () => \App\Filament\Support\Bi::canEditContent()),
        ];
    }
}
