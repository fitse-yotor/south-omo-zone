<?php

namespace App\Providers\Filament;

use App\Filament\Widgets\PortalStats;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Pages;
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

        return is_file(public_path('brand/logo.png')) ? asset('brand/logo.png') : null;
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
            ->colors(['primary' => Color::hex('#2a55bd'), 'success' => Color::hex('#2a9104'), 'warning' => Color::hex('#e0a82e'), 'danger' => Color::hex('#c8372d')])
            ->navigationGroups([
                NavigationGroup::make('Notice board'),
                NavigationGroup::make('Home page'),
                NavigationGroup::make('Investment'),
                NavigationGroup::make('Zone & tourism'),
                NavigationGroup::make('Tourism map'),
                NavigationGroup::make('Settings'),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->pages([Pages\Dashboard::class])
            ->widgets([\App\Filament\Widgets\LaunchChecklist::class, PortalStats::class])
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
            ->authMiddleware([Authenticate::class])
            ->spa();
    }
}
