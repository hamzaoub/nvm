<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\MicroserviceUsage;

class MicroservicesAnalyticsController extends Controller
{
    /**
     * Get usage analytics for all microservices
     */
    public function getUsageAnalytics(Request $request)
    {
        // Check if user has admin role
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Get date range from request
        $startDate = $request->input('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        
        // Get usage data from database
        $usageData = MicroserviceUsage::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('service_type, operation, COUNT(*) as request_count, SUM(credit_cost) as total_credits')
            ->groupBy('service_type', 'operation')
            ->get();
        
        // Organize data by service type
        $serviceUsage = [];
        foreach ($usageData as $usage) {
            if (!isset($serviceUsage[$usage->service_type])) {
                $serviceUsage[$usage->service_type] = [
                    'total_requests' => 0,
                    'total_credits' => 0,
                    'operations' => []
                ];
            }
            
            $serviceUsage[$usage->service_type]['total_requests'] += $usage->request_count;
            $serviceUsage[$usage->service_type]['total_credits'] += $usage->total_credits;
            $serviceUsage[$usage->service_type]['operations'][$usage->operation] = [
                'request_count' => $usage->request_count,
                'credit_cost' => $usage->total_credits
            ];
        }
        
        // Get service health status
        $serviceStatus = $this->getServiceHealthStatus();
        
        return response()->json([
            'date_range' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ],
            'service_usage' => $serviceUsage,
            'service_status' => $serviceStatus
        ]);
    }
    
    /**
     * Get user-specific usage analytics
     */
    public function getUserUsageAnalytics(Request $request)
    {
        $user = $request->user();
        
        // Get date range from request
        $startDate = $request->input('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        
        // Get usage data from database for this user
        $usageData = MicroserviceUsage::where('user_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('service_type, operation, COUNT(*) as request_count, SUM(credit_cost) as total_credits')
            ->groupBy('service_type', 'operation')
            ->get();
        
        // Organize data by service type
        $serviceUsage = [];
        foreach ($usageData as $usage) {
            if (!isset($serviceUsage[$usage->service_type])) {
                $serviceUsage[$usage->service_type] = [
                    'total_requests' => 0,
                    'total_credits' => 0,
                    'operations' => []
                ];
            }
            
            $serviceUsage[$usage->service_type]['total_requests'] += $usage->request_count;
            $serviceUsage[$usage->service_type]['total_credits'] += $usage->total_credits;
            $serviceUsage[$usage->service_type]['operations'][$usage->operation] = [
                'request_count' => $usage->request_count,
                'credit_cost' => $usage->total_credits
            ];
        }
        
        // Get user credit information
        $creditInfo = [
            'available_credits' => $user->credits,
            'total_used_credits' => MicroserviceUsage::where('user_id', $user->id)->sum('credit_cost'),
            'current_plan' => $user->subscription ? $user->subscription->plan->name : 'Free'
        ];
        
        return response()->json([
            'date_range' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ],
            'service_usage' => $serviceUsage,
            'credit_info' => $creditInfo
        ]);
    }
    
    /**
     * Log usage of microservices
     */
    public function logUsage(Request $request, $serviceType, $operation, $creditCost)
    {
        try {
            // Create usage record
            MicroserviceUsage::create([
                'user_id' => $request->user()->id,
                'service_type' => $serviceType,
                'operation' => $operation,
                'credit_cost' => $creditCost,
                'request_data' => json_encode([
                    'path' => $request->path(),
                    'method' => $request->method(),
                    'ip' => $request->ip()
                ])
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to log microservice usage: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get health status of all microservices
     */
    private function getServiceHealthStatus()
    {
        // Use cached status to avoid hammering the APIs
        return Cache::remember("microservices_health_status", 60, function () {
            $services = [
                'transform' => env('CONTENT_TRANSFORMATION_API', 'https://api.example.com/transform'),
                'meeting' => env('MEETING_ASSISTANT_API', 'https://api.example.com/meeting'),
                'voice' => env('VOICE_GENERATION_API', 'https://api.example.com/voice'),
                'journey' => env('CUSTOMER_JOURNEY_API', 'https://api.example.com/journey'),
                'data' => env('SYNTHETIC_DATA_API', 'https://api.example.com/data'),
            ];
            
            $status = [];
            foreach ($services as $name => $url) {
                try {
                    $response = Http::timeout(5)->get("{$url}/health");
                    $status[$name] = $response->successful() ? 'available' : 'unavailable';
                } catch (\Exception $e) {
                    Log::warning("Health check failed for {$url}: " . $e->getMessage());
                    $status[$name] = 'unavailable';
                }
            }
            
            return $status;
        });
    }
}
