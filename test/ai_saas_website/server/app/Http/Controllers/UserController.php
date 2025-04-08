<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Subscription;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Get the authenticated user's profile
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProfile()
    {
        $user = Auth::user();
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'createdAt' => $user->created_at,
            'emailVerified' => $user->email_verified_at !== null,
        ]);
    }
    
    /**
     * Update the authenticated user's profile
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'firstName' => 'sometimes|string|max:255|nullable',
            'lastName' => 'sometimes|string|max:255|nullable',
            // Email is no longer allowed to be updated
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Update user data
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        
        if ($request->has('firstName')) {
            $user->first_name = $request->firstName;
        }
        
        if ($request->has('lastName')) {
            $user->last_name = $request->lastName;
        }
        
        // Email changes are not allowed
        // If the request contains an email, we'll ignore it
        
        $user->save();
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'createdAt' => $user->created_at,
            'emailVerified' => $user->email_verified_at !== null,
        ]);
    }
    
    /**
     * Get the authenticated user's subscription details
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSubscription()
    {
        $user = Auth::user();
        
        // Get the user's active subscription
        $subscription = Subscription::where('user_id', $user->id)
            ->where(function($query) {
                $query->whereNull('ends_at')
                      ->orWhere('ends_at', '>', now());
            })
            ->with('plan')
            ->first();
        
        if (!$subscription) {
            // Return a default free plan structure instead of 404 error
            return response()->json([
                'id' => 0,
                'status' => 'Free',
                'planName' => 'Free Tier',
                'planDescription' => 'Basic access to platform features',
                'pricePerMonth' => 0,
                'credits' => 10,
                'daysUntilRenewal' => 0,
                'isActive' => true,
                'startDate' => now()->format('Y-m-d'),
                'endDate' => null,
                'features' => [
                    'Limited AI models access',
                    'Basic dashboard',
                    '10 free credits per month',
                    'Community support'
                ]
            ]);
        }
        
        // Calculate days until renewal
        $daysUntilRenewal = 0;
        if ($subscription->ends_at) {
            $daysUntilRenewal = now()->diffInDays($subscription->ends_at);
        }
        
        // Get the plan details
        $plan = $subscription->plan;
        
        // Mock features (in a real application these would come from the database)
        $features = [
            "Access to all AI models",
            "Advanced analytics dashboard",
            "Priority project processing",
            sprintf("%d AI credits per month", $plan->credits),
            "24/7 technical support",
            "API access for integrations"
        ];
        
        return response()->json([
            'id' => $subscription->id,
            'status' => $subscription->status,
            'planName' => $plan->name,
            'planDescription' => $plan->description,
            'pricePerMonth' => $plan->price / 100, // Convert cents to dollars
            'credits' => $plan->credits,
            'daysUntilRenewal' => $daysUntilRenewal,
            'isActive' => true,
            'startDate' => $subscription->created_at,
            'endDate' => $subscription->ends_at,
            'features' => $features
        ]);
    }
    
    /**
     * Change the authenticated user's password
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['errors' => ['current_password' => ['The current password is incorrect.']]], 422);
        }
        
        // Update password
        $user->password = Hash::make($request->password);
        $user->save();
        
        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }
}
