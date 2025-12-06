<div>
    {{-- Hero --}}
    <section class="relative flex w-full justify-center">
        <div class="absolute z-[1] h-screen w-full md:h-[414px] lg:h-[612px]">
            <div class="absolute z-[2] h-full w-full bg-black/70"></div>
            <video src={{ asset('storage/videos/hero.mp4') }} class="h-full w-full object-cover" autoplay loop
                muted></video>
        </div>
        <div
            class="relative z-[3] flex h-screen w-full justify-center md:h-[414px] lg:h-[612px] lg:max-w-screen xl:max-w-[1395px]">
            <div class="flex h-full w-full items-center justify-between lg:max-w-[900px] xl:max-w-[1155px]">
                <div class="max-w-[500px] space-y-[30px] px-5 xl:max-w-[615px] xl:px-0">
                    <h1 class="inter text-[48px] leading-[50px] font-extrabold text-white xl:leading-[28px]">
                        Asta Digital Agency
                    </h1>
                    <p class="inter text-[16px] leading-[28px] font-bold text-white">
                        Adalah perusahaan pengembang software yang berbasis di Yogyakarta. Kami fokus pada
                        pembuatan software kustom dan sistem ERP (Enterprise Resource Planning) untuk mendukung
                        kebutuhan bisnis Anda.
                    </p>
                    <x-button-main label="Mulai Sekarang" href="#start" style="text-white" />
                </div>
                <div class="hidden justify-center lg:flex lg:w-2/5">
                    <div class="w-full space-y-10">
                        <div class="grid w-full grid-cols-2 gap-10">
                            <div
                                class="floating float-delay-1 mt-[3rem] flex items-center justify-center rounded-[4px] bg-white px-5 py-2 opacity-80">
                                <div class="flex flex-col space-y-3">
                                    <p class="font-bold">
                                        <span class="text-[#004AAD]">5+</span> Clients
                                    </p>
                                    <img loading="lazy" class="h-auto w-[160px]"
                                        src={{ asset('storage/images/clients.png') }} alt="" />
                                </div>
                            </div>
                            <div
                                class="floating float-delay-2 mb-[3rem] flex items-center justify-center gap-4 rounded-[4px] bg-white px-5 py-3 opacity-80 lg:justify-start">
                                <div
                                    class="flex h-[84px] w-[61px] items-center justify-center rounded-[4px] bg-[#004AAD]">
                                    <img loading="lazy" class="w-[30px] xl:w-[46px]"
                                        src={{ asset('storage/svg/headset.svg') }} alt="" />
                                </div>
                                <div class="grotesk flex h-full flex-col justify-between font-bold xl:text-[20px]">
                                    <p class="text-[#004AAD]">Inovatif</p>
                                    <p>Kreatif</p>
                                    <p class="text-[#004AAD]">Adaptif</p>
                                </div>
                            </div>
                            <div class="col-span-2 flex justify-center">
                                <div class="floating float-delay-3 rounded-[4px] bg-white px-5 py-2 opacity-80">
                                    <div class="flex items-center gap-[10px]">
                                        <img loading="lazy" class="h-auto w-[50px]"
                                            src={{ asset('storage/images/client.png') }} alt="" />
                                        <div class="grostek font-bold">
                                            <p class="text-[#004AAD]">H. Darsum, S.E</p>
                                            <p class="text-[12px]">Hasilnya Memuaskan!</p>
                                            <div class="flex gap-1 text-[20px] text-[#004AAD]">
                                                <span>★</span>
                                                <span>★</span>
                                                <span>★</span>
                                                <span>★</span>
                                                <span>★</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {{-- Skill --}}
    <section id="start" class="relative z-[1] flex w-screen bg-[#004AAD] overflow-x-clip justify-center">
        <div class="absolute w-full h-full bg-[#A2FF0A] scale-105 -rotate-[3deg] top-0 left-0 z-[0]"></div>
        <div class="w-full relative z-[1] bg-[#004AAD] py-[29px] h-full flex justify-center">
            <div class="h-[48px] hidden lg:flex items-center justify-between w-full lg:max-w-[900px] xl:max-w-[1155px]">
                <x-skill-img src="jquery.svg" />
                <x-skill-img src="laravel.svg" />
                <x-skill-img src="react.svg" />
                <x-skill-img src="spark.svg" />
                <x-skill-img src="github.svg" />
                <x-skill-img src="php.svg" />
            </div>
            <div
                class="section-skill-mobile relative hidden md:flex items-center justify-center z-[100] h-full lg:hidden w-full px-5">
                <div class="swiper section-skill-swiper">
                    <div class="swiper-wrapper items-center">
                        <div class="swiper-slide">
                            <div class="w-full flex items-center justify-center py-[20px]">
                                <x-skill-img src="jquery.svg" />
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="w-full flex items-center justify-center py-[20px]">
                                <x-skill-img src="laravel.svg" />
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="w-full flex items-center justify-center py-[20px]">
                                <x-skill-img src="react.svg" />
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="w-full flex items-center justify-center py-[20px]">
                                <x-skill-img src="spark.svg" />
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="w-full flex items-center justify-center py-[20px]">
                                <x-skill-img src="github.svg" />
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="w-full flex items-center justify-center py-[20px]">
                                <x-skill-img src="php.svg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                class="section-skill-mobile relative flex md:hidden items-center justify-center z-[100] h-full lg:hidden w-full px-5">
                <div class="swiper section-skill-swiper">
                    <div class="swiper-wrapper items-center">
                        @foreach (['jquery', 'laravel', 'react', 'spark', 'github', 'php'] as $skill)
                            <div class="swiper-slide">
                                <img loading="lazy" class="h-[45px] w-auto" src="{{ asset("storage/svg/$skill.svg") }}"
                                    alt="{{ $skill }}">
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    </section>

    {{-- Bagaimana --}}
    <section class="w-full flex justify-center">
        <div class="w-full pt-[85px] lg:pt-[135px] pb-[62px] lg:pb-[112px] max-w-[1155px]">
            <div class="w-full text-center flex justify-center pb-[43px] lg:pb-[83px]">
                <h1
                    class="inter max-w-[500px] lg:max-w-[1000px] font-bold text-[38px] sm:text-[48px] leading-[38px] sm:leading-[60px] xl:leading-[28px]">
                    Bagaimana Kami
                    <span class="text-[#004AAD]">Membantu</span> Anda
                </h1>
            </div>
            <div class="xl:flex justify-between space-y-[50px] items-center px-5 xl:px-0">
                <div class="max-w-[523px] hidden xl:block w-full">
                    <img loading="lazy" class="w-full floating" src="{{ asset('storage/images/how.png') }}" loading="lazy"
                        alt="">
                </div>
                <div class="flex justify-center">
                    <div
                        class="w-full sm:max-w-[632px] space-y-[20px] p-5 sm:p-5 rounded-[8px] shadow-[0px_4px_15px_rgba(0,0,0,0.25)]">
                        <x-service-list bg="bg-[#004AAD]" text="#004AAD" title="Free 24/7 Support">
                            <x-slot:svg>
                                <svg class="text-white group-hover:text-[#004AAD] w-[24px] sm:w-[34px]" width="44"
                                    height="41" viewBox="0 0 44 41" fill="currentColor"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M39.5483 22.7054V18.912C39.5483 9.0405 31.917 0.775744 22.5374 0.489067C17.7028 0.375729 13.2126 2.12468 9.77968 5.50259C8.08692 7.15424 6.74206 9.13628 5.82631 11.3291C4.91056 13.5218 4.44289 15.8799 4.45155 18.2608V22.7054C2.03207 22.7054 0.0644531 24.6989 0.0644531 27.1501V36.0393C0.0644531 38.4905 2.03207 40.4839 4.45155 40.4839H8.83865V18.2608C8.83218 16.4752 9.18278 14.7067 9.86929 13.0621C10.5558 11.4175 11.564 9.93074 12.8331 8.69159C14.0971 7.44559 15.5961 6.4706 17.2405 5.82491C18.8849 5.17922 20.6409 4.8761 22.4036 4.93368C29.4405 5.14702 35.1612 11.4184 35.1612 18.912V40.4839H39.5483C41.9678 40.4839 43.9354 38.4905 43.9354 36.0393V27.1501C43.9354 24.6989 41.9678 22.7054 39.5483 22.7054Z"
                                        fill="#currentColor" />
                                    <path
                                        d="M11.6758 22.4194H16.0629V40.4839H11.6758V22.4194ZM29.2242 22.4194H33.6113V40.4839H29.2242V22.4194Z"
                                        fill="#currentColor" />
                                </svg>
                            </x-slot:svg>
                            Tim kami siap memberikan dukungan teknis untuk memastikan layanan yang lancar dan solusi
                            tepat
                            waktu.
                        </x-service-list>
                        <x-service-list bg="bg-black" text="black" title="Inovasi Teknologi">
                            <x-slot:svg>
                                <svg class="w-[24px] sm:w-[34px]" width="35" height="35" viewBox="0 0 35 35"
                                    fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M25.1397 10.7733H10.7715V25.1401H25.1383L25.1397 10.7733Z"
                                        fill="white" />
                                    <path
                                        d="M30.8865 7.89942V5.02692H28.014V2.15442H25.14V5.02692H22.2675V2.15442H19.3936V5.02692H16.5211V2.15442H13.6457V5.02692H10.7732V2.15442H7.8993V5.02692H5.0268V7.89942H2.1543V10.7734H5.0268V13.6459H2.1543V16.5198H5.0268V19.3923H2.1543V22.2662H5.0268V25.1387H2.1543V28.0127H5.0268V30.8852H7.8993V33.7591H10.7732V30.8866H13.6457V33.7591H16.5197V30.8866H19.3922V33.7591H22.2661V30.8866H25.1386V33.7591H28.0125V30.8866H30.885V28.0141H33.759V25.1402H30.8865V22.2677H33.759V19.3937H30.8865V16.5212H33.759V13.6459H30.8865V10.7734H33.759V7.89942H30.8865ZM28.014 28.0127H7.8993V7.90086H28.0111L28.014 28.0127Z"
                                        fill="white" />
                                </svg>
                            </x-slot:svg>
                            Kami menghadirkan solusi inovatif yang membantu perusahaan bertransformasi melalui teknologi
                            terbaru dan efisien.
                        </x-service-list>
                        <x-service-list bg="bg-[#004AAD]" text="#004AAD" title="Pengembangan Perangkat Lunak Kustom">
                            <x-slot:svg>
                                <svg class="w-[24px] sm:w-[34px]" width="35" height="35" viewBox="0 0 35 35"
                                    fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M30.96 0H3.44C2.52766 0 1.65268 0.362427 1.00755 1.00755C0.362427 1.65268 0 2.52766 0 3.44V24.08C0 24.9923 0.362427 25.8673 1.00755 26.5124C1.65268 27.1576 2.52766 27.52 3.44 27.52H13.76V30.96H8.6V34.4H25.8V30.96H20.64V27.52H30.96C31.8723 27.52 32.7473 27.1576 33.3924 26.5124C34.0376 25.8673 34.4 24.9923 34.4 24.08V3.44C34.4 2.52766 34.0376 1.65268 33.3924 1.00755C32.7473 0.362427 31.8723 0 30.96 0ZM30.96 24.08H3.44V3.44H30.96V24.08ZM25.37 18.92C25.37 19.7183 25.0529 20.4839 24.4884 21.0484C23.9239 21.6129 23.1583 21.93 22.36 21.93C21.5617 21.93 20.7961 21.6129 20.2316 21.0484C19.6671 20.4839 19.35 19.7183 19.35 18.92L13.76 16.0992C13.3247 16.4343 12.8042 16.6408 12.2576 16.6953C11.7109 16.7498 11.16 16.6501 10.6671 16.4075C10.1742 16.1649 9.75907 15.7891 9.46879 15.3227C9.17851 14.8563 9.02465 14.318 9.02465 13.7686C9.02465 13.2192 9.17851 12.6809 9.46879 12.2145C9.75907 11.7481 10.1742 11.3723 10.6671 11.1297C11.16 10.8871 11.7109 10.7874 12.2576 10.8419C12.8042 10.8964 13.3247 11.1029 13.76 11.438L19.35 8.6C19.3404 7.90985 19.5655 7.23691 19.9886 6.69155C20.4116 6.14618 21.0074 5.76075 21.6783 5.59847C22.3492 5.43619 23.0553 5.50669 23.6808 5.7984C24.3064 6.09012 24.8142 6.58575 25.1211 7.20399C25.4279 7.82224 25.5156 8.52641 25.3697 9.20103C25.2238 9.87565 24.853 10.4807 24.3181 10.9169C23.7832 11.3531 23.116 11.5946 22.4258 11.6018C21.7356 11.6089 21.0635 11.3814 20.5196 10.9564L14.9812 13.76L20.5196 16.5292C20.9635 16.1777 21.4981 15.9593 22.0612 15.8994C22.6243 15.8396 23.1928 15.9407 23.7007 16.191C24.2086 16.4414 24.6351 16.8307 24.9306 17.3138C25.226 17.7968 25.3784 18.3538 25.37 18.92Z"
                                        fill="white" />
                                </svg>
                            </x-slot:svg>
                            Pembuatan Sistem Internal yang Didesain Khusus untuk Meningkatkan Kinerja Perusahaan.
                        </x-service-list>
                        <x-service-list bg="bg-black" text="black" title="Dukungan dan Pemeliharaan Berkala">
                            <x-slot:svg>
                                <svg class="w-[24px] sm:w-[34px]" width="35" height="34" viewBox="0 0 35 34"
                                    fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M14.35 19.89C14.7292 19.89 15.0867 19.8617 15.4227 19.805C15.7587 19.7483 16.0866 19.6633 16.4062 19.55L23.0125 25.925L26.6875 22.355L20.125 15.9375C20.2417 15.6258 20.3292 15.3142 20.3875 15.0025C20.4458 14.6908 20.475 14.3367 20.475 13.94C20.475 12.325 19.8847 10.944 18.704 9.7971C17.5233 8.65016 16.1012 8.07613 14.4375 8.075C13.9417 8.075 13.4458 8.13903 12.95 8.2671C12.4542 8.39516 11.9729 8.57196 11.5062 8.7975L15.6187 12.7925L13.1687 15.1725L9.05625 11.1775C8.82291 11.6308 8.64091 12.0983 8.51025 12.58C8.37958 13.0617 8.31366 13.5433 8.3125 14.025C8.3125 15.64 8.90341 17.0215 10.0852 18.1696C11.2671 19.3177 12.6887 19.8911 14.35 19.89ZM17.5 34C15.0792 34 12.8042 33.5535 10.675 32.6604C8.54583 31.7673 6.69375 30.5564 5.11875 29.0275C3.54375 27.4986 2.29717 25.6995 1.379 23.63C0.460835 21.5605 0.00116888 19.3505 2.21519e-06 17C-0.00116445 14.6495 0.458502 12.4395 1.379 10.37C2.2995 8.30053 3.54608 6.50137 5.11875 4.9725C6.69141 3.44363 8.5435 2.23267 10.675 1.3396C12.8065 0.446533 15.0815 0 17.5 0C19.9185 0 22.1935 0.446533 24.325 1.3396C26.4565 2.23267 28.3086 3.44363 29.8812 4.9725C31.4539 6.50137 32.7011 8.30053 33.6227 10.37C34.5444 12.4395 35.0035 14.6495 35 17C34.9965 19.3505 34.5368 21.5605 33.621 23.63C32.7051 25.6995 31.4586 27.4986 29.8812 29.0275C28.3039 30.5564 26.4518 31.7679 24.325 32.6621C22.1982 33.5563 19.9232 34.0023 17.5 34Z"
                                        fill="white" />
                                </svg>
                            </x-slot:svg>
                            kami menyediakan layanan perawatan dan perbaikan sistem secara berkala untuk menjaga kinerja
                            optimal aplikasi Anda.
                        </x-service-list>
                        <x-service-list bg="bg-[#004AAD]" text="#004AAD" title="Analisis Kebutuhan">
                            <x-slot:svg>
                                <svg class="w-[24px] sm:w-[34px]" width="35" height="35" viewBox="0 0 35 35"
                                    fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M0 5.38588C0 2.41134 2.41134 0 5.38588 0H24.775C27.7496 0 30.1609 2.41134 30.1609 5.38588V14.2181C28.5449 13.3921 26.7144 12.9261 24.775 12.9261C18.231 12.9261 12.9261 18.231 12.9261 24.775C12.9261 26.7144 13.3921 28.5449 14.2181 30.1609H5.38588C2.41134 30.1609 0 27.7496 0 24.775V5.38588ZM12.6106 8.3019C13.0313 7.88124 13.0313 7.19922 12.6106 6.77856C12.1899 6.35788 11.5079 6.35788 11.0873 6.77856L7.54023 10.3256L6.14755 8.93291C5.72689 8.51223 5.04487 8.51223 4.62421 8.93291C4.20353 9.35357 4.20353 10.0356 4.62421 10.4563L6.77856 12.6106C7.19922 13.0313 7.88124 13.0313 8.3019 12.6106L12.6106 8.3019ZM12.6106 17.5502C12.1899 17.1297 11.5079 17.1297 11.0873 17.5502L7.54023 21.0973L6.14755 19.7046C5.72689 19.284 5.04487 19.284 4.62421 19.7046C4.20353 20.1253 4.20353 20.8074 4.62421 21.2281L6.77856 23.3825C7.19922 23.803 7.88124 23.803 8.3019 23.3825L12.6106 19.0738C13.0313 18.653 13.0313 17.971 12.6106 17.5502ZM16.1576 8.61741C15.5628 8.61741 15.0805 9.09968 15.0805 9.69458C15.0805 10.2895 15.5628 10.7718 16.1576 10.7718H22.6207C23.2155 10.7718 23.6979 10.2895 23.6979 9.69458C23.6979 9.09968 23.2155 8.61741 22.6207 8.61741H16.1576Z"
                                        fill="white" />
                                    <path
                                        d="M24.7747 34.4696C30.1289 34.4696 34.4692 30.1292 34.4692 24.775C34.4692 19.4208 30.1289 15.0804 24.7747 15.0804C19.4204 15.0804 15.0801 19.4208 15.0801 24.775C15.0801 30.1292 19.4204 34.4696 24.7747 34.4696ZM24.7747 19.3891C25.3695 19.3891 25.8518 19.8715 25.8518 20.4663V23.6979H29.0834C29.6782 23.6979 30.1605 24.1802 30.1605 24.775C30.1605 25.3698 29.6782 25.8522 29.0834 25.8522H25.8518V29.0837C25.8518 29.6785 25.3695 30.1609 24.7747 30.1609C24.1798 30.1609 23.6975 29.6785 23.6975 29.0837V25.8522H20.466C19.8711 25.8522 19.3888 25.3698 19.3888 24.775C19.3888 24.1802 19.8711 23.6979 20.466 23.6979H23.6975V20.4663C23.6975 19.8715 24.1798 19.3891 24.7747 19.3891Z"
                                        fill="white" />
                                </svg>
                            </x-slot:svg>
                            Kami menghadirkan layanan jasa IT khusus untuk menyempurnakan sistem internal bisnis Anda.
                        </x-service-list>
                    </div>
                </div>
                <div class="flex justify-center xl:hidden w-full">
                    <img loading="lazy" class="w-full lg:w-3/4" src="{{ asset('storage/images/how.png') }}"
                        alt="">
                </div>
            </div>
        </div>
    </section>

    {{-- Kembangkan --}}
    <section class="w-full relative flex bg-black justify-center">
        <div class="absolute left-0 bottom-0">
            <img loading="lazy" class="w-full z-[2]" src="{{ asset('storage/svg/meliuk1.svg') }}" alt="">
        </div>
        <div class="absolute right-0 top-0">
            <img loading="lazy" class="w-full z-[2]" src="{{ asset('storage/svg/meliuk2.svg') }}" alt="">
        </div>
        <div class="w-full lg:max-w-[900px] max-w-[600px] xl:max-w-[1155px] pt-[100px] pb-[140px]">
            <div class="space-y-[62px] w-full px-5 justify-center">
                <div class="text-white flex justify-center">
                    <h1
                        class="inter leading-[38px] text-center sm:leading-[60px] xl:leading-[28px] text-[38px] sm:text-[48px] font-bold">
                        Ayo Kembangkan Bisnismu Sekarang</h1>
                </div>
                <div class="text-white flex justify-center">
                    <p class="text-[16px] max-w-[860px] text-center leading-[28px] font-semibold">Kami hadir untuk
                        membantu setiap tahap perjalanan digital bisnismu. mulai dari membangun citra
                        profesional melalui company profile, mengelola operasional dengan sistem ERP yang terintegrasi,
                        hingga meningkatkan efisiensi penjualan melalui solusi Point of Sales yang andal.</p>
                </div>
            </div>
            <div class="relative z-10 pt-[48px] space-y-[50px]">
                <div class="swiper h-full swiperService w-full">
                    <div class="swiper-wrapper">
                        @foreach ($services as $service)
                            <div class="swiper-slide slide-Service">
                                <x-service-card link="/product-service/{{ $service->id }}"
                                    style="tilt-warp text-[20px]" src="{{ $service->logo }}"
                                    title="{{ $service->name }}"
                                    hidden="{{ $service->show_name === 0 ? 'hidden' : '' }}">
                                    {{ Str::limit($service->short_description, 130, '...') }}
                                </x-service-card>
                            </div>
                        @endforeach
                    </div>
                </div>
                <div class=" absolute px-5 top-0 w-full flex items-center h-full justify-between">
                    <button
                        class="custom-next sm:-left-[50px] xl:-left-[60px] z-[100] relative flex justify-center items-center hover:cursor-pointer hover:bg-[#A2FF0A] hover:text-[#004AAD] text-white transition-all duration-500 w-[43px] h-[43px] rounded-full bg-[#004AAD]">
                        <svg width="10" height="17" viewBox="0 0 10 17" fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M0.107682 8.5L7.85768 16.25L9.66602 14.4417L3.72435 8.5L9.66602 2.55833L7.85768 0.75L0.107682 8.5Z"
                                fill="currentColor" />
                        </svg>

                    </button>
                    <button
                        class="custom-prev sm:-right-[50px] xl:-right-[60px] z-[100] relative flex justify-center items-center hover:cursor-pointer hover:bg-[#A2FF0A] hover:text-[#004AAD] text-white transition-all duration-500 w-[43px] h-[43px] rounded-full bg-[#004AAD]">
                        <svg width="10" height="17" viewBox="0 0 10 17" fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9.89232 8.5L2.14232 16.25L0.333984 14.4417L6.27565 8.5L0.333984 2.55833L2.14232 0.75L9.89232 8.5Z"
                                fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="flex justify-center">
                <x-button-main label="Lihat lainnya" href="/product-service" style="text-white relative z-[20]" />
            </div>
        </div>
    </section>

    {{-- Quote --}}
    <section class="w-full flex justify-center bg-[#A2FF0A]">
        <div class="w-full flex justify-center py-[60px]">
            <div class="swiper swiperQuote">
                <div class="swiper-wrapper">
                    <div class="swiper-slide">
                        <div class="text-[#004AAD] flex justify-center text-center">
                            <div class="space-y-[42px] px-5 lg:px-0 max-w-[1155px]">
                                <h3
                                    class="inter text-[30px] lg:text-[40px] font-bold leading-[38px] lg:leading-[28px]">
                                    Kualitas Adalah Investasi
                                    Terbaik
                                    Untuk Masa Depan</h3>
                                <p class="text[16px] font-semibold leading-[28px] inter">
                                    Kualitas bukan sekadar hasil akhir tetapi juga adalah fondasi jangka panjang. Dengan
                                    memilih kualitas, Anda berinvestasi pada keandalan, kepercayaan, dan pertumbuhan
                                    berkelanjutan di masa depan.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="swiper-slide">
                        <div class="text-[#004AAD] flex justify-center text-center">
                            <div class="space-y-[42px] px-5 lg:px-0 max-w-[1155px]">
                                <h3
                                    class="inter text-[30px] lg:text-[40px] font-bold leading-[38px] lg:leading-[28px]">
                                    “Sendiri kita cepat, bersama kita hebat.”</h3>
                                <p class="text[16px] font-semibold leading-[28px] inter">
                                    Tim IT solid yang tumbuh lewat kolaborasi, inovasi, dan semangat untuk terus
                                    belajar.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="swiper-slide">
                        <div class="text-[#004AAD] flex justify-center text-center">
                            <div class="space-y-[42px] px-5 lg:px-0 max-w-[1155px]">
                                <h3
                                    class="inter text-[30px] lg:text-[40px] font-bold leading-[38px] lg:leading-[28px]">
                                    “Kekuatan tim ada pada kepercayaan dan kerja sama.”</h3>
                                <p class="text[16px] font-semibold leading-[28px] inter">
                                    Kami tim IT yang bergerak bersama, berpikir cerdas, dan bertindak cepat.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {{-- Contact Us --}}
    <section class="w-full flex justify-center">
        <div class="w-full max-w-[1155px] px-5 lg:px-0 flex justify-center items-center py-[128px]">
            <div class="space-y-[50px]">
                <div class="space-y-[35px]">
                    <div class="w-full flex justify-center">
                        <img loading="lazy" class="h-[50px]" src="{{ asset('storage/images/logo.png') }}"
                            loading="lazy" alt="">
                    </div>
                    <h3 class="text-[26px] lg:text-[36px] text-center font-bold inter"><span
                            class="text-[#004AAD]">Wujudkan</span>
                        Transformasi
                        Digital <span class="text-[#004AAD]">Bisnis Anda</span> Bersama Kami.</h3>
                    <div class="w-full flex justify-center">
                        <p class="max-w-[775px] inter font-semibold text-[16px] leading-[28px] text-center">Wujudkan
                            bisnis yang lebih efisien, modern, dan kompetitif dengan layanan digital kami—mulai dari
                            pengembangan sistem hingga integrasi solusi yang dirancang sesuai kebutuhan Anda.</p>
                    </div>
                </div>
                <div class="flex justify-center w-full gap-[10px] md:gap-[47px]">
                    <x-button-contact href="https://wa.me/628123456789" label="Whatsapp" bg="bg-[#004AAD]">
                        <x-slot:svg>
                            <svg width="30" height="31" viewBox="0 0 30 31" fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M24.7819 5.16033C23.4447 3.81007 21.8521 2.73945 20.097 2.01086C18.3419 1.28227 16.4593 0.910287 14.559 0.916583C6.59648 0.916583 0.106901 7.40617 0.106901 15.3687C0.106901 17.9207 0.777735 20.3999 2.0319 22.5874L-0.00976562 30.0832L7.64649 28.0707C9.76107 29.2228 12.1382 29.8353 14.559 29.8353C22.5215 29.8353 29.0111 23.3457 29.0111 15.3832C29.0111 11.5187 27.509 7.88742 24.7819 5.16033ZM14.559 27.3853C12.4007 27.3853 10.2861 26.802 8.43399 25.7082L7.99648 25.4457L3.44649 26.6416L4.6569 22.2083L4.36524 21.7562C3.16583 19.8415 2.52908 17.628 2.52773 15.3687C2.52773 8.74783 7.92357 3.352 14.5444 3.352C17.7527 3.352 20.7715 4.60617 23.0319 6.88117C24.1513 7.99513 25.0385 9.32029 25.6418 10.7798C26.2451 12.2392 26.5526 13.804 26.5465 15.3832C26.5757 22.0041 21.1798 27.3853 14.559 27.3853ZM21.1507 18.402C20.7861 18.227 19.0069 17.352 18.6861 17.2207C18.3507 17.1041 18.1173 17.0457 17.8694 17.3958C17.6215 17.7603 16.9361 18.577 16.7319 18.8103C16.5277 19.0583 16.309 19.0874 15.9444 18.8978C15.5798 18.7228 14.4132 18.3291 13.0423 17.1041C11.9632 16.1416 11.2486 14.9603 11.0298 14.5957C10.8257 14.2312 11.0007 14.0416 11.1902 13.852C11.3507 13.6916 11.5548 13.4291 11.7298 13.2249C11.9048 13.0207 11.9777 12.8603 12.0944 12.627C12.2111 12.3791 12.1527 12.1749 12.0652 11.9999C11.9777 11.8249 11.2486 10.0457 10.9569 9.31658C10.6652 8.61658 10.359 8.70408 10.1402 8.6895H9.44024C9.19232 8.6895 8.81315 8.777 8.47773 9.14158C8.1569 9.50617 7.22357 10.3812 7.22357 12.1603C7.22357 13.9395 8.52149 15.6603 8.69649 15.8937C8.87149 16.1416 11.2486 19.7874 14.8652 21.3478C15.7257 21.727 16.3965 21.9457 16.9215 22.1062C17.7819 22.3832 18.5694 22.3395 19.1965 22.252C19.8965 22.1499 21.3402 21.377 21.6319 20.5312C21.9382 19.6853 21.9382 18.9707 21.8361 18.8103C21.734 18.6499 21.5152 18.577 21.1507 18.402Z"
                                    fill="currentColor" />
                            </svg>
                        </x-slot:svg>
                    </x-button-contact>
                    <x-button-contact-us />
                </div>
            </div>
    </section>
</div>
