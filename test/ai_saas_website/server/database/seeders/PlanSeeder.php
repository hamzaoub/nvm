<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run()
    {
        // Disable foreign key checks to avoid constraint issues
        // We'll update existing plans by ID or create new ones

        $plans = [
            [
                'name' => 'Free',
                'price' => 0.00,
                'description' => 'Perfect for exploring the shallows',
                'duration' => 'monthly',
                'coin_balance' => 100,
                'features' => json_encode([
                    '100 monthly AI credits',
                    'Basic project templates',
                    'Community support',
                    '3 projects limit'
                ]),
                'status' => true
            ],
            [
                'name' => 'Coral Reef',
                'price' => 9.99,
                'description' => 'For creators ready to dive deeper',
                'duration' => 'monthly',
                'coin_balance' => 1000,
                'features' => json_encode([
                    '1,000 monthly AI credits',
                    'All project templates',
                    'Priority email support',
                    '15 projects limit',
                    'Advanced analytics'
                ]),
                'status' => true
            ],
            [
                'name' => 'Coral Reef',
                'price' => 99.99,
                'description' => 'For creators ready to dive deeper',
                'duration' => 'yearly',
                'coin_balance' => 12000, // 1000 per month x 12
                'features' => json_encode([
                    '1,000 monthly AI credits',
                    'All project templates',
                    'Priority email support',
                    '15 projects limit',
                    'Advanced analytics'
                ]),
                'status' => true
            ],
            [
                'name' => 'Deep Ocean',
                'price' => 29.99,
                'description' => 'Professional tools for serious explorers',
                'duration' => 'monthly',
                'coin_balance' => 5000,
                'features' => json_encode([
                    '5,000 monthly AI credits',
                    'Unlimited projects',
                    'Custom project templates',
                    'Advanced analytics',
                    'API access',
                    '24/7 priority support'
                ]),
                'status' => true
            ],
            [
                'name' => 'Deep Ocean',
                'price' => 299.99,
                'description' => 'Professional tools for serious explorers',
                'duration' => 'yearly',
                'coin_balance' => 60000, // 5000 per month x 12
                'features' => json_encode([
                    '5,000 monthly AI credits',
                    'Unlimited projects',
                    'Custom project templates',
                    'Advanced analytics',
                    'API access',
                    '24/7 priority support'
                ]),
                'status' => true
            ],
            [
                'name' => 'Trench Expedition',
                'price' => 79.99,
                'description' => 'For enterprises and power users',
                'duration' => 'monthly',
                'coin_balance' => 20000,
                'features' => json_encode([
                    '20,000 monthly AI credits',
                    'Unlimited everything',
                    'Dedicated account manager',
                    'Custom AI model training',
                    'White-label solutions',
                    'API rate limits 5x higher'
                ]),
                'status' => true
            ],
            [
                'name' => 'Trench Expedition',
                'price' => 799.99,
                'description' => 'For enterprises and power users',
                'duration' => 'yearly',
                'coin_balance' => 240000, // 20000 per month x 12
                'features' => json_encode([
                    '20,000 monthly AI credits',
                    'Unlimited everything',
                    'Dedicated account manager',
                    'Custom AI model training',
                    'White-label solutions',
                    'API rate limits 5x higher'
                ]),
                'status' => true
            ],
        ];

        // Map each plan to its fixed ID to ensure consistent references
        $planIds = [
            'Free Dive-monthly' => 1,
            'Coral Reef-monthly' => 2,
            'Coral Reef-yearly' => 3,
            'Deep Ocean-monthly' => 4,
            'Deep Ocean-yearly' => 5,
            'Trench Expedition-monthly' => 6,
            'Trench Expedition-yearly' => 7,
        ];

        foreach ($plans as $index => $plan) {
            $key = $plan['name'] . '-' . $plan['duration'];
            $id = $planIds[$key] ?? ($index + 1);

            Plan::updateOrCreate(
                ['id' => $id],
                $plan
            );
        }
    }
}