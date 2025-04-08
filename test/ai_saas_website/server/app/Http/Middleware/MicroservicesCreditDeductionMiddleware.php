<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MicroservicesCreditDeductionMiddleware
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
        // Only process if user is authenticated
        if (!$request->user()) {
            return $next($request);
        }
        
        // Get the service and operation from the request path
        $path = $request->path();
        $pathParts = explode('/', $path);
        
        // Determine service type (should be the second part of the path)
        $serviceType = $pathParts[1] ?? '';
        
        // Determine operation (should be the third part of the path)
        $operation = $pathParts[2] ?? '';
        
        // Get credit cost for this operation
        $creditCost = $this->getOperationCreditCost($serviceType, $operation);
        
        // If no credit cost, proceed without deduction
        if ($creditCost <= 0) {
            return $next($request);
        }
        
        // Check if user has enough credits
        $user = $request->user();
        $userCredits = $user->credits ?? 0;
        
        if ($userCredits < $creditCost) {
            Log::info("User {$user->id} has insufficient credits for {$serviceType}/{$operation}. Required: {$creditCost}, Available: {$userCredits}");
            
            return response()->json([
                'error' => 'Insufficient credits',
                'message' => "This operation requires {$creditCost} credits. You have {$userCredits} credits available.",
                'required_credits' => $creditCost,
                'available_credits' => $userCredits
            ], 402);
        }
        
        // Process the request
        $response = $next($request);
        
        // Only deduct credits if the request was successful
        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
            try {
                // Deduct credits from user
                $user->credits = $userCredits - $creditCost;
                $user->save();
                
                // Log credit deduction
                Log::info("Deducted {$creditCost} credits from user {$user->id} for {$serviceType}/{$operation}. Remaining: {$user->credits}");
                
                // Add credit information to response headers
                $response->headers->set('X-Credits-Cost', $creditCost);
                $response->headers->set('X-Credits-Remaining', $user->credits);
            } catch (\Exception $e) {
                Log::error("Failed to deduct credits from user {$user->id}: " . $e->getMessage());
            }
        }
        
        return $response;
    }
    
    /**
     * Get the credit cost for a specific operation.
     *
     * @param string $serviceType
     * @param string $operation
     * @return int
     */
    private function getOperationCreditCost($serviceType, $operation)
    {
        // Define credit costs for different operations
        $creditCosts = [
            'transform' => [
                'text-to-audio' => 2,
                'audio-to-text' => 3,
                'image-to-text' => 2,
                'text-to-image' => 5,
                'text-to-video' => 10,
                'convert-document' => 2,
                'default' => 1
            ],
            'meeting' => [
                'schedule' => 1,
                'join' => 5,
                'transcription' => 5,
                'summary' => 3,
                'action-items' => 2,
                'follow-up' => 3,
                'default' => 1
            ],
            'voice' => [
                'create-profile' => 10,
                'generate-speech' => 3,
                'list-profiles' => 0,
                'update-profile' => 1,
                'delete-profile' => 0,
                'default' => 1
            ],
            'journey' => [
                'track-event' => 1,
                'user-journey' => 3,
                'touchpoints' => 5,
                'recommendations' => 5,
                'ab-test' => 8,
                'funnel' => 5,
                'churn' => 5,
                'default' => 1
            ],
            'data' => [
                'create-schema' => 2,
                'generate-tabular' => 5,
                'generate-time-series' => 5,
                'generate-text' => 3,
                'anonymize' => 5,
                'datasets' => 0,
                'default' => 1
            ],
            'default' => 1
        ];
        
        // Return the credit cost for the specific operation, or the default for the service type
        return $creditCosts[$serviceType][$operation] ?? 
               $creditCosts[$serviceType]['default'] ?? 
               $creditCosts['default'];
    }
}
