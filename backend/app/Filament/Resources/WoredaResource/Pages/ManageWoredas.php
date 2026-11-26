<?php

namespace App\Filament\Resources\WoredaResource\Pages;

use App\Filament\Resources\WoredaResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageWoredas extends ManageRecords
{
    protected static string $resource = WoredaResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
