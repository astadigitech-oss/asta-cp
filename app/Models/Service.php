<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use SoftDeletes;

    protected $casts = [
        'image' => 'array',
    ];

    protected $fillable = [
        'name',
        'show_name',
        'header',
        'description',
        'short_description',
        'logo',
        'image',
    ];

    public function serviceListMains()
    {
        return $this->hasMany(ServiceListMain::class);
    }
}
