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
            'images'       => 'array',
            'content_sections' => 'array',
        ];
    }

    public function getUrlForSEO(): string
    {
        return url("/id/{$this->slug}");
    }

    public function getSEOTitle(): ?string
    {
        return is_array($this->title)
            ? ($this->title['id'] ?? $this->title['en'] ?? null)
            : $this->title;
    }

    public function getSEODescription(): ?string
    {
        $excerpt = is_array($this->excerpt)
            ? ($this->excerpt['id'] ?? $this->excerpt['en'] ?? null)
            : $this->excerpt;

        return $excerpt ? strip_tags($excerpt) : null;
    }
}
