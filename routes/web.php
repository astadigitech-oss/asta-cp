<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;
use App\Models\Service;
use App\Models\Article;
use App\Models\Discover;
use App\Models\Portfolio;

/*
|--------------------------------------------------------------------------
| Web Routes - SEO Subfolder & React SPA Frontend Fallback
|--------------------------------------------------------------------------
*/

// XML Sitemap — dibangun dengan spatie/laravel-sitemap, cache 24 jam
// Mendukung hreflang multilingual (id/en) untuk semua konten dinamis
Route::get('/sitemap.xml', function () {
    $xml = Cache::remember('sitemap_xml_content', 86400, function () {
        $baseUrl = rtrim(config('app.url', url('/')), '/');
        $locales = ['id', 'en'];

        $sitemap = \Spatie\Sitemap\Sitemap::create();

        // --- Static Pages ---
        $staticPages = [
            ''         => ['priority' => '1.0', 'changefreq' => \Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY],
            'blog'     => ['priority' => '0.9', 'changefreq' => \Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY],
            'discover' => ['priority' => '0.8', 'changefreq' => \Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY],
        ];

        foreach ($staticPages as $page => $meta) {
            $pathSegment = $page ? "/{$page}" : '';
            foreach ($locales as $locale) {
                $url = \Spatie\Sitemap\Tags\Url::create("{$baseUrl}/{$locale}{$pathSegment}")
                    ->setLastModificationDate(now())
                    ->setChangeFrequency($meta['changefreq'])
                    ->setPriority((float) $meta['priority']);

                foreach ($locales as $altLocale) {
                    $url->addAlternate("{$baseUrl}/{$altLocale}{$pathSegment}", $altLocale);
                }
                // x-default → bahasa Indonesia
                $url->addAlternate("{$baseUrl}/id{$pathSegment}", 'x-default');

                $sitemap->add($url);
            }
        }

        // --- Articles (published only) ---
        Article::where('is_published', true)->each(function ($article) use ($sitemap, $baseUrl, $locales) {
            foreach ($locales as $locale) {
                $slug   = method_exists($article, 'getLocalizedSlug') ? $article->getLocalizedSlug($locale) : $article->slug;
                $locUrl = "{$baseUrl}/{$locale}/{$slug}";

                $url = \Spatie\Sitemap\Tags\Url::create($locUrl)
                    ->setLastModificationDate($article->updated_at ?? now())
                    ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.9);

                foreach ($locales as $altLocale) {
                    $altSlug = method_exists($article, 'getLocalizedSlug') ? $article->getLocalizedSlug($altLocale) : $article->slug;
                    $url->addAlternate("{$baseUrl}/{$altLocale}/{$altSlug}", $altLocale);
                }
                $idSlug = method_exists($article, 'getLocalizedSlug') ? $article->getLocalizedSlug('id') : $article->slug;
                $url->addAlternate("{$baseUrl}/id/{$idSlug}", 'x-default');

                $sitemap->add($url);
            }
        });

        // --- Discovers ---
        Discover::each(function ($discover) use ($sitemap, $baseUrl, $locales) {
            foreach ($locales as $locale) {
                $identifier = method_exists($discover, 'getLocalizedSlug')
                    ? $discover->getLocalizedSlug($locale)
                    : ($discover->slug ?: $discover->id);
                $locUrl = "{$baseUrl}/{$locale}/discover/{$identifier}";

                $url = \Spatie\Sitemap\Tags\Url::create($locUrl)
                    ->setLastModificationDate($discover->updated_at ?? now())
                    ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.8);

                foreach ($locales as $altLocale) {
                    $altId = method_exists($discover, 'getLocalizedSlug')
                        ? $discover->getLocalizedSlug($altLocale)
                        : ($discover->slug ?: $discover->id);
                    $url->addAlternate("{$baseUrl}/{$altLocale}/discover/{$altId}", $altLocale);
                }
                $defaultId = method_exists($discover, 'getLocalizedSlug') ? $discover->getLocalizedSlug('id') : ($discover->slug ?: $discover->id);
                $url->addAlternate("{$baseUrl}/id/discover/{$defaultId}", 'x-default');

                $sitemap->add($url);
            }
        });

        return $sitemap->render();
    });

    return response($xml, 200)->header('Content-Type', 'text/xml');
})->middleware('throttle:60,1');


