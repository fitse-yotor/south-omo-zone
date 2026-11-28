<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;

/**
 * Reads the authenticated user's preferred locale and applies it
 * to the Laravel app for the duration of the request so all Filament
 * translation strings render in the right language.
 */
class SetAdminLocale
{
    public function handle(Request $request, Closure $next): mixed
    {
        $user = Auth::user();

        if ($user && in_array($user->locale ?? 'en', ['en', 'am'], true)) {
            App::setLocale($user->locale);
        }

        return $next($request);
    }
}
