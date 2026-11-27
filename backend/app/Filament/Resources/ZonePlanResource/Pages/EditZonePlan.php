<?php

namespace App\Filament\Resources\ZonePlanResource\Pages;

use App\Filament\Resources\ZonePlanResource;
use App\Filament\Support\Bi;
use App\Models\Woreda;
use App\Support\PortalNotifier;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditZonePlan extends EditRecord
{
    protected static string $resource = ZonePlanResource::class;

    protected ?string $statusBefore = null;

    protected array $woredasBefore = [];

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make()
                ->visible(fn () => Bi::isAdmin()),
        ];
    }

    protected function beforeSave(): void
    {
        $this->statusBefore = $this->record->status;
        $this->woredasBefore = $this->record->woredas()->pluck('woredas.id')->all();
    }

    protected function afterSave(): void
    {
        $plan = $this->record;
        if ($plan->woredas()->doesntExist()) { // "leave empty to assign to all"
            $plan->woredas()->sync(Woreda::pluck('id'));
        }
        if ($plan->status !== 'active') {
            return;
        }

        // Just activated: tell everyone assigned. Already active: tell only woredas that were added.
        $ids = $plan->woredas()->pluck('woredas.id')->all();
        $notify = $this->statusBefore === 'active' ? array_values(array_diff($ids, $this->woredasBefore)) : $ids;
        if ($notify) {
            PortalNotifier::planAssigned($plan, $notify);
        }
    }
}
