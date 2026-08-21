<div>
    {{-- Hero --}}
    <section class="relative w-full px-5 flex h-[750px] justify-center overflow-hidden">
        <div class="relative max-w-[1395px] w-full flex justify-center">
            <div class="w-full justify-center max-w-[1155px]">
                <div
                    class="absolute -left-[150px] bottom-[200px] w-[269px] h-[269px] rounded-full bg-[#004AAD] blur-[175px]">
                </div>
                <div
                    class="absolute -right-[280px] -bottom-[280px] w-[569px] h-[569px] rounded-full bg-[#A2FF0A] blur-[175px]">
                </div>
                <div class="space-y-[35px]  relative top-[60px]">
                    <div class="space-y-[40px]">
                        <h1 class="text-center font-bold text-[48px] inter leading-[48px] xl:leading-[28px]">Produk &
                            <span class="text-[#004AAD]">Layanan Kami</span>
                        </h1>
                        <div class="w-full flex justify-center">
                            <p class="inter text-[16px] leading-[28px] max-w-[800px] text-center">
                                Kami percaya bahwa setiap solusi harus dirancang berdasarkan kebutuhan nyata pengguna.
                                Karena
                                itu,
                                semua sistem yang kami kembangkan disesuaikan untuk mempermudah operasional,
                                meningkatkan
                                efisiensi,
                                dan mendukung pertumbuhan perusahaan Anda.
                            </p>
                        </div>
                    </div>
                    <div class="flex justify-center">
                        <div class="max-w-[890px]">
                            <img loading="lazy" class="w-full h-auto" loading="lazy"
                                src="{{ asset('storage/images/productServices.png') }}" alt="">
                        </div>
                    </div>
                    <div class="flex justify-center">
                        <x-button-main style="w-[250px]" label="Konsultasi Sekarang"
                            href="https://wa.me/6281578823564" />
                    </div>
                </div>
            </div>
        </div>
    </section>

    {{-- Temukan Product --}}
    <section class=" pt-[100px] relative px-5 pb-[100px] w-full flex justify-center">
        <div class="w-full max-w-[1155px]">
            <h1 class="text-center font-bold text-[48px] inter leading-[48px] xl:leading-[28px]"><span
                    class="text-[#004AAD]">Temukan</span> Produk & Layanan <span class="text-[#004AAD]">Kami</span></h1>
            <div class="w-full pt-[100px] hidden lg:grid-cols-3 lg:grid xl:grid-cols-4 space-y-[23px] gap-[23px]">
                @foreach ($dataServices as $service)
                    <div class="flex justify-center">
                        <x-service-card link="/product-service/{{ $service->id }}" :secondBg="true"
                            src="{{ $service->logo }}" hidden="{{ $service->show_name === 0 ? 'hidden' : '' }}"
                            title="{{ $service->name }}" style="suez-one text-[20px]">
                            {{ Str::limit(strip_tags($service->short_description), 130, '...') }}
                        </x-service-card>
                    </div>
                @endforeach
            </div>
            <div class="lg:hidden pt-[50px] w-full">
                <div class="swiper swiperProduct">
                    <div class="swiper-wrapper">
                        @foreach ($dataServices as $service)
                            <div class="swiper-slide">
                                <div class="flex w-full justify-center">
                                    <x-service-card :secondBg="true" src="{{ $service->logo }}"
                                        title="{{ $service->name }}"
                                        hidden="{{ $service->show_name === 0 ? 'hidden' : '' }}"
                                        link="/product-service/{{ $service->id }}" style="suez-one text-[20px]">
                                        {{ Str::limit(strip_tags($service->short_description), 130, '...') }}
                                    </x-service-card>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
            <div class=" absolute lg:hidden top-10 left-0 px-5 w-full flex items-center h-full justify-between">
                <button
                    class="custom-next  z-[10] relative flex justify-center items-center hover:cursor-pointer hover:bg-[#A2FF0A] hover:text-[#004AAD] text-white transition-all duration-500 w-[43px] h-[43px] rounded-full bg-[#004AAD]">
                    <svg width="10" height="17" viewBox="0 0 10 17" fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M0.107682 8.5L7.85768 16.25L9.66602 14.4417L3.72435 8.5L9.66602 2.55833L7.85768 0.75L0.107682 8.5Z"
                            fill="currentColor" />
                    </svg>

                </button>
                <button
                    class="custom-prev   z-[10] relative flex justify-center items-center hover:cursor-pointer hover:bg-[#A2FF0A] hover:text-[#004AAD] text-white transition-all duration-500 w-[43px] h-[43px] rounded-full bg-[#004AAD]">
                    <svg width="10" height="17" viewBox="0 0 10 17" fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M9.89232 8.5L2.14232 16.25L0.333984 14.4417L6.27565 8.5L0.333984 2.55833L2.14232 0.75L9.89232 8.5Z"
                            fill="currentColor" />
                    </svg>
                </button>
            </div>
        </div>
    </section>

    {{-- Konsultasi --}}
    <section class="w-full px-5 flex justify-center bg-[#A2FF0A] py-[70px]">
        <div class="w-full space-y-10 lg:space-y-0 lg:flex items-center justify-between max-w-[1155px]">
            <div class="space-y-3 text-[#004AAD]">
                <h2
                    class="lg:max-w-[645px] text-center lg:text-start text-[38px] lg:text-[48px] font-bold inter leading-[58px]">
                    Siap
                    Berkembang Bersama
                    Asta Digital Agency ?
                </h2>
                <p class="lg:max-w-[645px] text-center lg:text-start inter font-semibold text-[16px]">Transformasikan
                    operasional bisnis Anda ke
                    digital bersama kami sekarang juga</p>
            </div>
            <div class="w-full lg:w-auto flex justify-center">
                <a href="/discover#contact"
                    class="text-white transition-all duration-300 bg-black hover:bg-[#004AAD] w-[300px] lg:w-[383px] h-[70px] lg:h-[79px] text-[20px] lg:text-[32px] font-bold grotesk flex items-center justify-center rounded-[8px]">
                    Jadwalkan Konsultasi
                </a>
            </div>
        </div>
    </section>

    {{-- Dipercaya --}}
    <x-trusted swiperName="swiperLogo" />
</div>
