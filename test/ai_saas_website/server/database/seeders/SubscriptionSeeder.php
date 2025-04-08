<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SubscriptionSeeder extends Seeder
{
    public function run()
    {
        DB::table('subscriptions')->insert([
            [
                'user_id' => 1,
                'plan_id' => 3, // Premium plan
                'status' => 'active',
                'trial_ends_at' => null,
                'ends_at' => now()->addMonths(6),
                'stripe_id' => 'sub_' . Str::random(24),
                'stripe_status' => 'active',
                'stripe_price' => 'price_premium_monthly',
                'quantity' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'plan_id' => 2, // Standard plan
                'status' => 'active',
                'trial_ends_at' => null,
                'ends_at' => now()->addMonths(3),
                'stripe_id' => 'sub_' . Str::random(24),
                'stripe_status' => 'active',
                'stripe_price' => 'price_standard_monthly',
                'quantity' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
} 