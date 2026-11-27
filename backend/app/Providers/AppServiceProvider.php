<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Uploaded photos and PDFs: build their URLs from the address the page was opened on, not APP_URL.
        // Otherwise opening the admin as http://localhost (or a XAMPP subfolder, or https) while APP_URL says
        // something else makes upload previews fail, because the browser has to fetch them cross-origin.
        // (Read through config, not env(), so it keeps working after "php artisan optimize".)
        $fixed = config('filesystems.disks.uploads.fixed_url');
        if ($fixed) {
            config(['filesystems.disks.uploads.url' => rtrim($fixed, '/')]);
        } elseif (! $this->app->runningInConsole()) {
            $request = request();
            config(['filesystems.disks.uploads.url' => $request->getSchemeAndHttpHost().$request->getBasePath().'/uploads']);
        }
    }
}
