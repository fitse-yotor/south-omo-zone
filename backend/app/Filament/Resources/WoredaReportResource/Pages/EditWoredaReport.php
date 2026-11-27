<?php

namespace App\Filament\Resources\WoredaReportResource\Pages;

use App\Filament\Resources\WoredaReportResource;
use App\Support\PortalNotifier;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Auth;

class EditWoredaReport extends EditRecord
{
    protected static string $resource = WoredaReportResource::class;

    protected ?string $statusBefore = null;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $this->statusBefore = $this->record->status;

        // Woreda accounts cannot move the report, review it or write zone feedback, whatever the request says.
        // Correcting a report that was sent back submits it again.
        if (Auth::user()?->isWoredaUser()) {
            $data['woreda_id'] = $this->record->woreda_id;
            $data['status'] = 'submitted';
            unset($data['zone_feedback'], $data['reviewed_at'], $data['reviewed_by']);
        } elseif (($data['status'] ?? null) !== $this->statusBefore && in_array($data['status'] ?? null, ['approved', 'rejected', 'reviewed'], true)) {
            $data['reviewed_at'] = now();
            $data['reviewed_by'] = Auth::id();
        }

        return $data;
    }

    protected function afterSave(): void
    {
        $now = $this->record->status;
        if ($now === $this->statusBefore) {
            return;
        }
        if (Auth::user()?->isWoredaUser()) {
            PortalNotifier::reportSubmitted($this->record, resubmitted: $this->statusBefore === 'rejected');
        } elseif (in_array($now, ['approved', 'rejected'], true)) {
            PortalNotifier::reportReviewed($this->record, $this->record->zone_feedback);
        }
    }
}
