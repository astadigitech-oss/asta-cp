<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;
use App\Models\Service;
use App\Models\Article;
use App\Models\Discover;

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

    $cleanPath = preg_replace('/^(id|en)\/?/', '', $path);
    $article = null;
    $discover = null;
    $seo = null;

    if ($cleanPath && !in_array($cleanPath, ['', 'discover', 'blog'])) {
        $decoded = urldecode($cleanPath);
        $slugified = \Illuminate\Support\Str::slug($decoded);

        // 1. Cek apakah mengakses halaman detail discover
        if (str_starts_with($cleanPath, 'discover/')) {
            $discoverParam = substr($cleanPath, strlen('discover/'));
            $decodedParam = urldecode($discoverParam);
            $slugifiedParam = \Illuminate\Support\Str::slug($decodedParam);

            $discover = Discover::where(function ($q) use ($discoverParam, $decodedParam, $slugifiedParam) {
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

            if ($discover) {
                try {
                    $seo = $discover->seoData();
                } catch (\Throwable $e) {
                    // Fallback
                }
            }
        } else {
            // 2. Cek apakah mengakses artikel
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

            if ($article) {
                try {
                    $seo = $article->seoData();
                } catch (\Throwable $e) {
                    // Fallback
                }
            }
        }
    }

    return view('layouts.app', [
        'locale' => $locale,
        'article' => $article,
        'discover' => $discover,
        'seo' => $seo,
    ]);
})->where('any', '^(?!dapur-belakang|admin|api|storage|sitemap\.xml).*');

