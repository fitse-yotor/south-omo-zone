<?php

namespace App\Filament\Resources\CircularResource\Pages;

use App\Filament\Resources\CircularResource;
use App\Models\Circular;
use App\Support\PortalNotifier;
use Filament\Actions;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Auth;

class ViewCircular extends ViewRecord
{
    protected static string $resource = CircularResource::class;

    public function mount(int|string $record): void
    {
        parent::mount($record);

        // Opening the circular counts as reading it, for the woreda's own row only.
        $user = Auth::user();
        if ($user?->isWoredaUser() && $user->woreda_id) {
            $this->record->woredas()->wherePivotNull('read_at')
                ->updateExistingPivot($user->woreda_id, ['read_at' => now()]);
            $this->record->load('woredas');
        }
    }

    public function getTitle(): string
    {
        return $this->record->title;
    }

    protected function getHeaderActions(): array
    {
        $user = Auth::user();

        return [
            // Woreda: acknowledge, with an optional reply to the zone.
            Actions\Action::make('acknowledge')
                ->label('Acknowledge')
                ->icon('heroicon-o-check-badge')
                ->color('success')
                ->visible(fn (Circular $record) => $user?->isWoredaUser() && $record->requires_acknowledgement && ! $record->receiptFor()?->acknowledged_at)
                ->form([Textarea::make('response')->label('Reply to the zone (optional)')->rows(4)->maxLength(4000)])
                ->modalDescription('Confirms that your woreda has received this circular and will act on it.')
                ->action(function (Circular $record, array $data) use ($user) {
                    $record->woredas()->updateExistingPivot($user->woreda_id, [
                        'acknowledged_at' => now(),
                        'acknowledged_by' => $user->id,
                        'read_at' => $record->receiptFor()?->read_at ?? now(),
                        'response' => $data['response'] ?? null,
                    ]);
                    PortalNotifier::circularAcknowledged($record, $user->woreda?->name_en ?? 'A woreda', $data['response'] ?? null);
                    $record->load('woredas');
                    Notification::make()->title('Acknowledged — the zone has been notified')->success()->send();
                }),

            // Zone: remind the woredas that have not acknowledged yet.
            Actions\Action::make('remind')
                ->label('Remind pending woredas')
                ->icon('heroicon-o-bell-alert')
                ->color('warning')
                ->visible(fn (Circular $record) => $user?->canEditContent() && $record->requires_acknowledgement
                    && $record->woredas->contains(fn ($w) => ! $w->pivot->acknowledged_at))
                ->requiresConfirmation()
                ->modalDescription(fn (Circular $record) => 'Sends a new notification to: '
                    .$record->woredas->filter(fn ($w) => ! $w->pivot->acknowledged_at)->pluck('name_en')->join(', ').'.')
                ->action(function (Circular $record) {
                    $pending = $record->woredas->filter(fn ($w) => ! $w->pivot->acknowledged_at)->pluck('id')->all();
                    PortalNotifier::circularSent($record, $pending);
                    Notification::make()->title('Reminder sent to '.count($pending).' woreda(s)')->success()->send();
                }),

            Actions\EditAction::make(),
        ];
    }
}
