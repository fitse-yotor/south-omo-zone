<?php

namespace App\Filament\Widgets;

use App\Models\Announcement;
use App\Models\ContactMessage;
use App\Models\Opportunity;
use App\Models\User;
use App\Models\Woreda;
use App\Models\WoredaReport;
use App\Models\ZonePlan;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Auth;

class PortalStats extends StatsOverviewWidget
{
    protected static ?int $sort = 7;

    protected static ?string $pollingInterval = null;

    /** Woreda accounts: their own report counts first. Zone staff: website figures after the cumulative ones. */
    public static function getSort(): int
    {
        return Auth::user()?->isWoredaUser() ? 0 : 7;
    }

    protected function getHeading(): ?string
    {
        return Auth::user()?->isWoredaUser() ? 'My reporting' : 'Portal & website';
    }

    protected function getStats(): array
    {
        $user = Auth::user();

        // Woreda account: show their own stats
        if ($user?->isWoredaUser()) {
            $woredaId = $user->woreda_id;

            return [
                Stat::make('My Reports', WoredaReport::where('woreda_id', $woredaId)->count())
                    ->description('Total submitted')
                    ->icon('heroicon-o-document-chart-bar')
                    ->color('info'),

                Stat::make('Pending Feedback', WoredaReport::where('woreda_id', $woredaId)->where('status', 'submitted')->count())
                    ->description('Awaiting zone review')
                    ->icon('heroicon-o-clock')
                    ->color('warning'),

                Stat::make('Active Plans', ZonePlan::whereHas('woredas', fn ($q) => $q->where('woredas.id', $woredaId))->where('status', 'active')->count())
                    ->description('Plans assigned to your woreda')
                    ->icon('heroicon-o-clipboard-document-list')
                    ->color('success'),

                Stat::make('Approved Reports', WoredaReport::where('woreda_id', $woredaId)->where('status', 'approved')->count())
                    ->description('Reports approved by zone')
                    ->icon('heroicon-o-check-circle')
                    ->color('success'),
            ];
        }

        // Zone staff: show zone-wide stats
        return [
            Stat::make('Pending Reports', WoredaReport::where('status', 'submitted')->count())
                ->description('Woreda reports awaiting review')
                ->icon('heroicon-o-document-chart-bar')
                ->color(WoredaReport::where('status', 'submitted')->exists() ? 'warning' : 'gray')
                ->url('/admin/woreda-reports'),

            Stat::make('Active Plans', ZonePlan::where('status', 'active')->count())
                ->description('Zone plans currently running')
                ->icon('heroicon-o-clipboard-document-list')
                ->color('info'),

            Stat::make('Woreda Accounts', User::where('role', 'woreda')->where('is_active', true)->count())
                ->description('Active woreda logins')
                ->icon('heroicon-o-building-office-2')
                ->color('success'),

            Stat::make('Open vacancies', Announcement::open()->where('type', 'vacancy')->count())
                ->icon('heroicon-o-briefcase'),

            Stat::make('Open tenders', Announcement::open()->where('type', 'tender')->count())
                ->icon('heroicon-o-document-text'),

            Stat::make('Published opportunities', Opportunity::where('is_published', true)->count())
                ->icon('heroicon-o-chart-bar'),

            Stat::make('Unread messages', ContactMessage::whereNull('read_at')->count())
                ->icon('heroicon-o-envelope')
                ->color(ContactMessage::whereNull('read_at')->exists() ? 'warning' : 'gray'),

            Stat::make('Woredas', Woreda::count())
                ->description('Registered woredas')
                ->icon('heroicon-o-map'),
        ];
    }
}
