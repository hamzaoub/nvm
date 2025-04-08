<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsageStatisticsSeeder extends Seeder
{
    public function run()
    {
        DB::table('usage_statistics')->insert([
            [
                'user_id' => 1,
                'feature_name' => 'image_segmentation',
                'usage_count' => 15,
                'last_used_at' => now()->subDays(2),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'feature_name' => 'sentiment_analysis',
                'usage_count' => 8,
                'last_used_at' => now()->subDays(1),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
} 