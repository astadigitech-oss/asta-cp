<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ASTA Digital Agency — Solusi Teknologi & Digital Agency</title>
    
    <!-- Primary Meta Tags -->
    <meta name="title" content="ASTA Digital Agency — Solusi Teknologi & Digital Agency">
    <meta name="description" content="PT Asta Digital Agency membangun aplikasi mobile, website, dan sistem informasi modern untuk instansi pemerintah, UMKM, sekolah, dan perusahaan.">
    <meta name="keywords" content="asta digital, digital agency, software house, jasa pembuatan website, pembuatan aplikasi mobile, sistem informasi, IT consultant, web developer indonesia">
    <meta name="author" content="PT Asta Digital Agency">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#004AAD">
    <link rel="canonical" href="{{ url()->current() }}">

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:site_name" content="Asta Digital Agency">
    <meta property="og:title" content="ASTA Digital Agency — Solusi Teknologi & Digital Agency">
    <meta property="og:description" content="Transformasi digital yang andal dan terpercaya untuk instansi dan bisnis modern.">
    <meta property="og:image" content="{{ asset('images/logo-dark.png') }}">
    <meta property="og:locale" content="{{ app()->getLocale() == 'id' ? 'id_ID' : 'en_US' }}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{{ url()->current() }}">
    <meta name="twitter:title" content="ASTA Digital Agency — Solusi Teknologi & Digital Agency">
    <meta name="twitter:description" content="Transformasi digital yang andal dan terpercaya untuk instansi dan bisnis modern.">
    <meta name="twitter:image" content="{{ asset('images/logo-dark.png') }}">

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
      "description": "PT Asta Digital Agency membangun aplikasi mobile, website, dan sistem informasi modern untuk instansi pemerintah, UMKM, sekolah, dan perusahaan.",
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
    {{-- Preconnect Google Fonts untuk performa loading font --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.tsx'])
</head>
<body class="bg-background text-foreground antialiased">
    <div id="react-app"></div>
</body>
</html>
