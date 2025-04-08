<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExternalServiceCredential extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_name',
        'api_key',
        'api_secret',
        'base_url',
        'oauth_token',
        'description'
    ];

    protected $hidden = [
        'api_key',
        'api_secret',
        'oauth_token'
    ];

    public function logs()
    {
        return $this->hasMany(ExternalServiceLog::class, 'service_name', 'service_name');
    }
}
