<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;
use App\Models\Service;

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

        // Dynamic Service Pages
        foreach ($services as $service) {
            foreach ($locales as $locale) {
                $locUrl = "{$baseUrl}/{$locale}/discover/{$service->id}";
                $xml .= "  <url>\n";
                $xml .= "    <loc>{$locUrl}</loc>\n";
                $xml .= "    <lastmod>" . ($service->updated_at ? $service->updated_at->toIso8601String() : date('c')) . "</lastmod>\n";
                $xml .= "    <changefreq>weekly</changefreq>\n";
                $xml .= "    <priority>0.7</priority>\n";
                foreach ($locales as $altLocale) {
                    $altUrl = "{$baseUrl}/{$altLocale}/discover/{$service->id}";
                    $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"{$altLocale}\" href=\"{$altUrl}\"/>\n";
                }
                $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{$baseUrl}/id/discover/{$service->id}\"/>\n";
                $xml .= "  </url>\n";
            }
        }

        $xml .= '</urlset>';
        return $xml;
    });

    return response($xmlContent, 200)->header('Content-Type', 'text/xml');
})->middleware('throttle:60,1');

// Primary SPA Catch-all Route dengan Subfolder Locale Support
Route::get('/{locale?}/{any?}', function ($locale = 'id', $any = null) {
    if (!in_array($locale, ['id', 'en'])) {
        $fullPath = request()->path();
        return redirect('/id/' . ltrim($fullPath, '/'), 301);
    }

    app()->setLocale($locale);
    return view('layouts.app', ['locale' => $locale]);
})->where('any', '.*')->where('locale', '^(?!dapur-belakang|admin|api|storage|sitemap\.xml).*');

