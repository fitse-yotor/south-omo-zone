<?php

namespace App\Providers\Filament;

use App\Filament\Widgets\ActivePlans;
use App\Filament\Widgets\LatestReports;
use App\Filament\Widgets\PortalStats;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    /**
     * Anthropic warm neutrals: 50 = ivory #faf9f5, 200 = #e8e6dc, 400 = #b0aea5, 950 = near-black #141413.
     * 500 is darkened to #6e6d67 so secondary text keeps 4.5:1 contrast on ivory and white.
     */
    public const WARM_GRAY = [
        50 => '250, 249, 245', 100 => '240, 238, 230', 200 => '232, 230, 220', 300 => '209, 207, 197',
        400 => '176, 174, 165', 500 => '110, 109, 103', 600 => '84, 83, 79', 700 => '61, 61, 58',
        800 => '42, 41, 38', 900 => '31, 30, 29', 950 => '20, 20, 19',
    ];

    /** Clay accent: 500 = brand orange #d97757; 600 #b25434 and 700 #94422a carry white text (5.0:1 and 6.8:1). */
    public const CLAY = [
        50 => '251, 241, 237', 100 => '246, 224, 215', 200 => '239, 195, 177', 300 => '230, 161, 132',
        400 => '223, 138, 105', 500 => '217, 119, 87', 600 => '178, 84, 52', 700 => '148, 66, 42',
        800 => '120, 54, 35', 900 => '95, 44, 29', 950 => '58, 26, 16',
    ];

    /** Uploaded emblem from the settings, else the built-in one. */
    public static function logoUrl(): ?string
    {
        try {
            if ($url = \App\Models\SiteSetting::query()->first()?->logoUrl()) {
                return $url;
            }
        } catch (\Throwable) {
            // before the first migration
        }

        return \App\Support\SiteAssets::exists('brand', 'logo.png') ? asset('brand/logo.png') : null;
    }

    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->passwordReset()
            ->brandName('South Omo Zone · Admin')
            ->brandLogo(fn () => self::logoUrl())
            ->brandLogoHeight('2.75rem')
            ->favicon(fn () => self::logoUrl())
            // Anthropic palette: warm ivory / near-black surfaces (gray), clay accent (primary).
            ->colors([
                'primary' => self::CLAY,
                'gray' => self::WARM_GRAY,
                'info' => Color::hex('#3d7cc4'),
                'success' => Color::hex('#5f7a3e'),
                'warning' => Color::hex('#c98a1b'),
                'danger' => Color::hex('#b5412f'),
            ])
            ->font('Poppins', url: asset('fonts/fonts.css'), provider: \Filament\FontProviders\LocalFontProvider::class)
            ->darkMode(true)
            ->sidebarCollapsibleOnDesktop()
            ->collapsibleNavigationGroups()
            ->sidebarWidth('17rem')
            ->maxContentWidth(\Filament\Support\Enums\MaxWidth::ScreenTwoExtraLarge)
            ->renderHook(
                'panels::head.end',
                fn () => new \Illuminate\Support\HtmlString(
                    '<link rel="stylesheet" href="'.asset('css/admin-custom.css').'?v='.@filemtime(public_path('css/admin-custom.css')).'">'
                    .(app()->getLocale() === 'am'
                        ? '<style>body,input,button,select,textarea{font-family:"Noto Sans Ethiopic",system-ui,sans-serif!important}.fi-sidebar-item-label,.fi-topbar .fi-breadcrumbs-item-label{font-family:"Noto Sans Ethiopic",sans-serif!important}</style>'
                        : '')
                )
            )
            ->renderHook(
                'panels::topbar.start',
                fn () => \Illuminate\Support\Facades\Blade::render('<livewire:language-switcher />')
            )
            // Everyday work open; content sections start folded (Filament remembers each person's choice).
            ->navigationGroups([
                NavigationGroup::make(fn () => app()->getLocale() === 'am' ? __('admin.nav.woreda_portal') : 'Woreda Portal'),
                NavigationGroup::make(fn () => app()->getLocale() === 'am' ? __('admin.nav.notice_board') : 'Notice board'),
                NavigationGroup::make(fn () => app()->getLocale() === 'am' ? __('admin.nav.home_page') : 'Home page')->collapsed(),
                NavigationGroup::make(fn () => app()->getLocale() === 'am' ? __('admin.nav.investment') : 'Investment')->collapsed(),
                NavigationGroup::make(fn () => app()->getLocale() === 'am' ? __('admin.nav.zone_tourism') : 'Zone & tourism')->collapsed(),
                NavigationGroup::make(fn () => app()->getLocale() === 'am' ? __('admin.nav.tourism_map') : 'Tourism map')->collapsed(),
                NavigationGroup::make(fn () => app()->getLocale() === 'am' ? __('admin.nav.settings') : 'Settings')->collapsed(),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->pages([\App\Filament\Pages\Dashboard::class, \App\Filament\Pages\SystemStatus::class])
            // The bell: report, plan and circular news between the zone and the woredas (App\Support\PortalNotifier).
            // Private report / circular files, behind the panel login (App\Http\Controllers\PrivateFileController).
            ->authenticatedRoutes(function () {
                \Illuminate\Support\Facades\Route::get('files/{type}/{id}/{index}', \App\Http\Controllers\PrivateFileController::class)
                    ->whereIn('type', ['report', 'circular'])->whereNumber(['id', 'index'])
                    ->name('private-file');
            })
            ->databaseNotifications()
            ->databaseNotificationsPolling('30s')
            ->widgets([
                \App\Filament\Widgets\LaunchChecklist::class,
                \App\Filament\Widgets\IndicatorStats::class,
                \App\Filament\Widgets\CumulativeTrendChart::class,
                \App\Filament\Widgets\WoredaComparisonChart::class,
                \App\Filament\Widgets\WoredaScorecard::class,
                LatestReports::class,
                ActivePlans::class,
                PortalStats::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->defaultAvatarProvider(\App\Filament\Support\InitialsAvatar::class)
            ->authMiddleware([Authenticate::class, \App\Http\Middleware\SetAdminLocale::class])
            ->spa();
    }
}
