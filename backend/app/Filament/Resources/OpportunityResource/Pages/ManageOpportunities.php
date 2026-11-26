<?php

namespace App\Filament\Resources\OpportunityResource\Pages;

use App\Filament\Resources\OpportunityResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageOpportunities extends ManageRecords
{
    protected static string $resource = OpportunityResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('deleteSamples')->label('Delete all samples')->color('danger')->icon('heroicon-o-trash')
                ->visible(fn () => \App\Models\Opportunity::where('is_sample', true)->exists())
                ->requiresConfirmation()
                ->modalDescription('Deletes every opportunity marked as a sample. Real ones are not touched.')
                ->action(function () {
                    $n = \App\Models\Opportunity::where('is_sample', true)->get()->each->delete()->count();
                    \Filament\Notifications\Notification::make()->title("Deleted $n samples")->success()->send();
                }),
            Actions\CreateAction::make(),
        ];
    }
}
