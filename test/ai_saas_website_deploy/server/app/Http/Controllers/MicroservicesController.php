<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class MicroservicesController extends Controller
{
    /**
     * Proxy requests to Content Transformation API
     */
    public function contentTransformation(Request $request, $endpoint = null)
    {
        $apiUrl = env('CONTENT_TRANSFORMATION_API', 'https://api.example.com/transform');
        return $this->proxyRequest($request, $apiUrl, $endpoint);
    }

    /**
     * Proxy requests to AI Meeting Assistant API
     */
    public function meetingAssistant(Request $request, $endpoint = null)
    {
        $apiUrl = env('MEETING_ASSISTANT_API', 'https://api.example.com/meeting');
        return $this->proxyRequest($request, $apiUrl, $endpoint);
    }

    /**
     * Proxy requests to AI Voice Generation API
     */
    public function voiceGeneration(Request $request, $endpoint = null)
    {
        $apiUrl = env('VOICE_GENERATION_API', 'https://api.example.com/voice');
        return $this->proxyRequest($request, $apiUrl, $endpoint);
    }

    /**
     * Proxy requests to Customer Journey Optimization API
     */
    public function customerJourney(Request $request, $endpoint = null)
    {
        $apiUrl = env('CUSTOMER_JOURNEY_API', 'https://api.example.com/journey');
        return $this->proxyRequest($request, $apiUrl, $endpoint);
    }

    /**
     * Proxy requests to Synthetic Data Generation API
     */
    public function syntheticData(Request $request, $endpoint = null)
    {
        $apiUrl = env('SYNTHETIC_DATA_API', 'https://api.example.com/data');
        return $this->proxyRequest($request, $apiUrl, $endpoint);
    }

    /**
     * Get health status of all microservices
     */
    public function healthCheck()
    {
        $services = [
            'contentTransformation' => env('CONTENT_TRANSFORMATION_API', 'https://api.example.com/transform'),
            'meetingAssistant' => env('MEETING_ASSISTANT_API', 'https://api.example.com/meeting'),
            'voiceGeneration' => env('VOICE_GENERATION_API', 'https://api.example.com/voice'),
            'customerJourney' => env('CUSTOMER_JOURNEY_API', 'https://api.example.com/journey'),
            'syntheticData' => env('SYNTHETIC_DATA_API', 'https://api.example.com/data'),
        ];

        $status = [];
        foreach ($services as $name => $url) {
            // Use cached status to avoid hammering the APIs
            $status[$name] = Cache::remember("service_status_{$name}", 60, function () use ($url) {
                try {
                    $response = Http::timeout(5)->get("{$url}/health");
                    return $response->successful() ? 'available' : 'unavailable';
                } catch (\Exception $e) {
                    Log::warning("Health check failed for {$url}: " . $e->getMessage());
                    return 'unavailable';
                }
            });
        }

        return response()->json([
            'status' => 'ok',
            'services' => $status
        ]);
    }

    /**
     * Generic proxy method to forward requests to microservices
     */
    private function proxyRequest(Request $request, $baseUrl, $endpoint = null)
    {
        // Build the target URL
        $url = $baseUrl;
        if ($endpoint) {
            $url .= "/{$endpoint}";
        }

        try {
            // Prepare the HTTP client with headers
            $http = Http::withHeaders($this->getForwardHeaders($request));

            // Handle file uploads if present
            if ($request->hasFile('file')) {
                $files = $request->allFiles();
                foreach ($files as $key => $file) {
                    $http = $http->attach($key, file_get_contents($file), $file->getClientOriginalName());
                }
            }

            // Forward the request with appropriate method
            $response = match ($request->method()) {
                'GET' => $http->get($url, $request->query()),
                'POST' => $http->post($url, $request->all()),
                'PUT' => $http->put($url, $request->all()),
                'PATCH' => $http->patch($url, $request->all()),
                'DELETE' => $http->delete($url, $request->all()),
                default => abort(405, 'Method not allowed'),
            };

            // Return the response from the microservice
            return response($response->body(), $response->status())
                ->withHeaders($this->getResponseHeaders($response));

        } catch (\Exception $e) {
            Log::error("Proxy request failed: {$e->getMessage()}");
            return response()->json([
                'error' => 'Service unavailable',
                'message' => $e->getMessage()
            ], 503);
        }
    }

    /**
     * Get headers to forward to the microservice
     */
    private function getForwardHeaders(Request $request)
    {
        $headers = [];
        
        // Forward authorization header if present
        if ($request->hasHeader('Authorization')) {
            $headers['Authorization'] = $request->header('Authorization');
        }
        
        // Forward content type if present
        if ($request->hasHeader('Content-Type')) {
            $headers['Content-Type'] = $request->header('Content-Type');
        }
        
        // Forward accept header if present
        if ($request->hasHeader('Accept')) {
            $headers['Accept'] = $request->header('Accept');
        }
        
        // Add user ID if authenticated
        if ($request->user()) {
            $headers['X-User-ID'] = $request->user()->id;
        }
        
        return $headers;
    }

    /**
     * Get headers to include in the response
     */
    private function getResponseHeaders($response)
    {
        $headers = [];
        
        // Forward content type if present
        if ($response->header('Content-Type')) {
            $headers['Content-Type'] = $response->header('Content-Type');
        }
        
        return $headers;
    }
}
