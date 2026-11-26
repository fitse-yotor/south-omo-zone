<?php

namespace App\Filament\Widgets;

use App\Models\Announcement;
use App\Models\ContactMessage;
use App\Models\Opportunity;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class PortalStats extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Open vacancies', Announcement::open()->where('type', 'vacancy')->count())->icon('heroicon-o-briefcase'),
            Stat::make('Open tenders', Announcement::open()->where('type', 'tender')->count())->icon('heroicon-o-document-text'),
            Stat::make('Published opportunities', Opportunity::where('is_published', true)->count())->icon('heroicon-o-chart-bar'),
            Stat::make('Unread messages', ContactMessage::whereNull('read_at')->count())->icon('heroicon-o-envelope')
                ->color(ContactMessage::whereNull('read_at')->exists() ? 'warning' : 'gray'),
        ];
    }
}
