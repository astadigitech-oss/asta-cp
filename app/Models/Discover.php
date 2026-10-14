<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Rankbeam\Seo\Contracts\HasSEO as HasSEOContract;
use Rankbeam\Seo\Traits\HasSEO;

class Discover extends Model implements HasSEOContract
{
    use HasSEO;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'year',
        'logo',
        'image',
        'show_name',
        'short_description',
        'content_sections',
        'sort',
        'is_pinned',
        'is_highlight',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($discover) {
            if (empty($discover->slug) && !empty($discover->name)) {
                $raw = is_array($discover->name)
                    ? ($discover->name['id'] ?? $discover->name['en'] ?? reset($discover->name))
                    : (string) $discover->name;
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
                        $discover->slug = $multiSlug;
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
                        $discover->slug = $multiSlug;
                        return;
                    }
                }

                $discover->slug = \Illuminate\Support\Str::slug($clean);
            }
        });
    }

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'is_highlight' => 'boolean',
            'image' => 'array',
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
        $identifier = $this->getLocalizedSlug($locale);
        return url("/{$locale}/discover/{$identifier}");
    }

    public function getSEOTitle(): ?string
    {
        return is_array($this->name)
            ? ($this->name['id'] ?? $this->name['en'] ?? null)
            : $this->name;
    }

    public function getSEODescription(): ?string
    {
        $desc = is_array($this->short_description)
            ? ($this->short_description['id'] ?? $this->short_description['en'] ?? null)
            : $this->short_description;

        return $desc ? strip_tags($desc) : null;
    }

    public function DiscoverLists()
    {
        return $this->hasMany(DiscoverList::class);
    }
}
