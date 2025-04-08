<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create Admin
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@aipro.com',
            'email_verified_at' => Carbon::now(),
            'password' => Hash::make('password123'),
            'verification_code' => null,
        ]);

        // Create Verified User
        $verifiedUser = User::create([
            'name' => 'Verified User',
            'email' => 'verified@aipro.com',
            'email_verified_at' => Carbon::now(),
            'password' => Hash::make('password123'),
            'verification_code' => null,
        ]);

        // Create Unverified User
        $unverifiedUser = User::create([
            'name' => 'Unverified User',
            'email' => 'unverified@aipro.com',
            'email_verified_at' => null,
            'password' => Hash::make('password123'),
            'verification_code' => '123456',
        ]);

        // Create Test User
        $testUser = User::create([
            'name' => 'Test User',
            'email' => 'test@aipro.com',
            'email_verified_at' => Carbon::now(),
            'password' => Hash::make('password123'),
            'verification_code' => null,
        ]);
    }
} 