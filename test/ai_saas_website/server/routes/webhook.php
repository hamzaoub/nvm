<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Webhook Routes
|--------------------------------------------------------------------------
|
| Routes for handling webhooks from external services. These routes are
| kept separate from the main API routes to avoid middleware issues.
|
*/

// Stripe webhook route - explicitly defined outside of any middleware
Route::post('/webhook/stripe', [PaymentController::class, 'handleWebhook']);
