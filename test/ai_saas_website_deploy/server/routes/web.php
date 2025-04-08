<?php

use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

// Sanctum CSRF Cookie Route - must be first
Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show'])
    ->middleware(['web', 'api']);

// Redirect logged-in users to dashboard, show welcome page to guests
Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/dashboard');
    }
    return view('welcome');
});

require __DIR__.'/api.php';
