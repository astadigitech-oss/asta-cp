<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;

class Testimonial extends Model
{
    use SoftDeletes;

    public function scopePubliclyVerified(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->where('is_verified', true)
            ->whereNotNull('source_url')
            ->where('source_url', '!=', '');
    }

    public static function hasPublicSource(?string $url): bool
    {
        if (! $url || ! filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }

        return in_array(parse_url($url, PHP_URL_SCHEME), ['http', 'https'], true);
    }

    protected $fillable = [
        'name',
        'role',
        'org',
        'quote',
        'avatar',
        'tag',
        'rating',
        'source_url',
        'is_verified',
        'sort',
        'is_active',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_verified' => 'boolean',
        'sort' => 'integer',
        'is_active' => 'boolean',
    ];
}
