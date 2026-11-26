<?php

use Illuminate\Support\Facades\Route;

// The React site is built into public/ (index.html). It uses hash routes (#/invest, #/tourism…),
// so only "/" needs to serve it; /api and /admin are handled by Laravel.
Route::get('/', function () {
    $index = public_path('index.html');
    abort_unless(is_file($index), 404, 'Site not built yet: run deploy/build-release.sh');

    return response()->file($index, ['Content-Type' => 'text/html; charset=UTF-8']);
});
