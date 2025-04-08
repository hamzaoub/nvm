<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_id',
        'name',
        'uri',
        'icon',
        'icon_name',
        'icon_library',
        'color',
        'roles',
        'weight',
        'enabled',
        'parent_id'
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'weight' => 'integer'
    ];

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    public function parent()
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('weight');
    }
}
