<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPreference extends Model
{
    protected $fillable = [
        'user_id',
        'theme_preference',
        'notification_settings',
        'language_preference',
    ];

    protected $casts = [
        'notification_settings' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
