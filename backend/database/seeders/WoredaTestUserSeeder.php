<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Woreda;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Creates one test woreda account for each existing woreda.
 * Run with: php artisan db:seed --class=WoredaTestUserSeeder
 *
 * Credentials printed to the console after seeding.
 */
class WoredaTestUserSeeder extends Seeder
{
    public function run(): void
    {
        $woredas = Woreda::orderBy('sort')->get();

        if ($woredas->isEmpty()) {
            $this->command->warn('No woredas found. Seed woredas first, or create them via /admin.');
            return;
        }

        // Create one test account per woreda
        foreach ($woredas as $woreda) {
            $email = strtolower(str_replace(' ', '.', $woreda->name_en)).'@test.soz';

            // Skip if account already exists
            if (User::where('email', $email)->exists()) {
                $this->command->line("  ⚠  Skipped {$email} (already exists)");
                continue;
            }

            User::create([
                'name'      => $woreda->name_en.' Woreda Office',
                'email'     => $email,
                'password'  => Hash::make('woreda@test123'),
                'role'      => 'woreda',
                'woreda_id' => $woreda->id,
                'is_active' => true,
            ]);

            $this->command->info("  ✓  Created: {$email}  /  password: woreda@test123");
        }

        // Also create a single generic test account for the first woreda
        $first = $woredas->first();
        $genericEmail = 'woreda.test@soz.local';

        if (! User::where('email', $genericEmail)->exists()) {
            User::create([
                'name'      => 'Test Woreda User ('.$first->name_en.')',
                'email'     => $genericEmail,
                'password'  => Hash::make('woreda@test123'),
                'role'      => 'woreda',
                'woreda_id' => $first->id,
                'is_active' => true,
            ]);
            $this->command->info("  ✓  Generic test account: {$genericEmail}  /  password: woreda@test123");
        }

        $this->command->newLine();
        $this->command->line('Login at: <fg=cyan>http://localhost/south-omo-zone/backend/public/admin</>');
    }
}
