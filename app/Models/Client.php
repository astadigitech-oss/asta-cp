<?php

namespace App\Models;

use App\Support\ImageOptimizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'image',
    ];

    protected static function booted(): void
    {
        static::saved(function (Client $client) {
            \Illuminate\Support\Facades\Cache::forget('landing_api_cache');
            if ($client->image) {
                ImageOptimizer::downscaleIfOversized($client->image, 520, 200);
            }
        });

        static::deleted(function () {
            \Illuminate\Support\Facades\Cache::forget('landing_api_cache');
        });
    }
}
