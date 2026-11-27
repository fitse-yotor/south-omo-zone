<?php

namespace App\Filament\Pages;

use App\Filament\Support\Bi;
use App\Support\SystemChecks;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Artisan;

/** Administrators: is the server set up for speed and safety? With buttons to rebuild or clear the caches (no SSH needed). */
class SystemStatus extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-cpu-chip';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'System status';

    protected static ?int $navigationSort = 90;

    protected static string $view = 'filament.pages.system-status';

    public static function canAccess(): bool
    {
        return Bi::isAdmin();
    }

    public function getSubheading(): ?string
    {
        return 'Speed, safety and email settings of this server. Green is good; follow the advice next to anything orange or red.';
    }

    protected function getViewData(): array
    {
        $groups = SystemChecks::all();

        return ['groups' => $groups, 'summary' => SystemChecks::summary($groups)];
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('rebuild')
                ->label('Rebuild caches')
                ->icon('heroicon-o-bolt')
                ->requiresConfirmation()
                ->modalDescription(app()->environment('production')
                    ? 'Rebuilds the configuration, route, view, icon and panel caches. Do this after every update or .env change.'
                    : 'On a developer PC, cached settings hide later .env and code changes until you press “Clear caches”. Use this mainly on the live server.')
                ->action(fn () => $this->run(['optimize', 'filament:optimize'], 'Caches rebuilt')),

            Action::make('clear')
                ->label('Clear caches')
                ->icon('heroicon-o-arrow-path')
                ->color('gray')
                ->requiresConfirmation()
                ->modalDescription('Removes all caches. Use it if a change does not show up; then rebuild on the live server.')
                ->action(fn () => $this->run(['optimize:clear', 'filament:optimize-clear'], 'Caches cleared')),
        ];
    }

    private function run(array $commands, string $title): void
    {
        try {
            foreach ($commands as $command) {
                Artisan::call($command);
            }
            if (function_exists('opcache_reset')) {
                @opcache_reset(); // drop compiled copies of the old cache files
            }
            Notification::make()->title($title)->success()->send();
        } catch (\Throwable $e) {
            report($e);
            Notification::make()->title('That did not work')->body($e->getMessage())->danger()->persistent()->send();
        }
    }
}
