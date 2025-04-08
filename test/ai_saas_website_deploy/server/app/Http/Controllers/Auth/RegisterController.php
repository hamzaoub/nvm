<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Validation\Rules;
use App\Models\UserPreference;
use App\Models\Coin;
use App\Models\Subscription;
use App\Models\UserActivityLog;
use App\Models\Role;
use App\Models\UserSocialAccount;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Str;

use App\Models\Otp;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationCodeMail;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('auth/sign-up');
    }

    /**
     * Handle an incoming registration request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        // If provider_id exists, handle as Google Auth
        if ($request->has('provider_id')) {
            return $this->handleGoogleAuth($request);
        }

        // Otherwise proceed with normal registration
        $this->validateRegistration($request);

        $user = $this->createUser($request);
        $this->createUserPreferences($user);
        $this->createCoins($user);
        $this->createSubscription($user);
        $this->logUserActivity($user);
        $this->assignRoleToUser($user);



        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Create OTP record
        Otp::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        // Store user ID in session
        session(['temp_user_id' => $user->id]);

        // Send verification email
        Mail::to($user->email)->send(new VerificationCodeMail($code));
        return redirect()->route('verification.notice');
    }

    /**
     * Validate the registration request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function validateRegistration(Request $request)
    {
        $rules = [
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
            ]
        ];

        if (!$request->has('provider_id')) {
            $rules['confirmPassword'] = 'required|same:password';
        }

        $request->validate($rules, [
            'password.regex' => 'Password must include at least one lowercase letter, one uppercase letter, and one number'
        ]);
    }

    /**
     * Create a User instance after a valid registration.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \App\Models\User
     */
    protected function createUser(Request $request)
    {
        return User::create([
            'name' => $request->name,
            'last_name' => $request->lastName,
            'email' => $request->email,
            'password' => $request->provider_id ? null : Hash::make($request->password),
        ]);
    }

    /**
     * Get a custom validation rule to check if the email already exists.
     *
     * @return \Closure
     */
    protected function uniqueEmailRule()
    {
        return function ($attribute, $value, $fail) {
            if (User::where('email', $value)->exists()) {
                $fail('The email has already been taken.');
            }
        };
    }

    /**
     * Create a UserSocialAccount record.
     *
     * @param  \App\Models\User  $user
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    private function createUserSocialAccount(User $user, Request $request)
    {
        UserSocialAccount::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => $request->provider_id,
            'photo_url' => $request->photo_url,
        ]);
    }

    /**
     * Create user preferences record.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    protected function createUserPreferences(User $user)
    {
        UserPreference::create([
            'user_id' => $user->id,
            'theme_preference' => 'light',
            'notification_settings' => null,
            'language_preference' => 'en',
        ]);
    }

    /**
     * Create a coins record for the user.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    protected function createCoins(User $user)
    {
        Coin::create([
            'user_id' => $user->id,
            'coin_balance' => 200,
        ]);
    }

    /**
     * Create a subscription record for the user.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    protected function createSubscription(User $user)
    {
        Subscription::create([
            'user_id' => $user->id,
            'plan_id' => 1,
            'start_date' => now(),
            'end_date' => now()->addMonth(),
        ]);
    }

    /**
     * Log user registration activity.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    protected function logUserActivity(User $user)
    {
        UserActivityLog::create([
            'user_id' => $user->id,
            'activity_type' => 'registration',
            'ip_address' => request()->ip(),
            'description' => 'User registered successfully',
        ]);
    }

    /**
     * Assign a role to a user.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    protected function assignRoleToUser(User $user)
    {
        // Assign the 'user' role with ID 2 as default
        $role = Role::findOrFail(2); // This ensures we use ID 2 which is the 'user' role
        $user->roles()->attach($role);

        // Also create an entry in user_roles table for our new explicit role system
        \App\Models\UserRole::create([
            'user_id' => $user->id,
            'role' => 'user',
            'assigned_at' => now()
        ]);
    }
    public function handleGoogleAuth(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
            'lastName' => 'nullable|string',
            'provider_id' => 'required|string',
            'photo_url' => 'nullable|string',
        ]);

        // Check if user exists
        $existingUser = User::where('email', $request->email)->first();

        if ($existingUser) {
            // Check if this Google account is already linked
            $existingSocialAccount = UserSocialAccount::where('user_id', $existingUser->id)
                ->where('provider', 'google')
                ->where('provider_id', $request->provider_id)
                ->first();

            if ($existingSocialAccount) {
                Auth::login($existingUser);
                return response()->json([
                    'message' => 'Successfully logged in',
                    'user' => $existingUser
                ]);
            }

            return response()->json([
                'message' => 'An account with this email already exists. Please login with your password or use password reset.'
            ], 422);
        }

        // Create new user
        $user = User::create([
            'name' => $request->name,
            'lastName' =>  $request->lastName,
            'email' => $request->email,
            'password' => Hash::make(Str::random(32)), // Random password for social users
        ]);

        // Create social account
        $this->createUserSocialAccount($user, $request);

        // Create additional user records
        $this->createUserPreferences($user);
        $this->createCoins($user);
        $this->createSubscription($user);
        $this->logUserActivity($user);
        $this->assignRoleToUser($user);

        event(new Registered($user));
        Auth::login($user);

        return response()->json([
            'message' => 'Successfully registered',
            'user' => $user
        ]);
    }


}

