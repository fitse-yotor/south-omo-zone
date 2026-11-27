<?php

namespace App\Filament\Resources\WoredaReportResource\Pages;

use App\Filament\Resources\WoredaReportResource;
use App\Support\PortalNotifier;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Auth;

class CreateWoredaReport extends CreateRecord
{
    protected static string $resource = WoredaReportResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['submitted_by'] = Auth::id();

        // Woreda accounts: always their own woreda, always "submitted", never zone fields (set here, not trusted from the form).
        if (Auth::user()?->isWoredaUser()) {
            $data['woreda_id'] = Auth::user()->woreda_id;
            $data['status'] = 'submitted';
            unset($data['zone_feedback'], $data['reviewed_at'], $data['reviewed_by']);
        }

        return $data;
    }

    protected function afterCreate(): void
    {
        if ($this->record->status === 'submitted') {
            PortalNotifier::reportSubmitted($this->record);
        }
    }
}
