<?php

namespace App\Filament\Resources\CircularResource\Pages;

use App\Filament\Resources\CircularResource;
use App\Models\Woreda;
use App\Support\PortalNotifier;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Auth;

class CreateCircular extends CreateRecord
{
    protected static string $resource = CircularResource::class;

    protected static ?string $title = 'New circular';

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['created_by'] = Auth::id();
        if (empty($data['requires_acknowledgement'])) {
            $data['respond_by'] = null;
        }

        return $data;
    }

    protected function afterCreate(): void
    {
        if ($this->record->woredas()->doesntExist()) { // empty = every woreda
            $this->record->woredas()->sync(Woreda::pluck('id'));
        }
        PortalNotifier::circularSent($this->record);
    }

    protected function getCreatedNotificationTitle(): ?string
    {
        return 'Circular sent to '.$this->record->woredas()->count().' woreda(s)';
    }
}
