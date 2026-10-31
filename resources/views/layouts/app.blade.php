@php
    $currentUrl = url()->current();
    $currentLocale = app()->getLocale() ?: 'id';
    $baseUrl = config('app.url', url('/'));
    
    // Extraksi path tanpa prefix locale untuk generator Hreflang
    $path = request()->path();
    $cleanPath = trim(preg_replace('/^(id|en)(\/|$)/i', '', $path), '/');
    $cleanPathSegment = $cleanPath ? '/' . $cleanPath : '';

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

    // Load client translation dictionaries so SSR is 100% synchronized with CSR (React i18n)
    $localesPath = resource_path("js/locales/{$currentLocale}.json");
    $transDict = file_exists($localesPath) ? (json_decode(file_get_contents($localesPath), true) ?: []) : [];

    if (!function_exists('transKey')) {
        function transKey(array $dict, string $key, string $default = ''): string {
            $val = data_get($dict, $key, $default);
            return is_string($val) ? $val : (is_scalar($val) ? (string) $val : $default);
        }
    }

    // Dynamic SEO computation
    $isBlogPage = $isBlogPage ?? false;
    $isDiscoverPage = $isDiscoverPage ?? false;
    $isNotFound = $isNotFound ?? false;
    $itemTitle = $article ? $article->title : ($discover ? (is_array($discover->name) ? ($discover->name[$currentLocale] ?? reset($discover->name)) : $discover->name) : null);
    $itemDesc = $article ? ($article->excerpt ?: strip_tags($article->body ?? '')) : ($discover ? strip_tags(is_array($discover->short_description) ? ($discover->short_description[$currentLocale] ?? reset($discover->short_description)) : ($discover->short_description ?? '')) : null);

    if ($isNotFound) {
        $rawTitle = $currentLocale === 'en' ? 'Page Not Found (404) — ASTA Digital Agency' : 'Halaman Tidak Ditemukan (404) — ASTA Digital Agency';
        $rawDesc = $currentLocale === 'en'
            ? 'The page you are looking for could not be found or has been moved.'
            : 'Halaman yang Anda tuju tidak ditemukan atau mungkin telah dipindahkan.';
    } elseif ($isBlogPage) {
        $rawTitle = $currentLocale === 'en' ? 'Articles & Insights — ASTA Digital Agency' : 'Artikel & Wawasan — ASTA Digital Agency';
        $rawDesc = $currentLocale === 'en'
            ? 'Explore articles, guides, and insights on digital transformation, technology, and business growth from ASTA Digital Agency.'
            : 'Jelajahi kumpulan artikel, panduan, dan wawasan seputar transformasi digital, teknologi, dan pertumbuhan bisnis dari ASTA Digital Agency.';
    } elseif ($isDiscoverPage) {
        $rawTitle = $currentLocale === 'en'
            ? 'Technology Insights, Case Studies & Solutions — ASTA Digital Agency'
            : 'Semua Wawasan, Cerita & Panduan Teknologi — ASTA Digital Agency';
        $rawDesc = $currentLocale === 'en'
            ? 'Explore industry insights, digital transformation case studies, and software engineering solutions from ASTA Digital Agency.'
            : 'Jelajahi kumpulan wawasan industri, studi kasus transformasi digital, dan panduan rekayasa perangkat lunak dari para ahli di ASTA Digital Agency.';
    } else {
        $rawTitle = $seo?->title ?? ($itemTitle ? $itemTitle . ' — ASTA Digital Agency' : transKey($transDict, 'meta.title', 'ASTA Digital Agency — Solusi Teknologi & Digital Agency'));
        $rawDesc = $seo?->description ?? ($itemDesc ?: transKey($transDict, 'meta.description', 'PT Asta Digital Agency membangun aplikasi mobile, website, dan sistem informasi modern untuk instansi, UMKM, sekolah, dan perusahaan.'));
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

    $robots = $isNotFound ? 'noindex, follow' : ($seo?->robots ?? 'index, follow');
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
    $ogType = ($article || $discover) ? 'article' : ($isBlogPage ? 'blog' : ($isDiscoverPage ? 'website' : ($seo?->ogType ?? 'website')));

    $twitterTitle = localizeTextPhp($seo?->twitterTitle ?? $rawTitle, $currentLocale);
    $twitterDesc = localizeTextPhp($seo?->twitterDescription ?? $rawDesc, $currentLocale);
    $rawTwitterImage = $seo?->twitterImage;
    $twitterImage = !empty($rawTwitterImage)
        ? (str_starts_with($rawTwitterImage, 'http') ? $rawTwitterImage : asset('storage/' . ltrim($rawTwitterImage, '/')))
        : $ogImage;

    $jsonFlags = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT;
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
    @php
        $professionalServiceSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'ProfessionalService',
            'name' => 'PT Asta Digital Agency',
            'alternateName' => 'ASTA DIGITAL AGENCY',
            'url' => rtrim(config('app.url', url('/')), '/'),
            'logo' => asset('images/logo-dark.png'),
            'image' => $ogDefaultImage,
            'description' => 'ASTA DIGITAL AGENCY membangun aplikasi mobile, website, dan sistem informasi enterprise modern untuk instansi, UMKM, sekolah, dan perusahaan skala menengah hingga besar.',
            'telephone' => '+6281578223564',
            'email' => 'astadigitech@gmail.com',
            'priceRange' => '$$',
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => 'Jl. Imogiri Timur, Gng. Tobanan V, dsn. Jati Rt 008, Wonokromo, Kec. Pleret',
                'addressLocality' => 'Bantul',
                'addressRegion' => 'D.I. Yogyakarta',
                'postalCode' => '55791',
                'addressCountry' => 'ID',
            ],
            'sameAs' => [
                'https://www.instagram.com/astadigitalagency/',
                'https://www.linkedin.com/in/asta-digital-agency-b9441637a/',
            ],
        ];
    @endphp
    <script type="application/ld+json">
    {!! json_encode($professionalServiceSchema, $jsonFlags) !!}
    </script>
    @if ($article)
    @php
        $blogPostingSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'BlogPosting',
            'headline' => $metaTitle,
            'description' => $metaDesc,
            'image' => $ogImage,
            'datePublished' => $article->published_at?->toIso8601String() ?? now()->toIso8601String(),
            'dateModified' => $article->updated_at?->toIso8601String() ?? now()->toIso8601String(),
            'author' => [
                '@type' => 'Organization',
                'name' => $article->author ?: 'ASTA DIGITAL AGENCY Team',
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => 'PT Asta Digital Agency',
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => asset('images/logo-dark.png'),
                ],
            ],
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => $canonicalUrl,
            ],
        ];
    @endphp
    <script type="application/ld+json">
    {!! json_encode($blogPostingSchema, $jsonFlags) !!}
    </script>
    @if (!empty($article->faqs) && is_array($article->faqs))
    @php
        $faqSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => collect($article->faqs)->map(fn ($faqItem) => [
                '@type' => 'Question',
                'name' => localizeTextPhp($faqItem['question'] ?? '', $currentLocale),
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => strip_tags(localizeTextPhp($faqItem['answer'] ?? '', $currentLocale)),
                ],
            ])->all(),
        ];
    @endphp
    <script type="application/ld+json">
    {!! json_encode($faqSchema, $jsonFlags) !!}
    </script>
    @endif
    @if (!empty($seo?->schemaJsonld))
    <script type="application/ld+json">
    {!! is_string($seo->schemaJsonld) ? $seo->schemaJsonld : json_encode($seo->schemaJsonld, $jsonFlags) !!}
    </script>
    @endif
    @elseif ($discover)
    @php
        $discoverSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $metaTitle,
            'description' => $metaDesc,
            'image' => $ogImage,
            'datePublished' => $discover->created_at?->toIso8601String() ?? now()->toIso8601String(),
            'dateModified' => $discover->updated_at?->toIso8601String() ?? now()->toIso8601String(),
            'author' => [
                '@type' => 'Organization',
                'name' => 'ASTA DIGITAL AGENCY Team',
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => 'PT Asta Digital Agency',
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => asset('images/logo-dark.png'),
                ],
            ],
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => $canonicalUrl,
            ],
        ];
    @endphp
    <script type="application/ld+json">
    {!! json_encode($discoverSchema, $jsonFlags) !!}
    </script>
    @if (!empty($seo?->schemaJsonld))
    <script type="application/ld+json">
    {!! is_string($seo->schemaJsonld) ? $seo->schemaJsonld : json_encode($seo->schemaJsonld, $jsonFlags) !!}
    </script>
    @endif
    @elseif (!$article && !$discover && !$isBlogPage && !$isDiscoverPage && !$isNotFound)
    {{-- Global FAQPage JSON-LD untuk Homepage & SEO Bot Extraction (100% Sinkron CSR) --}}
    @php
        $homeFaqSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => [
                [
                    '@type' => 'Question',
                    'name' => transKey($transDict, 'faq.q1', 'Mengapa harus ASTA DIGITAL AGENCY?'),
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => transKey($transDict, 'faq.a1', 'ASTA DIGITAL AGENCY memiliki tim IT yang sangat kompeten, presisi, dan tepat waktu.'),
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => transKey($transDict, 'faq.q2', 'Apa Yang ASTA DIGITAL AGENCY tawarkan?'),
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => transKey($transDict, 'faq.a2', 'ASTA DIGITAL AGENCY menawarkan mahakarya digitalisasi yang eksklusif dan dirancang khusus secara orisinal untuk bisnis Anda.'),
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => transKey($transDict, 'faq.q3', 'Begaimana cara mendapatkan tim IT dedicated tanpa perlu repot melakukan rekrutment?'),
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => transKey($transDict, 'faq.a3', 'ASTA DIGITAL AGENCY menyediakan tim IT dedicated yang ahli dan siap bekerja secara eksklusif untuk proyek Anda.'),
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => transKey($transDict, 'faq.q4', 'Apakah ASTA DIGITAL AGENCY menjamin ketepatan waktu dalam setiap proyek pembuatan website'),
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => transKey($transDict, 'faq.a4', 'Pasti. Kami didukung oleh tim yang handal dengan manajemen proyek yang presisi.'),
                    ],
                ],
            ],
        ];
    @endphp
    <script type="application/ld+json">
    {!! json_encode($homeFaqSchema, $jsonFlags) !!}
    </script>
    @endif
    @if ($isBlogPage && !empty($blogArticles['data']))
    @php
        $collectionSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'CollectionPage',
            'name' => $metaTitle,
            'description' => $metaDesc,
            'url' => $canonicalUrl,
            'mainEntity' => [
                '@type' => 'ItemList',
                'itemListElement' => collect($blogArticles['data'])->values()->map(fn ($art, $idx) => [
                    '@type' => 'ListItem',
                    'position' => $idx + 1,
                    'url' => rtrim($baseUrl, '/') . '/' . $currentLocale . '/' . $art['slug'],
                    'name' => localizeTextPhp($art['title'], $currentLocale),
                ])->all(),
            ],
        ];
    @endphp
    <script type="application/ld+json">
    {!! json_encode($collectionSchema, $jsonFlags) !!}
    </script>
    @endif
    @if ($isDiscoverPage)
    @php
        $discoverFaqSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => [
                [
                    '@type' => 'Question',
                    'name' => $currentLocale === 'en' ? 'Is your organization ready to grow with ASTA DIGITAL AGENCY?' : 'Siapkah perusahaan Anda berkembang bersama ASTA DIGITAL AGENCY?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => $currentLocale === 'en' ? 'ASTA DIGITAL AGENCY partners with enterprises to build progressive technology solutions, optimizing operational workflows and delivering high production cost efficiency.' : 'ASTA DIGITAL AGENCY siap bekerjasama dengan perusahaan Anda agar lebih maju, efektif, dan berkembang. Pengerjaan sistem yang cepat memberikan dampak progresif serta efisiensi biaya operasional tinggi.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => $currentLocale === 'en' ? 'How does ASTA DIGITAL AGENCY ensure custom digital systems meet organizational goals?' : 'Bagaimana ASTA DIGITAL AGENCY memastikan hasil kustomisasi sistem sesuai dengan tujuan perusahaan?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => $currentLocale === 'en' ? 'ASTA DIGITAL AGENCY maintains full strategic alignment with clients, conducting iterative architecture reviews so that every technical specification strictly matches enterprise goals.' : 'ASTA DIGITAL AGENCY memegang teguh komitmen menjaga satu visi dengan klien melalui proses kolaboratif sehingga setiap detail arsitektur digital selaras dengan ekspektasi bisnis Anda.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => $currentLocale === 'en' ? 'Does the partnership end once the software or website is launched?' : 'Apakah kemitraan berakhir setelah pembuatan website atau sistem selesai?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => $currentLocale === 'en' ? 'No, ASTA DIGITAL AGENCY provides continuous long-term technological partnerships, ensuring systems remain secure, scalable, and up-to-date post-launch.' : 'Tidak, ASTA DIGITAL AGENCY berkomitmen membangun ekosistem digital secara berkelanjutan dan bertindak sebagai mitra teknologi jangka panjang seiring pertumbuhan skala bisnis.',
                    ],
                ],
            ],
        ];
    @endphp
    <script type="application/ld+json">
    {!! json_encode($discoverFaqSchema, $jsonFlags) !!}
    </script>
    @if (!empty($discoverItems) && $discoverItems->count() > 0)
    @php
        $discoverCollectionSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'CollectionPage',
            'name' => $metaTitle,
            'description' => $metaDesc,
            'url' => $canonicalUrl,
            'mainEntity' => [
                '@type' => 'ItemList',
                'itemListElement' => $discoverItems->values()->map(fn ($item, $idx) => [
                    '@type' => 'ListItem',
                    'position' => $idx + 1,
                    'url' => rtrim($baseUrl, '/') . '/' . $currentLocale . '/discover/' . (method_exists($item, 'getLocalizedSlug') ? $item->getLocalizedSlug($currentLocale) : ($item->slug ?: $item->id)),
                    'name' => html_entity_decode(localizeTextPhp(is_array($item->name) ? ($item->name[$currentLocale] ?? reset($item->name)) : $item->name, $currentLocale), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
                ])->all(),
            ],
        ];
    @endphp
    <script type="application/ld+json">
    {!! json_encode($discoverCollectionSchema, $jsonFlags) !!}
    </script>
    @endif
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
                <nav class="flex items-center gap-2 text-xs text-gray-500 mb-6 pb-3 border-b border-gray-200 dark:border-gray-800">
                    <a href="{{ url("/{$currentLocale}") }}" class="hover:text-blue-600">{{ $currentLocale === 'en' ? 'Home' : 'Beranda' }}</a>
                    <span>/</span>
                    <a href="{{ url("/{$currentLocale}/blog") }}" class="hover:text-blue-600">{{ $currentLocale === 'en' ? 'Articles & Insights' : 'Artikel & Wawasan' }}</a>
                    <span>/</span>
                    <span class="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-xs">{{ localizeTextPhp($article->title, $currentLocale) }}</span>
                </nav>
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

                {{-- Rekomendasi Artikel Terkait (Khusus Blog - SSR) --}}
                @if (isset($recommendedArticles) && $recommendedArticles->count() > 0)
                    <section class="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                    {{ $currentLocale === 'en' ? 'Related Articles & Insights' : 'Artikel & Rekomendasi Terkait' }}
                                </h2>
                                <p class="text-sm text-gray-500 mt-1">
                                    {{ $currentLocale === 'en' ? 'Explore more tips, strategies, and digital technology insights from ASTA Digital.' : 'Jelajahi panduan, tips, dan wawasan teknologi terbaru dari tim ahli ASTA Digital.' }}
                                </p>
                            </div>
                            <a href="{{ url("/{$currentLocale}/blog") }}" class="text-sm font-semibold text-blue-600 hover:underline">
                                {{ $currentLocale === 'en' ? 'View All Articles' : 'Lihat Semua Artikel' }} &rarr;
                            </a>
                        </div>
                        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            @foreach ($recommendedArticles as $rec)
                                @php
                                    $recSlug = method_exists($rec, 'getLocalizedSlug') ? $rec->getLocalizedSlug($currentLocale) : $rec->slug;
                                    $recThumbnail = $rec->thumbnail ? ((str_starts_with($rec->thumbnail, 'http') ? $rec->thumbnail : asset('storage/' . ltrim($rec->thumbnail, '/')))) : null;
                                @endphp
                                <a href="{{ url("/{$currentLocale}/{$recSlug}") }}" class="block rounded-2xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                                    @if ($recThumbnail)
                                        <div class="w-full aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-gray-100">
                                            <img src="{{ $recThumbnail }}" alt="{{ localizeTextPhp($rec->title, $currentLocale) }}" class="h-full w-full object-cover" />
                                        </div>
                                    @endif
                                    <div class="text-xs text-gray-400 mb-1">
                                        {{ $rec->published_at?->format('d M Y') ?? date('d M Y') }}
                                        @if ($rec->category)
                                            • <span class="font-semibold text-blue-600">{{ $rec->category }}</span>
                                        @endif
                                    </div>
                                    <h3 class="font-bold text-base text-gray-900 dark:text-white line-clamp-2 mb-2">
                                        {{ localizeTextPhp($rec->title, $currentLocale) }}
                                    </h3>
                                    @if ($rec->excerpt)
                                        <p class="text-xs text-gray-500 line-clamp-2">
                                            {{ strip_tags(localizeTextPhp($rec->excerpt, $currentLocale)) }}
                                        </p>
                                    @endif
                                </a>
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

                @if ($discover->DiscoverLists && $discover->DiscoverLists->count() > 0)
                    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <h3 class="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                            {{ $currentLocale === 'en' ? 'Key Technical Highlights & Deliverables' : 'Poin Kunci & Hasil Rekayasa Sistem' }}
                        </h3>
                        <ul class="grid sm:grid-cols-2 gap-3.5">
                            @foreach ($discover->DiscoverLists as $dl)
                                <li class="flex items-start gap-3 bg-blue-50/60 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 text-sm font-medium text-gray-800 dark:text-gray-200">
                                    <span class="text-blue-600 font-bold">•</span>
                                    <span>{{ strip_tags(localizeTextPhp($dl->description, $currentLocale)) }}</span>
                                </li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                @if (!empty($discover->content_sections) && is_array($discover->content_sections))
                    <div class="mt-10 space-y-8">
                        @foreach ($discover->content_sections as $sIdx => $sec)
                            <section class="border-t pt-6 space-y-3">
                                <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-wider">
                                    {{ $currentLocale === 'en' ? 'Part ' . ($sIdx + 1) : 'Bagian ' . ($sIdx + 1) }}
                                </span>
                                @if (!empty($sec['image']))
                                    <img src="{{ str_starts_with($sec['image'], 'http') ? $sec['image'] : asset('storage/' . ltrim($sec['image'], '/')) }}"
                                         alt="Section media"
                                         class="w-full rounded-2xl object-cover max-h-[500px]" />
                                @endif
                                @if (!empty($sec['description']))
                                    <div class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {!! localizeTextPhp($sec['description'], $currentLocale) !!}
                                    </div>
                                @endif
                            </section>
                        @endforeach
                    </div>
                @endif

                {{-- Modul FAQ Permanen Detail Solusi / Discover --}}
                <section class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <h2 class="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                        {{ $currentLocale === 'en' ? 'Frequently Asked Questions (FAQ)' : 'Pertanyaan Umum seputar Solusi Ini (FAQ)' }}
                    </h2>
                    <div class="space-y-4">
                        <div class="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/50">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                {{ $currentLocale === 'en' ? 'Can ASTA DIGITAL AGENCY build a similar customized solution for my company?' : 'Apakah ASTA DIGITAL AGENCY dapat membangun solusi serupa untuk perusahaan saya?' }}
                            </h3>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                                {{ $currentLocale === 'en'
                                    ? 'Yes, ASTA DIGITAL AGENCY develops tailor-made enterprise software, web portals, and mobile apps aligned with your specific business goals, security standards, and workflow requirements.'
                                    : 'Ya, ASTA DIGITAL AGENCY merekayasa aplikasi mobile, website modern, dan sistem informasi enterprise kustom yang disesuaikan secara presisi dengan kebutuhan alur kerja dan standar industri Anda.' }}
                            </p>
                        </div>
                    </div>
                </section>
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

                    {{-- Link Pagination SSR untuk Crawler & Pembaca --}}
                    @if (!empty($blogArticles['last_page']) && $blogArticles['last_page'] > 1)
                        @php
                            $currentPage = (int) ($blogArticles['current_page'] ?? 1);
                            $lastPage = (int) ($blogArticles['last_page'] ?? 1);
                            $prevPage = $currentPage > 1 ? $currentPage - 1 : null;
                            $nextPage = $currentPage < $lastPage ? $currentPage + 1 : null;
                        @endphp
                        <nav class="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
                            @if ($prevPage)
                                <a href="/{{ $currentLocale }}/blog?page={{ $prevPage }}"
                                   class="inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <span>←</span>
                                    <span>{{ $currentLocale === 'en' ? 'Previous' : 'Sebelumnya' }}</span>
                                </a>
                            @endif

                            <div class="flex items-center gap-1.5">
                                @for ($p = 1; $p <= $lastPage; $p++)
                                    @if ($lastPage > 7 && abs($p - $currentPage) > 2 && $p !== 1 && $p !== $lastPage)
                                        @if ($p === 2 || $p === $lastPage - 1)
                                            <span class="text-gray-400 text-xs px-1">…</span>
                                        @endif
                                    @else
                                        <a href="/{{ $currentLocale }}/blog?page={{ $p }}"
                                           class="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all {{ $p === $currentPage ? 'bg-[#004AAD] text-white shadow-xs' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800' }}">
                                            {{ $p }}
                                        </a>
                                    @endif
                                @endfor
                            </div>

                            @if ($nextPage)
                                <a href="/{{ $currentLocale }}/blog?page={{ $nextPage }}"
                                   class="inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <span>{{ $currentLocale === 'en' ? 'Next' : 'Berikutnya' }}</span>
                                    <span>→</span>
                                </a>
                            @endif
                        </nav>
                    @endif
                @endif
            </main>
        @elseif ($isDiscoverPage)
            <main class="max-w-6xl mx-auto px-4 py-16 space-y-12">
                <header class="text-center max-w-3xl mx-auto space-y-4">
                    <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest">
                        ASTA DIGITAL AGENCY · {{ $currentLocale === 'en' ? 'PORTFOLIO & TECH INNOVATION' : 'PORTOFOLIO & INOVASI TEKNOLOGI' }}
                    </span>
                    <h1 class="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                        {{ $currentLocale === 'en'
                            ? 'What technology case studies and software solutions has ASTA DIGITAL AGENCY developed?'
                            : 'Apa saja studi kasus teknologi dan inovasi perangkat lunak dari ASTA DIGITAL AGENCY?' }}
                    </h1>
                    <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        <strong>ASTA DIGITAL AGENCY</strong> {{ $currentLocale === 'en'
                            ? 'presents real-world software engineering case studies, enterprise platforms, and digital transformation insights crafted for clients across various industries.'
                            : 'menghadirkan dokumentasi rekayasa perangkat lunak, portal enterprise, aplikasi mobile, serta studi kasus transformasi digital yang terbukti memangkas waktu kerja dan meningkatkan produktivitas.' }}
                    </p>
                </header>

                @if (!empty($discoverItems) && $discoverItems->count() > 0)
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        @foreach ($discoverItems as $item)
                            @php
                                $dName = is_array($item->name) ? ($item->name[$currentLocale] ?? reset($item->name)) : $item->name;
                                $dDesc = is_array($item->short_description) ? ($item->short_description[$currentLocale] ?? reset($item->short_description)) : $item->short_description;
                                $dSlug = method_exists($item, 'getLocalizedSlug') ? $item->getLocalizedSlug($currentLocale) : ($item->slug ?: $item->id);
                                $dImg = null;
                                if (!empty($item->image)) {
                                    $first = is_array($item->image) ? ($item->image[0] ?? null) : $item->image;
                                    if ($first) {
                                        $dImg = str_starts_with($first, 'http') ? $first : asset('storage/' . ltrim($first, '/'));
                                    }
                                }
                            @endphp
                            <article class="flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                                @if ($dImg)
                                    <a href="/{{ $currentLocale }}/discover/{{ $dSlug }}" class="block aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        <img src="{{ $dImg }}" alt="{{ localizeTextPhp($dName, $currentLocale) }}" class="w-full h-full object-cover" loading="lazy" />
                                    </a>
                                @endif
                                <div class="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div class="flex items-center gap-2 mb-2">
                                            <span class="text-xs font-bold text-blue-600 uppercase">{{ $item->type ?: 'Story' }}</span>
                                            @if ($item->year)
                                                <span class="text-xs text-gray-400">• {{ $item->year }}</span>
                                            @endif
                                        </div>
                                        <h2 class="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                                            <a href="/{{ $currentLocale }}/discover/{{ $dSlug }}" class="hover:text-blue-600 transition-colors">
                                                {{ localizeTextPhp($dName, $currentLocale) }}
                                            </a>
                                        </h2>
                                        @if ($dDesc)
                                            <p class="mt-2.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                                {!! strip_tags(localizeTextPhp($dDesc, $currentLocale)) !!}
                                            </p>
                                        @endif
                                    </div>
                                    <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                        <a href="/{{ $currentLocale }}/discover/{{ $dSlug }}" class="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                                            <span>{{ $currentLocale === 'en' ? 'Read Case Study' : 'Pelajari Studi Kasus' }}</span>
                                            <span>→</span>
                                        </a>
                                    </div>
                                </div>
                            </article>
                        @endforeach
                    </div>
                @endif

                {{-- FAQ Permanen Katalog Discover untuk Bot AI & Pengunjung --}}
                <section class="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
                    <h2 class="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                        {{ $currentLocale === 'en' ? 'Frequently Asked Questions about ASTA Solutions (FAQ)' : 'Pertanyaan Umum seputar Solusi & Inovasi ASTA DIGITAL AGENCY (FAQ)' }}
                    </h2>
                    <div class="space-y-4">
                        <div class="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <h3 class="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2">
                                {{ $currentLocale === 'en' ? 'How does ASTA DIGITAL AGENCY ensure systems match organizational needs?' : 'Bagaimana ASTA DIGITAL AGENCY memastikan hasil kustomisasi sistem sesuai dengan tujuan perusahaan?' }}
                            </h3>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                                {{ $currentLocale === 'en'
                                    ? 'ASTA DIGITAL AGENCY collaborates directly with stakeholders to align system architecture with business KPIs, maintaining complete transparency throughout every milestone.'
                                    : 'ASTA DIGITAL AGENCY memegang teguh komitmen menjaga satu visi dengan klien. Seluruh proses kustomisasi dilakukan secara kolaboratif agar setiap detail arsitektur digital selaras dengan ekspektasi dan target strategis bisnis Anda.' }}
                            </p>
                        </div>
                        <div class="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <h3 class="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2">
                                {{ $currentLocale === 'en' ? 'Does partnership end once the software or platform goes live?' : 'Apakah kemitraan berakhir setelah pembuatan website atau sistem selesai?' }}
                            </h3>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                                {{ $currentLocale === 'en'
                                    ? 'No. ASTA DIGITAL AGENCY provides ongoing engineering support, uptime monitoring, and continuous iterations to ensure systems scale smoothly as your enterprise grows.'
                                    : 'Tidak. ASTA DIGITAL AGENCY memiliki komitmen membangun dan mengembangkan ekosistem digital Anda secara berkelanjutan dengan pendampingan teknis, garansi pemeliharaan, dan skalabilitas jangka panjang.' }}
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        @elseif ($isNotFound)
            {{-- Semantic Server-Side Pre-rendered Content untuk Halaman 404 --}}
            <main class="max-w-2xl mx-auto px-4 py-24 text-center">
                <div class="h-20 w-20 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                    404
                </div>
                <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {{ $currentLocale === 'en' ? 'Page Not Found' : 'Halaman Tidak Ditemukan' }}
                </h1>
                <p class="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    {{ $currentLocale === 'en'
                        ? 'The page or article you are looking for might have been moved, deleted, or is not yet published.'
                        : 'Halaman atau artikel yang Anda cari mungkin telah dipindahkan, dihapus, atau belum dipublikasikan.' }}
                </p>
                <a href="/{{ $currentLocale }}" class="inline-flex items-center gap-2 rounded-full bg-[#004AAD] text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition-all shadow-md">
                    <span>←</span>
                    <span>{{ $currentLocale === 'en' ? 'Back to Home' : 'Kembali ke Beranda' }}</span>
                </a>
            </main>
        @else
            {{-- Semantic Server-Side Pre-rendered Content untuk Homepage & Bot AI (100% Sinkron CSR) --}}
            <main class="max-w-6xl mx-auto px-4 py-12 space-y-16">
                {{-- 1. Hero Section (#top) --}}
                <header id="top" class="border-b border-gray-100 dark:border-gray-800 pb-12 space-y-6">
                    <span class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                        <span class="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                        {{ transKey($transDict, 'hero.eyebrow', 'Agensi Digital Premium · Est. 2022') }}
                    </span>

                    <h1 class="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.08]">
                        {{ transKey($transDict, 'hero.title_1', 'Membangun ') }}
                        <span class="text-blue-600 underline decoration-blue-400 decoration-wavy decoration-2 underline-offset-8">
                            {{ transKey($transDict, 'hero.title_highlight', 'pengalaman digital') }}
                        </span>
                        {{ transKey($transDict, 'hero.title_2', ' terbaik untuk bisnis modern.') }}
                    </h1>

                    <p class="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-normal max-w-4xl">
                        {{ transKey($transDict, 'hero.description') }}
                    </p>

                    <div class="flex flex-wrap items-center gap-3 pt-2">
                        <a href="#kontak" class="inline-flex items-center gap-2 rounded-full bg-[#004AAD] text-white px-6 py-3 text-sm font-semibold shadow-md hover:opacity-95 transition-all">
                            {{ transKey($transDict, 'hero.cta_start', 'Mulai Proyek') }}
                            <span>→</span>
                        </a>
                        <a href="#portofolio" class="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            {{ transKey($transDict, 'hero.cta_portfolio', 'Lihat Portofolio') }}
                        </a>
                    </div>

                    <div class="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                        <span class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 px-3 py-1.5">
                            <span class="text-emerald-500">🛡</span> {{ transKey($transDict, 'hero.trust_security', 'Keamanan Siap terjamin') }}
                        </span>
                        <span class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 px-3 py-1.5">
                            <span class="text-amber-500">🏆</span> {{ transKey($transDict, 'hero.trust_award', 'Kualitas Penghargaan') }}
                        </span>
                        <span class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 px-3 py-1.5">
                            <span class="text-blue-500">⚡</span> {{ transKey($transDict, 'hero.trust_fast', 'Fast & Scalable') }}
                        </span>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <div class="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                            <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">20+</div>
                            <div class="text-xs uppercase tracking-wider text-gray-500 mt-1">{{ transKey($transDict, 'hero.stat_projects', 'PROYEK') }}</div>
                        </div>
                        <div class="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                            <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">8+</div>
                            <div class="text-xs uppercase tracking-wider text-gray-500 mt-1">{{ transKey($transDict, 'hero.stat_clients', 'KLIEN') }}</div>
                        </div>
                        <div class="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                            <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">4+</div>
                            <div class="text-xs uppercase tracking-wider text-gray-500 mt-1">{{ transKey($transDict, 'hero.stat_years', 'TAHUN') }}</div>
                        </div>
                        <div class="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                            <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">98%</div>
                            <div class="text-xs uppercase tracking-wider text-gray-500 mt-1">{{ transKey($transDict, 'hero.stat_satisfaction', 'KEPUASAN') }}</div>
                        </div>
                    </div>
                </header>

                {{-- 2. Section Tentang ASTA (#tentang) --}}
                <section id="tentang" class="space-y-8 pt-4 border-b border-gray-100 dark:border-gray-800 pb-12">
                    <div>
                        <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                            {{ transKey($transDict, 'about.eyebrow', 'Profil Entitas & Rekayasa') }}
                        </span>
                        <h2 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            {{ transKey($transDict, 'about.title') }}
                        </h2>
                        <p class="mt-2 text-gray-600 dark:text-gray-400 max-w-4xl leading-relaxed">
                            {{ transKey($transDict, 'about.description') }}
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                                {{ transKey($transDict, 'about.vision_title') }}
                            </h3>
                            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {{ transKey($transDict, 'about.vision_desc') }}
                            </p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                                {{ transKey($transDict, 'about.mission_title') }}
                            </h3>
                            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {{ transKey($transDict, 'about.mission_desc') }}
                            </p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40">
                            <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-1">{{ transKey($transDict, 'about.val_1_title') }}</h4>
                            <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'about.val_1_desc') }}</p>
                        </div>
                        <div class="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40">
                            <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-1">{{ transKey($transDict, 'about.val_2_title') }}</h4>
                            <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'about.val_2_desc') }}</p>
                        </div>
                        <div class="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40">
                            <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-1">{{ transKey($transDict, 'about.val_3_title') }}</h4>
                            <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'about.val_3_desc') }}</p>
                        </div>
                        <div class="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40">
                            <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-1">{{ transKey($transDict, 'about.val_4_title') }}</h4>
                            <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'about.val_4_desc') }}</p>
                        </div>
                    </div>
                </section>

                {{-- 3. Section Layanan Utama (#layanan) --}}
                <section id="layanan" class="space-y-8 pt-4 border-b border-gray-100 dark:border-gray-800 pb-12">
                    <div>
                        <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                            {{ transKey($transDict, 'services.eyebrow', 'Solusi & Layanan Teknologi') }}
                        </span>
                        <h2 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            {{ transKey($transDict, 'services.title') }}
                        </h2>
                        <p class="mt-2 text-gray-600 dark:text-gray-400 max-w-4xl leading-relaxed">
                            {{ transKey($transDict, 'services.description') }}
                        </p>
                    </div>

                    @if (!empty($homeServices) && $homeServices->count() > 0)
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            @foreach ($homeServices as $svc)
                                <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-shadow">
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                        {{ localizeTextPhp($svc->name, $currentLocale) }}
                                    </h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                        {!! strip_tags(localizeTextPhp($svc->short_description ?: $svc->description, $currentLocale)) !!}
                                    </p>
                                    @if ($svc->serviceListMains && $svc->serviceListMains->count() > 0)
                                        <ul class="text-xs space-y-1.5 text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3">
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
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ transKey($transDict, 'services.default_web_title', 'Web Apps Development') }}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'services.default_web_desc', 'Aplikasi berbasis web modern, cepat & responsif.') }}</p>
                            </div>
                            <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ transKey($transDict, 'services.default_mobile_title', 'Mobile Apps Development') }}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'services.default_mobile_desc', 'Aplikasi Android & iOS performa tinggi.') }}</p>
                            </div>
                            <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ transKey($transDict, 'services.default_it_title', 'Layanan IT & Konsultasi') }}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'services.default_it_desc', 'Dukungan IT dan konsultasi arsitektur sistem.') }}</p>
                            </div>
                        </div>
                    @endif
                </section>

                {{-- 4. Section Komparasi Metode (#komparasi) --}}
                <section id="komparasi" class="space-y-8 pt-4 border-b border-gray-100 dark:border-gray-800 pb-12">
                    <div>
                        <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                            {{ transKey($transDict, 'comparison.eyebrow', 'TOLOK UKUR STANDAR') }}
                        </span>
                        <h2 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            {{ transKey($transDict, 'comparison.title') }}
                        </h2>
                        <p class="mt-2 text-gray-600 dark:text-gray-400 max-w-4xl leading-relaxed">
                            {{ transKey($transDict, 'comparison.description') }}
                        </p>
                    </div>

                    <div class="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-gray-50/50 dark:bg-gray-900/50">
                        <table class="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr class="border-b border-gray-200 dark:border-gray-700">
                                    <th class="py-3 px-4 font-bold text-gray-900 dark:text-white">{{ transKey($transDict, 'comparison.col_parameter', 'Parameter Evaluasi') }}</th>
                                    <th class="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{{ transKey($transDict, 'comparison.col_asta', 'Metode ASTA DIGITAL AGENCY') }}</th>
                                    <th class="py-3 px-4 font-bold text-gray-500">{{ transKey($transDict, 'comparison.col_traditional', 'Metode Tradisional') }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                                <tr>
                                    <td class="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">{{ transKey($transDict, 'comparison.row_1_param') }}</td>
                                    <td class="py-3 px-4 text-gray-800 dark:text-gray-300">{{ transKey($transDict, 'comparison.row_1_asta') }}</td>
                                    <td class="py-3 px-4 text-gray-500">{{ transKey($transDict, 'comparison.row_1_traditional') }}</td>
                                </tr>
                                <tr>
                                    <td class="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">{{ transKey($transDict, 'comparison.row_2_param') }}</td>
                                    <td class="py-3 px-4 text-gray-800 dark:text-gray-300">{{ transKey($transDict, 'comparison.row_2_asta') }}</td>
                                    <td class="py-3 px-4 text-gray-500">{{ transKey($transDict, 'comparison.row_2_traditional') }}</td>
                                </tr>
                                <tr>
                                    <td class="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">{{ transKey($transDict, 'comparison.row_3_param') }}</td>
                                    <td class="py-3 px-4 text-gray-800 dark:text-gray-300">{{ transKey($transDict, 'comparison.row_3_asta') }}</td>
                                    <td class="py-3 px-4 text-gray-500">{{ transKey($transDict, 'comparison.row_3_traditional') }}</td>
                                </tr>
                                <tr>
                                    <td class="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">{{ transKey($transDict, 'comparison.row_4_param') }}</td>
                                    <td class="py-3 px-4 text-gray-800 dark:text-gray-300">{{ transKey($transDict, 'comparison.row_4_asta') }}</td>
                                    <td class="py-3 px-4 text-gray-500">{{ transKey($transDict, 'comparison.row_4_traditional') }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {{-- 5. Section Portofolio (#portofolio) --}}
                @if (!empty($homePortfolios) && $homePortfolios->count() > 0)
                    <section id="portofolio" class="space-y-8 pt-4 border-b border-gray-100 dark:border-gray-800 pb-12">
                        <div>
                            <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                                {{ transKey($transDict, 'portfolio.eyebrow', 'Studi Kasus & Rekam Jejak') }}
                            </span>
                            <h2 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                {{ transKey($transDict, 'portfolio.title') }}
                            </h2>
                            <p class="mt-2 text-gray-600 dark:text-gray-400 max-w-4xl leading-relaxed">
                                {{ transKey($transDict, 'portfolio.description') }}
                            </p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            @foreach ($homePortfolios as $pf)
                                <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-shadow">
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="text-xs font-bold text-blue-600 uppercase">{{ $pf->type === 'mobile' ? transKey($transDict, 'portfolio.tab_mobile', 'Mobile Apps') : transKey($transDict, 'portfolio.tab_desktop', 'Desktop & Web') }}</span>
                                    </div>
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {{ localizeTextPhp($pf->name, $currentLocale) }}
                                    </h3>
                                    @if ($pf->description)
                                        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {!! strip_tags(localizeTextPhp($pf->description, $currentLocale)) !!}
                                        </p>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </section>
                @endif

                {{-- 6. Section Discover / Studi Kasus (#discover) --}}
                @php
                    $homeDiscovers = $homeDiscovers ?? collect();
                @endphp
                @if (!empty($homeDiscovers) && $homeDiscovers->count() > 0)
                    <section id="discover" class="space-y-8 pt-4 border-b border-gray-100 dark:border-gray-800 pb-12">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                                    {{ transKey($transDict, 'discover.eyebrow', 'Temukan & Wawasan') }}
                                </span>
                                <h2 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                    {{ transKey($transDict, 'discover.title') }}
                                </h2>
                                <p class="mt-2 text-gray-600 dark:text-gray-400 max-w-4xl leading-relaxed">
                                    {{ transKey($transDict, 'discover.description') }}
                                </p>
                            </div>
                            <a href="/{{ $currentLocale }}/discover" class="hidden sm:inline-block text-sm font-semibold text-blue-600 hover:underline shrink-0">
                                {{ $currentLocale === 'en' ? 'View All →' : 'Lihat Semua →' }}
                            </a>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            @foreach ($homeDiscovers as $item)
                                @php
                                    $dName = is_array($item->name) ? ($item->name[$currentLocale] ?? reset($item->name)) : $item->name;
                                    $dDesc = is_array($item->short_description) ? ($item->short_description[$currentLocale] ?? reset($item->short_description)) : $item->short_description;
                                    $dSlug = method_exists($item, 'getLocalizedSlug') ? $item->getLocalizedSlug($currentLocale) : ($item->slug ?: $item->id);
                                    $dImg = null;
                                    if (!empty($item->image)) {
                                        $first = is_array($item->image) ? ($item->image[0] ?? null) : $item->image;
                                        if ($first) {
                                            $dImg = str_starts_with($first, 'http') ? $first : asset('storage/' . ltrim($first, '/'));
                                        }
                                    }
                                @endphp
                                <article class="flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                                    @if ($dImg)
                                        <a href="/{{ $currentLocale }}/discover/{{ $dSlug }}" class="block aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            <img src="{{ $dImg }}" alt="{{ localizeTextPhp($dName, $currentLocale) }}" class="w-full h-full object-cover" loading="lazy" />
                                        </a>
                                    @endif
                                    <div class="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div class="flex items-center gap-2 mb-2">
                                                <span class="text-xs font-bold text-blue-600 uppercase">{{ $item->type ?: 'Story' }}</span>
                                                @if ($item->year)
                                                    <span class="text-xs text-gray-400">• {{ $item->year }}</span>
                                                @endif
                                            </div>
                                            <h3 class="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                                                <a href="/{{ $currentLocale }}/discover/{{ $dSlug }}" class="hover:text-blue-600 transition-colors">
                                                    {{ localizeTextPhp($dName, $currentLocale) }}
                                                </a>
                                            </h3>
                                            @if ($dDesc)
                                                <p class="mt-2.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                                    {!! strip_tags(localizeTextPhp($dDesc, $currentLocale)) !!}
                                                </p>
                                            @endif
                                        </div>
                                        <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                            <a href="/{{ $currentLocale }}/discover/{{ $dSlug }}" class="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                                                <span>{{ $currentLocale === 'en' ? 'Read Story' : 'Pelajari Selengkapnya' }}</span>
                                                <span>→</span>
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            @endforeach
                        </div>
                    </section>
                @endif

                {{-- 7. Section Mengapa Kami (Why Us) --}}
                <section class="space-y-8 pt-4 border-b border-gray-100 dark:border-gray-800 pb-12">
                    <div>
                        <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                            {{ transKey($transDict, 'why_us.eyebrow', 'Mengapa Kami') }}
                        </span>
                        <h2 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            {{ transKey($transDict, 'why_us.title') }}
                        </h2>
                        <p class="mt-2 text-gray-600 dark:text-gray-400 max-w-4xl leading-relaxed">
                            {{ transKey($transDict, 'why_us.description') }}
                        </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <h3 class="font-bold text-base text-gray-900 dark:text-white mb-2">{{ transKey($transDict, 'why_us.reason_1_title') }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'why_us.reason_1_desc') }}</p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <h3 class="font-bold text-base text-gray-900 dark:text-white mb-2">{{ transKey($transDict, 'why_us.reason_2_title') }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'why_us.reason_2_desc') }}</p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <h3 class="font-bold text-base text-gray-900 dark:text-white mb-2">{{ transKey($transDict, 'why_us.reason_3_title') }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'why_us.reason_3_desc') }}</p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <h3 class="font-bold text-base text-gray-900 dark:text-white mb-2">{{ transKey($transDict, 'why_us.reason_4_title') }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'why_us.reason_4_desc') }}</p>
                        </div>
                    </div>
                </section>

                {{-- 8. Section Proses Kerja (#proses) --}}
                <section id="proses" class="space-y-8 pt-4 border-b border-gray-100 dark:border-gray-800 pb-12">
                    <div>
                        <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                            {{ transKey($transDict, 'process.eyebrow', 'Proses Kerja') }}
                        </span>
                        <h2 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            {{ transKey($transDict, 'process.title') }}
                        </h2>
                        <p class="mt-2 text-gray-600 dark:text-gray-400 max-w-4xl leading-relaxed">
                            {{ transKey($transDict, 'process.description') }}
                        </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <span class="text-xs font-bold text-blue-600 uppercase">01</span>
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mt-1 mb-2">{{ transKey($transDict, 'process.step_1_title') }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'process.step_1_desc') }}</p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <span class="text-xs font-bold text-blue-600 uppercase">02</span>
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mt-1 mb-2">{{ transKey($transDict, 'process.step_2_title') }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'process.step_2_desc') }}</p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <span class="text-xs font-bold text-blue-600 uppercase">03</span>
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mt-1 mb-2">{{ transKey($transDict, 'process.step_3_title') }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'process.step_3_desc') }}</p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <span class="text-xs font-bold text-blue-600 uppercase">04</span>
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mt-1 mb-2">{{ transKey($transDict, 'process.step_4_title') }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'process.step_4_desc') }}</p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <span class="text-xs font-bold text-blue-600 uppercase">05</span>
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mt-1 mb-2">{{ transKey($transDict, 'process.step_5_title') }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'process.step_5_desc') }}</p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <span class="text-xs font-bold text-blue-600 uppercase">06</span>
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mt-1 mb-2">{{ transKey($transDict, 'process.step_6_title') }}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ transKey($transDict, 'process.step_6_desc') }}</p>
                        </div>
                    </div>
                </section>

                {{-- 9. Section Blog / Wawasan (#blog) --}}
                @if (!empty($homeArticles) && $homeArticles->count() > 0)
                    <section id="blog" class="space-y-6 pt-4 border-b border-gray-100 dark:border-gray-800 pb-12">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                                    {{ transKey($transDict, 'blog.eyebrow', 'Wawasan & Edukasi') }}
                                </span>
                                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                    {{ transKey($transDict, 'blog.title') }}
                                </h2>
                                <p class="mt-2 text-gray-600 dark:text-gray-400 max-w-4xl leading-relaxed">
                                    {{ transKey($transDict, 'blog.description') }}
                                </p>
                            </div>
                            <a href="/{{ $currentLocale }}/blog" class="text-sm font-semibold text-blue-600 hover:underline shrink-0">
                                {{ transKey($transDict, 'blog.view_all', 'Lihat Semua Artikel') }} →
                            </a>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            @foreach ($homeArticles as $art)
                                <article class="p-5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-shadow">
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

                {{-- 10. Section Testimoni --}}
                <section class="space-y-4 pt-4 border-b border-gray-100 dark:border-gray-800 pb-12 text-center max-w-3xl mx-auto">
                    <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest">
                        {{ transKey($transDict, 'testimonials.eyebrow', 'Testimoni') }}
                    </span>
                    <h2 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        {{ transKey($transDict, 'testimonials.title') }}
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {{ transKey($transDict, 'testimonials.description') }}
                    </p>
                </section>

                {{-- 11. Section FAQ (#faq) --}}
                <section id="faq" class="space-y-6 pt-4 border-b border-gray-100 dark:border-gray-800 pb-12">
                    <div>
                        <span class="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                            {{ transKey($transDict, 'faq.eyebrow', 'PERTANYAAN UMUM') }}
                        </span>
                        <h2 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            {{ transKey($transDict, 'faq.title') }}
                        </h2>
                        <p class="mt-2 text-gray-600 dark:text-gray-400 max-w-4xl leading-relaxed">
                            {{ transKey($transDict, 'faq.description') }}
                        </p>
                    </div>

                    <div class="space-y-4">
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                {{ transKey($transDict, 'faq.q1', 'Mengapa harus ASTA DIGITAL AGENCY?') }}
                            </h3>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                {{ transKey($transDict, 'faq.a1') }}
                            </p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                {{ transKey($transDict, 'faq.q2', 'Apa Yang ASTA DIGITAL AGENCY tawarkan?') }}
                            </h3>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                {{ transKey($transDict, 'faq.a2') }}
                            </p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                {{ transKey($transDict, 'faq.q3', 'Begaimana cara mendapatkan tim IT dedicated tanpa perlu repot melakukan rekrutment?') }}
                            </h3>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                {{ transKey($transDict, 'faq.a3') }}
                            </p>
                        </div>
                        <div class="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                {{ transKey($transDict, 'faq.q4', 'Apakah ASTA DIGITAL AGENCY menjamin ketepatan waktu dalam setiap proyek pembuatan website') }}
                            </h3>
                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                {{ transKey($transDict, 'faq.a4') }}
                            </p>
                        </div>
                    </div>
                </section>

                {{-- 12. Section CTA --}}
                <section class="p-8 md:p-12 rounded-3xl bg-[#004AAD] text-white text-center space-y-4 shadow-xl">
                    <h2 class="text-2xl md:text-4xl font-bold">
                        {{ transKey($transDict, 'cta.title') }}
                    </h2>
                    <p class="text-base md:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        {{ transKey($transDict, 'cta.description') }}
                    </p>
                    <div class="pt-2">
                        <a href="#kontak" class="inline-flex items-center gap-2 rounded-full bg-white text-[#004AAD] px-8 py-3.5 text-sm font-bold shadow-lg hover:bg-blue-50 transition-colors">
                            {{ transKey($transDict, 'cta.button', 'Jadwalkan Konsultasi Gratis') }}
                        </a>
                    </div>
                </section>

                {{-- 13. Section Kontak & Footer (#kontak) --}}
                <footer id="kontak" class="pt-4 space-y-8 text-sm text-gray-600 dark:text-gray-400">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div class="space-y-3">
                            <span class="text-lg font-bold text-gray-900 dark:text-white">ASTA DIGITAL AGENCY</span>
                            <p class="text-xs leading-relaxed">
                                {{ transKey($transDict, 'footer.description') }}
                            </p>
                        </div>
                        <div class="space-y-2">
                            <span class="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{{ transKey($transDict, 'footer.office_title', 'Alamat Kantor') }}</span>
                            <p class="text-xs leading-relaxed">
                                {{ transKey($transDict, 'contact.info_office_address') }}
                            </p>
                        </div>
                        <div class="space-y-2">
                            <span class="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{{ transKey($transDict, 'footer.contact_title', 'Hubungi Kami') }}</span>
                            <p class="text-xs">Email: <a href="mailto:{{ transKey($transDict, 'contact.info_email', 'halo@astadigital.id') }}" class="text-blue-600 hover:underline">halo@astadigital.id</a></p>
                            <p class="text-xs">Phone: +62 812-3456-7890</p>
                        </div>
                        <div class="space-y-2">
                            <span class="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{{ transKey($transDict, 'footer.hours_title', 'Jam Kerja') }}</span>
                            <p class="text-xs">{{ transKey($transDict, 'footer.hours_weekdays', 'Senin - Jumat: 08:00 - 17:00') }}</p>
                        </div>
                    </div>
                    <div class="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
                        <p>{{ transKey($transDict, 'footer.copyright', '© Copyright 2025 PT Asta Digital Agency') }}</p>
                        <p class="text-gray-400">Software House & IT Consultant Indonesia</p>
                    </div>
                </footer>
            </main>
        @endif
    </div>
</body>
</html>
