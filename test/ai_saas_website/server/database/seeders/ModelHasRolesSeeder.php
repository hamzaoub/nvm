<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModelHasRolesSeeder extends Seeder
{
    public function run()
    {
        DB::table('model_has_roles')->delete();
        
        // Then insert new records
        DB::table('model_has_roles')->insert([
            ['model_id' => 1, 'model_type' => 'App\Models\User', 'role_id' => 1],
            ['model_id' => 2, 'model_type' => 'App\Models\User', 'role_id' => 2],
            ['model_id' => 3, 'model_type' => 'App\Models\User', 'role_id' => 2],
        ]);
    }
} 