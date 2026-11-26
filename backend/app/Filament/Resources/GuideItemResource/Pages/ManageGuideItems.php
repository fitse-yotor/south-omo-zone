<?php

namespace App\Filament\Resources\GuideItemResource\Pages;

use App\Filament\Resources\GuideItemResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageGuideItems extends ManageRecords
{
    protected static string $resource = GuideItemResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
