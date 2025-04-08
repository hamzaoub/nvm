<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiServiceCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name'
    ];

    public function services()
    {
        return $this->hasMany(AiService::class, 'category_id');
    }
}
