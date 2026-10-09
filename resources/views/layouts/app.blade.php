@php
    $currentUrl = url()->current();
    $currentLocale = app()->getLocale() ?: 'id';
    $baseUrl = config('app.url', url('/'));
    
    // Extraksi path tanpa prefix locale untuk generator Hreflang
    $path = request()->path();
    $cleanPath = preg_replace('/^(id|en)\/?/', '', $path);
    $cleanPathSegment = $cleanPath ? '/' . ltrim($cleanPath, '/') : '';
    
    $idUrl = rtrim($baseUrl, '/') . '/id' . $cleanPathSegment;
    $enUrl = rtrim($baseUrl, '/') . '/en' . $cleanPathSegment;

    if (!function_exists('localizeTextPhp')) {
        function localizeTextPhp(?string $text, string $lang = 'id'): string {
            if (!$text) return '';
            $trimmed = trim($text);
            if (!$trimmed) return '';

            // Delimiter style: [:id]...[:en]...
            if (preg_match('/\[:\s*(id|en)\s*\]/i', $trimmed)) {
                $parts = preg_split('/\[:\s*(id|en)\s*\]/i', $trimmed, -1, PREG_SPLIT_DELIM_CAPTURE);
                $dict = [];
                for ($i = 1; $i < count($parts); $i += 2) {
                    $tag = strtolower(trim($parts[$i]));
                    $val = trim($parts[$i + 1] ?? '');
                    $val = preg_replace('/\[:\s*\]$/', '', $val);
                    $dict[$tag] = trim($val);
                }
                if (!empty($dict[$lang])) return $dict[$lang];
                $fallback = $lang === 'id' ? 'en' : 'id';
                if (!empty($dict[$fallback])) return $dict[$fallback];
            }

            // Tag pairs: [id]...[/id]
            if (preg_match('/\[\s*(id|en)\s*\](.*?)\[\/\s*\1\s*\]/is', $trimmed)) {
                preg_match_all('/\[\s*(id|en)\s*\](.*?)\[\/\s*\1\s*\]/is', $trimmed, $matches, PREG_SET_ORDER);
                $dict = [];
                foreach ($matches as $m) {
                    $dict[strtolower(trim($m[1]))] = trim($m[2]);
                }
                if (!empty($dict[$lang])) return $dict[$lang];
                $fallback = $lang === 'id' ? 'en' : 'id';
                if (!empty($dict[$fallback])) return $dict[$fallback];
            }

            return $trimmed;
        }
    }

    // Dynamic SEO computation
    $rawTitle = $seo?->title ?? ($article ? $article->title . ' — ASTA Digital Agency' : 'ASTA Digital Agency — Solusi Teknologi & Digital Agency');
    $rawDesc = $seo?->description ?? ($article ? ($article->excerpt ?: strip_tags($article->body ?? '')) : 'PT Asta Digital Agency membangun aplikasi mobile, website, dan sistem informasi modern untuk instansi, UMKM, sekolah, dan perusahaan.');
    
    $metaTitle = localizeTextPhp($rawTitle, $currentLocale);
    $metaDesc = localizeTextPhp($rawDesc, $currentLocale);
    
    $keywords = 'asta digital, digital agency, software house, jasa pembuatan website, pembuatan aplikasi mobile, sistem informasi, IT consultant, web developer indonesia';
    if ($seo && !empty($seo->focusKeywords)) {
        $kwList = collect($seo->focusKeywords)->map(fn ($k) => is_array($k) ? ($k['keyword'] ?? '') : (is_object($k) ? ($k->keyword ?? '') : (string) $k))->filter()->implode(', ');
        if ($kwList) {
            $keywords = localizeTextPhp($kwList, $currentLocale);
        }
    }

    $robots = $seo?->robots ?? 'index, follow';
    $canonicalUrl = $seo?->canonical ?: $currentUrl;

    $ogTitle = localizeTextPhp($seo?->ogTitle ?? $rawTitle, $currentLocale);
    $ogDesc = localizeTextPhp($seo?->ogDescription ?? $rawDesc, $currentLocale);
    $ogImage = $seo?->ogImage ?? ($article && $article->thumbnail ? (str_starts_with($article->thumbnail, 'http') ? $article->thumbnail : asset('storage/' . ltrim($article->thumbnail, '/'))) : asset('images/logo-dark.png'));
    $ogType = $article ? 'article' : ($seo?->ogType ?? 'website');

    $twitterTitle = localizeTextPhp($seo?->twitterTitle ?? $rawTitle, $currentLocale);
    $twitterDesc = localizeTextPhp($seo?->twitterDescription ?? $rawDesc, $currentLocale);
    $twitterImage = $seo?->twitterImage ?? $ogImage;
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', $currentLocale) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $metaTitle }}</title>
    
    <!-- Primary Meta Tags -->
    <meta name="title" content="{{ $metaTitle }}">
    <meta name="description" content="{{ $metaDesc }}">
    <meta name="keywords" content="{{ $keywords }}">
    <meta name="author" content="{{ $article->author ?? 'PT Asta Digital Agency' }}">
    <meta name="robots" content="{{ $robots }}">
    <meta name="theme-color" content="#004AAD">

    <!-- SEO Subfolder Canonical & Hreflang Tags -->
    <link rel="canonical" href="{{ $canonicalUrl }}">
    <link rel="alternate" hreflang="id" href="{{ $idUrl }}" />
    <link rel="alternate" hreflang="en" href="{{ $enUrl }}" />
    <link rel="alternate" hreflang="x-default" href="{{ $idUrl }}" />

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="{{ $ogType }}">
    <meta property="og:url" content="{{ $currentUrl }}">
    <meta property="og:site_name" content="Asta Digital Agency">
    <meta property="og:title" content="{{ $ogTitle }}">
    <meta property="og:description" content="{{ $ogDesc }}">
    <meta property="og:image" content="{{ $ogImage }}">
    <meta property="og:locale" content="{{ $currentLocale == 'id' ? 'id_ID' : 'en_US' }}">
    <meta property="og:locale:alternate" content="{{ $currentLocale == 'id' ? 'en_US' : 'id_ID' }}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{{ $currentUrl }}">
    <meta name="twitter:title" content="{{ $twitterTitle }}">
    <meta name="twitter:description" content="{{ $twitterDesc }}">
    <meta name="twitter:image" content="{{ $twitterImage }}">

    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    {
      "@@context": "https://schema.org",
      "@@type": "ProfessionalService",
      "name": "PT Asta Digital Agency",
      "alternateName": "Asta Digital",
      "url": "https://astadigitalagency.com",
      "logo": "{{ asset('images/logo-dark.png') }}",
      "image": "{{ asset('images/logo-dark.png') }}",
      "description": "PT Asta Digital Agency membangun aplikasi mobile, website, dan sistem informasi modern untuk instansi, UMKM, sekolah, dan perusahaan.",
      "telephone": "+6281578223564",
      "email": "astadigitech@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "ID"
      },
      "sameAs": [
        "https://www.instagram.com/astadigitech",
        "https://linkedin.com/company/astadigitech"
      ]
    }
    </script>

    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16x16.png') }}">
    <link rel="icon" href="{{ asset('favicon.png') }}" type="image/png">
    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">
    <link rel="apple-touch-icon" href="{{ asset('favicon.png') }}">
    @production
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-599R2RLEDJ"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-599R2RLEDJ');
    </script>
@endproduction
    {{-- Preconnect & Load Google Fonts untuk performa maksimal tanpa render blocking di Safari & Firefox --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.tsx'])
</head>
<body class="bg-background text-foreground antialiased">
    <div id="react-app"></div>
</body>
</html>