// Primary SPA Catch-all Route dengan Subfolder Locale Support & Dynamic Article & Discover SEO Server-side Rendering
// NOTE: Tidak menggunakan redirect agar tidak loop dengan React Router (TanStack).
// Locale dideteksi dari URL path, lalu diserahkan ke frontend untuk handle routing.
Route::get('/{any?}', function () {
    $path = request()->path();
    $locale = 'id'; // default

    if (str_starts_with($path, 'en/') || $path === 'en') {
        $locale = 'en';
    } elseif (str_starts_with($path, 'id/') || $path === 'id') {
        $locale = 'id';
    }

    app()->setLocale($locale);

    $cleanPath = trim(preg_replace('/^(id|en)(\/|$)/i', '', $path), '/');

    // 1. Permanent Redirect 301 untuk URL mock discover (mencegah 404 pada URL yang terlanjur terindeks)
    if (preg_match('/^discover\/mock/i', $cleanPath)) {
        return redirect("/{$locale}/discover", 301);
    }

    // 2. Permanent Redirect 301 jika mengakses /blog/{slug} agar selaras dengan rute /{slug}
    if (str_starts_with($cleanPath, 'blog/') && strlen($cleanPath) > 5) {
        $blogSlug = substr($cleanPath, 5);
        return redirect("/{$locale}/{$blogSlug}", 301);
    }

    $isBlogPage = ($cleanPath === 'blog');
    $isDiscoverPage = ($cleanPath === 'discover');
    $isHomePage = ($cleanPath === '');
    $homeServices = null;
    $homeArticles = null;
    $homePortfolios = null;
    $homeDiscovers = null;
    $blogArticles = null;
    $discoverItems = null;
    $article = null;
    $discover = null;
    $seo = null;
    $initialData = [
        'locale' => $locale,
        'article' => null,
        'discover' => null,
        'blogArticles' => null,
        'slug' => null,
        'id' => null,
    ];

    if ($isHomePage) {
        try {
            $homeServices = Service::with(['serviceListMains' => function ($q) {
                $q->orderBy('sort', 'asc');
            }])->orderBy('sort', 'asc')->get();
        } catch (\Throwable $e) {
            $homeServices = collect();
        }

        try {
            $homeArticles = Article::where('is_published', true)
                ->where(function ($q) {
                    $q->whereNull('published_at')->orWhere('published_at', '<=', now());
                })
                ->latest('published_at')
                ->limit(3)
                ->get();
        } catch (\Throwable $e) {
            $homeArticles = collect();
        }

        try {
            $homePortfolios = Portfolio::orderBy('sort', 'asc')->limit(6)->get();
        } catch (\Throwable $e) {
            $homePortfolios = collect();
        }

        try {
            $homeDiscovers = Discover::with(['DiscoverLists' => function ($query) {
                $query->where('is_active', true)->orderBy('sort', 'asc');
            }])
            ->orderByDesc('is_pinned')
            ->orderByDesc('year')
            ->orderByDesc('created_at')
            ->limit(6)
            ->get();
        } catch (\Throwable $e) {
            $homeDiscovers = collect();
        }
    } elseif ($isBlogPage) {
        try {
            $query = Article::where('is_published', true)
                ->where(function ($q) {
                    $q->whereNull('published_at')
                      ->orWhere('published_at', '<=', now());
                })
                ->latest('published_at');

            $paginated = $query->paginate(9);
            $paginated->getCollection()->transform(function ($item) {
                $thumbnailUrl = $item->thumbnail ? ((str_starts_with($item->thumbnail, 'http') ? $item->thumbnail : asset('storage/' . ltrim($item->thumbnail, '/')))) : null;
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'slug' => method_exists($item, 'getLocalizedSlug') ? $item->getLocalizedSlug($locale) : $item->slug,
                    'thumbnail' => $thumbnailUrl,
                    'excerpt' => $item->excerpt,
                    'author' => $item->author ?? 'ASTA Digital Team',
                    'category' => $item->category ?? 'General',
                    'published_at' => $item->published_at?->format('d M Y') ?? $item->created_at->format('d M Y'),
                    'published_at_iso' => $item->published_at?->toIso8601String() ?? $item->created_at->toIso8601String(),
                ];
            });

            $blogArticles = $paginated->toArray();
            $initialData['blogArticles'] = $blogArticles;
        } catch (\Throwable $e) {
            // Graceful fallback jika DB belum siap atau error
            $blogArticles = null;
        }
    } elseif ($isDiscoverPage) {
        try {
            $discoverItems = Discover::with(['DiscoverLists' => function ($query) {
                $query->where('is_active', true)->orderBy('sort', 'asc');
            }])
            ->orderByDesc('is_pinned')
            ->orderByDesc('year')
            ->orderByDesc('created_at')
            ->get();
        } catch (\Throwable $e) {
            $discoverItems = collect();
        }
    } elseif ($cleanPath && !in_array($cleanPath, ['', 'discover'])) {
        $decoded = urldecode($cleanPath);
        $slugified = \Illuminate\Support\Str::slug($decoded);

        // 1. Cek apakah mengakses halaman detail discover
        if (str_starts_with($cleanPath, 'discover/')) {
            $discoverParam = substr($cleanPath, strlen('discover/'));
            $decodedParam = urldecode($discoverParam);
            $slugifiedParam = \Illuminate\Support\Str::slug($decodedParam);

            try {
                $discover = Discover::with(['DiscoverLists' => function ($query) {
                    $query->where('is_active', true)->orderBy('sort', 'asc');
                }])->where(function ($q) use ($discoverParam, $decodedParam, $slugifiedParam) {
                    $q->where('slug', $discoverParam)
                      ->orWhere('slug', $decodedParam)
                      ->orWhere('slug', $slugifiedParam)
                      ->orWhere('slug', 'like', "%]{$discoverParam}%")
                      ->orWhere('slug', 'like', "%]{$decodedParam}%")
                      ->orWhere('slug', 'like', "%]{$slugifiedParam}%");

                    if (is_numeric($discoverParam)) {
                        $q->orWhere('id', (int) $discoverParam);
                    }
                })->first();
            } catch (\Throwable $e) {
                $discover = null;
            }

            if ($discover) {
                try {
                    $seo = $discover->seoData();
                } catch (\Throwable $e) {
                    // Fallback
                }

                $rawImages = is_array($discover->image) ? $discover->image : (is_string($discover->image) ? [$discover->image] : []);
                $formattedImages = collect($rawImages)->map(function ($img) {
                    if (!$img) return null;
                    return (str_starts_with($img, 'http://') || str_starts_with($img, 'https://')) ? $img : asset('storage/' . ltrim($img, '/'));
                })->filter()->values()->all();

                $rawSections = is_array($discover->content_sections)
                    ? $discover->content_sections
                    : (is_string($discover->content_sections) && !empty($discover->content_sections) ? (json_decode($discover->content_sections, true) ?: []) : []);

                $formattedSections = collect($rawSections)->map(function ($section) {
                    $img = !empty($section['image']) ? ((str_starts_with($section['image'], 'http://') || str_starts_with($section['image'], 'https://')) ? $section['image'] : asset('storage/' . ltrim($section['image'], '/'))) : null;
                    return [
                        'media_type' => $section['media_type'] ?? (!empty($section['video_url']) ? 'video' : 'image'),
                        'image' => $img,
                        'video_url' => $section['video_url'] ?? null,
                        'description' => $section['description'] ?? '',
                    ];
                })->values()->all();

                $initialData['id'] = $discoverParam;
                $initialData['discover'] = [
                    'id' => $discover->id,
                    'name' => $discover->name,
                    'slug' => $discover->slug,
                    'type' => $discover->type ?: 'story',
                    'year' => $discover->year,
                    'short_description' => $discover->short_description,
                    'content_sections' => $formattedSections,
                    'show_name' => $discover->show_name,
                    'is_pinned' => $discover->is_pinned,
                    'is_highlight' => (bool) $discover->is_highlight,
                    'logo' => $discover->logo ? ((str_starts_with($discover->logo, 'http') ? $discover->logo : asset('storage/' . ltrim($discover->logo, '/')))) : null,
                    'image' => $formattedImages,
                    'created_at' => $discover->created_at ? $discover->created_at->toISOString() : null,
                    'DiscoverLists' => $discover->DiscoverLists,
                    'seo' => [
                        'meta_title' => $seo?->title ?? $discover->name,
                        'meta_description' => $seo?->description ?? strip_tags($discover->short_description ?? ''),
                        'canonical_url' => $seo?->canonical ?? url("/{$locale}/discover/" . (method_exists($discover, 'getLocalizedSlug') ? $discover->getLocalizedSlug($locale) : ($discover->slug ?: $discover->id))),
                        'robots' => $seo?->robots ?? 'index, follow',
                        'og_title' => $seo?->ogTitle ?? ($seo?->title ?? $discover->name),
                        'og_description' => $seo?->ogDescription ?? ($seo?->description ?? strip_tags($discover->short_description ?? '')),
                        'og_image' => $seo?->ogImage ?? ($formattedImages[0] ?? null),
                        'og_type' => $seo?->ogType ?? 'article',
                        'twitter_card' => 'summary_large_image',
                        'twitter_title' => $seo?->twitterTitle ?? ($seo?->title ?? $discover->name),
                        'twitter_description' => $seo?->twitterDescription ?? ($seo?->description ?? strip_tags($discover->short_description ?? '')),
                        'twitter_image' => $seo?->twitterImage ?? ($formattedImages[0] ?? null),
                        'schema_jsonld' => $seo?->schemaJsonld,
                    ],
                ];
            }
        } else {
            // 2. Cek apakah mengakses artikel
            try {
                $article = Article::where('is_published', true)
                    ->where(function ($q) use ($cleanPath, $decoded, $slugified) {
                        $q->where('slug', $cleanPath)
                          ->orWhere('slug', $decoded)
                          ->orWhere('slug', $slugified)
                          ->orWhere('slug', 'like', "%]{$cleanPath}%")
                          ->orWhere('slug', 'like', "%]{$decoded}%")
                          ->orWhere('slug', 'like', "%]{$slugified}%");

                        if (is_numeric($cleanPath)) {
                            $q->orWhere('id', (int) $cleanPath);
                        }
                    })
                    ->first();
            } catch (\Throwable $e) {
                $article = null;
            }

            if ($article) {
                try {
                    $seo = $article->seoData();
                } catch (\Throwable $e) {
                    // Fallback
                }

                $thumbnailUrl = $article->thumbnail ? ((str_starts_with($article->thumbnail, 'http') ? $article->thumbnail : asset('storage/' . ltrim($article->thumbnail, '/')))) : null;
                $rawImages = is_array($article->images) ? $article->images : [];
                $formattedImages = collect($rawImages)->map(function ($img) {
                    if (!$img) return null;
                    return (str_starts_with($img, 'http://') || str_starts_with($img, 'https://')) ? $img : asset('storage/' . ltrim($img, '/'));
                })->filter()->values()->all();

                if ($thumbnailUrl && !in_array($thumbnailUrl, $formattedImages)) {
                    array_unshift($formattedImages, $thumbnailUrl);
                }

                $rawSections = is_array($article->content_sections) ? $article->content_sections : [];
                $formattedSections = collect($rawSections)->map(function ($section) {
                    $img = !empty($section['image']) ? ((str_starts_with($section['image'], 'http://') || str_starts_with($section['image'], 'https://')) ? $section['image'] : asset('storage/' . ltrim($section['image'], '/'))) : null;
                    return [
                        'media_type' => $section['media_type'] ?? (!empty($section['video_url']) ? 'video' : (!empty($section['image']) ? 'image' : 'none')),
                        'image' => $img,
                        'video_url' => $section['video_url'] ?? null,
                        'description' => $section['description'] ?? '',
                    ];
                })->values()->all();

                $canonicalUrl = $seo?->canonical ?: url("/{$locale}/" . (method_exists($article, 'getLocalizedSlug') ? $article->getLocalizedSlug($locale) : $article->slug));
                $keywords = '';
                if ($seo && !empty($seo->focusKeywords)) {
                    $keywords = collect($seo->focusKeywords)
                        ->map(fn ($k) => is_array($k) ? ($k['keyword'] ?? '') : (is_object($k) ? ($k->keyword ?? '') : (string) $k))
                        ->filter()
                        ->implode(', ');
                }

                $initialData['slug'] = $cleanPath;
                $initialData['article'] = [
                    'id' => $article->id,
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'thumbnail' => $thumbnailUrl,
                    'images' => $formattedImages,
                    'excerpt' => $article->excerpt,
                    'tldr_summary' => $article->tldr_summary ?? [],
                    'body' => $article->body,
                    'content_sections' => $formattedSections,
                    'faqs' => $article->faqs ?? [],
                    'author' => $article->author ?? 'ASTA Digital Team',
                    'category' => $article->category ?? 'General',
                    'published_at' => $article->published_at?->format('d M Y') ?? $article->created_at->format('d M Y'),
                    'published_at_iso' => $article->published_at?->toIso8601String() ?? $article->created_at->toIso8601String(),
                    'updated_at_iso' => $article->updated_at?->toIso8601String(),
                    'seo' => [
                        'meta_title' => $seo?->title ?? $article->title,
                        'meta_description' => $seo?->description ?? ($article->excerpt ?: strip_tags($article->body ?? '')),
                        'canonical_url' => $canonicalUrl,
                        'robots' => $seo?->robots ?? 'index, follow',
                        'og_title' => $seo?->ogTitle ?? ($seo?->title ?? $article->title),
                        'og_description' => $seo?->ogDescription ?? ($seo?->description ?? ($article->excerpt ?: strip_tags($article->body ?? ''))),
                        'og_image' => $seo?->ogImage ?? ($formattedImages[0] ?? $thumbnailUrl),
                        'og_type' => $seo?->ogType ?? 'article',
                        'twitter_card' => 'summary_large_image',
                        'twitter_title' => $seo?->twitterTitle ?? ($seo?->title ?? $article->title),
                        'twitter_description' => $seo?->twitterDescription ?? ($seo?->description ?? ($article->excerpt ?: strip_tags($article->body ?? ''))),
                        'twitter_image' => $seo?->twitterImage ?? ($formattedImages[0] ?? $thumbnailUrl),
                        'keywords' => $keywords,
                        'schema_jsonld' => $seo?->schemaJsonld,
                    ],
                ];

                $recommendedArticles = Article::where('is_published', true)
                    ->where('id', '!=', $article->id)
                    ->where(function ($q) {
                        $q->whereNull('published_at')
                          ->orWhere('published_at', '<=', now());
                    })
                    ->latest('published_at')
                    ->limit(3)
                    ->get();
            }
        }
    }

    $isNotFound = (!$isHomePage && !$isBlogPage && !$isDiscoverPage && !$article && !$discover);
    $statusCode = $isNotFound ? 404 : 200;

    return response()->view('layouts.app', [
        'locale' => $locale,
        'article' => $article,
        'recommendedArticles' => $recommendedArticles ?? collect(),
        'discover' => $discover,
        'blogArticles' => $blogArticles,
        'isBlogPage' => $isBlogPage,
        'isDiscoverPage' => $isDiscoverPage,
        'discoverItems' => $discoverItems,
        'isHomePage' => $isHomePage,
        'isNotFound' => $isNotFound,
        'homeServices' => $homeServices,
        'homeArticles' => $homeArticles,
        'homePortfolios' => $homePortfolios,
        'homeDiscovers' => $homeDiscovers,
        'seo' => $seo,
        'initialData' => $initialData,
    ], $statusCode);
})->where('any', '^(?!dapur-belakang|admin|api|storage|sitemap\.xml|livewire).*');

