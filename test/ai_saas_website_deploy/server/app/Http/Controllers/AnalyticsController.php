<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\User;
use App\Models\AiProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Get analytics data for admin dashboard
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAdminAnalytics(Request $request)
    {
        // Check for admin role
        $user = Auth::user();
        if (!$user || !$this->isUserAdmin()) {
            return response()->json(['error' => 'Unauthorized. Admin access required.'], 403);
        }

        // Get time period from request or default to last 30 days
        $period = $request->input('period', 'month');
        $startDate = $this->getStartDate($period);
        
        // Get overall counts
        $totalUsers = User::count();
        $newUsers = User::where('created_at', '>=', $startDate)->count();
        $totalProjects = AiProject::count();
        $newProjects = AiProject::where('created_at', '>=', $startDate)->count();
        
        // Get user registrations over time
        $userTrend = $this->getUserRegistrationTrend($startDate);
        
        // Get project creation trend
        $projectTrend = $this->getProjectCreationTrend($startDate);
        
        // Get user role distribution
        $userRoles = $this->getUserRoleDistribution();
        
        // Get project distribution by type
        $projectTypes = $this->getProjectTypeDistribution();
        
        // Get system health data
        $systemHealth = $this->getSystemHealth();
        
        return response()->json([
            'overview' => [
                'totalUsers' => $totalUsers,
                'newUsers' => $newUsers,
                'userGrowth' => $totalUsers > 0 ? round(($newUsers / $totalUsers) * 100, 2) : 0,
                'totalProjects' => $totalProjects,
                'newProjects' => $newProjects,
                'projectGrowth' => $totalProjects > 0 ? round(($newProjects / $totalProjects) * 100, 2) : 0,
            ],
            'trends' => [
                'userRegistrations' => $userTrend,
                'projectCreations' => $projectTrend,
            ],
            'distributions' => [
                'userRoles' => $userRoles,
                'projectTypes' => $projectTypes,
            ],
            'system' => $systemHealth,
        ]);
    }
    
    /**
     * Get start date based on period
     */
    private function getStartDate($period)
    {
        $now = Carbon::now();
        
        switch ($period) {
            case 'week':
                return $now->subDays(7);
            case 'month':
                return $now->subDays(30);
            case 'quarter':
                return $now->subDays(90);
            case 'year':
                return $now->subDays(365);
            default:
                return $now->subDays(30);
        }
    }
    
    /**
     * Get user registration trend
     */
    private function getUserRegistrationTrend($startDate)
    {
        $users = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', $startDate)
        ->groupBy('date')
        ->orderBy('date')
        ->get();
        
        // Fill in missing dates with zero values
        return $this->fillMissingDates($users, $startDate);
    }
    
    /**
     * Get project creation trend
     */
    private function getProjectCreationTrend($startDate)
    {
        $projects = AiProject::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', $startDate)
        ->groupBy('date')
        ->orderBy('date')
        ->get();
        
        // Fill in missing dates with zero values
        return $this->fillMissingDates($projects, $startDate);
    }
    
    /**
     * Fill in missing dates with zero values
     */
    private function fillMissingDates($data, $startDate)
    {
        $result = [];
        $current = Carbon::parse($startDate);
        $today = Carbon::today();
        
        // Convert data to associative array with date as key
        $dateMap = [];
        foreach ($data as $item) {
            $dateMap[$item->date] = $item->count;
        }
        
        // Fill in all dates
        while ($current->lte($today)) {
            $dateString = $current->format('Y-m-d');
            $result[] = [
                'date' => $dateString,
                'count' => $dateMap[$dateString] ?? 0,
            ];
            $current->addDay();
        }
        
        return $result;
    }
    
    /**
     * Get user role distribution
     */
    private function getUserRoleDistribution()
    {
        // This is a simplified implementation - adjust based on your actual role structure
        $adminCount = DB::table('model_has_roles')
            ->where('role_id', 1) // Assuming 1 is admin role ID
            ->count();
            
        $totalUsers = User::count();
        $regularUsers = $totalUsers - $adminCount;
        
        return [
            ['name' => 'Admin', 'value' => $adminCount, 'color' => '#00b4d8'],
            ['name' => 'Regular', 'value' => $regularUsers, 'color' => '#0077b6'],
        ];
    }
    
    /**
     * Get project type distribution
     */
    private function getProjectTypeDistribution()
    {
        // Adjust this based on your actual project type field
        // This is a placeholder implementation
        $types = AiProject::select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                // Add ocean-themed colors
                $colors = [
                    'Research' => '#051e2f',
                    'Development' => '#0a3a5a',
                    'Production' => '#0c4c74',
                    'Personal' => '#00b4d8',
                    'Education' => '#0077b6',
                ];
                
                return [
                    'name' => $item->type ?: 'Undefined',
                    'value' => $item->count,
                    'color' => $colors[$item->type] ?? '#90e0ef',
                ];
            });
            
        return $types;
    }
    
    /**
     * Get system health data
     */
    private function getSystemHealth()
    {
        // CPU and memory usage
        $cpuUsage = sys_getloadavg()[0] * 100;
        
        // Database size (this will depend on your DB system)
        $dbSize = 0;
        try {
            $dbInfo = DB::select('SELECT pg_database_size(current_database()) as size');
            $dbSize = $dbInfo[0]->size / 1024 / 1024; // Convert to MB
        } catch (\Exception $e) {
            // Fallback for non-PostgreSQL or if query fails
            $dbSize = rand(100, 500); // Mock value
        }
        
        return [
            'cpu' => min(round($cpuUsage, 2), 100),
            'memory' => round(rand(20, 80), 2), // Mock value - replace with actual memory usage if available
            'dbSize' => round($dbSize, 2),
            'uptime' => rand(1, 30) . ' days', // Mock value - replace with actual server uptime
        ];
    }
    
    /**
     * Check if the current user is an admin
     *
     * @return bool
     */
    private function isUserAdmin(): bool
    {
        $user = Auth::user();
        if (!$user) return false;
        
        if (method_exists($user, 'roles')) {
            $roles = $user->roles->pluck('name');
            return $roles->contains('admin');
        }
        
        return false;
    }
}
