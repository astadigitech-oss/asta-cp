<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\QueryException;
use App\Models\Service;
use App\Models\Article;
use App\Models\Discover;
use App\Models\Portfolio;
use App\Models\Client;
use App\Models\Testimonial;
use App\Http\Controllers\OptimizedImageController;
use App\Support\OptimizedImage;

/*
|--------------------------------------------------------------------------
| Web Routes - SEO Subfolder & React SPA Frontend Fallback
|--------------------------------------------------------------------------
*/

// Route robots.txt fallback jika request masuk ke PHP (misal via Nginx fallback atau dev server)
Route::get('/robots.txt', function () {
    $file = public_path('robots.txt');
    if (file_exists($file)) {
        return response()->file($file, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
    abort(404);
});

// Redirect jika user salah ketik "robot.txt" (tanpa akhiran 's')
Route::get('/robot.txt', function () {
    return redirect('/robots.txt', 301);
});

// XML Sitemap — dibangun dengan spatie/laravel-sitemap, cache 24 jam
// Mendukung hreflang multilingual (id/en) untuk semua konten dinamis
Route::get('/sitemap.xml', function () {
    $xml = Cache::remember('sitemap_xml_content', 3600, function () {
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
        Article::where('is_published', true)
            ->where(function ($query) {
                $query->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->each(function ($article) use ($sitemap, $baseUrl, $locales) {
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

Route::get('/media/{preset}/{path}', OptimizedImageController::class)
    ->where('path', '.+')
    ->name('media.optimized');

Route::get('/storage/optimized/{preset}/{filename}', [OptimizedImageController::class, 'serveOptimizedStorage'])
    ->where('filename', '[a-zA-Z0-9_\-\.]+')
    ->name('storage.optimized');

// Redirect Cloudflare email protection link jika di-crawl oleh SEO bot (mencegah 404 broken link)
Route::get('/cdn-cgi/l/email-protection', function () {
    $locale = request()->cookie('asta_lang') ?: (app()->getLocale() ?: 'id');
    return redirect("/{$locale}#kontak", 301);
});

// Halaman utama (root /) dan halaman localized (/{locale}) langsung melayani SSR tanpa redirect ganda,
// mencegah penalti "Hindari pengalihan halaman ganda" (Multiple Page Redirects) di Google PageSpeed Insights.
Route::get('/{any?}', function () {
    $path = trim(request()->path(), '/');
    $locale = 'id'; // default

    if ($path === '') {
        $preferredLocale = request()->cookie('asta_lang');
        if (in_array($preferredLocale, ['id', 'en'], true)) {
            $locale = $preferredLocale;
        }
        // Jangan redirect ke /{locale}! Sajikan langsung dengan status 200 OK untuk menghindari redirect chain.
    } elseif (str_starts_with($path, 'en/') || $path === 'en') {
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
    $isServicesPage = ($cleanPath === 'services');
    $isPortfolioPage = ($cleanPath === 'portfolio' || $cleanPath === 'portfolios');
    $isHomePage = ($cleanPath === '');
    $homeServices = null;
    $homeArticles = null;
    $homePortfolios = null;
    $homeDiscovers = null;
    $homeClients = collect();
    $homeTestimonials = collect();
    $blogArticles = null;
    $discoverItems = null;
    $article = null;
    $discover = null;
    $service = null;
    $portfolio = null;
    $seo = null;
    $initialData = [
        'locale' => $locale,
        'article' => null,
        'discover' => null,
        'service' => null,
        'portfolio' => null,
        'blogArticles' => null,
        'slug' => null,
        'id' => null,
    ];

    if ($isHomePage) {
        $homeCacheKey = "home_data_bundle_v2_{$locale}";
        $cachedHome = Cache::remember($homeCacheKey, 1800, function () {
            try {
                $landing = (new \App\Http\Controllers\Api\LandingController())->getLandingData()->getData(true);
            } catch (\Throwable $e) {
                $landing = null;
            }

            try {
                $clients = Client::all();
            } catch (\Throwable $e) {
                $clients = collect();
            }

            try {
                $testimonials = Testimonial::activeForLanding()
                    ->orderBy('sort')
                    ->get();
            } catch (\Throwable $e) {
                $testimonials = collect();
            }

            try {
                $services = Service::with(['serviceListMains' => function ($q) {
                    $q->orderBy('sort', 'asc');
                }])->orderBy('sort', 'asc')->get();
            } catch (\Throwable $e) {
                $services = collect();
            }

            try {
                $articles = Article::where('is_published', true)
                    ->where(function ($q) {
                        $q->whereNull('published_at')->orWhere('published_at', '<=', now());
                    })
                    ->latest('published_at')
                    ->limit(3)
                    ->get();
            } catch (\Throwable $e) {
                $articles = collect();
            }

            try {
                $portfolios = Portfolio::orderBy('sort', 'asc')->limit(6)->get();
            } catch (\Throwable $e) {
                $portfolios = collect();
            }

            try {
                $discovers = Discover::with(['DiscoverLists' => function ($query) {
                    $query->where('is_active', true)->orderBy('sort', 'asc');
                }])
                ->orderByDesc('is_pinned')
                ->orderByDesc('year')
                ->orderByDesc('created_at')
                ->limit(6)
                ->get();
            } catch (\Throwable $e) {
                $discovers = collect();
            }

            return [
                'landing' => $landing,
                'clients' => $clients,
                'testimonials' => $testimonials,
                'services' => $services,
                'articles' => $articles,
                'portfolios' => $portfolios,
                'discovers' => $discovers,
            ];
        });

        $initialData['landing'] = $cachedHome['landing'] ?? null;
        $homeClients = $cachedHome['clients'] ?? collect();
        $homeTestimonials = $cachedHome['testimonials'] ?? collect();
        $homeServices = $cachedHome['services'] ?? collect();
        $homeArticles = $cachedHome['articles'] ?? collect();
        $homePortfolios = $cachedHome['portfolios'] ?? collect();
        $homeDiscovers = $cachedHome['discovers'] ?? collect();
    } elseif ($isBlogPage) {
        try {
            $query = Article::where('is_published', true)
                ->where(function ($q) {
                    $q->whereNull('published_at')
                      ->orWhere('published_at', '<=', now());
                })
                ->latest('published_at');

            $paginated = $query->paginate(9);
            $paginated->getCollection()->transform(function ($item) use ($locale) {
                $thumbnailUrl = OptimizedImage::url($item->thumbnail, 'article-thumb');
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
    } elseif ($isServicesPage || $isPortfolioPage) {
        try {
            $initialData['landing'] = Cache::remember('landing_api_cache', 30, function () {
                return (new \App\Http\Controllers\Api\LandingController())->getLandingData()->getData(true);
            });
        } catch (\Throwable $e) {
            $initialData['landing'] = null;
        }
    } elseif ($cleanPath && !in_array($cleanPath, ['', 'discover', 'services', 'portfolio', 'portfolios'])) {
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
                    return OptimizedImage::url($img, 'discover-card');
                })->filter()->values()->all();
                $discoverOgImage = isset($rawImages[0]) && $rawImages[0]
                    ? ((str_starts_with($rawImages[0], 'http') ? $rawImages[0] : asset('storage/' . ltrim($rawImages[0], '/'))))
                    : null;

                $rawSections = is_array($discover->content_sections)
                    ? $discover->content_sections
                    : (is_string($discover->content_sections) && !empty($discover->content_sections) ? (json_decode($discover->content_sections, true) ?: []) : []);

                $formattedSections = collect($rawSections)->map(function ($section) {
                    $img = !empty($section['image']) ? OptimizedImage::url($section['image'], 'discover-section') : null;
                    return [
                        'media_type' => $section['media_type'] ?? (!empty($section['video_url']) ? 'video' : 'image'),
                        'image' => $img,
                        'video_url' => $section['video_url'] ?? null,
                        'description' => $section['description'] ?? '',
                    ];
                })->values()->all();

                $initialData['id'] = $discoverParam;
                $discoverNameRaw = is_array($discover->name) ? ($discover->name[$locale] ?? reset($discover->name)) : $discover->name;
                $discoverDescRaw = $seo?->description ?? strip_tags(is_array($discover->short_description) ? ($discover->short_description[$locale] ?? reset($discover->short_description)) : ($discover->short_description ?? ''));
                $discoverLocalizedDesc = \App\Support\ContentSanitizer::resolveLocalizedDescription($discoverDescRaw, $locale, $discoverNameRaw, 'discover');

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
                    'logo' => OptimizedImage::url($discover->logo, 'discover-logo'),
                    'image' => $formattedImages,
                    'created_at' => $discover->created_at ? $discover->created_at->toISOString() : null,
                    'DiscoverLists' => $discover->DiscoverLists,
                    'seo' => [
                        'meta_title' => $seo?->title ?? $discover->name,
                        'meta_description' => $discoverLocalizedDesc,
                        'canonical_url' => $seo?->canonical ?? url("/{$locale}/discover/" . (method_exists($discover, 'getLocalizedSlug') ? $discover->getLocalizedSlug($locale) : ($discover->slug ?: $discover->id))),
                        'robots' => $seo?->robots ?? 'index, follow',
                        'og_title' => $seo?->ogTitle ?? ($seo?->title ?? $discover->name),
                        'og_description' => $discoverLocalizedDesc,
                        'og_image' => $seo?->ogImage ?? ($discoverOgImage ?? ($formattedImages[0] ?? null)),
                        'og_type' => $seo?->ogType ?? 'article',
                        'twitter_card' => 'summary_large_image',
                        'twitter_title' => $seo?->twitterTitle ?? ($seo?->title ?? $discover->name),
                        'twitter_description' => $discoverLocalizedDesc,
                        'twitter_image' => $seo?->twitterImage ?? ($discoverOgImage ?? ($formattedImages[0] ?? null)),
                        'schema_jsonld' => $seo?->schemaJsonld,
                    ],
                ];
            }
        } elseif (str_starts_with($cleanPath, 'services/')) {
            // 2. Cek apakah mengakses halaman detail service
            $serviceParam = substr($cleanPath, strlen('services/'));
            $decodedParam = urldecode($serviceParam);
            $slugifiedParam = \Illuminate\Support\Str::slug($decodedParam);

            try {
                $service = Service::with(['serviceListMains' => function ($query) {
                    $query->orderBy('sort', 'asc');
                }])->where(function ($q) use ($serviceParam, $decodedParam, $slugifiedParam) {
                    if (is_numeric($serviceParam)) {
                        $q->where('id', (int) $serviceParam);
                    } else {
                        $q->where('id', $serviceParam)
                          ->orWhere('name', 'like', "%{$decodedParam}%");
                    }
                })->first();
            } catch (\Throwable $e) {
                $service = null;
            }

            if ($service) {
                try {
                    $seo = $service->seoData();
                } catch (\Throwable $e) {
                    // Fallback
                }

                $rawImages = collect($service->image ?? [])->all();
                $formattedImages = collect($rawImages)->map(function ($img) {
                    if (!$img) return null;
                    return OptimizedImage::url($img, 'service-detail');
                })->filter()->values()->all();

                $serviceOgImage = $seo?->ogImage ?: (isset($rawImages[0]) && $rawImages[0]
                    ? (str_starts_with($rawImages[0], 'http') ? $rawImages[0] : asset('storage/' . ltrim($rawImages[0], '/')))
                    : (OptimizedImage::url($service->cover_image, 'service-cover') ?: OptimizedImage::url($service->logo, 'service-logo')));

                $initialData['id'] = $serviceParam;
                $serviceNameRaw = is_array($service->name) ? ($service->name[$locale] ?? reset($service->name)) : $service->name;
                $serviceDescRaw = $seo?->description ?? strip_tags(is_array($service->short_description) ? ($service->short_description[$locale] ?? reset($service->short_description)) : ($service->short_description ?? ''));
                $serviceLocalizedDesc = \App\Support\ContentSanitizer::resolveLocalizedDescription($serviceDescRaw, $locale, $serviceNameRaw, 'service');

                $initialData['service'] = [
                    'id' => $service->id,
                    'name' => $service->name,
                    'show_name' => $service->show_name,
                    'header' => $service->header,
                    'description' => $service->description,
                    'short_description' => $service->short_description,
                    'logo' => OptimizedImage::url($service->logo, 'service-logo'),
                    'cover_image' => OptimizedImage::url($service->cover_image, 'service-cover'),
                    'image' => $formattedImages,
                    'created_at' => $service->created_at ? $service->created_at->toISOString() : null,
                    'updated_at' => $service->updated_at ? $service->updated_at->toISOString() : null,
                    'serviceListMains' => $service->serviceListMains,
                    'faqs' => $service->faqs ?? [],
                    'seo' => [
                        'meta_title' => $seo?->title ?? $service->name,
                        'meta_description' => $serviceLocalizedDesc,
                        'canonical_url' => $seo?->canonical ?: url("/{$locale}/services/{$service->id}"),
                        'robots' => $seo?->robots ?? 'index, follow',
                        'og_title' => $seo?->ogTitle ?? ($seo?->title ?? $service->name),
                        'og_description' => $serviceLocalizedDesc,
                        'og_image' => $serviceOgImage,
                        'og_type' => 'website',
                        'twitter_card' => 'summary_large_image',
                        'twitter_title' => $seo?->twitterTitle ?? ($seo?->title ?? $service->name),
                        'twitter_description' => $serviceLocalizedDesc,
                        'twitter_image' => $serviceOgImage,
                    ],
                ];
            }
        } elseif (str_starts_with($cleanPath, 'portfolio/') || str_starts_with($cleanPath, 'portfolios/')) {
            // Cek apakah mengakses halaman detail portfolio
            $portfolioParam = str_starts_with($cleanPath, 'portfolio/')
                ? substr($cleanPath, strlen('portfolio/'))
                : substr($cleanPath, strlen('portfolios/'));
            $decodedParam = urldecode($portfolioParam);

            try {
                $portfolio = Portfolio::where(function ($q) use ($portfolioParam, $decodedParam) {
                    if (is_numeric($portfolioParam)) {
                        $q->where('id', (int) $portfolioParam);
                    } else {
                        $q->where('id', $portfolioParam)
                          ->orWhere('name', 'like', "%{$decodedParam}%");
                    }
                })->first();
            } catch (\Throwable $e) {
                $portfolio = null;
            }

            if ($portfolio) {
                $formattedImage = OptimizedImage::url($portfolio->image, 'portfolio-card');
                $formattedThumb = OptimizedImage::url($portfolio->image, 'portfolio-thumb');
                $portfolioOgImage = $formattedImage ?: ($portfolio->image ? (str_starts_with($portfolio->image, 'http') ? $portfolio->image : asset('storage/' . ltrim($portfolio->image, '/'))) : null);

                $initialData['id'] = $portfolioParam;
                $portfolioNameRaw = $portfolio->name;
                $portfolioDescRaw = strip_tags($portfolio->description ?? '');
                $portfolioLocalizedDesc = \App\Support\ContentSanitizer::resolveLocalizedDescription($portfolioDescRaw, $locale, $portfolioNameRaw, 'portfolio');

                $otherPortfolios = Portfolio::where('id', '!=', $portfolio->id)
                    ->orderBy('sort', 'asc')
                    ->limit(3)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'type' => $item->type,
                            'category' => $item->type === 'mobile' ? 'Mobile' : 'Desktop',
                            'image' => OptimizedImage::url($item->image, 'portfolio-thumb'),
                            'demo_url' => $item->demo_url,
                        ];
                    });

                $canonicalUrl = url("/{$locale}/portfolio/{$portfolio->id}");

                $initialData['portfolio'] = [
                    'id' => $portfolio->id,
                    'name' => $portfolio->name,
                    'description' => $portfolio->description,
                    'type' => $portfolio->type,
                    'category' => $portfolio->type === 'mobile' ? 'Mobile' : 'Desktop',
                    'image' => $formattedImage,
                    'image_small' => $formattedThumb,
                    'demo_url' => $portfolio->demo_url,
                    'created_at' => $portfolio->created_at ? $portfolio->created_at->format('d M Y') : null,
                    'updated_at' => $portfolio->updated_at ? $portfolio->updated_at->toISOString() : null,
                    'other_portfolios' => $otherPortfolios,
                    'seo' => [
                        'meta_title' => "{$portfolio->name} — ASTA Digital Agency",
                        'meta_description' => $portfolioLocalizedDesc,
                        'canonical_url' => $canonicalUrl,
                        'robots' => 'index, follow',
                        'og_title' => "{$portfolio->name} — ASTA Digital Agency",
                        'og_description' => $portfolioLocalizedDesc,
                        'og_image' => $portfolioOgImage,
                        'og_type' => 'website',
                        'twitter_card' => 'summary_large_image',
                        'twitter_title' => "{$portfolio->name} — ASTA Digital Agency",
                        'twitter_description' => $portfolioLocalizedDesc,
                        'twitter_image' => $portfolioOgImage,
                    ],
                ];
            }
        } else {
            // 3. Cek apakah mengakses artikel
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

                $thumbnailUrl = OptimizedImage::url($article->thumbnail, 'article-thumb');
                $thumbnailOgUrl = $article->thumbnail
                    ? ((str_starts_with($article->thumbnail, 'http') ? $article->thumbnail : asset('storage/' . ltrim($article->thumbnail, '/'))))
                    : null;
                $rawImages = is_array($article->images) ? $article->images : [];
                $formattedImages = collect($rawImages)->map(function ($img) use ($article) {
                    if (!$img) return null;
                    return OptimizedImage::url(
                        $img,
                        $img === $article->thumbnail ? 'article-thumb' : 'article-image',
                    );
                })->filter()->values()->all();

                if ($thumbnailUrl && !in_array($thumbnailUrl, $formattedImages)) {
                    array_unshift($formattedImages, $thumbnailUrl);
                }

                $rawSections = is_array($article->content_sections) ? $article->content_sections : [];
                $formattedSections = collect($rawSections)->map(function ($section) use ($article) {
                    $img = !empty($section['image']) ? OptimizedImage::url($section['image'], 'article-image') : null;
                    return [
                        'media_type' => $section['media_type'] ?? (!empty($section['video_url']) ? 'video' : (!empty($section['image']) ? 'image' : 'none')),
                        'image' => $img,
                        'video_url' => $section['video_url'] ?? null,
                        'description' => \App\Support\ContentSanitizer::cleanArticleHtml($section['description'] ?? '', $article->title),
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
                $articleTitleRaw = is_array($article->title) ? ($article->title[$locale] ?? reset($article->title)) : $article->title;
                $articleDescRaw = $seo?->description ?? ($article->excerpt ?: strip_tags($article->body ?? ''));
                $articleLocalizedDesc = \App\Support\ContentSanitizer::resolveLocalizedDescription($articleDescRaw, $locale, $articleTitleRaw, 'article');

                $initialData['article'] = [
                    'id' => $article->id,
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'thumbnail' => $thumbnailUrl,
                    'images' => $formattedImages,
                    'excerpt' => $article->excerpt,
                    'tldr_summary' => $article->tldr_summary ?? [],
                    'body' => \App\Support\ContentSanitizer::cleanArticleHtml($article->body, $article->title),
                    'content_sections' => $formattedSections,
                    'faqs' => $article->faqs ?? [],
                    'author' => $article->author ?? 'ASTA Digital Team',
                    'category' => $article->category ?? 'General',
                    'published_at' => $article->published_at?->format('d M Y') ?? $article->created_at->format('d M Y'),
                    'published_at_iso' => $article->published_at?->toIso8601String() ?? $article->created_at->toIso8601String(),
                    'updated_at_iso' => $article->updated_at?->toIso8601String(),
                    'seo' => [
                        'meta_title' => $seo?->title ?? $article->title,
                        'meta_description' => $articleLocalizedDesc,
                        'canonical_url' => $canonicalUrl,
                        'robots' => $seo?->robots ?? 'index, follow',
                        'og_title' => $seo?->ogTitle ?? ($seo?->title ?? $article->title),
                        'og_description' => $articleLocalizedDesc,
                        'og_image' => $seo?->ogImage ?? ($thumbnailOgUrl ?? ($formattedImages[0] ?? null)),
                        'og_type' => $seo?->ogType ?? 'article',
                        'twitter_card' => 'summary_large_image',
                        'twitter_title' => $seo?->twitterTitle ?? ($seo?->title ?? $article->title),
                        'twitter_description' => $articleLocalizedDesc,
                        'twitter_image' => $seo?->twitterImage ?? ($thumbnailOgUrl ?? ($formattedImages[0] ?? null)),
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

    $isNotFound = (!$isHomePage && !$isBlogPage && !$isDiscoverPage && !$isServicesPage && !$isPortfolioPage && !$article && !$discover && !$service && !$portfolio);
    $statusCode = $isNotFound ? 404 : 200;

    $response = response()->view('layouts.app', [
        'locale' => $locale,
        'article' => $article,
        'recommendedArticles' => $recommendedArticles ?? collect(),
        'discover' => $discover,
        'service' => $service,
        'portfolio' => $portfolio,
        'blogArticles' => $blogArticles,
        'isBlogPage' => $isBlogPage,
        'isDiscoverPage' => $isDiscoverPage,
        'isServicesPage' => $isServicesPage,
        'isPortfolioPage' => $isPortfolioPage,
        'discoverItems' => $discoverItems,
        'isHomePage' => $isHomePage,
        'isNotFound' => $isNotFound,
        'homeServices' => $homeServices,
        'homeArticles' => $homeArticles,
        'homePortfolios' => $homePortfolios,
        'homeDiscovers' => $homeDiscovers,
        'homeClients' => $homeClients,
        'homeTestimonials' => $homeTestimonials,
        'seo' => $seo,
        'initialData' => $initialData,
    ], $statusCode);

    if ($statusCode === 200) {
        // Berikan instruksi cache yang jelas ke browser & CDN Edge (Cloudflare):
        // Browser: cache 120s, CDN/Cloudflare (s-maxage): cache 3600s (1 jam), stale-while-revalidate: 1 hari
        $response->header('Cache-Control', 'public, max-age=120, s-maxage=3600, stale-while-revalidate=86400');
    }

    return $response;
})->where('any', '^(?!dapur-belakang|admin|api|storage|sitemap\.xml|livewire).*');
