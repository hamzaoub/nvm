<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserActivityLogSeeder extends Seeder
{
    public function run()
    {
        DB::table('user_activity_logs')->insert([
            [
                'user_id' => 1,
                'activity_type' => 'login',
                'description' => 'User logged in successfully',
                'metadata' => json_encode(['ip' => '192.168.1.1']),
                'ip_address' => '192.168.1.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'activity_type' => 'subscription_change',
                'description' => 'User upgraded to Premium plan',
                'metadata' => json_encode(['plan_id' => 3]),
                'ip_address' => '192.168.1.2',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
} 