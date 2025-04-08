<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'machine_name',
        'description'
    ];

    public function items()
    {
        return $this->hasMany(MenuItem::class)->orderBy('weight');
    }

    public function rootItems()
    {
        return $this->items()->whereNull('parent_id');
    }
}
