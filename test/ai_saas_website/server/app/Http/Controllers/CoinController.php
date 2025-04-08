<?php

namespace App\Http\Controllers;

use App\Models\Coin;
use App\Models\Plan;
use App\Models\User;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CoinController extends Controller
{
    /**
     * Get the authenticated user's coin information
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getUserCoins(Request $request)
    {
        $user = $request->user();

        // Get or create the coin record for the user
        $coin = Coin::where('user_id', $user->id)->first();
        if (!$coin) {
            // Get the default free plan's coin balance
            $freePlan = Plan::where('name', 'Free')->first();
            $defaultBalance = $freePlan ? $freePlan->coin_balance : 200;

            $coin = Coin::create([
                'user_id' => $user->id,
                'coin_balance' => $defaultBalance,
                'last_refresh_at' => now(),
            ]);
        }

        // Get the active subscription if exists
        $activeSubscription = Subscription::where('user_id', $user->id)
        ->where(function ($query) {
            $query->whereNull('ends_at')
                  ->orWhere('ends_at', '>', now());
        })
        ->with('plan')
        ->first();


        $planName = 'Free Plan';
        $currentPlanMax = 200; // Default for free plan
        $daysUntilRenewal = 30; // Default for free plan


        if ($activeSubscription && $activeSubscription->plan) {
            $planName = $activeSubscription->plan->name . ' Plan';
            $currentPlanMax = $activeSubscription->plan->coin_balance;
            $daysUntilRenewal = $activeSubscription->ends_at ? (int)now()->diffInDays($activeSubscription->ends_at) : 30;
        }



        else if ($user->plan_id) {
            // Direct plan assignment - fetch the plan
            $userPlan = Plan::find($user->plan_id);
            if ($userPlan) {
                $planName = $userPlan->name . ' Plan';
                $currentPlanMax = $userPlan->coin_balance;
            }
        }

        // Get the maximum possible coins from all plans for the progress bar max value
        $maxPossibleCoins = Plan::max('coin_balance') ?? 1200; // Default to 1200 if no plans exist

        // Build ocean-themed subscription data
        $subscription = [
            'plan' => $planName,
            'renewal_days' => (int)$daysUntilRenewal, // Cast to integer to ensure no decimals
            'theme' => 'ocean', // Maintains octopus-themed design
            'icon' => 'octopus' // Use octopus icon for the subscription plan
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'coin_balance' => $coin->coin_balance,
                'max_coins' => $maxPossibleCoins, // Using the maximum from all plans
                'current_plan_max' => $currentPlanMax, // The user's current plan max
                'subscription' => $subscription
            ]
        ]);
    }
}
