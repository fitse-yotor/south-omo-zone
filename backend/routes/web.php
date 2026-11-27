<?php

use Illuminate\Support\Facades\Route;

// The React site is built into public/ (index.html). It uses hash routes (#/invest, #/tourism…),
// so only "/" needs to serve it; /api and /admin are handled by Laravel.
Route::get('/', function () {
    $index = public_path('index.html');
    abort_unless(is_file($index), 404, 'Site not built yet: run deploy/build-release.sh');

    return response()->file($index, ['Content-Type' => 'text/html; charset=UTF-8']);
});

// Built-in photos and emblem. On a live server these files sit in public/ and never reach Laravel;
// on a developer PC (before deploy/build-release.sh) they are served from the React site's public/ folder,
// so admin previews and the panel logo work there too.
Route::get('/{folder}/{file}', function (string $folder, string $file) {
    $path = \App\Support\SiteAssets::path($folder, $file);
    abort_unless($path, 404);

    return response()->file($path, ['Cache-Control' => 'public, max-age=86400']);
})->whereIn('folder', \App\Support\SiteAssets::FOLDERS)->where('file', '[A-Za-z0-9._-]+');
