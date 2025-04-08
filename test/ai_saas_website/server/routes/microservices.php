<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MicroservicesController;

/*
|--------------------------------------------------------------------------
| Microservices API Routes
|--------------------------------------------------------------------------
|
| Routes for proxying requests to the AWS-hosted microservices
|
*/

// Health check endpoint
Route::get('/microservices/health', [MicroservicesController::class, 'healthCheck']);

// Content Transformation API routes
Route::prefix('microservices/transform')->group(function () {
    Route::any('/{endpoint?}', [MicroservicesController::class, 'contentTransformation'])
        ->where('endpoint', '.*');
});

// AI Meeting Assistant API routes
Route::prefix('microservices/meeting')->group(function () {
    Route::any('/{endpoint?}', [MicroservicesController::class, 'meetingAssistant'])
        ->where('endpoint', '.*');
});

// AI Voice Generation API routes
Route::prefix('microservices/voice')->group(function () {
    Route::any('/{endpoint?}', [MicroservicesController::class, 'voiceGeneration'])
        ->where('endpoint', '.*');
});

// Customer Journey Optimization API routes
Route::prefix('microservices/journey')->group(function () {
    Route::any('/{endpoint?}', [MicroservicesController::class, 'customerJourney'])
        ->where('endpoint', '.*');
});

// Synthetic Data Generation API routes
Route::prefix('microservices/data')->group(function () {
    Route::any('/{endpoint?}', [MicroservicesController::class, 'syntheticData'])
        ->where('endpoint', '.*');
});
