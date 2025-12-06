<!DOCTYPE html>
<html lang="en" class="scroll-smooth">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ASTA DIGITAL AGENCY</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
    <link rel="icon" href="{{ asset('storage/images/logo.png') }}" type="image/png">
</head>

<body class="relative">
    <nav class="fixed top-0 left-0 w-full border border-gray-200 bg-white z-50 flex justify-center">
        <x-nav />
    </nav>
    <div class="pt-[90px]">
        {{ $slot }}
    </div>
    <footer class="w-full flex justify-center rounded-t-[50px] bg-[#004AAD] py-[80px] lg:py-[48px]">
        <div
            class="max-w-[905px] xl:max-w-[1160px] px-5 space-y-10 lg:space-y-0 lg:px-0 lg:flex justify-between w-full">
            <div class="max-w-[300px] xl:max-w-[372px] space-y-[40px] w-full">
                <x-logo logo="logoPutih.png" size="w-[82px] h-auto" />
                <p class="max-w-[372px] text-[16px] font-semibold inter text-white">
                    Kami percaya bahwa teknologi bukan sekadar alat, tapi jembatan menuju pertumbuhan bisnis yang
                    berkelanjutan.
                </p>
                <div class="flex items-center gap-[10px]">
                    {{-- <a href="" class="block hover:scale-120 duration-300 transition-all">
                        <img loading="lazy" class="w-[31px] h-[31px]" loading="lazy"
                            src="{{ asset('storage/svg/linkedin.svg') }}" alt="" /></a> --}}
                    <a href="https://www.instagram.com/astadigitalagency/"
                        class="block hover:scale-120 duration-300 transition-all">
                        <img loading="lazy" class="w-[31px] h-[31px]" loading="lazy"
                            src="{{ asset('storage/svg/instagram.svg') }}" alt="" /></a>
                    {{-- <a href="" class="block hover:scale-120 duration-300 transition-all">
                        <img loading="lazy" class="w-[31px] h-[31px]" loading="lazy"
                            src="{{ asset('storage/svg/facebook.svg') }}" alt="" /></a> --}}
                    <a href="/discover#contact" class="block hover:scale-120 duration-300 transition-all">
                        <img loading="lazy" class="w-[31px] h-[31px]" loading="lazy"
                            src="{{ asset('storage/svg/gmail.svg') }}" alt="" /></a>
                </div>
            </div>
            <div class="border-[1px] border-white h-0 w-full lg:w-0 lg:h-[375px]"></div>
            <div
                class="max-w-[550px] xl:max-w-[695px] grid sm:grid-cols-2 xl:grid-cols-5 space-y-10 sm:space-y-0 gap-[15px] xl:gap-[35px] w-full text-white">
                <div class="col-span-1 xl:col-span-3 space-y-[12px]">
                    <div class="flex items-center gap-[14px]">
                        <img loading="lazy" src="{{ asset('storage/svg/pin.svg') }}" class="w-[36px] h-[36px]"
                            alt="">
                        <h2 class="grotesk text-[24px] font-bold leading-[28px]">Alamat Kantor</h2>
                    </div>
                    <p class="xl:max-w[395px] inter font-semibold text-[16px] leading-[28px]">
                        Jl. Imogiri Timur, Gng. Tobanan V, dsn. Jati Rt 008, Wonokromk, kec. pleret, kab. Bantul, D.I Yogyakarta
                    </p>
                </div>
                <div class="col-span-1 xl:col-span-2 space-y-[12px]">
                    <div class="flex items-center gap-[14px]">
                        <h2 class="grotesk text-[24px] font-bold leading-[28px]">Solusi</h2>
                    </div>
                    <ul class="inter font-semibold text-[16px] leading-[28px]">
                        <li>Konsultan IT</li>
                        <li>Layanan IT</li>
                        <li>Web Apps Development</li>
                        <li>Mobile Apps Development</li>
                    </ul>
                </div>
                <div class="col-span-1 xl:col-span-3 space-y-[12px]">
                    <div class="flex items-center gap-[14px]">
                        <img loading="lazy" src="{{ asset('storage/svg/clock.svg') }}" class="w-[36px] h-[36px]"
                            alt="">
                        <h2 class="grotesk text-[24px] font-bold leading-[28px]">Jam Kerja Kantor</h2>
                    </div>
                    <ul class="inter font-semibold text-[16px] leading-[28px]">
                        <li>Senin-Jumat: 08:00-17:00</li>
                        <li>Sabtu: On Call</li>
                        <li>Minggu: On Call</li>
                    </ul>
                </div>
                <div class="col-span-1 xl:col-span-2 space-y-[12px]">
                    <div class="flex items-center gap-[14px]">
                        <h2 class="grotesk text-[24px] font-bold leading-[28px]">Hubungi Kami</h2>
                    </div>
                    <ul class="inter font-semibold text-[16px] leading-[28px]">
                        <li>astadigitech@gmail.com</li>
                        <li>+62 815 7822 3564</li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
    <div class="w-full justify-center bg-black py-[29px]">
        <p class="text-center text-white inter font-semibold text-[16px] leading-[28px]">
            © Copyright 2025 PT Asta Digital Agency
        </p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
</body>

</html>
