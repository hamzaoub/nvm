<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MenuController extends Controller
{
    /**
     * Get menu items for a specific menu, filtered by user role
     *
     * @param Request $request
     * @param string $menuName Machine name of the menu
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMenuItems(Request $request, $menuName = 'sidebar_menu')
    {
        // Debug - log all menus for troubleshooting
        \Log::info('Available menus:', Menu::all()->toArray());
        
        // Find the menu by machine name
        $menu = Menu::where('machine_name', $menuName)->first();
        
        if (!$menu) {
            // Create the sidebar menu if it doesn't exist - useful for first run
            $menu = Menu::create([
                'name' => 'Sidebar Menu',
                'machine_name' => 'sidebar_menu',
                'description' => 'Main sidebar navigation menu',
            ]);
            
            // Add a default menu item
            MenuItem::create([
                'menu_id' => $menu->id,
                'name' => 'Dashboard',
                'uri' => '/dashboard',
                'icon_name' => 'FaHome',
                'icon_library' => 'react-icons/fa',
                'color' => 'blue',
                'weight' => 0,
                'enabled' => true,
                'roles' => null,
            ]);
        }
        
        // Get the user's role - handle unauthenticated access by defaulting to basic user
        $user = Auth::user();
        $userRole = 'user'; // Default role
        if ($user && method_exists($user, 'hasRole')) {
            $userRole = $user->hasRole('admin') ? 'admin' : 'user';
        }
        
        // Fetch menu items, ordered by weight
        $query = MenuItem::where('menu_id', $menu->id)
            ->where('enabled', true)
            ->orderBy('weight');
            
        // If user is not admin, filter out admin-only items
        if ($userRole !== 'admin') {
            $query->where(function($q) {
                $q->whereNull('roles')
                  ->orWhere('roles', 'user')
                  ->orWhere('roles', 'LIKE', '%user%');
            });
        }
        
        $menuItems = $query->get();
        
        return response()->json([
            'menu' => $menu,
            'items' => $menuItems
        ]);
    }
}
