<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSocialAccountSeeder extends Seeder
{
    public function run()
    {
        DB::table('user_social_accounts')->insert([
            [
                'user_id' => 1,
                'provider' => 'google',
                'provider_id' => '12345678',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'provider' => 'github',
                'provider_id' => '87654321',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
} 