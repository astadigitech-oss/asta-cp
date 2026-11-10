<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Portfolio extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'image',
        'type',
        'sort',
        'description',
        'demo_url',
    ];

    protected static function booted(): void
    {
        static::saved(function () {
            Cache::forget('landing_api_cache');
        });

        static::deleted(function () {
            Cache::forget('landing_api_cache');
        });
    }
}
