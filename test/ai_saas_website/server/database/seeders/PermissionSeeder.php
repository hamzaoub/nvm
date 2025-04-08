<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            'dashboard',
            'Home',
            'permission list',
            'permission create',
            'permission edit',
            'permission delete',
            'role list',
            'role create',
            'role edit',
            'role delete',
            'user list',
            'user create',
            'user edit',
            'user delete',
            'menu list',
            'menu create',
            'menu edit',
            'menu delete',
            'menu.item list',
            'menu.item create',
            'menu.item edit',
            'menu.item delete',
            'category list',
            'category create',
            'category edit',
            'category delete',
            'category.type list',
            'category.type create',
            'category.type edit',
            'category.type delete',
            'ai-service list',
            'ai-service create',
            'ai-service edit',
            'ai-service delete',
            'plans list',
            'plans create',
            'plans edit',
            'plans delete',
            'subscriptions list',
            'subscriptions create',
            'subscriptions edit',
            'subscriptions delete',
            'api-services list',
            'api-services create',
            'api-services edit',
            'api-services delete',
            'user-activity-logs list',
            'user-activity-logs create',
            'user-activity-logs edit',
            'user-activity-logs delete',
            'transaction list',
            'transaction create',
            'transaction edit',
            'transaction delete',
        ];

        foreach ($permissions as $permission) {
            Permission::create([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }
    }
}