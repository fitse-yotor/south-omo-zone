<?php

use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ContentController;
use Illuminate\Support\Facades\Route;

Route::get('/content', ContentController::class)->middleware('throttle:120,1');
Route::post('/contact', ContactController::class)->middleware('throttle:5,1');
