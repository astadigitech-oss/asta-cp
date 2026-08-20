<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Testimonial extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'role',
        'org',
        'quote',
        'avatar',
        'tag',
        'rating',
        'sort',
        'is_active',
    ];

    protected $casts = [
        'rating' => 'integer',
        'sort' => 'integer',
        'is_active' => 'boolean',
    ];
}
