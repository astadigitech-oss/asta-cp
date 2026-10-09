<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Rankbeam\Seo\Contracts\HasSEO as HasSEOContract;
use Rankbeam\Seo\Traits\HasSEO;

class Article extends Model implements HasSEOContract
{
    use HasSEO;
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'thumbnail',
        'images',
        'excerpt',
        'body',
        'content_sections',
        'author',
        'category',
        'is_published',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'images' => 'array',
            'content_sections' => 'array',
        ];
    }
}
