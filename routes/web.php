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

// XML Sitemap Route dengan Caching & Throttle Protection (Aman dari DDoS / Bot Attack)
Route::get('/sitemap.xml', function () {
    $xmlContent = Cache::remember('sitemap_xml_content', 86400, function () {
        $baseUrl = config('app.url', url('/'));
        $locales = ['id', 'en'];
        $staticPages = ['', 'discover'];

        $services = Service::all();
        $articles = Article::where('is_published', true)->get();
        $discovers = Discover::all();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";

        // Static Pages (Home & Discover)
        foreach ($staticPages as $page) {
            $pathSegment = $page ? "/{$page}" : '';
            foreach ($locales as $locale) {
                $locUrl = "{$baseUrl}/{$locale}{$pathSegment}";
                $xml .= "  <url>\n";
                $xml .= "    <loc>{$locUrl}</loc>\n";
                $xml .= "    <lastmod>" . date('c') . "</lastmod>\n";
                $xml .= "    <changefreq>daily</changefreq>\n";
                $xml .= "    <priority>" . ($page === '' ? '1.0' : '0.8') . "</priority>\n";
                foreach ($locales as $altLocale) {
                    $altUrl = "{$baseUrl}/{$altLocale}{$pathSegment}";
                    $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"{$altLocale}\" href=\"{$altUrl}\"/>\n";
                }
                $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{$baseUrl}/id{$pathSegment}\"/>\n";
                $xml .= "  </url>\n";
            }
        }

        // Dynamic Blog Article Pages (Clean URL & Multilingual)
        foreach ($articles as $article) {
            foreach ($locales as $locale) {
                $locUrl = "{$baseUrl}/{$locale}/{$article->slug}";
                $xml .= "  <url>\n";
                $xml .= "    <loc>{$locUrl}</loc>\n";
                $xml .= "    <lastmod>" . ($article->updated_at ? $article->updated_at->toIso8601String() : date('c')) . "</lastmod>\n";
                $xml .= "    <changefreq>weekly</changefreq>\n";
                $xml .= "    <priority>0.9</priority>\n";
                foreach ($locales as $altLocale) {
                    $altUrl = "{$baseUrl}/{$altLocale}/{$article->slug}";
                    $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"{$altLocale}\" href=\"{$altUrl}\"/>\n";
                }
                $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{$baseUrl}/id/{$article->slug}\"/>\n";
                $xml .= "  </url>\n";
            }
        }

        // Dynamic Discover & E-Learning Pages
        foreach ($discovers as $discover) {
            $identifier = $discover->slug ?: $discover->id;
            foreach ($locales as $locale) {
                $locUrl = "{$baseUrl}/{$locale}/discover/{$identifier}";
                $xml .= "  <url>\n";
                $xml .= "    <loc>{$locUrl}</loc>\n";
                $xml .= "    <lastmod>" . ($discover->updated_at ? $discover->updated_at->toIso8601String() : date('c')) . "</lastmod>\n";
                $xml .= "    <changefreq>weekly</changefreq>\n";
                $xml .= "    <priority>0.8</priority>\n";
                foreach ($locales as $altLocale) {
                    $altUrl = "{$baseUrl}/{$altLocale}/discover/{$identifier}";
                    $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"{$altLocale}\" href=\"{$altUrl}\"/>\n";
                }
                $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{$baseUrl}/id/discover/{$identifier}\"/>\n";
                $xml .= "  </url>\n";
            }
        }

        $xml .= '</urlset>';
        return $xml;
    });

    return response($xmlContent, 200)->header('Content-Type', 'text/xml');
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
                  ->orWhere('slug', $slugifiedParam);

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
                      ->orWhere('slug', $slugified);

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

