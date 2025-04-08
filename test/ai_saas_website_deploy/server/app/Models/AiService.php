<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiService extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'endpoint',
        'cost',
        'category_id'
    ];

    protected $casts = [
        'cost' => 'integer'
    ];

    public function category()
    {
        return $this->belongsTo(AiServiceCategory::class, 'category_id');
    }

    public function logs()
    {
        return $this->hasMany(AiServiceLog::class, 'service_id');
    }
}
