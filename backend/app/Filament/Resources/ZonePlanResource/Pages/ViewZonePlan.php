<?php

namespace App\Filament\Resources\ZonePlanResource\Pages;

use App\Filament\Resources\ZonePlanResource;
use Filament\Resources\Pages\ViewRecord;

class ViewZonePlan extends ViewRecord
{
    protected static string $resource = ZonePlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            \Filament\Actions\EditAction::make()
                ->visible(fn () => \App\Filament\Support\Bi::canEditContent()),
        ];
    }
}
