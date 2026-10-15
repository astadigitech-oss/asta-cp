<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;
use Rankbeam\Seo\Contracts\HasSEO as HasSEOContract;
use Rankbeam\Seo\Traits\HasSEO;

class Article extends Model implements HasSEOContract
{
    use HasSEO;
    use Searchable;
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
                    $slugs = [];
                    for ($i = 1; $i < count($parts); $i += 2) {
                        $tag = strtolower(trim($parts[$i]));
                        $val = preg_replace('/\[:\s*\]$/', '', trim($parts[$i + 1] ?? ''));
                        if (!empty($val)) {
                            $slugs[$tag] = \Illuminate\Support\Str::slug($val);
                        }
                    }
                    if (!empty($slugs)) {
                        $multiSlug = '';
                        foreach ($slugs as $t => $s) {
                            $multiSlug .= "[:{$t}]{$s}";
                        }
                        $article->slug = $multiSlug;
                        return;
                    }
                } elseif (preg_match_all('/\[\s*(id|en)\s*\](.*?)\[\/\s*\1\s*\]/is', $clean, $matches, PREG_SET_ORDER)) {
                    $multiSlug = '';
                    foreach ($matches as $m) {
                        $tag = strtolower(trim($m[1]));
                        $s = \Illuminate\Support\Str::slug(trim($m[2]));
                        $multiSlug .= "[:{$tag}]{$s}";
                    }
                    if (!empty($multiSlug)) {
                        $article->slug = $multiSlug;
                        return;
                    }
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

    public function getLocalizedSlug(?string $locale = null): string
    {
        $lang = $locale ?: (app()->getLocale() ?: 'id');
        $raw = (string) $this->slug;
        if (preg_match('/\[:\s*(id|en)\s*\]/i', $raw)) {
            $parts = preg_split('/\[:\s*(id|en)\s*\]/i', $raw, -1, PREG_SPLIT_DELIM_CAPTURE);
            $dict = [];
            for ($i = 1; $i < count($parts); $i += 2) {
                $tag = strtolower(trim($parts[$i]));
                $val = preg_replace('/\[:\s*\]$/', '', trim($parts[$i + 1] ?? ''));
                $dict[$tag] = $val;
            }
            if (!empty($dict[$lang])) return $dict[$lang];
            $fallback = $lang === 'id' ? 'en' : 'id';
            if (!empty($dict[$fallback])) return $dict[$fallback];
        }
        return $raw ?: (string) $this->id;
    }

    public function getUrlForSEO(): string
    {
        $locale = app()->getLocale() ?: 'id';
        $slug = $this->getLocalizedSlug($locale);
        return url("/{$locale}/{$slug}");
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

    // -------------------------------------------------------------------------
    // Laravel Scout / Meilisearch
    // -------------------------------------------------------------------------

    public function searchableAs(): string
    {
        return 'articles';
    }

    /** Hanya artikel yang sudah published yang masuk index */
    public function shouldBeSearchable(): bool
    {
        return (bool) $this->is_published;
    }

    public function toSearchableArray(): array
    {
        $titleId  = is_array($this->title)  ? ($this->title['id']  ?? '') : (string) $this->title;
        $titleEn  = is_array($this->title)  ? ($this->title['en']  ?? '') : '';
        $excerptId = is_array($this->excerpt) ? ($this->excerpt['id'] ?? '') : (string) $this->excerpt;
        $excerptEn = is_array($this->excerpt) ? ($this->excerpt['en'] ?? '') : '';

        return [
            'id'           => $this->id,
            'type'         => 'article',
            'title_id'     => strip_tags($titleId),
            'title_en'     => strip_tags($titleEn),
            'title'        => strip_tags($titleId ?: $titleEn),
            'excerpt_id'   => strip_tags($excerptId),
            'excerpt_en'   => strip_tags($excerptEn),
            'excerpt'      => strip_tags($excerptId ?: $excerptEn),
            'body'         => strip_tags((string) $this->body),
            'author'       => $this->author,
            'category'     => $this->category,
            'slug'         => $this->slug,
            'thumbnail'    => $this->thumbnail,
            'is_published' => (int) $this->is_published,
            'published_at' => $this->published_at?->timestamp,
            'updated_at'   => $this->updated_at?->timestamp,
        ];
    }

    /** Konfigurasi Meilisearch index settings */
    public function toMeilisearchSettings(): array
    {
        return [
            'searchableAttributes' => [
                'title_id', 'title_en', 'title',
                'excerpt_id', 'excerpt_en',
                'body', 'author', 'category',
            ],
            'filterableAttributes' => ['is_published', 'category', 'type'],
            'sortableAttributes'   => ['published_at', 'updated_at'],
            'rankingRules'         => [
                'words', 'typo', 'proximity', 'attribute', 'sort', 'exactness',
            ],
        ];
    }
}
