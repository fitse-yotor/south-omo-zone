<?php

namespace App\Filament\Resources\AnnouncementResource\Pages;

use App\Filament\Resources\AnnouncementResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageAnnouncements extends ManageRecords
{
    protected static string $resource = AnnouncementResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('deleteSamples')->label('Delete all samples')->color('danger')->icon('heroicon-o-trash')
                ->visible(fn () => \App\Models\Announcement::where('is_sample', true)->exists())
                ->requiresConfirmation()
                ->modalDescription('Deletes every vacancy and tender marked as a sample. Real ones are not touched.')
                ->action(function () {
                    $n = \App\Models\Announcement::where('is_sample', true)->get()->each->delete()->count();
                    \Filament\Notifications\Notification::make()->title("Deleted $n samples")->success()->send();
                }),
            Actions\CreateAction::make(),
        ];
    }
}
