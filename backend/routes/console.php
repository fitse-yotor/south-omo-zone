<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;

use function Laravel\Prompts\password;
use function Laravel\Prompts\select;
use function Laravel\Prompts\text;

// php artisan portal:admin  — create or update an admin-panel user interactively.
Artisan::command('portal:admin', function () {
    $name = text('Full name', required: true);
    $email = text('Email', required: true, validate: fn ($v) => filter_var($v, FILTER_VALIDATE_EMAIL) ? null : 'Enter a valid email.');
    $role = select('Role', User::ROLES, default: 'admin');
    $pass = password('Password (at least 12 characters)', required: true, validate: fn ($v) => strlen($v) >= 12 ? null : 'Use at least 12 characters.');
    User::updateOrCreate(['email' => $email], ['name' => $name, 'password' => $pass, 'role' => $role, 'is_active' => true]);
    $this->info("User {$email} saved. Sign in at ".url('/admin'));
})->purpose('Create or update an admin-panel user');
