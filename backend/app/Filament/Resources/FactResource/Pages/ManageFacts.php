<?php

namespace App\Filament\Resources\FactResource\Pages;

use App\Filament\Resources\FactResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageFacts extends ManageRecords
{
    protected static string $resource = FactResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
