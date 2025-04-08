<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run()
    {
        // First clear existing menus to avoid duplications
        // Disable foreign key checks before truncating
        \DB::statement('SET FOREIGN_KEY_CHECKS=0');
        MenuItem::truncate();
        Menu::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1');
        
        // Create Sidebar Menu
        $sidebarMenu = Menu::create([
            'name' => 'Sidebar Menu',
            'machine_name' => 'sidebar_menu',
            'description' => 'Main sidebar navigation menu',
        ]);

        // Create sidebar menu items with React icon information
        // Dashboard - for all users
        MenuItem::create([
            'menu_id' => $sidebarMenu->id,
            'name' => 'Dashboard',
            'uri' => '/dashboard',
            'icon' => null,
            'icon_name' => 'FaHome',
            'icon_library' => 'react-icons/fa',
            'color' => 'blue',
            'weight' => 0,
            'enabled' => true,
            'roles' => null, // null means available to all roles
        ]);
        
        // AI Projects - for all users
        MenuItem::create([
            'menu_id' => $sidebarMenu->id,
            'name' => 'AI Projects',
            'uri' => '/projects',
            'icon' => null,
            'icon_name' => 'FaProjectDiagram',
            'icon_library' => 'react-icons/fa',
            'color' => 'orange',
            'weight' => 10,
            'enabled' => true,
            'roles' => null,
        ]);
        
        // AI Models - for all users
        MenuItem::create([
            'menu_id' => $sidebarMenu->id,
            'name' => 'AI Models',
            'uri' => '/ai-models',
            'icon' => null,
            'icon_name' => 'RiWaterFlashFill',
            'icon_library' => 'react-icons/ri',
            'color' => 'indigo',
            'weight' => 20,
            'enabled' => true,
            'roles' => null,
        ]);
        
        // AI Research - for all users
        MenuItem::create([
            'menu_id' => $sidebarMenu->id,
            'name' => 'AI Research',
            'uri' => '/data',
            'icon' => null,
            'icon_name' => 'MdOutlineScience',
            'icon_library' => 'react-icons/md',
            'color' => 'purple',
            'weight' => 30,
            'enabled' => true,
            'roles' => null,
        ]);
        
        // Analytics - for admins only
        MenuItem::create([
            'menu_id' => $sidebarMenu->id,
            'name' => 'Analytics',
            'uri' => '/admin/analytics',
            'icon' => null,
            'icon_name' => 'FaChartBar',
            'icon_library' => 'react-icons/fa',
            'color' => 'red',
            'weight' => 40,
            'enabled' => true,
            'roles' => 'admin', // only admin can see this
        ]);
        
        // AI Community - for all users
        MenuItem::create([
            'menu_id' => $sidebarMenu->id,
            'name' => 'AI Community',
            'uri' => '/community',
            'icon' => null,
            'icon_name' => 'FaUsers',
            'icon_library' => 'react-icons/fa',
            'color' => 'amber',
            'weight' => 50,
            'enabled' => true,
            'roles' => null,
        ]);
        
        // Admin Settings - for admins only
        MenuItem::create([
            'menu_id' => $sidebarMenu->id,
            'name' => 'Admin Settings',
            'uri' => '/admin/settings',
            'icon' => null,
            'icon_name' => 'FaCog',
            'icon_library' => 'react-icons/fa',
            'color' => 'green',
            'weight' => 60,
            'enabled' => true,
            'roles' => 'admin',
        ]);
    }
} 