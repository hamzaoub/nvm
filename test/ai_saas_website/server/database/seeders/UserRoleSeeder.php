<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class UserRoleSeeder extends Seeder
{
    public function run()
    {
        // Ensure roles exist with correct IDs
        $this->ensureRolesExist();
        
        // Process existing users
        User::all()->each(function ($user) {
            // If user has no roles, assign default user role (ID=2)
            if ($user->roles->isEmpty()) {
                $user->roles()->syncWithoutDetaching([2]); // ID 2 is 'user' role
                
                // Also add to our new user_roles table
                UserRole::firstOrCreate(
                    ['user_id' => $user->id, 'role' => 'user'],
                    ['assigned_at' => now()]
                );
            }
            
            // For existing admin users, make sure they also have an entry in user_roles
            else if ($user->hasRole('admin')) {
                UserRole::firstOrCreate(
                    ['user_id' => $user->id, 'role' => 'admin'],
                    ['assigned_at' => now()]
                );
            }
        });
    }
    
    /**
     * Ensure that roles exist with correct IDs
     * This avoids disrupting existing relationships
     */
    private function ensureRolesExist()
    {
        // Check if admin role exists with ID 1
        if (!Role::where('id', 1)->where('name', 'admin')->exists()) {
            // If it doesn't exist with ID 1, check if it exists with another ID
            $adminRole = Role::where('name', 'admin')->first();
            
            if (!$adminRole) {
                // Create it if it doesn't exist
                Role::create([
                    'id' => 1,
                    'name' => 'admin',
                    'guard_name' => 'web'
                ]);
            }
        }
        
        // Check if user role exists with ID 2
        if (!Role::where('id', 2)->where('name', 'user')->exists()) {
            // If it doesn't exist with ID 2, check if it exists with another ID
            $userRole = Role::where('name', 'user')->first();
            
            if (!$userRole) {
                // Create it if it doesn't exist
                Role::create([
                    'id' => 2,
                    'name' => 'user',
                    'guard_name' => 'web'
                ]);
            }
        }
        
        // Check if moderator role exists with ID 3
        if (!Role::where('id', 3)->where('name', 'moderator')->exists()) {
            // If it doesn't exist with ID 3, check if it exists with another ID
            $modRole = Role::where('name', 'moderator')->first();
            
            if (!$modRole) {
                // Create it if it doesn't exist
                Role::create([
                    'id' => 3,
                    'name' => 'moderator',
                    'guard_name' => 'web'
                ]);
            }
        }
    }
} 