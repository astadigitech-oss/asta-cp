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
    $isBlogPage = $isBlogPage ?? false;
    $itemTitle = $article ? $article->title : ($discover ? (is_array($discover->name) ? ($discover->name[$currentLocale] ?? reset($discover->name)) : $discover->name) : null);
    $itemDesc = $article ? ($article->excerpt ?: strip_tags($article->body ?? '')) : ($discover ? strip_tags(is_array($discover->short_description) ? ($discover->short_description[$currentLocale] ?? reset($discover->short_description)) : ($discover->short_description ?? '')) : null);

    if ($isBlogPage) {
        $rawTitle = $currentLocale === 'en' ? 'Articles & Insights — ASTA Digital Agency' : 'Artikel & Wawasan — ASTA Digital Agency';
        $rawDesc = $currentLocale === 'en'
            ? 'Explore articles, guides, and insights on digital transformation, technology, and business growth from ASTA Digital Agency.'
            : 'Jelajahi kumpulan artikel, panduan, dan wawasan seputar transformasi digital, teknologi, dan pertumbuhan bisnis dari ASTA Digital Agency.';
    } else {
        $rawTitle = $seo?->title ?? ($itemTitle ? $itemTitle . ' — ASTA Digital Agency' : 'ASTA Digital Agency — Solusi Teknologi & Digital Agency');
        $rawDesc = $seo?->description ?? ($itemDesc ?: 'PT Asta Digital Agency membangun aplikasi mobile, website, dan sistem informasi modern untuk instansi, UMKM, sekolah, dan perusahaan.');
    }

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
    $ogType = ($article || $discover) ? 'article' : ($isBlogPage ? 'blog' : ($seo?->ogType ?? 'website'));

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
      "alternateName": "ASTA DIGITAL AGENCY",
      "url": "{{ rtrim(config('app.url'), '/') }}",
      "logo": "{{ asset('images/logo-dark.png') }}",
      "image": "{{ $ogDefaultImage }}",
      "description": "ASTA DIGITAL AGENCY membangun aplikasi mobile, website, dan sistem informasi enterprise modern untuk instansi, UMKM, sekolah, dan perusahaan skala menengah hingga besar.",
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
        "name": "{{ addslashes($article->author ?: 'ASTA DIGITAL AGENCY Team') }}"
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
    @if (!empty($article->faqs) && is_array($article->faqs))
    <script type="application/ld+json">
    {
      "@@context": "https://schema.org",
      "@@type": "FAQPage",
      "mainEntity": [
        @foreach ($article->faqs as $fIdx => $faqItem)
        {
          "@@type": "Question",
          "name": "{{ addslashes(localizeTextPhp($faqItem['question'] ?? '', $currentLocale)) }}",
          "acceptedAnswer": {
            "@@type": "Answer",
            "text": "{{ addslashes(strip_tags(localizeTextPhp($faqItem['answer'] ?? '', $currentLocale))) }}"
          }
        }@if (!$loop->last),@endif
        @endforeach
      ]
    }
    </script>
    @endif
    @elseif (!$article && !$discover && !$isBlogPage)
    {{-- Global FAQPage JSON-LD untuk Homepage & SEO Bot Extraction --}}
    <script type="application/ld+json">
    {
      "@@context": "https://schema.org",
      "@@type": "FAQPage",
      "mainEntity": [
        {
          "@@type": "Question",
          "name": "{{ $currentLocale === 'en' ? 'What services does ASTA DIGITAL AGENCY provide?' : 'Apa saja layanan utama yang ditawarkan oleh ASTA DIGITAL AGENCY?' }}",
          "acceptedAnswer": {
            "@@type": "Answer",
            "text": "{{ $currentLocale === 'en' ? 'ASTA DIGITAL AGENCY provides enterprise software development services including mobile app development (iOS and Android), custom modern web applications, and enterprise information systems.' : 'ASTA DIGITAL AGENCY menyediakan layanan rekayasa perangkat lunak mencakup pembuatan aplikasi mobile (Android & iOS), pengembangan web aplikasi modern, serta sistem informasi enterprise kustom.' }}"
          }
        },
        {
          "@@type": "Question",
          "name": "{{ $currentLocale === 'en' ? 'How does ASTA DIGITAL AGENCY approach system security and performance?' : 'Bagaimana pendekatan ASTA DIGITAL AGENCY terhadap keamanan dan performa sistem?' }}",
          "acceptedAnswer": {
            "@@type": "Answer",
            "text": "{{ $currentLocale === 'en' ? 'ASTA DIGITAL AGENCY implements layered security standards, strict input sanitization, automated test coverage, and high-performance clean architecture to ensure system resilience and fast response times.' : 'ASTA DIGITAL AGENCY menerapkan standar keamanan berlapis, sanitasi input ketat, pengujian otomatis, serta arsitektur clean code performa tinggi untuk menjamin ketahanan dan kecepatan respons sistem.' }}"
          }
        },
        {
          "@@type": "Question",
          "name": "{{ $currentLocale === 'en' ? 'What is the typical project development timeline at ASTA DIGITAL AGENCY?' : 'Berapa lama estimasi pengerjaan proyek di ASTA DIGITAL AGENCY?' }}",
          "acceptedAnswer": {
            "@@type": "Answer",
            "text": "{{ $currentLocale === 'en' ? 'Typical development timelines range from 2 to 12 weeks depending on technical complexity, scope, and specific client requirements.' : 'Estimasi waktu pengerjaan berkisar antara 2 hingga 12 minggu tergantung pada tingkat kompleksitas teknis, ruang lingkup, dan kebutuhan khusus klien.' }}"
          }
        },
        {
          "@@type": "Question",
          "name": "{{ $currentLocale === 'en' ? 'Does ASTA DIGITAL AGENCY provide post-launch maintenance and support?' : 'Apakah ASTA DIGITAL AGENCY menyediakan dukungan pemeliharaan (maintenance) pasca-peluncuran?' }}",
          "acceptedAnswer": {
            "@@type": "Answer",
            "text": "{{ $currentLocale === 'en' ? 'Yes, ASTA DIGITAL AGENCY provides explicit maintenance warranties, server uptime monitoring, and ongoing technical SLA support.' : 'Ya, ASTA DIGITAL AGENCY menyediakan garansi pemeliharaan teknis, monitoring server, serta SLA dukungan teknis berkelanjutan pasca-rilis sistem.' }}"
          }
        }
      ]
    }
    </script>
    @endif
    @if ($isBlogPage && !empty($blogArticles['data']))
    <script type="application/ld+json">
    {
      "@@context": "https://schema.org",
      "@@type": "CollectionPage",
      "name": "{{ addslashes($metaTitle) }}",
      "description": "{{ addslashes($metaDesc) }}",
      "url": "{{ $canonicalUrl }}",
      "mainEntity": {
        "@@type": "ItemList",
        "itemListElement": [
          @foreach ($blogArticles['data'] as $idx => $art)
          {
            "@@type": "ListItem",
            "position": {{ $idx + 1 }},
            "url": "{{ rtrim($baseUrl, '/') . '/' . $currentLocale . '/' . $art['slug'] }}",
            "name": "{{ addslashes(localizeTextPhp($art['title'], $currentLocale)) }}"
          }@if (!$loop->last),@endif
          @endforeach
        ]
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

                {{-- Modul Ringkasan Eksekutif (TL;DR 3 Poin) untuk Bot AI & Pembaca Cepat --}}
                @if (!empty($article->tldr_summary) && is_array($article->tldr_summary))
                    <div class="my-6 p-6 rounded-2xl bg-blue-50/80 border border-blue-200/90 dark:bg-blue-950/30 dark:border-blue-900/60 shadow-xs">
                        <div class="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-300 font-bold text-sm uppercase tracking-wider">
                            <span>⚡ {{ $currentLocale === 'en' ? 'Executive Summary (TL;DR)' : 'Ringkasan Eksekutif (TL;DR)' }}</span>
                        </div>
                        <ul class="space-y-2.5 text-gray-800 dark:text-gray-200 text-base list-disc list-inside">
                            @foreach ($article->tldr_summary as $point)
                                @php
                                    $ptText = is_array($point) ? ($point['point'] ?? reset($point)) : $point;
                                @endphp
                                <li class="leading-relaxed">
                                    {!! localizeTextPhp($ptText, $currentLocale) !!}
                                </li>
                            @endforeach
                        </ul>
                    </div>
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

                {{-- Modul FAQ Permanen Artikel Blog --}}
                @if (!empty($article->faqs) && is_array($article->faqs))
                    <section class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <h2 class="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                            {{ $currentLocale === 'en' ? 'Frequently Asked Questions (FAQ)' : 'Pertanyaan Umum seputar Topik Ini (FAQ)' }}
                        </h2>
                        <div class="space-y-4">
                            @foreach ($article->faqs as $faq)
                                <div class="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/50">
                                    <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                        {{ localizeTextPhp($faq['question'] ?? '', $currentLocale) }}
                                    </h3>
                                    <div class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                                        {!! localizeTextPhp($faq['answer'] ?? '', $currentLocale) !!}
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </section>
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
        @elseif ($isBlogPage)
            <main class="max-w-6xl mx-auto px-4 py-12">
                <header class="mb-10 text-center">
                    <span class="text-xs font-semibold text-blue-600 uppercase tracking-widest">
                        {{ $currentLocale === 'en' ? 'Blog & Knowledge' : 'Artikel & Wawasan' }}
                    </span>
                    <h1 class="text-3xl md:text-5xl font-bold mt-2 text-gray-900 dark:text-white">
                        {{ $currentLocale === 'en' ? 'Articles & Insights' : 'Artikel & Wawasan' }}
                    </h1>
                    <p class="mt-3 text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {{ $currentLocale === 'en'
                            ? 'Explore articles, guides, and insights on digital transformation and technology.'
                            : 'Jelajahi kumpulan artikel, panduan, dan wawasan seputar transformasi digital dan teknologi.' }}
                    </p>
                </header>
                @if (!empty($blogArticles['data']))
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        @foreach ($blogArticles['data'] as $art)
                            <article class="flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                                @if (!empty($art['thumbnail']))
                                    <a href="/{{ $currentLocale }}/{{ $art['slug'] }}" class="block aspect-video overflow-hidden">
                                        <img src="{{ $art['thumbnail'] }}" alt="{{ localizeTextPhp($art['title'], $currentLocale) }}" class="w-full h-full object-cover" loading="lazy" />
                                    </a>
                                @endif
                                <div class="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <span class="text-xs font-semibold text-blue-600 uppercase tracking-wider">{{ $art['category'] }}</span>
                                        <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white line-clamp-2">
                                            <a href="/{{ $currentLocale }}/{{ $art['slug'] }}" class="hover:text-blue-600 transition-colors">
                                                {{ localizeTextPhp($art['title'], $currentLocale) }}
                                            </a>
                                        </h2>
                                        @if (!empty($art['excerpt']))
                                            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                                {{ localizeTextPhp($art['excerpt'], $currentLocale) }}
                                            </p>
                                        @endif
                                    </div>
                                    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                                        <span>{{ $art['author'] }}</span>
                                        <time>{{ $art['published_at'] }}</time>
                                    </div>
                                </div>
                            </article>
                        @endforeach
                    </div>
                @endif
            </main>
        @else
            {{-- Semantic Server-Side Pre-rendered Content untuk Homepage & Bot AI --}}
            <main class="max-w-5xl mx-auto px-4 py-16 space-y-16">
                {{-- 1. Hero Section Berbasis Prompt & Aturan BLUF --}}
                <header class="border-b border-gray-100 dark:border-gray-800 pb-12">
                    <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                        ASTA DIGITAL AGENCY · SOFTWARE HOUSE & IT CONSULTANT
                    </span>
                    <h1 class="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
                        {{ $currentLocale === 'en'
                            ? 'What software engineering and digital transformation solutions does ASTA DIGITAL AGENCY provide?'
                            : 'Apa saja solusi rekayasa perangkat lunak dan transformasi digital dari ASTA DIGITAL AGENCY?' }}
                    </h1>
                    {{-- BLUF Paragraf: Jawaban langsung di kalimat pertama --}}
                    <p class="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6 font-medium">
                        <strong>ASTA DIGITAL AGENCY</strong> {{ $currentLocale === 'en'
                            ? 'is a technology studio specializing in end-to-end custom software development, high-performance mobile applications (Android & iOS), and scalable enterprise information systems for companies, public institutions, and educational organizations.'
                            : 'adalah studio teknologi yang berfokus pada rekayasa perangkat lunak kustom, pengembangan aplikasi mobile (Android & iOS) berkinerja tinggi, serta sistem informasi enterprise berskala besar untuk perusahaan, instansi, dan institusi pendidikan.' }}
                    </p>
                    <ul class="space-y-3 text-base text-gray-700 dark:text-gray-300">
                        <li class="flex items-start gap-2">
                            <span class="text-blue-600 font-bold">•</span>
                            <span><strong>Arsitektur Skalabel:</strong> ASTA DIGITAL AGENCY merancang sistem berbasis clean architecture dan microservices yang siap menangani lonjakan data secara stabil.</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-blue-600 font-bold">•</span>
                            <span><strong>Keamanan Tingkat Enterprise:</strong> ASTA DIGITAL AGENCY menerapkan protokol proteksi data ketat, sanitasi masukan, dan pengujian kerentanan berkala.</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-blue-600 font-bold">•</span>
                            <span><strong>Dukungan SLA Definitif:</strong> ASTA DIGITAL AGENCY memberikan jaminan garansi pemeliharaan, pemantauan proaktif, dan respon teknis cepat.</span>
                        </li>
                    </ul>
                </header>

                {{-- 2. Section Layanan Utama ASTA DIGITAL AGENCY --}}
                <section id="layanan" class="space-y-8">
                    <div>
                        <h2 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            {{ $currentLocale === 'en'
                                ? 'What core technology services does ASTA DIGITAL AGENCY offer?'
                                : 'Layanan teknologi apa saja yang disediakan oleh ASTA DIGITAL AGENCY?' }}
                        </h2>
                        <p class="mt-2 text-gray-600 dark:text-gray-400">
                            {{ $currentLocale === 'en'
                                ? 'ASTA DIGITAL AGENCY delivers end-to-end engineering tailored to specific organizational workflows:'
                                : 'ASTA DIGITAL AGENCY menghadirkan layanan rekayasa perangkat lunak terintegrasi yang disesuaikan dengan kebutuhan bisnis:' }}
                        </p>
                    </div>

                    @if (!empty($homeServices) && $homeServices->count() > 0)
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            @foreach ($homeServices as $svc)
                                <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                        {{ localizeTextPhp($svc->name, $currentLocale) }}
                                    </h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                        {!! strip_tags(localizeTextPhp($svc->short_description ?: $svc->description, $currentLocale)) !!}
                                    </p>
                                    @if ($svc->serviceListMains && $svc->serviceListMains->count() > 0)
                                        <ul class="text-xs space-y-1.5 text-gray-500 border-t pt-3">
                                            @foreach ($svc->serviceListMains as $feature)
                                                <li>• {{ localizeTextPhp($feature->description, $currentLocale) }}</li>
                                            @endforeach
                                        </ul>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Web Apps & Portal Enterprise</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">ASTA DIGITAL AGENCY mengembangkan portal web modern, sistem manajemen internal, dan aplikasi berbasis cloud yang aman dan responsif.</p>
                            </div>
                            <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Mobile Apps (Android & iOS)</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">ASTA DIGITAL AGENCY membangun aplikasi mobile native dan multiplatform berkinerja tinggi dengan UI/UX modern dan intuitif.</p>
                            </div>
                            <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">IT Consulting & Sistem Kustom</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">ASTA DIGITAL AGENCY memberikan konsultasi arsitektur sistem, audit keamanan, dan integrasi API untuk instansi maupun korporasi.</p>
                            </div>
                        </div>
                    @endif

                    {{-- Tabel Komparasi Metode Rekayasa: ASTA vs Tradisional --}}
                    <div class="mt-10 overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-gray-50/50 dark:bg-gray-900/50">
                        <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            {{ $currentLocale === 'en'
                                ? 'Comparison: ASTA DIGITAL AGENCY Method vs Traditional Development'
                                : 'Tabel Komparasi: Metode Rekayasa ASTA DIGITAL AGENCY vs Metode Pengembangan Tradisional' }}
                        </h3>
                        <table class="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr class="border-b border-gray-200 dark:border-gray-700">
                                    <th class="py-3 px-4 font-bold text-gray-900 dark:text-white">Parameter Evaluasi</th>
                                    <th class="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">Metode ASTA DIGITAL AGENCY</th>
                                    <th class="py-3 px-4 font-bold text-gray-500">Metode Tradisional</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                                <tr>
                                    <td class="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Arsitektur Kode & Skalabilitas</td>
                                    <td class="py-3 px-4 text-gray-800 dark:text-gray-300">Clean architecture, modular, siap skala tinggi tanpa refactor ulang total.</td>
                                    <td class="py-3 px-4 text-gray-500">Monolitik kaku, sulit dikembangkan lebih lanjut, utang teknis tinggi.</td>
                                </tr>
                                <tr>
                                    <td class="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Kesiapan AI & Mesin Pencari (GEO/SEO)</td>
                                    <td class="py-3 px-4 text-gray-800 dark:text-gray-300">Struktur semantik lengkap, skema Schema.org (JSON-LD), ramah ekstraksi bot AI.</td>
                                    <td class="py-3 px-4 text-gray-500">Client-Side Rendering murni tanpa pre-rendering, konten tersembunyi dari perayap.</td>
                                </tr>
                                <tr>
                                    <td class="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Keamanan & Audit Sistem</td>
                                    <td class="py-3 px-4 text-gray-800 dark:text-gray-300">Validasi input ketat, sanitasi berlapis, enkripsi data, dan proteksi CSRF/XSS.</td>
                                    <td class="py-3 px-4 text-gray-500">Pengujian keamanan sekunder atau diabaikan hingga insiden terjadi.</td>
                                </tr>
                                <tr>
                                    <td class="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Jaminan Garansi & SLA</td>
                                    <td class="py-3 px-4 text-gray-800 dark:text-gray-300">Garansi pemeliharaan pasca-rilis dengan SLA respon terikat kontrak.</td>
                                    <td class="py-3 px-4 text-gray-500">Dukungan berakhir setelah serah terima awal tanpa jaminan bug fixing.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {{-- 3. Section FAQ Permanen Homepage --}}
                <section id="faq" class="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h2 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        {{ $currentLocale === 'en'
                            ? 'Frequently Asked Questions about ASTA DIGITAL AGENCY (FAQ)'
                            : 'Pertanyaan Umum seputar Layanan ASTA DIGITAL AGENCY (FAQ)' }}
                    </h2>
                    <div class="space-y-4">
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                Apa saja layanan utama yang disediakan oleh ASTA DIGITAL AGENCY?
                            </h3>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                ASTA DIGITAL AGENCY menyediakan layanan komprehensif berupa pengembangan aplikasi mobile native dan hybrid (Android & iOS), rekayasa sistem informasi enterprise kustom, pembuatan platform web modern, serta audit arsitektur teknologi.
                            </p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                Bagaimana ASTA DIGITAL AGENCY menjamin keamanan data pada sistem yang dibangun?
                            </h3>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                ASTA DIGITAL AGENCY menerapkan prinsip security-by-design dengan enkripsi data saat transit dan saat disimpan, sanitasi input terhadap kerentanan OWASP Top 10, manajemen hak akses berbasis peran (RBAC), serta pencatatan audit log sistem yang lengkap.
                            </p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                Berapa lama durasi rata-rata pengerjaan proyek di ASTA DIGITAL AGENCY?
                            </h3>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                Durasi pengerjaan proyek bervariasi antara 2 hingga 12 minggu bergantung pada ruang lingkup modul, kompleksitas integrasi API pihak ketiga, dan kebutuhan kustomisasi sistem yang disepakati.
                            </p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                Apakah ASTA DIGITAL AGENCY menyediakan layanan konsultasi sebelum proyek dimulai?
                            </h3>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                Ya, ASTA DIGITAL AGENCY menyediakan sesi konsultasi teknis dan pemetaan kebutuhan (discovery) awal secara cuma-cuma untuk merumuskan spesifikasi produk, arsitektur yang tepat, dan estimasi investasi yang efisien.
                            </p>
                        </div>
                    </div>
                </section>

                {{-- 4. Section Artikel & Wawasan Terbaru --}}
                @if (!empty($homeArticles) && $homeArticles->count() > 0)
                    <section class="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <div class="flex items-center justify-between">
                            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                {{ $currentLocale === 'en' ? 'Latest Technology Insights & Articles' : 'Wawasan Teknologi & Artikel Terbaru' }}
                            </h2>
                            <a href="/{{ $currentLocale }}/blog" class="text-sm font-semibold text-blue-600 hover:underline">
                                {{ $currentLocale === 'en' ? 'View All Insights →' : 'Lihat Semua Artikel →' }}
                            </a>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            @foreach ($homeArticles as $art)
                                <article class="p-5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
                                    <span class="text-xs font-bold text-blue-600 uppercase">{{ $art->category ?: 'Technology' }}</span>
                                    <h3 class="font-bold text-base mt-2 text-gray-900 dark:text-white line-clamp-2">
                                        <a href="/{{ $currentLocale }}/{{ method_exists($art, 'getLocalizedSlug') ? $art->getLocalizedSlug($currentLocale) : $art->slug }}" class="hover:text-blue-600 transition-colors">
                                            {{ localizeTextPhp($art->title, $currentLocale) }}
                                        </a>
                                    </h3>
                                    @if ($art->excerpt)
                                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                                            {{ localizeTextPhp($art->excerpt, $currentLocale) }}
                                        </p>
                                    @endif
                                </article>
                            @endforeach
                        </div>
                    </section>
                @endif
            </main>
        @endif
    </div>
</body>
</html>
