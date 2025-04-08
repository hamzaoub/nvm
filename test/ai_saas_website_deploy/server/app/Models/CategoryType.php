<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoryType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'machine_name',
        'is_flat',
        'parent_id',
        'order',
        'status'
    ];

    protected $casts = [
        'is_flat' => 'boolean',
        'status' => 'boolean'
    ];

    public function parent()
    {
        return $this->belongsTo(CategoryType::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(CategoryType::class, 'parent_id');
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }
}
