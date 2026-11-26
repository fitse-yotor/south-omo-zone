<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PortalSeeder::class);

        // First administrator, only when credentials are provided (never a default password):
        //   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-passphrase' php artisan db:seed
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');
        if ($email && $password) {
            User::updateOrCreate(['email' => $email], ['name' => env('ADMIN_NAME', 'Administrator'), 'password' => $password, 'role' => 'admin', 'is_active' => true]);
            $this->command?->info("Administrator {$email} is ready. Remove ADMIN_PASSWORD from .env now.");
        } else {
            $this->command?->warn('No administrator created. Run: php artisan portal:admin');
        }
    }
}
