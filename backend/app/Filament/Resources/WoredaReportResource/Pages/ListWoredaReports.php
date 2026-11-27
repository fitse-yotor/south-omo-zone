<?php

namespace App\Filament\Resources\WoredaReportResource\Pages;

use App\Filament\Resources\WoredaReportResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListWoredaReports extends ListRecords
{
    protected static string $resource = WoredaReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()->label('Submit Report'),
        ];
    }
}
