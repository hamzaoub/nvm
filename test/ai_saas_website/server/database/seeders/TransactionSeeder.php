<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('transactions')->insert([
            [
                'id' => 2,
                'user_id' => 2,
                'service_id' => null,
                'plan_id' => 2,
                'payment_method_id' => 1,
                'transaction_type' => 'plan_purchase',
                'amount' => 500,
                'created_at' => '2024-04-30 16:44:19',
                'updated_at' => '2024-04-30 16:44:19',
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'service_id' => null,
                'plan_id' => 3,
                'payment_method_id' => 2,
                'transaction_type' => 'plan_upgrade',
                'amount' => 1200,
                'created_at' => '2024-04-30 16:44:19',
                'updated_at' => '2024-04-30 16:44:19',
            ],
        ]);
    }
} 