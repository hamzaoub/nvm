<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExternalServiceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_name',
        'request_parameters',
        'response_data'
    ];

    protected $casts = [
        'request_parameters' => 'array',
        'response_data' => 'array'
    ];

    public function credential()
    {
        return $this->belongsTo(ExternalServiceCredential::class, 'service_name', 'service_name');
    }
}
