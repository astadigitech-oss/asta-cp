<div>
    <div class="relative z-[100] bg-white w-screen flex justify-center">
        <div class="reative w-full max-w-[1395px] items-center h-[90px] flex justify-center">
            <div class="w-full px-5 lg:px-0 justify-between flex items-center max-w-[900px] xl:max-w-[1155px]">
                <x-logo size="w-[85px] h-auto" logo="logo.png" />
                <div class="gap-[54px] xl:flex items-center hidden">
                    <div class="flex items-center gap-[40px]">
                        {{-- Menu Home --}}
                        <x-menu href="/" label="Home" />
                        {{-- Menu Products & Services --}}
                        <x-menu-dropdown href="/product-service" hiddenSecondary="hidden" label="Product & Services"
                            textSeeMore="See All Products & Services">
                            <div class="w-full gap-10 space-y-[16px]">
                                <p class="text-[#5D5D5D]">Product & Services</p>
                                <div class="grid w-full grid-cols-3 space-y-[17px]">
                                    @foreach ($services as $service)
                                        <x-menu-sub href="/product-service/{{ $service->id }}"
                                            hiddenTitle="{{ $service->show_name === 0 ? 'hidden' : '' }}"
                                            src="{{ $service->logo }}" font="suez-one" title="{{ $service->name }}"
                                            size="text-[20px]"
                                            maxW="max-w-[312px]">{{ Str::limit($service->short_description, 130, '...') }}</x-menu-sub>
                                    @endforeach
                                </div>
                            </div>
                        </x-menu-dropdown>


                        {{-- Portofolios --}}
                        <x-menu-dropdown href="/portfolio" :tabs="['Mobile', 'Desktop']" hidden='hidden' default="Mobile"
                            label="Portfolios" textSeeMore="See All Portfolios">

                            <div class="relative z-[2] w-full pl-[350px]">
                                <div id="portfolio-mobile" class="w-full gap-10">
                                    <div x-show="activeTab === 'Mobile'">
                                        <p class="text-[#5D5D5D] pb-5">
                                            Portfolios Mobile
                                        </p>
                                        <div class="grid grid-cols-2 gap-x-[10px] gap-y-[10px]">
                                            @foreach ($mobiles as $mobile)
                                                <x-portfolio-tab src="{{ $mobile->image }}" title="{{ $mobile->name }}">
                                                    {!! \Illuminate\Support\Str::limit($mobile->description, 100) !!}
                                                </x-portfolio-tab>
                                            @endforeach
                                        </div>
                                    </div>
                                    <div x-show="activeTab === 'Desktop'">
                                        <p class="text-[#5D5D5D] pb-5">
                                            Portfolios Desktop
                                        </p>
                                        <div class="grid grid-cols-2 gap-x-[10px] gap-y-[10px]">
                                            @foreach ($desktops as $desktop)
                                                <x-portfolio-tab src="{{ $desktop->image }}"
                                                    title="{{ $desktop->name }}">
                                                    {!! \Illuminate\Support\Str::limit($desktop->description, 100) !!}
                                                </x-portfolio-tab>
                                            @endforeach
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </x-menu-dropdown>


                        {{-- Discover --}}
                        <x-menu-dropdown href="/discover" hiddenSecondary="hidden" label="Discover"
                            textSeeMore="See All Discover">
                            <div class="w-full space-y-[16px]">
                                <p class="text-[#5D5D5D]">Discover</p>
                                <div class="flex gap-[25px]">
                                    <div class="grid w-[795px] grid-cols-2 gap-[25px]">
                                        @foreach ($discovers as $discover)
                                            <x-menu-sub maxW="max-w-[394px]" href="/discover"
                                                src="{{ $discover->logo }}"
                                                hiddenTitle="{{ $discover->show_name === 0 ? 'hidden' : '' }}"
                                                font="suez-one" title="{{ $discover->name }}" size="text-[20px]">
                                                <div class="grid w-full grid-cols-[auto_auto] py-2">
                                                    @foreach ($discover->DiscoverLists->chunk(2) as $chunk)
                                                        <x-list-warp>
                                                            @foreach ($chunk as $list)
                                                                <x-list-item text="{{ \Illuminate\Support\Str::limit($list->description, 23, '...') }}" />
                                                            @endforeach
                                                        </x-list-warp>
                                                    @endforeach
                                                </div>
                                            </x-menu-sub>
                                        @endforeach
                                    </div>
                                    <div class="h-[188px] border-r-[2px] border-[#8D8D8D]"></div>
                                    <div class="relative -top-5">
                                        <h3 class="text-[20px] font-bold text-[#004AAD]">
                                            Cerita <span class="text-[#38B6FF]">Asta</span>
                                        </h3>
                                        <div class="relative w-[320px]">
                                            <div
                                                class="relative z-[2] flex gap-[14px] rounded-[8px] bg-[#E7F6FF] p-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
                                                <img loading="lazy" src={{ asset('storage/images/story.png') }}
                                                    class="w-[136px]" alt="" />
                                                <p class="text-[10px] leading-[20px]">
                                                    Di balik layar setiap sistem yang berjalan lancar, ada kami tim IT
                                                    yang selalu
                                                    siap untuk memecahkan setiap tantangan teknologi.
                                                </p>
                                            </div>
                                            <div
                                                class="absolute -bottom-[40px] left-0 z-[1] flex h-[73px] w-full items-end rounded-[8px] bg-[#A2FF0A] px-[5px] pb-[8px] text-[#004AAD]">
                                                <a href=""
                                                    class="inter flex items-center text-center w-full justify-center gap-[5px] text-[14px] font-medium">
                                                    <p>Masih Tahap Develpoment</p>
                                                    <img loading="lazy" class="w-[14px]" src="{{ asset('storage/svg/arrow.svg') }}" alt="" />
                                                </a>
                                            </div>
                                            <div class="absolute -bottom-[50px] z-[0] flex w-full justify-center">
                                                <div class="h-[73px] w-[304px] rounded-[8px] bg-[#004AAD]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </x-menu-dropdown>
                    </div>
                    <x-button-main href="/discover#contact" label="Contact Us" style="" />
                </div>
                <div class="xl:hidden">
                    <x-burger />
                </div>
            </div>
        </div>
    </div>
</div>
