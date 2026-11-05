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
    } elseif ($isHomePage ?? false) {
        $rawTitle = transKey($transDict, 'meta.title', 'ASTA Digital Agency — Solusi Teknologi & Digital Agency');
        $rawDesc = transKey($transDict, 'meta.description', 'ASTA Digital Agency membangun website, aplikasi mobile, dan sistem informasi custom untuk UMKM dan perusahaan.');
    } else {
        $rawTitle = $seo?->title ?? ($itemTitle ? $itemTitle . ' — ASTA Digital Agency' : transKey($transDict, 'meta.title', 'ASTA Digital Agency — Solusi Teknologi & Digital Agency'));
        $rawDesc = $seo?->description ?? ($itemDesc ?: transKey($transDict, 'meta.description', 'PT Asta Digital Agency membangun aplikasi mobile, website, dan sistem informasi modern untuk instansi, UMKM, sekolah, dan perusahaan.'));
    }

    // html_entity_decode mencegah double-escape &amp;amp; saat Blade merender {{ }}
    $parsedTitle = localizeTextPhp($rawTitle, $currentLocale);
    if ($currentLocale === 'en' && ($discover || $article)) {
        $idTitle = localizeTextPhp($rawTitle, 'id');
        if ($parsedTitle === $idTitle && !str_contains($parsedTitle, 'Case Study') && !str_contains($parsedTitle, 'Insights')) {
            $parsedTitle .= ($discover ? ' — Case Study' : ' — Insights');
        }
    }
    $metaTitle = html_entity_decode($parsedTitle, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $metaDesc = \App\Support\ContentSanitizer::resolveLocalizedDescription($rawDesc, $currentLocale, $itemTitle, $discover ? 'discover' : ($article ? 'article' : 'page'));

    $homepageSourceFiles = [
        resource_path('views/layouts/app.blade.php'),
        $localesPath,
    ];
    $homepageSourceModifiedAt = collect($homepageSourceFiles)
        ->filter(fn ($file) => is_file($file))
        ->map(fn ($file) => filemtime($file))
        ->max() ?? time();
    $homepageDataModifiedAt = collect([$homeServices, $homeArticles, $homePortfolios, $homeDiscovers])
        ->filter()
        ->flatMap(fn ($items) => collect($items))
        ->pluck('updated_at')
        ->filter()
        ->max();
    $homepageModifiedAt = \Illuminate\Support\Carbon::createFromTimestamp(max(
        $homepageSourceModifiedAt,
        $homepageDataModifiedAt?->timestamp ?? 0,
    ));
    $robotImageHash = '';
    $robotImagePath = resource_path('js/assets/Hero/Robot.webp');
    if (($isHomePage ?? false) && is_file($robotImagePath)) {
        $robotImageHash = substr(hash_file('sha256', $robotImagePath), 0, 12);
    }
    $robotImageBase = '/images/optimized/Hero/Robot-webp';

    $keywords = 'asta digital agency, jasa pembuatan website, pengembangan aplikasi mobile, sistem informasi custom, software house indonesia, digital agency indonesia';
    if ($seo && !empty($seo->focusKeywords)) {
        $kwList = collect($seo->focusKeywords)->map(fn ($k) => is_array($k) ? ($k['keyword'] ?? '') : (is_object($k) ? ($k->keyword ?? '') : (string) $k))->filter()->implode(', ');
        if ($kwList) {
            $keywords = localizeTextPhp($kwList, $currentLocale);
        }
    }

    $robots = $isNotFound ? 'noindex, follow' : ($seo?->robots ?? 'index, follow');
    $canonicalUrl = $seo?->canonical ?: (($isHomePage ?? false) ? ($currentLocale === 'en' ? $enUrl : $idUrl) : $currentUrl);

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

    $ogTitle = $seo?->ogTitle ? html_entity_decode(localizeTextPhp($seo->ogTitle, $currentLocale), ENT_QUOTES | ENT_HTML5, 'UTF-8') : $metaTitle;
    $ogDesc = $seo?->ogDescription ? \App\Support\ContentSanitizer::resolveLocalizedDescription($seo->ogDescription, $currentLocale, $itemTitle, $discover ? 'discover' : ($article ? 'article' : 'page')) : $metaDesc;

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

    $twitterTitle = $seo?->twitterTitle ? html_entity_decode(localizeTextPhp($seo->twitterTitle, $currentLocale), ENT_QUOTES | ENT_HTML5, 'UTF-8') : $metaTitle;
    $twitterDesc = $seo?->twitterDescription ? \App\Support\ContentSanitizer::resolveLocalizedDescription($seo->twitterDescription, $currentLocale, $itemTitle, $discover ? 'discover' : ($article ? 'article' : 'page')) : $metaDesc;
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
    <link rel="alternate" type="text/plain" href="{{ asset('llms.txt') }}" title="LLM information">

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="{{ $ogType }}">
    <meta property="og:url" content="{{ $canonicalUrl }}">
    <meta property="og:site_name" content="Asta Digital Agency">
    <meta property="og:title" content="{{ $ogTitle }}">
    <meta property="og:description" content="{{ $ogDesc }}">
    <meta property="og:image" content="{{ $ogImage }}">
    <meta property="og:locale" content="{{ $currentLocale == 'id' ? 'id_ID' : 'en_US' }}">
    <meta property="og:locale:alternate" content="{{ $currentLocale == 'id' ? 'en_US' : 'id_ID' }}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@astadigitalagency">
    <meta name="twitter:creator" content="@astadigitalagency">
    <meta name="twitter:url" content="{{ $canonicalUrl }}">
    <meta name="twitter:title" content="{{ $twitterTitle }}">
    <meta name="twitter:description" content="{{ $twitterDesc }}">
    <meta name="twitter:image" content="{{ $twitterImage }}">

    <!-- Structured Data (JSON-LD) -->
    @php
        $agencySocialLinks = collect(config('services.agency.social_links', []))
            ->filter(fn ($url) => is_string($url) && $url !== '')
            ->all();
        $agencyLatitude = config('services.agency.latitude');
        $agencyLongitude = config('services.agency.longitude');
        $professionalServiceSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'ProfessionalService',
            'name' => 'PT Asta Digital Agency',
            'alternateName' => 'ASTA DIGITAL AGENCY',
            'url' => rtrim(config('app.url', url('/')), '/'),
            'logo' => asset('images/logo-dark.png'),
            'image' => $ogDefaultImage,
            'description' => $currentLocale === 'en'
                ? 'ASTA Digital Agency provides website development, mobile apps, and custom information systems for SMEs and organizations in Yogyakarta, Indonesia.'
                : 'ASTA Digital Agency menyediakan jasa pembuatan website, aplikasi mobile, dan sistem informasi custom untuk UMKM dan perusahaan di Yogyakarta.',
            'telephone' => '+6281578223564',
            'email' => 'cs@astadigitalagency.com',
            'priceRange' => '$$',
            'foundingDate' => '2022',
            'areaServed' => [
                ['@type' => 'City', 'name' => 'Yogyakarta'],
                ['@type' => 'Country', 'name' => 'Indonesia'],
            ],
            'openingHoursSpecification' => [
                [
                    '@type' => 'OpeningHoursSpecification',
                    'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    'opens' => '08:00',
                    'closes' => '17:00',
                ],
            ],
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => 'Jl. Imogiri Timur, Gng. Tobanan V, dsn. Jati Rt 008, Wonokromo, Kec. Pleret',
                'addressLocality' => 'Bantul',
                'addressRegion' => 'D.I. Yogyakarta',
                'postalCode' => '55791',
                'addressCountry' => 'ID',
            ],
            'sameAs' => array_values(array_filter(array_merge([
                'https://www.instagram.com/astadigitalagency/',
                'https://www.linkedin.com/company/asta-digital-agency/',
                'https://share.google/mde5DANqT5rDfNKfO',
            ], $agencySocialLinks))),
        ];
        if (is_numeric($agencyLatitude) && is_numeric($agencyLongitude)) {
            $professionalServiceSchema['geo'] = [
                '@type' => 'GeoCoordinates',
                'latitude' => (float) $agencyLatitude,
                'longitude' => (float) $agencyLongitude,
            ];
        }
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
            'datePublished' => $article->published_at?->toIso8601String(),
            'dateModified' => $article->updated_at?->toIso8601String(),
            'inLanguage' => $currentLocale,
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
        $blogPostingSchema = array_filter($blogPostingSchema, fn ($value) => $value !== null);
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
            'datePublished' => $discover->created_at?->toIso8601String(),
            'dateModified' => $discover->updated_at?->toIso8601String(),
            'inLanguage' => $currentLocale,
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
        $discoverSchema = array_filter($discoverSchema, fn ($value) => $value !== null);
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
    @php
        $homepageSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => 'ASTA Digital Agency',
            'url' => rtrim(config('app.url', url('/')), '/'),
            'dateModified' => $homepageModifiedAt->toIso8601String(),
            'inLanguage' => $currentLocale,
        ];
        $homepagePageSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'WebPage',
            'name' => $metaTitle,
            'url' => $canonicalUrl,
            'dateModified' => $homepageModifiedAt->toIso8601String(),
            'inLanguage' => $currentLocale,
        ];
    @endphp
    <script type="application/ld+json">
    {!! json_encode($homepageSchema, $jsonFlags) !!}
    </script>
    <script type="application/ld+json">
    {!! json_encode($homepagePageSchema, $jsonFlags) !!}
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
                        'text' => $currentLocale === 'en' ? 'ASTA DIGITAL AGENCY discusses project goals, operational workflows, and constraints with clients before preparing a proposal and scope of work.' : 'ASTA DIGITAL AGENCY membahas tujuan proyek, alur kerja, dan batasan bersama klien sebelum menyiapkan penawaran serta ruang lingkup kerja.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => $currentLocale === 'en' ? 'How does ASTA DIGITAL AGENCY ensure custom digital systems meet organizational goals?' : 'Bagaimana ASTA DIGITAL AGENCY memastikan hasil kustomisasi sistem sesuai dengan tujuan perusahaan?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => $currentLocale === 'en' ? 'Project requirements and technical choices are reviewed with stakeholders so the agreed scope reflects the organization’s goals.' : 'Kebutuhan proyek dan pilihan teknis dibahas bersama pemangku kepentingan agar ruang lingkup yang disepakati mencerminkan tujuan organisasi.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => $currentLocale === 'en' ? 'Does the partnership end once the software or website is launched?' : 'Apakah kemitraan berakhir setelah pembuatan website atau sistem selesai?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => $currentLocale === 'en' ? 'Post-launch maintenance and support can be discussed and included in the proposal or service agreement.' : 'Pemeliharaan dan dukungan setelah peluncuran dapat dibahas dan dicantumkan dalam penawaran atau perjanjian layanan.',
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
    @if ($isHomePage ?? false)
        <link rel="preload" as="image"
              href="{{ $robotImageBase }}-640.avif?v={{ $robotImageHash }}"
              imagesrcset="{{ $robotImageBase }}-320.avif?v={{ $robotImageHash }} 320w, {{ $robotImageBase }}-480.avif?v={{ $robotImageHash }} 480w, {{ $robotImageBase }}-640.avif?v={{ $robotImageHash }} 640w, {{ $robotImageBase }}-954.avif?v={{ $robotImageHash }} 954w"
              imagesizes="(min-width: 1280px) 40vw, (min-width: 640px) 50vw, 100vw"
              type="image/avif"
              fetchpriority="high">
    @endif
    @php
        $gaId = config('services.google.analytics_id');
    @endphp
    @if (!empty($gaId))
    <!-- Google tag (gtag.js) -->
    <script defer src="https://www.googletagmanager.com/gtag/js?id={{ $gaId }}"></script>
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
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@500;700&display=optional" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap"></noscript>
    {{-- Initial Data Inlining untuk 0ms Data Fetching di React SPA --}}
    @php
        $clientInitialData = array_merge($initialData ?? ['locale' => $currentLocale], [
            'homepageModifiedAt' => $homepageModifiedAt->toDateString(),
            'socialLinks' => $agencySocialLinks ?? [],
            'agencyGeo' => isset($agencyLatitude, $agencyLongitude) && is_numeric($agencyLatitude) && is_numeric($agencyLongitude)
                ? ['latitude' => (float) $agencyLatitude, 'longitude' => (float) $agencyLongitude]
                : null,
        ]);
    @endphp
    <script>
        window.__INITIAL_DATA__ = @json($clientInitialData);
    </script>
    <style>
        *,*::before,*::after{box-sizing:border-box}
        html{-webkit-text-size-adjust:100%;text-size-adjust:100%;overflow-x:hidden}
        body{margin:0;min-width:320px;min-height:100vh;overflow-x:hidden;background:#f7fbff;color:#0b1f33;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
        #react-app{min-height:100vh;overflow-x:hidden}
        h1,h2,h3,p{margin-top:0}
    </style>
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
                        <img src="{{ \App\Support\OptimizedImage::url($article->thumbnail, 'article-thumb') }}"
                             alt="{{ localizeTextPhp($article->title, $currentLocale) }}"
                             {!! \App\Support\OptimizedImage::htmlAttributes('article-thumb') !!}
                             fetchpriority="high"
                             decoding="async"
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
                    <!--email_off-->
                    {!! \App\Support\ContentSanitizer::cleanArticleHtml(localizeTextPhp($article->body, $currentLocale), $article->title) !!}
                    <!--email_on-->
                </div>

                @if (!empty($article->content_sections) && is_array($article->content_sections))
                    <div class="mt-10 space-y-8">
                        @foreach ($article->content_sections as $sec)
                            <div class="border-t pt-6">
                                @if (!empty($sec['image']))
                                    <img src="{{ \App\Support\OptimizedImage::url($sec['image'], 'article-image') }}"
                                         alt="{{ localizeTextPhp($article->title, $currentLocale) }}"
                                         {!! \App\Support\OptimizedImage::htmlAttributes('article-image') !!}
                                         loading="lazy"
                                         decoding="async"
                                         class="w-full rounded-xl object-cover my-4" />
                                @endif
                                @if (!empty($sec['description']))
                                    <div class="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {!! \App\Support\ContentSanitizer::cleanArticleHtml(localizeTextPhp($sec['description'], $currentLocale), $article->title) !!}
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
                                    $recThumbnail = \App\Support\OptimizedImage::url($rec->thumbnail, 'article-thumb');
                                @endphp
                                <a href="{{ url("/{$currentLocale}/{$recSlug}") }}" class="block rounded-2xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                                    @if ($recThumbnail)
                                        <div class="w-full aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-gray-100">
                                            <img src="{{ $recThumbnail }}" alt="{{ localizeTextPhp($rec->title, $currentLocale) }}" {!! \App\Support\OptimizedImage::htmlAttributes('article-thumb') !!} loading="lazy" decoding="async" class="h-full w-full object-cover" />
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

                {{-- Breadcrumb Navigation — Provides outgoing links for SEO crawlers --}}
                <nav aria-label="Breadcrumb" class="flex items-center flex-wrap gap-1.5 text-xs text-gray-500 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <a href="{{ url('/' . $currentLocale) }}" class="hover:text-blue-600 transition-colors font-medium">
                        {{ $currentLocale === 'en' ? 'Home' : 'Beranda' }}
                    </a>
                    <span aria-hidden="true" class="text-gray-400">/</span>
                    <a href="{{ url('/' . $currentLocale . '/discover') }}" class="hover:text-blue-600 transition-colors font-medium">
                        {{ $currentLocale === 'en' ? 'Insights & Case Studies' : 'Wawasan & Studi Kasus' }}
                    </a>
                    <span aria-hidden="true" class="text-gray-400">/</span>
                    <span class="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                        {{ localizeTextPhp(is_array($discover->name) ? ($discover->name[$currentLocale] ?? reset($discover->name)) : $discover->name, $currentLocale) }}
                    </span>
                </nav>

                <header class="mb-8">
                    @if (!empty($discover->type))
                        <span class="text-sm font-semibold text-blue-600 uppercase tracking-wider">{{ $discover->type }}</span>
                    @endif
                    <h1 class="text-3xl md:text-5xl font-bold mt-2 mb-4 text-gray-900 dark:text-white leading-tight">
                        {{ localizeTextPhp(is_array($discover->name) ? ($discover->name[$currentLocale] ?? reset($discover->name)) : $discover->name, $currentLocale) }}{{ $currentLocale === 'en' && !is_array($discover->name) && !preg_match('/\[:\s*en\s*\]/i', $discover->name ?? '') && !str_contains($discover->name ?? '', 'Case Study') ? ' — Case Study' : '' }}
                    </h1>
                </header>

                @if ($discoverImg)
                    <div class="my-6">
                        <img src="{{ \App\Support\OptimizedImage::url(is_array($discover->image) ? ($discover->image[0] ?? null) : $discover->image, 'discover-card') }}"
                             alt="{{ localizeTextPhp(is_array($discover->name) ? ($discover->name[$currentLocale] ?? reset($discover->name)) : $discover->name, $currentLocale) }}"
                             {!! \App\Support\OptimizedImage::htmlAttributes('discover-card') !!}
                             fetchpriority="high"
                             decoding="async"
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
                                    <img src="{{ \App\Support\OptimizedImage::url($sec['image'], 'discover-section') }}"
                                         alt="{{ localizeTextPhp(is_array($discover->name) ? ($discover->name[$currentLocale] ?? reset($discover->name)) : $discover->name, $currentLocale) }}"
                                         {!! \App\Support\OptimizedImage::htmlAttributes('discover-section') !!}
                                         loading="lazy"
                                         decoding="async"
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

                {{-- CTA & Navigation Section — Outgoing links for SEO (internal + external) --}}
                <section class="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800" aria-label="{{ $currentLocale === 'en' ? 'Related Links' : 'Tautan Terkait' }}">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {{ $currentLocale === 'en' ? 'Interested in a Similar Digital Solution?' : 'Tertarik Membangun Solusi Digital Serupa?' }}
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-sm sm:text-base">
                        {{ $currentLocale === 'en'
                            ? 'ASTA Digital Agency specializes in custom enterprise software, mobile apps, and modern web platforms. Contact our team for a free consultation and discover how we can help grow your business.'
                            : 'ASTA Digital Agency ahli membangun sistem informasi enterprise, aplikasi mobile, dan website modern yang disesuaikan kebutuhan bisnis Anda. Hubungi tim kami untuk konsultasi gratis.' }}
                    </p>
                    <div class="flex flex-wrap gap-3">
                        <a href="{{ url('/' . $currentLocale . '#kontak') }}"
                           class="inline-flex items-center gap-2 rounded-full bg-[#004AAD] px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity">
                            {{ $currentLocale === 'en' ? 'Contact Us' : 'Hubungi Kami' }}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                        </a>
                        <a href="{{ url('/' . $currentLocale . '/discover') }}"
                           class="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            {{ $currentLocale === 'en' ? 'Explore All Case Studies' : 'Jelajahi Semua Studi Kasus' }}
                        </a>
                        <a href="{{ url('/' . $currentLocale . '/blog') }}"
                           class="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            {{ $currentLocale === 'en' ? 'Read Our Articles' : 'Baca Artikel Kami' }}
                        </a>
                        <a href="https://astadigitalagency.com"
                           target="_blank"
                           rel="noopener"
                           class="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            ASTA Digital Agency
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        </a>
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
                                        <img src="{{ $art['thumbnail'] }}" alt="{{ localizeTextPhp($art['title'], $currentLocale) }}" width="640" height="360" class="w-full h-full object-cover" loading="lazy" decoding="async" />
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
                            ? 'What project information and software work can you review?'
                            : 'Informasi proyek dan pekerjaan perangkat lunak apa yang dapat ditinjau?' }}
                    </h1>
                    <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        <strong>ASTA DIGITAL AGENCY</strong> {{ $currentLocale === 'en'
                            ? 'shares published project information and software work for visitors to review.'
                            : 'membagikan informasi proyek dan pekerjaan perangkat lunak yang telah dipublikasikan untuk ditinjau pengunjung.' }}
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
                                        $dImg = \App\Support\OptimizedImage::url($first, 'discover-thumb');
                                    }
                                }
                            @endphp
                            <article class="flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                                @if ($dImg)
                                    <a href="/{{ $currentLocale }}/discover/{{ $dSlug }}" class="block aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        <img src="{{ $dImg }}" alt="{{ localizeTextPhp($dName, $currentLocale) }}" {!! \App\Support\OptimizedImage::htmlAttributes('discover-thumb') !!} class="w-full h-full object-cover" loading="lazy" decoding="async" />
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
                                            <span>{{ $currentLocale === 'en' ? 'Read More' : 'Pelajari Selengkapnya' }}</span>
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
                                    ? 'Post-launch maintenance and support options can be discussed and included in the proposal or service agreement.'
                                    : 'Opsi pemeliharaan dan dukungan setelah peluncuran dapat dibahas dan dicantumkan dalam penawaran atau perjanjian layanan.' }}
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
            {{-- Homepage SSR uses the locale dictionary directly; geometry mirrors React Hero for 0 CLS. --}}
            <header class="fixed top-0 left-0 right-0 z-50 h-20 border-b border-gray-200/50 bg-white/80 backdrop-blur-md dark:border-gray-800/50 dark:bg-gray-950/80">
                <nav aria-label="{{ $currentLocale === 'en' ? 'Main navigation' : 'Navigasi utama' }}" class="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
                    <a href="/{{ $currentLocale }}" class="font-bold text-gray-900 dark:text-white">ASTA Digital Agency</a>
                    <div class="flex flex-wrap items-center gap-4 text-sm">
                        <a href="#tentang" class="hover:text-blue-600">{{ transKey($transDict, 'nav.about') }}</a>
                        <a href="#layanan" class="hover:text-blue-600">{{ transKey($transDict, 'nav.services') }}</a>
                        <a href="#portofolio" class="hover:text-blue-600">{{ transKey($transDict, 'nav.portfolio') }}</a>
                        <a href="#faq" class="hover:text-blue-600">FAQ</a>
                        <a href="/{{ $currentLocale }}/blog" class="hover:text-blue-600">{{ transKey($transDict, 'nav.blog') }}</a>
                        <a href="/{{ $currentLocale }}/discover" class="hover:text-blue-600">{{ transKey($transDict, 'nav.discover') }}</a>
                        <a href="#kontak" class="hover:text-blue-600">{{ transKey($transDict, 'nav.contact') }}</a>
                        <a href="{{ $currentLocale === 'en' ? $idUrl : $enUrl }}" lang="{{ $currentLocale === 'en' ? 'id' : 'en' }}" class="font-semibold">{{ $currentLocale === 'en' ? 'ID' : 'EN' }}</a>
                    </div>
                </nav>
            </header>
            <main>
                {{-- 1. Hero Section (#top) - Mirrors React Hero grid exactly to prevent any CLS --}}
                <section id="top" class="relative overflow-hidden pt-26 pb-6 sm:pt-26 lg:pb-6 xl:pt-34">
                    <div class="mx-auto max-w-[1440px] xl:max-w-[1600px] 2xl:max-w-[1780px] px-4 sm:px-6 lg:px-10 xl:px-14">
                        <div class="grid items-center gap-14 lg:grid-cols-12">
                            <div class="lg:col-span-7 space-y-5">
                                <span class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                                    <span class="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                                    {{ transKey($transDict, 'hero.eyebrow', 'Agensi Digital Yogyakarta') }}
                                </span>

                                <h1 class="font-display text-[2.5rem] font-bold leading-[1.02] tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-[4.25rem]">
                                    {{ transKey($transDict, 'hero.title_1', 'Membangun ') }}
                                    <span class="text-blue-600 underline decoration-blue-400 decoration-wavy decoration-2 underline-offset-8">
                                        {{ transKey($transDict, 'hero.title_highlight', 'pengalaman digital') }}
                                    </span>
                                    {{ transKey($transDict, 'hero.title_2', ' terbaik untuk bisnis modern.') }}
                                </h1>

                                <p class="max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
                                    {{ transKey($transDict, 'hero.description') }}
                                </p>

                                <div class="flex flex-wrap items-center gap-3 pt-2">
                                    <a href="#kontak" class="inline-flex h-12 items-center gap-2 rounded-full bg-[#004AAD] px-6 text-sm font-semibold text-white shadow-md hover:opacity-95 transition-all">
                                        {{ transKey($transDict, 'hero.cta_start', 'Mulai Proyek') }}
                                        <span>→</span>
                                    </a>
                                    <a href="#portofolio" class="inline-flex h-12 items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-6 text-sm font-semibold text-gray-700 shadow-xs hover:bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 transition-colors">
                                        {{ transKey($transDict, 'hero.cta_portfolio', 'Lihat Portofolio') }}
                                    </a>
                                </div>

                                <div class="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                                    <a href="#portofolio" class="rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 hover:text-blue-600 dark:border-gray-800 dark:bg-gray-900/70">{{ transKey($transDict, 'hero.trust_portfolio') }}</a>
                                    <a href="#tentang" class="rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 hover:text-blue-600 dark:border-gray-800 dark:bg-gray-900/70">{{ transKey($transDict, 'hero.trust_company') }}</a>
                                    <a href="#kontak" class="rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 hover:text-blue-600 dark:border-gray-800 dark:bg-gray-900/70">{{ transKey($transDict, 'hero.trust_contact') }}</a>
                                </div>
                            </div>

                            <div class="relative lg:col-span-5">
                                <div class="relative mx-auto aspect-square w-full max-w-[520px] xl:max-w-[600px] flex items-center justify-center">
                                    <picture class="block h-full w-full">
                                        <source type="image/avif" srcset="{{ $robotImageBase }}-320.avif?v={{ $robotImageHash }} 320w, {{ $robotImageBase }}-480.avif?v={{ $robotImageHash }} 480w, {{ $robotImageBase }}-640.avif?v={{ $robotImageHash }} 640w, {{ $robotImageBase }}-954.avif?v={{ $robotImageHash }} 954w" sizes="(min-width: 1280px) 40vw, (min-width: 640px) 50vw, 100vw">
                                        <source type="image/webp" srcset="{{ $robotImageBase }}-320.webp?v={{ $robotImageHash }} 320w, {{ $robotImageBase }}-480.webp?v={{ $robotImageHash }} 480w, {{ $robotImageBase }}-640.webp?v={{ $robotImageHash }} 640w, {{ $robotImageBase }}-954.webp?v={{ $robotImageHash }} 954w" sizes="(min-width: 1280px) 40vw, (min-width: 640px) 50vw, 100vw">
                                        <img src="{{ $robotImageBase }}-954.webp?v={{ $robotImageHash }}" alt="ASTA Digital Agency" width="954" height="715" sizes="(min-width: 1280px) 40vw, (min-width: 640px) 50vw, 100vw" fetchpriority="high" loading="eager" decoding="async" class="w-full h-full object-contain">
                                    </picture>
                                </div>
                            </div>
                        </div>

                        @if ($homeClients->isNotEmpty())
                            <div class="mt-12 rounded-2xl glass px-4 py-5 sm:px-6 shadow-soft sm:mt-14 overflow-hidden min-h-[92px] flex items-center">
                                <div class="flex flex-col lg:flex-row items-center gap-5 sm:gap-6 lg:gap-8 w-full">
                                    <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 shrink-0">{{ transKey($transDict, 'hero.trusted_by') }}</span>
                                    <div class="flex flex-wrap items-center gap-5">
                                        @foreach ($homeClients as $client)
                                            @if ($client->image)
                                                <img src="{{ \App\Support\OptimizedImage::url($client->image, 'client-logo') }}"
                                                     alt="{{ localizeTextPhp($client->name, $currentLocale) }}"
                                                     width="112" height="44" loading="lazy" decoding="async"
                                                     class="max-h-10 max-w-28 object-contain opacity-75" />
                                            @else
                                                <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ localizeTextPhp($client->name, $currentLocale) }}</span>
                                            @endif
                                        @endforeach
                                    </div>
                                </div>
                            </div>
                        @endif

                        <div class="mt-8 grid gap-4 border-t border-gray-100 pt-6 dark:border-gray-800 sm:grid-cols-3">
                            <h2 class="sr-only">{{ transKey($transDict, 'home_seo.proof_title') }}</h2>
                            <a href="#portofolio" class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                                <h2 class="font-bold text-gray-900 dark:text-white">{{ transKey($transDict, 'hero.trust_portfolio') }}</h2>
                                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'home_seo.proof_portfolio') }}</p>
                            </a>
                            <a href="#tentang" class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                                <h2 class="font-bold text-gray-900 dark:text-white">{{ transKey($transDict, 'hero.trust_company') }}</h2>
                                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'home_seo.proof_company') }}</p>
                            </a>
                            <a href="#kontak" class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                                <h2 class="font-bold text-gray-900 dark:text-white">{{ transKey($transDict, 'hero.trust_contact') }}</h2>
                                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'home_seo.proof_contact') }}</p>
                            </a>
                        </div>
                    </div>
                </section>

                <section class="space-y-6 border-b border-gray-100 pb-12 dark:border-gray-800">
                    <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                        {{ transKey($transDict, 'home_seo.title') }}
                    </h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ transKey($transDict, 'home_seo.updated_label') }}
                        <time datetime="{{ $homepageModifiedAt->toDateString() }}">
                            {{ $currentLocale === 'en' ? $homepageModifiedAt->format('F j, Y') : $homepageModifiedAt->format('d/m/Y') }}
                        </time>
                    </p>
                    <div class="grid gap-6 md:grid-cols-3">
                        <article>
                            <h3 class="font-semibold text-gray-900 dark:text-white">{{ transKey($transDict, 'home_seo.website_title') }}</h3>
                            <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'home_seo.website_description') }}</p>
                        </article>
                        <article>
                            <h3 class="font-semibold text-gray-900 dark:text-white">{{ transKey($transDict, 'home_seo.mobile_title') }}</h3>
                            <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'home_seo.mobile_description') }}</p>
                        </article>
                        <article>
                            <h3 class="font-semibold text-gray-900 dark:text-white">{{ transKey($transDict, 'home_seo.systems_title') }}</h3>
                            <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'home_seo.systems_description') }}</p>
                        </article>
                    </div>
                    <div class="max-w-4xl">
                        <h3 class="font-semibold text-gray-900 dark:text-white">{{ transKey($transDict, 'home_seo.process_title') }}</h3>
                        <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'home_seo.process_description') }}</p>
                    </div>
                    <div class="grid gap-6 md:grid-cols-2">
                        <article>
                            <h3 class="font-semibold text-gray-900 dark:text-white">{{ transKey($transDict, 'home_seo.review_title') }}</h3>
                            <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'home_seo.review_description') }}</p>
                        </article>
                        <article>
                            <h3 class="font-semibold text-gray-900 dark:text-white">{{ transKey($transDict, 'home_seo.security_title') }}</h3>
                            <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'home_seo.security_description') }}</p>
                        </article>
                    </div>
                    <p class="max-w-4xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">{{ transKey($transDict, 'home_seo.location') }}</p>
                    <div class="flex flex-wrap gap-4 text-sm font-semibold text-blue-700 dark:text-blue-300">
                        <a href="#layanan" class="underline underline-offset-4">{{ transKey($transDict, 'home_seo.services_link') }}</a>
                        <a href="#kontak" class="underline underline-offset-4">{{ transKey($transDict, 'home_seo.contact_link') }}</a>
                    </div>

                    {{-- Kartu Transparansi Identitas Perusahaan & Titik Kontak (Memenuhi E-E-A-T & Bot AI) --}}
                    <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-6 text-sm text-gray-700 shadow-xs dark:border-gray-800 dark:bg-gray-900/50">
                        <h4 class="font-semibold text-gray-900 dark:text-white text-base mb-3">
                            {{ $currentLocale === 'en' ? 'Company Information & Contact Transparency' : 'Informasi Resmi Perusahaan & Transparansi Kontak' }}
                        </h4>
                        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <span class="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    {{ $currentLocale === 'en' ? 'Legal Entity & Status' : 'Entitas Resmi & Status' }}
                                </span>
                                <span class="font-medium text-gray-900 dark:text-white">PT Asta Digital Agency</span>
                                <span class="block text-xs text-gray-500">{{ $currentLocale === 'en' ? 'Registered Software House' : 'Software House & Konsultan IT Terdaftar' }}</span>
                            </div>
                            <div>
                                <span class="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    {{ $currentLocale === 'en' ? 'Direct Phone / WhatsApp' : 'Telepon / WhatsApp' }}
                                </span>
                                <a href="tel:+6281578223564" class="font-semibold text-blue-600 hover:underline dark:text-blue-400">+62 815 7822 3564</a>
                                <span class="block text-xs text-gray-500">{{ $currentLocale === 'en' ? 'Mon-Fri: 08:00 - 17:00 WIB' : 'Senin - Jumat: 08:00 - 17:00 WIB' }}</span>
                            </div>
                            <div>
                                <span class="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    {{ $currentLocale === 'en' ? 'Official Email' : 'Email Resmi' }}
                                </span>
                                <!--email_off-->
                                <a href="mailto:cs@astadigitalagency.com" class="font-semibold text-blue-600 hover:underline dark:text-blue-400">cs@astadigitalagency.com</a>
                                <!--email_on-->
                                <span class="block text-xs text-gray-500">24/7 Client Support</span>
                            </div>
                            <div>
                                <span class="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    {{ $currentLocale === 'en' ? 'Head Office & Location' : 'Alamat Kantor Operasional' }}
                                </span>
                                <address class="font-medium text-gray-900 dark:text-white not-italic text-xs leading-relaxed">
                                    Jl. Imogiri Timur, Gng. Tobanan V, Wonokromo, Pleret, Bantul, D.I. Yogyakarta 55791
                                </address>
                            </div>
                        </div>
                        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-4 text-xs font-medium">
                            <span class="text-gray-500">{{ $currentLocale === 'en' ? 'Verified Social Profiles:' : 'Profil Sosial Terverifikasi:' }}</span>
                            <a href="https://www.instagram.com/astadigitalagency/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline dark:text-blue-400">Instagram (@astadigitalagency)</a>
                            <span class="text-gray-300">•</span>
                            <a href="https://www.linkedin.com/company/asta-digital-agency/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline dark:text-blue-400">LinkedIn (PT Asta Digital Agency)</a>
                        </div>
                    </div>
                </section>

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
                                            $dImg = \App\Support\OptimizedImage::url($first, 'discover-thumb');
                                        }
                                    }
                                @endphp
                                <article class="flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                                    @if ($dImg)
                                        <a href="/{{ $currentLocale }}/discover/{{ $dSlug }}" class="block aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            <img src="{{ $dImg }}" alt="{{ localizeTextPhp($dName, $currentLocale) }}" {!! \App\Support\OptimizedImage::htmlAttributes('discover-thumb') !!} class="w-full h-full object-cover" loading="lazy" decoding="async" />
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

                @if (!empty($homeTestimonials) && $homeTestimonials->isNotEmpty())
                    <section id="testimoni" class="space-y-6 border-b border-gray-100 pb-12 dark:border-gray-800">
                        <div class="mx-auto max-w-3xl space-y-3 text-center">
                            <span class="inline-block text-xs font-bold uppercase tracking-widest text-blue-600">
                                {{ transKey($transDict, 'testimonials.eyebrow') }}
                            </span>
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-white md:text-4xl">
                                {{ transKey($transDict, 'testimonials.title') }}
                            </h2>
                            <p class="leading-relaxed text-gray-600 dark:text-gray-400">
                                {{ transKey($transDict, 'testimonials.description') }}
                            </p>
                        </div>
                        <div class="grid gap-6 md:grid-cols-2">
                            @foreach ($homeTestimonials as $testimonial)
                                <figure class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                                    <blockquote class="leading-relaxed text-gray-800 dark:text-gray-200">
                                        “{{ strip_tags($testimonial->quote) }}”
                                    </blockquote>
                                    <figcaption class="mt-4 text-sm">
                                        <span class="font-semibold text-gray-900 dark:text-white">{{ $testimonial->name }}</span>
                                        @if ($testimonial->role || $testimonial->org)
                                            <span class="text-gray-600 dark:text-gray-400">
                                                · {{ collect([$testimonial->role, $testimonial->org])->filter()->implode(', ') }}
                                            </span>
                                        @endif
                                    </figcaption>
                                    <a href="{{ $testimonial->source_url }}" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block text-sm font-semibold text-blue-600 underline underline-offset-4">
                                        {{ transKey($transDict, 'testimonials.view_source') }}
                                    </a>
                                </figure>
                            @endforeach
                        </div>
                    </section>
                @endif

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
                <section id="kontak" class="rounded-3xl border border-gray-200 bg-white p-8 text-gray-700 shadow-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ transKey($transDict, 'contact.title') }}</h2>
                    <p class="mt-2 max-w-3xl leading-relaxed">{{ transKey($transDict, 'contact.description') }}</p>
                    <div class="mt-6 grid gap-8 lg:grid-cols-2">
                        <div>
                            <address class="grid gap-4 not-italic sm:grid-cols-2 lg:grid-cols-1">
                                <div>
                                    <span class="block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ transKey($transDict, 'contact.info_office') }}</span>
                                    <span class="mt-1 block">{{ transKey($transDict, 'contact.info_office_address') }}</span>
                                </div>
                                <div>
                                    <span class="block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ transKey($transDict, 'contact.info_phone') }}</span>
                                    <a class="mt-1 block text-blue-700 underline dark:text-blue-300" href="tel:+6281578223564">+62 815 7822 3564</a>
                                    <!--email_off-->
                                    <a class="mt-1 block text-blue-700 underline dark:text-blue-300" href="mailto:cs@astadigitalagency.com">cs@astadigitalagency.com</a>
                                    <!--email_on-->
                                </div>
                            </address>
                        </div>
                        <form data-contact-form action="/api/contact" method="post"
                            data-success="{{ transKey($transDict, 'contact.form.success_desc') }}"
                            data-error="{{ transKey($transDict, 'contact.form.error_desc') }}"
                            data-submitting="{{ transKey($transDict, 'contact.form.submitting') }}"
                            class="grid gap-4">
                            <input type="text" name="website_hp" tabindex="-1" autocomplete="off" aria-hidden="true" class="hidden opacity-0 absolute -z-10 pointer-events-none h-0 w-0" />
                            <input type="hidden" name="_timer" value="" />
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ transKey($transDict, 'contact.form_title') }}</h3>
                            <div>
                                <label for="contact-name" class="mb-1 block text-sm font-medium">{{ transKey($transDict, 'contact.form.full_name') }}</label>
                                <input id="contact-name" name="name" type="text" required maxlength="255" autocomplete="name"
                                    placeholder="{{ transKey($transDict, 'contact.form.placeholder_first_name') }}"
                                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
                            </div>
                            <div class="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label for="contact-email" class="mb-1 block text-sm font-medium">{{ transKey($transDict, 'contact.form.email') }}</label>
                                    <input id="contact-email" name="email" type="email" required maxlength="255" autocomplete="email"
                                        placeholder="{{ transKey($transDict, 'contact.form.placeholder_email') }}"
                                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
                                </div>
                                <div>
                                    <label for="contact-phone" class="mb-1 block text-sm font-medium">{{ transKey($transDict, 'contact.form.phone') }}</label>
                                    <input id="contact-phone" name="phone" type="tel" maxlength="20" autocomplete="tel"
                                        placeholder="{{ transKey($transDict, 'contact.form.placeholder_phone') }}"
                                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label for="contact-organization" class="mb-1 block text-sm font-medium">{{ transKey($transDict, 'contact.form.organization') }}</label>
                                <input id="contact-organization" name="organization" type="text" maxlength="255" autocomplete="organization"
                                    placeholder="{{ transKey($transDict, 'contact.form.placeholder_organization') }}"
                                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
                            </div>
                            <div>
                                <label for="contact-message" class="mb-1 block text-sm font-medium">{{ transKey($transDict, 'contact.form.message') }}</label>
                                <textarea id="contact-message" name="message" rows="5" required maxlength="5000"
                                    placeholder="{{ transKey($transDict, 'contact.form.placeholder_message') }}"
                                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"></textarea>
                            </div>
                            <button type="submit" class="justify-self-start rounded-full bg-[#004AAD] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">
                                {{ transKey($transDict, 'contact.form.submit') }}
                            </button>
                            <p data-contact-status role="status" aria-live="polite" class="text-sm"></p>
                        </form>
                    </div>
                </section>

                <footer id="footer" class="pt-4 space-y-8 text-sm text-gray-600 dark:text-gray-400">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div class="space-y-3">
                            <span class="text-lg font-bold text-gray-900 dark:text-white">ASTA DIGITAL AGENCY</span>
                            <p class="text-xs leading-relaxed">
                                {{ transKey($transDict, 'footer.description') }}
                            </p>
                        </div>
                        <div class="space-y-2">
                            <span class="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{{ transKey($transDict, 'footer.office_title', 'Alamat Kantor') }}</span>
                            <address class="text-xs leading-relaxed not-italic">
                                {{ transKey($transDict, 'contact.info_office_address') }}
                            </address>
                        </div>
                        <div class="space-y-2">
                            <span class="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{{ transKey($transDict, 'footer.contact_title', 'Hubungi Kami') }}</span>
                            <!--email_off-->
                            <p class="text-xs">Email: <a href="mailto:cs@astadigitalagency.com" class="text-blue-600 hover:underline">cs@astadigitalagency.com</a></p>
                            <!--email_on-->
                            <p class="text-xs">{{ transKey($transDict, 'contact.info_phone', 'Telepon') }}: <a href="tel:+6281578223564" class="text-blue-600 hover:underline">+62 815 7822 3564</a></p>
                        </div>
                        <div class="space-y-2">
                            <span class="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{{ transKey($transDict, 'footer.hours_title', 'Jam Kerja') }}</span>
                            <p class="text-xs">{{ transKey($transDict, 'footer.hours_weekdays', 'Senin - Jumat: 08:00 - 17:00') }}</p>
                        </div>
                    </div>
                    @if (!empty($agencySocialLinks))
                        <nav aria-label="{{ $currentLocale === 'en' ? 'Social media' : 'Media sosial' }}" class="flex flex-wrap gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                            @foreach ($agencySocialLinks as $network => $url)
                                <a href="{{ $url }}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline dark:text-blue-300">{{ ucfirst($network) }}</a>
                            @endforeach
                        </nav>
                    @endif
                    <div class="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
                        <p>{{ transKey($transDict, 'footer.copyright', '© Copyright 2025 PT Asta Digital Agency') }}</p>
                        <p class="text-gray-400">Software House & IT Consultant Indonesia</p>
                    </div>
                </footer>
            </main>
        @endif
    </div>
    @if ($isHomePage ?? false)
        <script>
            (() => {
                const form = document.querySelector("[data-contact-form]");
                if (!form) return;

                const timer = form.querySelector('input[name="_timer"]');
                const button = form.querySelector('button[type="submit"]');
                const status = form.querySelector("[data-contact-status]");
                const defaultLabel = button.textContent;
                timer.value = String(Date.now());

                form.addEventListener("submit", async (event) => {
                    event.preventDefault();
                    button.disabled = true;
                    button.textContent = form.dataset.submitting;
                    status.textContent = "";

                    try {
                        const response = await fetch(form.action, {
                            method: "POST",
                            headers: { Accept: "application/json" },
                            body: new FormData(form),
                        });
                        const result = await response.json();
                        if (!response.ok) {
                            throw new Error(result.message || form.dataset.error);
                        }

                        form.reset();
                        timer.value = String(Date.now());
                        status.textContent = form.dataset.success;
                    } catch (error) {
                        status.textContent = error instanceof Error ? error.message : form.dataset.error;
                    } finally {
                        button.disabled = false;
                        button.textContent = defaultLabel;
                    }
                });
            })();
        </script>
    @endif
</body>
</html>
