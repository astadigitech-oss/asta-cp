<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;
use Rankbeam\Seo\Contracts\HasSEO as HasSEOContract;
use Rankbeam\Seo\Traits\HasSEO;

class Service extends Model implements HasSEOContract
{
    use HasSEO;
    use Searchable;
    use SoftDeletes;

    protected $casts = [
        'image' => 'array',
    ];

    protected $fillable = [
        'name',
        'show_name',
        'header',
        'description',
        'short_description',
        'logo',
        'cover_image',
        'image',
    ];

    public function serviceListMains()
    {
        return $this->hasMany(ServiceListMain::class);
    }

    protected static function booted(): void
    {
        static::saved(function () {
            \Illuminate\Support\Facades\Cache::forget('sitemap_xml_content');
        });

        static::deleted(function () {
            \Illuminate\Support\Facades\Cache::forget('sitemap_xml_content');
        });
    }

    // -------------------------------------------------------------------------
    // Rankbeam SEO
    // -------------------------------------------------------------------------

    public function getUrlForSEO(): string
    {
        // Service tidak punya halaman detail publik sendiri,
        // arahkan ke homepage dengan anchor
        return url('/');
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

    // -------------------------------------------------------------------------
    // Laravel Scout / Meilisearch
    // -------------------------------------------------------------------------

    public function searchableAs(): string
    {
        return 'services';
    }

    public function toSearchableArray(): array
    {
        $name  = is_array($this->name) ? ($this->name['id'] ?? $this->name['en'] ?? '') : (string) $this->name;
        $descShort = is_array($this->short_description) ? ($this->short_description['id'] ?? $this->short_description['en'] ?? '') : (string) $this->short_description;
        $descFull  = is_array($this->description) ? ($this->description['id'] ?? $this->description['en'] ?? '') : (string) $this->description;

        return [
            'id'                => $this->id,
            'type'              => 'service',
            'name'              => strip_tags($name),
            'header'            => $this->header,
            'short_description' => strip_tags($descShort),
            'description'       => strip_tags($descFull),
            'logo'              => $this->logo,
            'updated_at'        => $this->updated_at?->timestamp,
        ];
    }

    /** Konfigurasi Meilisearch index settings */
    public function toMeilisearchSettings(): array
    {
        return [
            'searchableAttributes' => ['name', 'header', 'short_description', 'description'],
            'filterableAttributes' => ['type'],
            'sortableAttributes'   => ['updated_at'],
            'rankingRules'         => [
                'words', 'typo', 'proximity', 'attribute', 'sort', 'exactness',
            ],
        ];
    }
}
