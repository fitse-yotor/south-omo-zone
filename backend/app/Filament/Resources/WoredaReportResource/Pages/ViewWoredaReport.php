<?php

namespace App\Filament\Resources\WoredaReportResource\Pages;

use App\Filament\Resources\WoredaReportResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewWoredaReport extends ViewRecord
{
    protected static string $resource = WoredaReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            WoredaReportResource::commentAction(Actions\Action::class),
            WoredaReportResource::approveAction(Actions\Action::class),
            WoredaReportResource::sendBackAction(Actions\Action::class),
            Actions\EditAction::make(),
        ];
    }
}
