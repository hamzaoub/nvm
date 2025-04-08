<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserPreference;
use App\Models\Coin;
use App\Models\Subscription;
use App\Models\UserActivityLog;
use App\Models\Role;
use App\Models\Otp;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationCodeMail;

class RegisteredUserController extends Controller
{
    public function store(Request $request)
    {
        // Check if this is a Google registration
        if ($request->has('provider') && $request->provider === 'google') {
            // Validate the request
            $request->validate([
                'email' => 'required|email|unique:users',
                'name' => 'required|string|max:255',
                'lastName' => 'nullable|string|max:255',
                'provider_id' => 'required|string',
                'idToken' => 'required',
            ]);

            // Create the user
            $user = User::create([

                'name' => $request->name,
                'last_name' => $request->lastName,
                'email' => $request->email,
                'password' => Hash::make(uniqid()), // Random password
                'google_id' => $request->provider_id,
                'email_verified_at' => now(), // Mark as verified immediately for Google users
            ]);

            // Set up the user's account
            $this->createUserPreferences($user);
            $this->createCoins($user);
            $this->createSubscription($user);
            $this->logUserActivity($user);
            $this->assignRoleToUser($user);

            // Login the user
            Auth::login($user);
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Registered with Google successfully.',
                'redirect' => '/dashboard',
                'requires_otp' => false
            ]);
        }

        // Regular registration
        $this->validateRegistration($request);

        $user = $this->createUser($request);
        $this->createUserPreferences($user);
        $this->createCoins($user);
        $this->createSubscription($user);
        $this->logUserActivity($user);
        $this->assignRoleToUser($user);

        // Generate OTP code
        $this->generateAndSendOtp($user, $request);

        event(new Registered($user));
        Auth::login($user);

        // Store user ID in session for OTP verification
        session(['temp_user_id' => $user->id]);

        return response()->json([
            'message' => 'Registration successful. Please verify your email.',
            // 'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
            'redirect' => '/verify',
            'requires_otp' => true
        ], 201);
    }

    protected function validateRegistration(Request $request)
    {
        return $request->validate([
            'name' => 'required|string|max:50',
            'lastName' => 'required|string|max:50',
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[a-z]/',
                'regex:/[A-Z]/',
                'regex:/[0-9]/'
            ],
            'confirmPassword' => 'required|same:password'
        ], [
            'password.regex' => 'Password must include at least one lowercase letter, one uppercase letter, and one number'
        ]);
    }

    protected function createUser(Request $request)
    {
        return User::create([
            'name' => $request->name,
            'last_name' => $request->lastName,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
    }

    protected function createUserPreferences(User $user)
    {
        UserPreference::create([
            'user_id' => $user->id,
            'theme_preference' => 'light',
            'notification_settings' => null,
            'language_preference' => 'en',
        ]);
    }

    protected function createCoins(User $user)
    {
        Coin::create([
            'user_id' => $user->id,
            'coin_balance' => 200,
        ]);
    }

    protected function createSubscription(User $user)
    {
        Subscription::create([
            'user_id' => $user->id,
            'plan_id' => 1,
            'start_date' => now(),
            'end_date' => now()->addMonth(),
        ]);
    }

    protected function logUserActivity(User $user)
    {
        UserActivityLog::create([
            'user_id' => $user->id,
            'activity_type' => 'registration',
            'ip_address' => request()->ip(),
            'description' => 'User registered successfully',
        ]);
    }

    protected function assignRoleToUser(User $user)
    {
        $role = Role::where('name', 'user')->first();
        if ($role) {
            $user->roles()->attach($role);
        }
    }

    protected function generateAndSendOtp(User $user, Request $request)
    {
        // Generate a 6-digit OTP code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Create OTP record
        Otp::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        // Store verification code in user table
        $user->verification_code = $code;
        $user->save();

        // Send verification email
        Mail::to($user->email)->send(new VerificationCodeMail($code));

        return $code;
    }
}
