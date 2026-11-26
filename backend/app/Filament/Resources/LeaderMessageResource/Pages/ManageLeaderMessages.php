<?php

namespace App\Filament\Resources\LeaderMessageResource\Pages;

use App\Filament\Resources\LeaderMessageResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageLeaderMessages extends ManageRecords
{
    protected static string $resource = LeaderMessageResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
