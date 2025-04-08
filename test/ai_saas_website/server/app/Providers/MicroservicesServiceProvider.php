<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\MicroservicesAuthMiddleware;
use App\Http\Middleware\MicroservicesRateLimitMiddleware;
use App\Http\Middleware\MicroservicesCreditDeductionMiddleware;

class MicroservicesServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        // Register middleware
        $router = $this->app['router'];
        $router->aliasMiddleware('microservices.auth', MicroservicesAuthMiddleware::class);
        $router->aliasMiddleware('microservices.ratelimit', MicroservicesRateLimitMiddleware::class);
        $router->aliasMiddleware('microservices.credits', MicroservicesCreditDeductionMiddleware::class);
        
        // Create middleware group for microservices
        $router->middlewareGroup('microservices', [
            'auth:sanctum', // Ensure user is authenticated
            'microservices.auth', // Add AWS authentication
            'microservices.ratelimit', // Apply rate limiting
            'microservices.credits', // Handle credit deduction
        ]);
        
        // Load microservices routes
        $this->loadRoutesFrom(base_path('routes/microservices.php'));
    }
}
