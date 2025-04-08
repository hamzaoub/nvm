<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'description',
        'duration',
        'coin_balance',
        'features',
        'status'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'coin_balance' => 'integer',
        'features' => 'array',
        'status' => 'boolean'
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
