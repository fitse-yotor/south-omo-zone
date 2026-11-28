<?php

namespace App\Filament\Pages;

use Filament\Pages\Dashboard as BaseDashboard;
use Illuminate\Support\Facades\Auth;

class Dashboard extends BaseDashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-home';

    public function getHeading(): string
    {
        $user = Auth::user();

        if ($user?->isWoredaUser()) {
            return app()->getLocale() === 'am'
                ? __('admin.dashboard.title_woreda').', '.$user->name
                : 'Welcome, '.$user->name;
        }

        return app()->getLocale() === 'am'
            ? __('admin.dashboard.title_zone')
            : 'South Omo Zone Admin';
    }

    public function getSubheading(): string
    {
        $user = Auth::user();

        if ($user?->isWoredaUser()) {
            $woreda = $user->woreda?->name_en ?? '';

            return app()->getLocale() === 'am'
                ? $user->woreda?->name_am.' · '.__('admin.dashboard.sub_woreda')
                : $woreda.' Woreda · Submit reports and track your plan progress here.';
        }

        return app()->getLocale() === 'am'
            ? __('admin.dashboard.sub_zone')
            : 'Zone portal overview · reports, plans and content in one place.';
    }

    public static function canAccess(): bool
    {
        return Auth::user()?->is_active ?? false;
    }

    public function getColumns(): int|string|array
    {
        return 2;
    }
}
