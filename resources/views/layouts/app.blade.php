@php
    $currentUrl = url()->current();
    $currentLocale = app()->getLocale() ?: 'id';
    $baseUrl = config('app.url', url('/'));
    
    // Extraksi path tanpa prefix locale untuk generator Hreflang
    $path = request()->path();
    $cleanPath = preg_replace('/^(id|en)\/?/', '', $path);
    $cleanPathSegment = $cleanPath ? '/' . ltrim($cleanPath, '/') : '';

    if ($article && method_exists($article, 'getLocalizedSlug')) {
        $idUrl = rtrim($baseUrl, '/') . '/id/' . $article->getLocalizedSlug('id');
        $enUrl = rtrim($baseUrl, '/') . '/en/' . $article->getLocalizedSlug('en');
    } elseif ($discover && method_exists($discover, 'getLocalizedSlug')) {
        $idUrl = rtrim($baseUrl, '/') . '/id/discover/' . $discover->getLocalizedSlug('id');
        $enUrl = rtrim($baseUrl, '/') . '/en/discover/' . $discover->getLocalizedSlug('en');
    } else {
        $idUrl = rtrim($baseUrl, '/') . '/id' . $cleanPathSegment;
        $enUrl = rtrim($baseUrl, '/') . '/en' . $cleanPathSegment;
    }

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
    $itemTitle = $article ? $article->title : ($discover ? (is_array($discover->name) ? ($discover->name[$currentLocale] ?? reset($discover->name)) : $discover->name) : null);
    $itemDesc = $article ? ($article->excerpt ?: strip_tags($article->body ?? '')) : ($discover ? strip_tags(is_array($discover->short_description) ? ($discover->short_description[$currentLocale] ?? reset($discover->short_description)) : ($discover->short_description ?? '')) : null);

    $rawTitle = $seo?->title ?? ($itemTitle ? $itemTitle . ' — ASTA Digital Agency' : 'ASTA Digital Agency — Solusi Teknologi & Digital Agency');
    $rawDesc = $seo?->description ?? ($itemDesc ?: 'PT Asta Digital Agency membangun aplikasi mobile, website, dan sistem informasi modern untuk instansi, UMKM, sekolah, dan perusahaan.');

    // html_entity_decode mencegah double-escape &amp;amp; saat Blade merender {{ }}
    $metaTitle = html_entity_decode(localizeTextPhp($rawTitle, $currentLocale), ENT_QUOTES | ENT_HTML5, 'UTF-8');
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

    // Resolve OG default image via Vite manifest (supaya dapat URL dengan hash yang benar)
    $ogDefaultImage = \Illuminate\Support\Facades\Vite::asset('resources/js/assets/og-image.png');

    // Discover first image fallback
    $discoverImg = null;
    if ($discover && !empty($discover->image)) {
        $firstImg = is_array($discover->image) ? ($discover->image[0] ?? null) : $discover->image;
        if ($firstImg) {
            $discoverImg = str_starts_with($firstImg, 'http') ? $firstImg : asset('storage/' . ltrim($firstImg, '/'));
        }
    }

    $ogTitle = localizeTextPhp($seo?->ogTitle ?? $rawTitle, $currentLocale);
    $ogDesc = localizeTextPhp($seo?->ogDescription ?? $rawDesc, $currentLocale);

    $rawOgImage = $seo?->ogImage;
    if (!empty($rawOgImage)) {
        $ogImage = str_starts_with($rawOgImage, 'http') ? $rawOgImage : asset('storage/' . ltrim($rawOgImage, '/'));
    } else {
        $ogImage = ($article && $article->thumbnail
            ? (str_starts_with($article->thumbnail, 'http')
                ? $article->thumbnail
                : asset('storage/' . ltrim($article->thumbnail, '/')))
            : ($discoverImg ?: $ogDefaultImage));
    }
    $ogType = ($article || $discover) ? 'article' : ($seo?->ogType ?? 'website');

    $twitterTitle = localizeTextPhp($seo?->twitterTitle ?? $rawTitle, $currentLocale);
    $twitterDesc = localizeTextPhp($seo?->twitterDescription ?? $rawDesc, $currentLocale);
    $rawTwitterImage = $seo?->twitterImage;
    $twitterImage = !empty($rawTwitterImage)
        ? (str_starts_with($rawTwitterImage, 'http') ? $rawTwitterImage : asset('storage/' . ltrim($rawTwitterImage, '/')))
        : $ogImage;
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
      "url": "{{ rtrim(config('app.url'), '/') }}",
      "logo": "{{ asset('images/logo-dark.png') }}",
      "image": "{{ $ogDefaultImage }}",
      "description": "PT Asta Digital Agency membangun aplikasi mobile, website, dan sistem informasi modern untuk instansi, UMKM, sekolah, dan perusahaan.",
      "telephone": "+6281578223564",
      "email": "astadigitech@gmail.com",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Jl. Imogiri Timur, Gng. Tobanan V, dsn. Jati Rt 008, Wonokromo, Kec. Pleret",
        "addressLocality": "Bantul",
        "addressRegion": "D.I. Yogyakarta",
        "postalCode": "55791",
        "addressCountry": "ID"
      },
      "sameAs": [
        "https://www.instagram.com/astadigitalagency/",
        "https://www.linkedin.com/in/asta-digital-agency-b9441637a/"
      ]
    }
    </script>
    @if ($article)
    <script type="application/ld+json">
    {
      "@@context": "https://schema.org",
      "@@type": "BlogPosting",
      "headline": "{{ addslashes($metaTitle) }}",
      "description": "{{ addslashes($metaDesc) }}",
      "image": "{{ $ogImage }}",
      "datePublished": "{{ $article->published_at?->toIso8601String() ?? now()->toIso8601String() }}",
      "dateModified": "{{ $article->updated_at?->toIso8601String() ?? now()->toIso8601String() }}",
      "author": {
        "@@type": "Organization",
        "name": "{{ addslashes($article->author ?: 'ASTA Digital Team') }}"
      },
      "publisher": {
        "@@type": "Organization",
        "name": "PT Asta Digital Agency",
        "logo": {
          "@@type": "ImageObject",
          "url": "{{ asset('images/logo-dark.png') }}"
        }
      },
      "mainEntityOfPage": {
        "@@type": "WebPage",
        "@@id": "{{ $canonicalUrl }}"
      }
    }
    </script>
    @endif

    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16x16.png') }}">
    <link rel="icon" href="{{ asset('favicon.png') }}" type="image/png">
    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">
    <link rel="apple-touch-icon" href="{{ asset('favicon.png') }}">
    @php
        $gaId = config('services.google.analytics_id');
    @endphp
    @if (!empty($gaId))
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ $gaId }}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', '{{ $gaId }}');
    </script>
    @endif
    {{-- Preconnect & Load Google Fonts untuk performa maksimal tanpa render blocking di Safari & Firefox --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap">
    {{-- Initial Data Inlining untuk 0ms Data Fetching di React SPA --}}
    <script>
        window.__INITIAL_DATA__ = @json($initialData ?? ['locale' => $currentLocale]);
    </script>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.tsx'])
</head>
<body class="bg-background text-foreground antialiased">
    <div id="react-app">
        {{-- Semantic Server-Side Pre-rendered Content untuk Mesin Pencari & Bot AI --}}
        @if ($article)
            <article class="max-w-4xl mx-auto px-4 py-12">
                <header class="mb-8">
                    @if (!empty($article->category))
                        <span class="text-sm font-semibold text-blue-600 uppercase tracking-wider">{{ $article->category }}</span>
                    @endif
                    <h1 class="text-3xl md:text-5xl font-bold mt-2 mb-4 text-gray-900 dark:text-white leading-tight">
                        {{ localizeTextPhp($article->title, $currentLocale) }}
                    </h1>
                    <div class="flex items-center gap-3 text-sm text-gray-500">
                        <span>{{ $article->author ?: 'PT Asta Digital Agency' }}</span>
                        <span>•</span>
                        <time datetime="{{ $article->published_at?->toIso8601String() ?? now()->toIso8601String() }}">
                            {{ $article->published_at?->format('d M Y') ?? date('d M Y') }}
                        </time>
                    </div>
                </header>

                @if ($article->thumbnail)
                    <div class="my-6">
                        <img src="{{ str_starts_with($article->thumbnail, 'http') ? $article->thumbnail : asset('storage/' . ltrim($article->thumbnail, '/')) }}"
                             alt="{{ localizeTextPhp($article->title, $currentLocale) }}"
                             class="w-full rounded-2xl shadow-md object-cover max-h-[500px]" />
                    </div>
                @endif

                @if ($article->excerpt)
                    <p class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
                        {{ localizeTextPhp($article->excerpt, $currentLocale) }}
                    </p>
                @endif

                <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed space-y-4">
                    {!! localizeTextPhp($article->body, $currentLocale) !!}
                </div>

                @if (!empty($article->content_sections) && is_array($article->content_sections))
                    <div class="mt-10 space-y-8">
                        @foreach ($article->content_sections as $sec)
                            <div class="border-t pt-6">
                                @if (!empty($sec['image']))
                                    <img src="{{ str_starts_with($sec['image'], 'http') ? $sec['image'] : asset('storage/' . ltrim($sec['image'], '/')) }}"
                                         alt="Content media"
                                         class="w-full rounded-xl object-cover my-4" />
                                @endif
                                @if (!empty($sec['description']))
                                    <div class="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {!! localizeTextPhp($sec['description'], $currentLocale) !!}
                                    </div>
                                @endif
                            </div>
                        @endforeach
                    </div>
                @endif
            </article>
        @elseif ($discover)
            <article class="max-w-4xl mx-auto px-4 py-12">
                <header class="mb-8">
                    @if (!empty($discover->type))
                        <span class="text-sm font-semibold text-blue-600 uppercase tracking-wider">{{ $discover->type }}</span>
                    @endif
                    <h1 class="text-3xl md:text-5xl font-bold mt-2 mb-4 text-gray-900 dark:text-white leading-tight">
                        {{ localizeTextPhp(is_array($discover->name) ? ($discover->name[$currentLocale] ?? reset($discover->name)) : $discover->name, $currentLocale) }}
                    </h1>
                </header>

                @if ($discoverImg)
                    <div class="my-6">
                        <img src="{{ $discoverImg }}"
                             alt="{{ localizeTextPhp(is_array($discover->name) ? ($discover->name[$currentLocale] ?? reset($discover->name)) : $discover->name, $currentLocale) }}"
                             class="w-full rounded-2xl shadow-md object-cover max-h-[500px]" />
                    </div>
                @endif

                <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed space-y-4">
                    {!! localizeTextPhp(is_array($discover->short_description) ? ($discover->short_description[$currentLocale] ?? reset($discover->short_description)) : $discover->short_description, $currentLocale) !!}
                </div>
            </article>
        @else
            {{-- Profile & Services Fallback untuk Homepage / Public URLs --}}
            <main class="max-w-5xl mx-auto px-4 py-16">
                <h1 class="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                    ASTA Digital Agency — Solusi Teknologi & Digital Agency
                </h1>
                <p class="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                    PT Asta Digital Agency membangun aplikasi mobile, website, dan sistem informasi modern untuk instansi, UMKM, sekolah, dan perusahaan.
                </p>
                <section class="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
                    <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-xl">
                        <h2 class="text-xl font-bold mb-2">Jasa Pembuatan Website & Sistem Informasi</h2>
                        <p class="text-gray-600 dark:text-gray-400">Pengembangan platform web modern, cepat, aman, dan responsive sesuai kebutuhan bisnis Anda.</p>
                    </div>
                    <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-xl">
                        <h2 class="text-xl font-bold mb-2">Pembuatan Aplikasi Mobile (Android & iOS)</h2>
                        <p class="text-gray-600 dark:text-gray-400">Aplikasi mobile native & hybrid berkinerja tinggi dengan UI/UX intuitif.</p>
                    </div>
                </section>
            </main>
        @endif
    </div>
</body>
</html>
