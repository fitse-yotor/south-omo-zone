<?php

namespace App\Filament\Resources\PhotoCreditResource\Pages;

use App\Filament\Resources\PhotoCreditResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManagePhotoCredits extends ManageRecords
{
    protected static string $resource = PhotoCreditResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
