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
        'slug',
        'image',
        'type',
        'sort',
        'description',
        'demo_url',
    ];

    protected static function booted(): void
    {
        static::creating(function ($portfolio) {
            if (empty($portfolio->slug)) {
                $portfolio->slug = static::generateUniqueSlug($portfolio);
            }
        });

        static::updating(function ($portfolio) {
            if (empty($portfolio->slug)) {
                $portfolio->slug = static::generateUniqueSlug($portfolio);
            }
        });

        static::saved(function () {
            Cache::forget('landing_api_cache');
        });

        static::deleted(function () {
            Cache::forget('landing_api_cache');
        });
    }

    public static function generateUniqueSlug(self $portfolio): string
    {
        $name = is_array($portfolio->name)
            ? ($portfolio->name['id'] ?? $portfolio->name['en'] ?? 'portfolio')
            : (string) $portfolio->name;
        $base = \Illuminate\Support\Str::slug($name) ?: 'portfolio';
        $slug = $base;
        $i = 1;
        while (static::withTrashed()->where('slug', $slug)->where('id', '!=', $portfolio->id ?? 0)->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
}
