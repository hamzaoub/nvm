<?php

namespace Database\Seeders;

use App\Models\Coin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CoinSeeder extends Seeder
{
    public function run()
    {
        // Clear the table first
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('coins')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Then insert new records
        $users = DB::table('users')->take(3)->pluck('id');
        
        if ($users->count() >= 3) {
            DB::table('coins')->insert([
                ['id' => 1, 'user_id' => $users[0], 'coin_balance' => 200, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 2, 'user_id' => $users[1], 'coin_balance' => 200, 'created_at' => now(), 'updated_at' => now()],
                ['id' => 3, 'user_id' => $users[2], 'coin_balance' => 200, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }
}