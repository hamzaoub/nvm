<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Coin extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'coin_balance',
        'last_refresh_at'
    ];
    
    protected $casts = [
        'coin_balance' => 'integer',
        'last_refresh_at' => 'datetime'
    ];

    /**
     * Get the user that owns the coin account
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Get the maximum allowed coins based on the user's plan
     * 
     * @return int
     */
    public function getMaxCoins()
    {
        // Get user's active subscription and related plan
        $user = $this->user;
        $subscription = $user->subscription;
        
        if ($subscription && $subscription->plan) {
            return $subscription->plan->coin_balance;
        }
        
        // If no active subscription, check if user has a direct plan relationship
        if ($user->plan) {
            return $user->plan->coin_balance;
        }
        
        // Default to the Free plan's coin balance
        $freePlan = Plan::where('name', 'Free')->first();
        return $freePlan ? $freePlan->coin_balance : 200; // Default to 200 if no Free plan found
    }
    
    /**
     * Calculate days until next renewal
     * 
     * @return int
     */
    public function getDaysUntilRenewal()
    {
        $user = $this->user;
        $subscription = $user->subscription;
        
        if ($subscription && $subscription->ends_at) {
            return now()->diffInDays($subscription->ends_at);
        }
        
        // Default renewal period for free users or if no end date is specified
        return 30;
    }
}
