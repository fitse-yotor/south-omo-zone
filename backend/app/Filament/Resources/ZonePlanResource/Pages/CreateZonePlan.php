<?php

namespace App\Filament\Resources\ZonePlanResource\Pages;

use App\Filament\Resources\ZonePlanResource;
use App\Models\Woreda;
use App\Support\PortalNotifier;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Auth;

class CreateZonePlan extends CreateRecord
{
    protected static string $resource = ZonePlanResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['created_by'] = Auth::id();

        return $data;
    }

    protected function afterCreate(): void
    {
        // The form says "leave empty to assign to all": make that true.
        if ($this->record->woredas()->doesntExist()) {
            $this->record->woredas()->sync(Woreda::pluck('id'));
        }
        if ($this->record->status === 'active') {
            PortalNotifier::planAssigned($this->record);
        }
    }
}
