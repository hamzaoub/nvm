<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserProfileSeeder extends Seeder
{
    public function run()
    {
        DB::table('user_profiles')->insert([
            [
                'user_id' => 1,
                'bio' => 'System administrator with extensive experience',
                'phone_number' => '+1234567890',
                'location' => '123 Admin Street, Tech City',
                'birth_date' => '1990-01-01',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'bio' => 'Regular user exploring AI services',
                'phone_number' => '+1987654321',
                'location' => '456 User Avenue, Tech Town',
                'birth_date' => '1995-05-15',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
} 