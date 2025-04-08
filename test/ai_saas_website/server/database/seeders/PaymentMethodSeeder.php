<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('payment_methods')->insert([
            [
                'id' => 1,
                'user_id' => 1,
                'payment_method_type' => 'credit_card',
                'card_number' => '5365895685601768',
                'expiry_date' => '2027-03-11 01:50:05',
                'billing_address' => '1304 Brandi Ferry\nNorth Floridaton, MS 06973',
                'created_at' => '2024-04-30 16:44:19',
                'updated_at' => '2024-04-30 16:44:19',
            ],
            [
                'id' => 2,
                'user_id' => 2,
                'payment_method_type' => 'credit_card',
                'card_number' => '6011826124664949',
                'expiry_date' => '2027-02-08 03:23:15',
                'billing_address' => '64693 Claudie Villages\nWest Blancachester, MS 74758',
                'created_at' => '2024-04-30 16:44:19',
                'updated_at' => '2024-04-30 16:44:19',
            ],
        ]);
    }
} 