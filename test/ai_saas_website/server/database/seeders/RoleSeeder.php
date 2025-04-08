<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    // database/seeders/RoleSeeder.php

public function run()
{
    // Disable foreign key checks
    \DB::statement('SET FOREIGN_KEY_CHECKS=0;');

    // Clear existing relationships first
    \DB::table('model_has_roles')->truncate();

    // Then truncate roles
    \DB::table('roles')->truncate();

    // Re-enable foreign key checks
    \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

    $roles = [
        ['name' => 'admin', 'guard_name' => 'web'],
        ['name' => 'user', 'guard_name' => 'web'],
    ];

    foreach ($roles as $role) {
        \Spatie\Permission\Models\Role::create($role);
    }
}
}