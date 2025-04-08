<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\AiProjectController;
use App\Http\Controllers\CoinController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\AnalyticsController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Apply the web middleware to enable session handling
Route::middleware(['web'])->group(function () {
    // Auth Routes
    Route::prefix('api/auth')->group(function () {
        Route::post('/register', [RegisteredUserController::class, 'store']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::get('/google', [AuthController::class, 'googleLogin']);
        Route::get('/google/callback', [AuthController::class, 'googleCallback']);

        // OTP Verification Routes
        Route::post('/verify-otp', [OtpController::class, 'verify']);
        Route::post('/resend-otp', [OtpController::class, 'resend']);
        Route::get('/get-latest-otp', [OtpController::class, 'getLatestOtp']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/user', [AuthController::class, 'user']);
        });
    });

    // Test route for email
    Route::get('/test-email', function (Request $request) {
        try {
            $code = '123456';
            $email = $request->query('email', '66fdccbcb8@emaily.pro');
            Mail::to($email)->send(new \App\Mail\VerificationCodeMail($code));
            return response()->json([
                'message' => 'Email sent successfully to ' . $email,
                'mail_config' => [
                    'driver' => config('mail.default'),
                    'host' => config('mail.mailers.smtp.host'),
                    'port' => config('mail.mailers.smtp.port'),
                    'from' => config('mail.from'),
                    'encryption' => config('mail.mailers.smtp.encryption')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
    Route::get('/welcome', [WelcomeController::class, 'index']);

    // Menu Routes - accessible without authentication
    Route::get('/menu/{menuName?}', [\App\Http\Controllers\MenuController::class, 'getMenuItems']);

    // Plan Routes - accessible without authentication
    Route::get('/plans', [PlanController::class, 'index']);
    Route::get('/plans/{id}', [PlanController::class, 'show']);

    // Stripe webhook moved to webhook.php route file

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        // User Coins Route
        Route::get('/user/coins', [CoinController::class, 'getUserCoins']);

        // User Profile Routes
        Route::get('/user/profile', [UserController::class, 'getProfile']);
        Route::put('/user/profile', [UserController::class, 'updateProfile']);
        Route::get('/user/subscription', [UserController::class, 'getSubscription']);
        Route::post('/user/change-password', [UserController::class, 'changePassword']);

        // Payment Routes
        Route::get('/payment/subscription', [PaymentController::class, 'getSubscription']);
        Route::post('/payment/create-intent', [PaymentController::class, 'createPaymentIntent']);
        Route::post('/payment/create-subscription', [PaymentController::class, 'createSubscription']);
        Route::post('/payment/cancel-subscription', [PaymentController::class, 'cancelSubscription']);
        Route::post('/payment/create-checkout-session', [PaymentController::class, 'createCheckoutSession']);
        Route::get('/payment/verify-checkout-session', [PaymentController::class, 'verifyCheckoutSession']);

        Route::prefix('api')->group(function () {
            // Welcome Page Data
            Route::prefix('ai')->controller(AIController::class)->group(function () {
                Route::post('generate', 'generate');
                Route::get('history', 'history');
                Route::get('capabilities', 'capabilities');
            });

            // Debug route to check user roles
            Route::get('/check-roles', function (\Illuminate\Http\Request $request) {
                $user = $request->user();
                return response()->json([
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'has_admin_role' => $user->hasRole('admin'),
                    'all_roles' => $user->getRoleNames(),
                    'all_permissions' => $user->getAllPermissions()->pluck('name')
                ]);
            });

            // AI Projects Routes - Read operations available to all authenticated users
            Route::get('projects', [AiProjectController::class, 'index']);
            Route::get('check-admin', [AiProjectController::class, 'checkRoles']);
            Route::get('projects/{project}', [AiProjectController::class, 'show']);

            // Admin-only CRUD operations
            // Apply authorization within controllers rather than middleware to avoid issues
            Route::group(['middleware' => ['auth:sanctum']], function () {
                // AI Projects admin routes
                Route::post('projects', [AiProjectController::class, 'store']);
                Route::put('projects/{project}', [AiProjectController::class, 'update']);
                Route::delete('projects/{project}', [AiProjectController::class, 'destroy']);

                // Analytics admin routes - explicitly using the fully qualified class name for the middleware
                Route::get('analytics/dashboard', [AnalyticsController::class, 'getAdminAnalytics']);

            });
        });
    });
});
