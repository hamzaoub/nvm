<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    public const VERIFICATION_CODE_EXPIRY = 3600; // 1 hour in seconds
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'verification_code',
        'email_verified_at',
        'google_id',
        'first_name',
        'last_name'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    
    /**
     * Check if user has admin role
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }
    
    /**
     * Get user roles as array
     *
     * @return array
     */
    public function getRoleNames(): array
    {
        return $this->roles()->pluck('name')->toArray();
    }

    /**
     * Generate a new verification code for the user
     *
     * @return string
     */
    public function generateVerificationCode(): string
    {
        $code = sprintf('%06d', random_int(0, 999999));
        $this->verification_code = $code;
        $this->save();
        return $code;
    }

    /**
     * Verify the user's email with the given code
     *
     * @param string $code
     * @return bool
     */
    public function verifyEmail(string $code): bool
    {
        if ($this->verification_code === $code) {
            $this->email_verified_at = now();
            $this->verification_code = null;
            $this->save();
            return true;
        }
        return false;
    }

    /**
     * Check if the user's email is verified
     *
     * @return bool
     */
    public function isEmailVerified(): bool
    {
        return $this->email_verified_at !== null;
    }

    /**
     * Get the user's social accounts
     */
    public function socialAccounts()
    {
        return $this->hasMany(UserSocialAccount::class);
    }

    /**
     * Get the user's activity logs
     */
    public function activityLogs()
    {
        return $this->hasMany(UserActivityLog::class);
    }
    
    /**
     * Get the user's roles
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function userRoles()
    {
        return $this->hasMany(UserRole::class);
    }
    
    /**
     * Get the user's active roles
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function activeRoles()
    {
        return $this->userRoles()->where(function ($query) {
            $query->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
        });
    }
    
    /**
     * Check if user has a specific role
     *
     * @param string $role
     * @return bool
     */
    public function hasUserRole(string $role): bool
    {
        return $this->activeRoles()->where('role', $role)->exists();
    }
    
    /**
     * Get the user's coin account
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function coin()
    {
        return $this->hasOne(Coin::class);
    }
    
    /**
     * Get the user's plan
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
    
    /**
     * Get the user's active subscription
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function subscription()
    {
        return $this->hasOne(Subscription::class)->whereNull('ends_at')->orWhere('ends_at', '>', now());
    }
    
    /**
     * Get all user's subscriptions
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
