<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class MicroservicesRateLimitMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Get rate limit settings from environment
        $rateLimit = (int)env('API_RATE_LIMIT', 60);
        $rateLimitWindow = (int)env('API_RATE_LIMIT_WINDOW', 1); // in minutes
        
        // Get user ID for rate limiting
        $userId = $request->user() ? $request->user()->id : $request->ip();
        
        // Create a unique key for this user and endpoint
        $endpoint = $request->route()->getName() ?? $request->path();
        $cacheKey = "rate_limit:{$userId}:{$endpoint}";
        
        // Get current request count from cache
        $requestCount = Cache::get($cacheKey, 0);
        
        // Check if rate limit is exceeded
        if ($requestCount >= $rateLimit) {
            Log::warning("Rate limit exceeded for user {$userId} on endpoint {$endpoint}");
            
            return response()->json([
                'error' => 'Rate limit exceeded',
                'message' => "You have exceeded the rate limit of {$rateLimit} requests per {$rateLimitWindow} minute(s) for this endpoint."
            ], 429);
        }
        
        // Increment request count
        Cache::put($cacheKey, $requestCount + 1, now()->addMinutes($rateLimitWindow));
        
        // Add rate limit headers to response
        $response = $next($request);
        $response->headers->set('X-RateLimit-Limit', $rateLimit);
        $response->headers->set('X-RateLimit-Remaining', $rateLimit - $requestCount - 1);
        
        return $response;
    }
}
