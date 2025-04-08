<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Otp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationCodeMail;

class AuthController extends Controller
{
    public function user(Request $request)
    {
        $user = $request->user();
        $roles = $user->roles->pluck('name');

        return response()->json([
            'user' => $user,
            'roles' => $roles
        ]);
    }
    public function login(Request $request)
    {
        // Check if this is a Google login
        if ($request->has('provider') && $request->provider === 'google') {
            // Validate the request
            $request->validate([
                'email' => 'required|email',
                'idToken' => 'required',
            ]);

            // Find or create the user
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'User not found'
                ], 422);
            }

            // For Google login, create a permanent token directly (no OTP verification)
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Add isAdmin flag to user object
            $roles = $user->roles->pluck('name');
            $userResponse = $user->toArray();
            $userResponse['isAdmin'] = $roles->contains('admin');

            return response()->json([
                'user' => $userResponse,
                'token' => $token,
                'message' => 'Logged in with Google successfully.',
                'redirect' => '/dashboard',
                'requires_otp' => false
            ]);
        }

        // Regular email/password login
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            // Create a permanent token - no OTP verification needed for login
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Add isAdmin flag to user object
            $roles = $user->roles->pluck('name');
            $userResponse = $user->toArray();
            $userResponse['isAdmin'] = $roles->contains('admin');

            return response()->json([
                'user' => $userResponse,
                'token' => $token,
                'message' => 'Logged in successfully.',
                'redirect' => '/dashboard',
                'requires_otp' => false
            ]);
        }

        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    public function googleLogin()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function googleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::updateOrCreate([
                'email' => $googleUser->email,
            ], [
                'name' => $googleUser->name,
                'google_id' => $googleUser->id,
                'password' => Hash::make(uniqid()),
            ]);

            // For Google login, create a permanent token directly (no OTP verification)
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Add isAdmin flag to user object
            $roles = $user->roles->pluck('name');
            $userResponse = $user->toArray();
            $userResponse['isAdmin'] = $roles->contains('admin');

            return response()->json([
                'user' => $userResponse,
                'token' => $token,
                'message' => 'Logged in with Google successfully.',
                'redirect' => '/dashboard',
                'requires_otp' => false
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Google authentication failed'
            ], 401);
        }
    }

    public function logout(Request $request)
    {
        // Handle token-based logout
        if ($request->user() && !$request->user()->currentAccessToken() instanceof \Laravel\Sanctum\TransientToken) {
            $request->user()->currentAccessToken()->delete();
        }

        // Handle session-based logout
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    protected function generateAndSendOtp(User $user)
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
