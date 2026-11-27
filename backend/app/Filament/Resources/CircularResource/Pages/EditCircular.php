<?php

namespace App\Filament\Resources\CircularResource\Pages;

use App\Filament\Resources\CircularResource;
use App\Models\Woreda;
use App\Support\PortalNotifier;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCircular extends EditRecord
{
    protected static string $resource = CircularResource::class;

    protected array $woredasBefore = [];

    protected function getHeaderActions(): array
    {
        return [Actions\ViewAction::make(), Actions\DeleteAction::make()];
    }

    protected function beforeSave(): void
    {
        $this->woredasBefore = $this->record->woredas()->pluck('woredas.id')->all();
    }

    protected function afterSave(): void
    {
        if ($this->record->woredas()->doesntExist()) {
            $this->record->woredas()->sync(Woreda::pluck('id'));
        }
        // Corrections are not re-announced; woredas added now get the circular as new.
        $added = array_values(array_diff($this->record->woredas()->pluck('woredas.id')->all(), $this->woredasBefore));
        if ($added) {
            PortalNotifier::circularSent($this->record, $added);
        }
    }
}
