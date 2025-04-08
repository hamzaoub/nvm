<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Otp;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationCodeMail;

class OtpController extends Controller
{
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $otp = Otp::where('code', $request->code)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$otp) {
            return back()->withErrors([
                'code' => 'Invalid or expired verification code.',
            ]);
        }

        // Mark OTP as used
        $otp->used = true;
        $otp->save();

        // Activate the user
        $user = $otp->user;
        $user->email_verified_at = now();
        $user->save();

        // Delete any temporary tokens
        $user->tokens()->where('name', 'temp_auth_token')->delete();

        // Create a permanent token
        $token = $user->createToken('auth_token')->plainTextToken;

        event(new Registered($user));
        Auth::login($user);

        return response()->json([
            'message' => 'Email verified successfully!',
            'token' => $token,
            // 'user' => $user,
            'redirect' => '/dashboard'
        ]);
    }

    public function resend(Request $request)
    {
        $user = User::find(session('temp_user_id'));

        if (!$user) {
            return back()->withErrors([
                'email' => 'Unable to find user.',
            ]);
        }

        // Generate new OTP
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Create new OTP record
        Otp::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        // Update user's verification code
        $user->verification_code = $code;
        $user->save();

        // Send new verification email
        Mail::to($user->email)->send(new VerificationCodeMail($code));

        return back()->with('success', 'Verification code resent successfully.');
    }

    public function showVerificationForm()
    {
        return Inertia::render('auth/otp');
    }

    public function getLatestOtp(Request $request)
    {
        $user = User::find(session('temp_user_id'));

        if (!$user) {
            return response()->json([
                'error' => 'User not found'
            ], 404);
        }

        // First check if user has verification_code
        if ($user->verification_code) {
            // Check if there's a matching OTP that's still valid
            $otp = Otp::where('user_id', $user->id)
                ->where('code', $user->verification_code)
                ->where('used', false)
                ->where('expires_at', '>', now())
                ->first();

            if ($otp) {
                return response()->json([
                    'code' => $user->verification_code,
                    'expires_at' => $otp->expires_at,
                    'email' => $user->email
                ]);
            }
        }

        // Fallback to finding the latest OTP
        $otp = Otp::where('user_id', $user->id)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otp) {
            return response()->json([
                'error' => 'No active OTP found'
            ], 404);
        }

        // Update user's verification code if not set
        if (!$user->verification_code) {
            $user->verification_code = $otp->code;
            $user->save();
        }

        return response()->json([
            'code' => $otp->code,
            'expires_at' => $otp->expires_at,
            'email' => $user->email
        ]);
    }
}
