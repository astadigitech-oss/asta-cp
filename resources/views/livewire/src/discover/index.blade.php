<div>
    {{-- Main Content --}}
    <section class="w-full flex justify-center">
        <div class="h-[750px] absolute top-0 left-0 w-screen overflow-x-clip">
            <div class="relative w-full h-full">
                <div
                    class="absolute z-[1] -left-[10px] top-[150px] sm:top-[350px] w-[150px] h-[150px] rounded-full bg-[#004AAD] blur-[105px]">
                </div>
                <div
                    class="absolute z-[1] -right-[100px] -bottom-[0px] w-[350px] h-[350px] rounded-full bg-[#A2FF0A] blur-[175px]">
                </div>
            </div>
        </div>

        {{-- Hero --}}
        <div class="w-full h-[750px] flex justify-center relative z-[20] items-center max-w-[1155px]">
            <div class="w-full space-y-[50px]">
                <div class="w-full flex justify-center text-center">
                    <h1 class="text-center font-bold text-[48px] inter leading-[48px] xl:leading-[28px]">Dapatkan
                        <span class="text-[#004AAD]">Sekarang</span>
                    </h1>
                </div>
                <div class="w-full flex justify-center items-center relative">
                    <div class="swiper swiperDiscover">
                        <div class="swiper-wrapper">
                            @foreach ($services as $service)
                                <div class="swiper-slide">
                                    <div class="flex py-[50px] w-full justify-center">
                                        <x-service-card label="Konsultasi Sekarang" :secondBg="true"
                                            src="{{ $service->logo }}" title="{{ $service->name }}"
                                            hidden="{{ $service->show_name === 0 ? 'hidden' : '' }}"
                                            link="https://wa.me/6281578823564">
                                            <div class="w-full space-y-0">
                                                @foreach ($service->DiscoverLists as $item)
                                                    <div class="flex items-center gap-[5px]">
                                                        <svg class="text-[#004AAD]" width="10" height="10"
                                                            viewBox="0 0 10 10" fill="currentColor"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <path
                                                                d="M4.3 7.3L7.825 3.775L7.125 3.075L4.3 5.9L2.875 4.475L2.175 5.175L4.3 7.3ZM5 10C4.30833 10 3.65833 9.86866 3.05 9.606C2.44167 9.34333 1.9125 8.98716 1.4625 8.5375C1.0125 8.08783 0.656334 7.55866 0.394 6.95C0.131667 6.34133 0.000333966 5.69133 6.32911e-07 5C-0.0003327 4.30867 0.131001 3.65867 0.394 3.05C0.657 2.44133 1.01317 1.91217 1.4625 1.4625C1.91183 1.01283 2.441 0.656667 3.05 0.394C3.659 0.131333 4.309 0 5 0C5.691 0 6.341 0.131333 6.95 0.394C7.559 0.656667 8.08816 1.01283 8.5375 1.4625C8.98683 1.91217 9.34316 2.44133 9.60649 3.05C9.86983 3.65867 10.001 4.30867 9.99999 5C9.99899 5.69133 9.86766 6.34133 9.60599 6.95C9.34433 7.55866 8.98816 8.08783 8.5375 8.5375C8.08683 8.98716 7.55766 9.3435 6.95 9.6065C6.34233 9.8695 5.69233 10.0007 5 10Z"
                                                                fill="currentColor" />
                                                        </svg>
                                                        <div class="portfolio-content text-[12px] inter leading-[20px]">{!! $item->description !!}</div>
                                                    </div>
                                                @endforeach
                                            </div>
                                        </x-service-card>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                    <div class=" absolute px-5 top-0 w-full flex items-center h-full justify-between">
                        <button
                            class="discover-prev xl:-left-[60px] z-[50] relative flex justify-center items-center hover:cursor-pointer hover:bg-[#A2FF0A] hover:text-[#004AAD] text-white transition-all duration-500 w-[43px] h-[43px] rounded-full bg-[#004AAD]">
                            <svg width="10" height="17" viewBox="0 0 10 17" fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M0.107682 8.5L7.85768 16.25L9.66602 14.4417L3.72435 8.5L9.66602 2.55833L7.85768 0.75L0.107682 8.5Z"
                                    fill="currentColor" />
                            </svg>

                        </button>
                        <button
                            class="discover-next xl:-right-[60px] z-[50] relative flex justify-center items-center hover:cursor-pointer hover:bg-[#A2FF0A] hover:text-[#004AAD] text-white transition-all duration-500 w-[43px] h-[43px] rounded-full bg-[#004AAD]">
                            <svg width="10" height="17" viewBox="0 0 10 17" fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M9.89232 8.5L2.14232 16.25L0.333984 14.4417L6.27565 8.5L0.333984 2.55833L2.14232 0.75L9.89232 8.5Z"
                                    fill="currentColor" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>


    {{-- Konsultasi --}}
    <section class="w-full px-5 flex justify-center">
        <div class="w-full pb-[50px] lg:pb-[100px] max-w-[1155px]  relative z-[20]">
            <div class=" pt-[50px] flex justify-center lg:justify-end">
                <div class="space-y-[32px]">
                    <h3 class="text-[48px] text-center lg:text-end leading-[48px] sm:leading-[28px] font-bold inter">Ayo
                        <span class="text-[#004AAD]">Bergabung</span> Sekarang Juga
                    </h3>
                    <div class="flex justify-end">
                        <p class="text-[16px] text-center lg:text-end max-w-[596px] inter">Jangan ragu memulai langkah
                            di dunia maya
                            bersama Asta Digital Agency. Karena kami akan selalu membantumu</p>
                    </div>
                    <div class="w-full lg:w-auto flex justify-center lg:justify-end">
                        <a href="#contact"
                            class="text-white transition-all duration-300 bg-black hover:bg-[#004AAD] w-[300px] lg:w-[383px] h-[70px] lg:h-[79px] text-[20px] lg:text-[32px] font-bold grotesk flex items-center justify-center rounded-[8px]">
                            Jadwalkan Konsultasi
                        </a>
                    </div>
                </div>
            </div>
            <div class=" lg:absolute h-full top-0 lg:flex items-center justify-start">
                <img loading="lazy" src="{{ asset('storage/images/discover.png') }}" class="w-full lg:w-[577px]"
                    alt="">
            </div>
        </div>
    </section>

    {{-- Keunggulan --}}
    <section class="flex px-5 z-[20] relative py-[20px] md:py-[50px] lg:py-[200px] pb-[100px] justify-center w-full">
        <div class="absolute z-[1] left-1/3 top-[0px] w-[150px] h-[150px] rounded-full bg-[#004AAD] blur-[105px]">
        </div>
        <div wire:ignore class="w-full max-w-[700px] lg:max-w-[900px] xl:max-w-[1155px]">
            <x-advantage />
        </div>
    </section>

    {{-- Contact --}}
    <section id="contact" class="w-full px-5 flex relative justify-center bg-black">
        <div class="max-w-[700px] lg:max-w-[900px] py-[100px] xl:max-w-[1155px] w-full">
            <div class="md:flex items-center justify-between">
                <div class="w-full md:w-[40%]">
                    <form wire:submit.prevent="save" class="space-y-[15px] w-full">
                        <div class="grid lg:grid-cols-2 gap-[15px]">
                            <div class="relative">
                                <input type="text" placeholder="Nama Depan" wire:model="first_name" required
                                    class="w-full box-border py-[13px] px-[21px] bg-white outline-none rounded-[8px] border border-gray-300" />
                                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#004AAD]">*</span>
                                @error('first_name')
                                    <span class="text-red-500 text-sm">{{ $message }}</span>
                                @enderror
                            </div>

                            <div class="relative">
                                <input type="text" placeholder="Nama Belakang" wire:model="last_name" required
                                    class="w-full box-border py-[13px] px-[21px] bg-white outline-none rounded-[8px] border border-gray-300" />
                                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#004AAD]">*</span>
                                @error('last_name')
                                    <span class="text-red-500 text-sm">{{ $message }}</span>
                                @enderror
                            </div>
                        </div>

                        <div class="relative">
                            <input type="tel" inputmode="numeric" placeholder="Nomor Telepon/Whatsapp" wire:model="phone" required
                                class="w-full box-border py-[13px] px-[21px] bg-white outline-none rounded-[8px] border border-gray-300" />
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#004AAD]">*</span>
                            @error('phone')
                                <span class="text-red-500 text-sm">{{ $message }}</span>
                            @enderror
                        </div>

                        <div class="relative">
                            <input type="text" placeholder="Email" wire:model="email" required
                                class="w-full box-border py-[13px] px-[21px] bg-white outline-none rounded-[8px] border border-gray-300" />
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#004AAD]">*</span>
                            @error('email')
                                <span class="text-red-500 text-sm">{{ $message }}</span>
                            @enderror
                        </div>

                        <textarea wire:model="message" placeholder="Tulis Pesan Disini"
                            class="w-full rounded-[8px] px-[21px] py-[13px] outline-none h-[180px] bg-white"></textarea>
                        @error('message')
                            <span class="text-red-500 text-sm">{{ $message }}</span>
                        @enderror

                        <button type="submit"
                            class="w-full text-[24px] hover:cursor-pointer rounded-[8px] hover:text-[#004AAD] transition-all duration-300 hover:bg-[#A2FF0A] font-bold grostesk text-white bg-[#004AAD] flex justify-center py-[13px]">
                            Kirim Pesan
                        </button>

                        @if (session()->has('success'))
                            <p class="text-green-500 text-center mt-2">{{ session('success') }}</p>
                        @endif
                    </form>

                </div>
                <div class="w-full md:w-[55%]">
                    <img loading="lazy" src="{{ asset('storage/images/contact.png') }}" class="w-full"
                        alt="">
                </div>
            </div>
        </div>
    </section>

    <section class="h-[50px]">

    </section>
</div>
