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

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($article) {
            if (empty($article->slug) && !empty($article->title)) {
                $raw = is_array($article->title)
                    ? ($article->title['id'] ?? $article->title['en'] ?? reset($article->title))
                    : (string) $article->title;
                $clean = trim($raw);

                if (preg_match('/\[:\s*(id|en)\s*\]/i', $clean)) {
                    $parts = preg_split('/\[:\s*(id|en)\s*\]/i', $clean, -1, PREG_SPLIT_DELIM_CAPTURE);
                    for ($i = 1; $i < count($parts); $i += 2) {
                        if (strtolower(trim($parts[$i])) === 'id') {
                            $clean = preg_replace('/\[:\s*\]$/', '', trim($parts[$i + 1] ?? ''));
                            break;
                        }
                    }
                } elseif (preg_match('/\[\s*id\s*\](.*?)\[\/\s*id\s*\]/is', $clean, $m)) {
                    $clean = trim($m[1]);
                }

                $article->slug = \Illuminate\Support\Str::slug($clean);
            }
        });
    }

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
