<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // First, seed independent tables
        $this->call([
            CategoryTypeSeeder::class,
            RoleSeeder::class,
            PermissionSeeder::class,
            PlanSeeder::class,
            AiServiceSeeder::class,
            ExternalServiceSeeder::class,
            MenuSeeder::class,
        ]);

        // Then seed user-related data
        $this->call([
            UserSeeder::class,
            UserProfileSeeder::class,
            UserSocialAccountSeeder::class,
            ModelHasRolesSeeder::class,
            RoleHasPermissionSeeder::class,
            AiProjectSeeder::class,
        ]);

        // Finally, seed dependent data
        $this->call([
            SubscriptionSeeder::class,
            PaymentMethodSeeder::class,
            TransactionSeeder::class,
            UserActivityLogSeeder::class,
            UsageStatisticsSeeder::class,
        ]);

        // Additional seeders
        $this->call([
            UserRoleSeeder::class,
        ]);
    }
}
