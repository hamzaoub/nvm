<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    /**
     * Get all subscription plans
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Get all active plans
        $plans = Plan::where('status', true)->get();
        
        // Transform the plans to match the frontend structure
        $formattedPlans = $plans->map(function ($plan) {
            // Determine if this is a monthly or yearly plan
            $isPlanMonthly = $plan->duration === 'monthly';
            $isPlanYearly = $plan->duration === 'yearly';
            
            // Only include either pricePerMonth or pricePerYear based on the plan's duration
            $result = [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'credits' => $plan->coin_balance,
                'features' => json_decode($plan->features),
            ];
            
            // Add the appropriate price field based on duration
            if ($isPlanMonthly) {
                $result['pricePerMonth'] = floatval($plan->price);
            } elseif ($isPlanYearly) {
                $result['pricePerYear'] = floatval($plan->price);
            }
            
            // Special flags for certain plans
            if ($plan->name === 'Coral Reef' && $isPlanMonthly) {
                $result['popular'] = true;
                $result['badge'] = 'Popular';
            }
            
            if ($plan->name === 'Deep Ocean' && $isPlanMonthly) {
                $result['highlight'] = true;
            }
            
            return $result;
        });
        
        // Group plans by name to merge monthly and yearly options
        $groupedPlans = [];
        foreach ($formattedPlans as $plan) {
            $name = $plan['name'];
            
            // If this plan name doesn't exist in the grouped plans yet, add it
            if (!isset($groupedPlans[$name])) {
                $groupedPlans[$name] = $plan;
                continue;
            }
            
            // Merge with existing plan of the same name
            if (isset($plan['pricePerMonth'])) {
                $groupedPlans[$name]['pricePerMonth'] = $plan['pricePerMonth'];
            }
            
            if (isset($plan['pricePerYear'])) {
                $groupedPlans[$name]['pricePerYear'] = $plan['pricePerYear'];
            }
        }
        
        // Return the array values (we don't need the keys anymore)
        return response()->json(array_values($groupedPlans));
    }
    
    /**
     * Get a specific plan by ID
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        // Get a specific plan
        $plan = Plan::findOrFail($id);
        
        return response()->json([
            'id' => $plan->id,
            'name' => $plan->name,
            'description' => $plan->description,
            'price' => $plan->price,
            'duration' => $plan->duration,
            'credits' => $plan->coin_balance,
            'features' => json_decode($plan->features),
            'status' => $plan->status
        ]);
    }
}
