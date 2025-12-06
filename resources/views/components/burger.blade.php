<div>
    <div x-data="{ burgerActive: false, product: false, portfolio: false, discover: false }">
        <button @click="burgerActive = !burgerActive" class="group space-y-1">
            <!-- Garis 1 -->
            <span
                class="block h-0.5 w-6 rounded bg-black transition-all duration-300 ease-in-out group-hover:translate-y-2 group-hover:rotate-45"
                :class="burgerActive ? 'translate-y-2 rotate-45' : 'translate-y-0 rotate-0'"></span>

            <!-- Garis 2 -->
            <span class="block h-0.5 w-6 rounded bg-black transition-all duration-300 ease-in-out group-hover:opacity-0"
                :class="burgerActive ? 'opacity-0' : 'opacity-100'"></span>

            <!-- Garis 3 -->
            <span
                class="block h-0.5 w-6 rounded bg-black transition-all duration-300 ease-in-out group-hover:-translate-y-2 group-hover:-rotate-45"
                :class="burgerActive ? '-translate-y-2 -rotate-45' : 'translate-y-0 rotate-0'"></span>
        </button>

        <div x-cloak
            class="absolute bg-white top-[90px] left-0 z-[100] flex w-full py-3 justify-center transition-all duration-500
            overflow-y-auto max-h-[calc(100vh-90px)]"
            :class="burgerActive ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-5 opacity-0'">
            <div class="pb-10 w-full flex justify-center">
                <div class="space-y-3 w-full px-5 lg:px-0 max-w-[900px]">
                    {{-- Home --}}
                    <a href="/"
                        class="py-5 border-b-[1px] border-gray-400 flex justify-between items-center text-[20px] font-bold inter">
                        <p>Home</p>
                    </a>

                    {{-- Product & Services --}}
                    <button @click="product = !product"
                        class="py-5 border-b-[1px] border-gray-400 block w-full text-[20px] font-bold inter">
                        <div class="flex justify-between items-center">
                            <span :class="product ? 'text-[#004AAD]' : 'text-black'">Product & Services</span>
                            <span :class="product ? 'text-[#A2FF0A]' : 'text-black'"
                                x-text="product ? '▼' : '▲'"></span>
                        </div>
                        <div class="overflow-hidden space-y-[30px] transition-all duration-500 ease-in-out"
                            :class="product ? 'max-h-[1000px] py-2' : 'max-h-0'">
                            <div class="relative">
                                <div class="absolute z-[101] left-0 w-[20px] h-full bg-[#004AAD]"></div>
                                <div class="w-full pl-[30px] flex justify-start">
                                    <div class="py-5 space-y-5 w-full">
                                        @foreach ($services as $service)
                                            <a class="py-5 border-b-2 border-gray-100 flex items-center gap-3 w-full"
                                                href="/product-service/{{ $service->id }}">
                                                <div class="{{ $service->show_name === 0 ? '' : 'w-[60px]' }}">
                                                    <img loading="lazy" src="{{ asset('storage/' . $service->logo) }}"
                                                        class="h-[50px]" alt="">
                                                </div>
                                                <p
                                                    class="inter text-[20px] {{ $service->show_name === 0 ? 'hidden' : '' }}">
                                                    {{ $service->name }}</p>
                                            </a>
                                        @endforeach
                                    </div>
                                </div>
                            </div>
                            <div class="w-full inline-block pl-[30px] justify-start">
                                <a href="/product-service"
                                    class="inter {textSeeMoreStyle} flex items-center gap-[5px] text-[14px] font-medium transition-all duration-300 hover:scale-105 hover:text-[#A2FF0A] text-[#1A81E2]">
                                    <p>See All Products & Services</p>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M10.9445 7.91702L6.53972 12.441C6.35994 12.6257 6.27364 12.8411 6.28083 13.0873C6.28802 13.3335 6.38181 13.5489 6.5622 13.7336C6.74198 13.9029 6.95173 13.9915 7.19145 13.9995C7.43116 14.0075 7.64091 13.9189 7.8207 13.7336L13.7536 7.64004C13.8435 7.54771 13.9074 7.44769 13.9451 7.33998C13.9829 7.23226 14.0011 7.11685 13.9999 6.99375C13.9987 6.87065 13.9799 6.75524 13.9433 6.64753C13.9068 6.53981 13.8432 6.43979 13.7527 6.34746L7.8198 0.253898C7.65499 0.0846325 7.44884 0 7.20133 0C6.95383 0 6.74048 0.0846325 6.5613 0.253898C6.38151 0.438552 6.29162 0.657982 6.29162 0.912188C6.29162 1.16639 6.38151 1.38552 6.5613 1.56955L10.9445 6.07048H0.898933C0.644237 6.07048 0.430592 6.15912 0.257997 6.33638C0.0854015 6.51365 -0.000596046 6.73277 2.86102e-06 6.99375C0.000601768 7.25473 0.0868998 7.47416 0.258895 7.65204C0.43089 7.82992 0.644237 7.91825 0.898933 7.91702H10.9445Z"
                                            fill="currentColor" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </button>

                    {{-- Portfolios --}}
                    <button @click="portfolio = !portfolio"
                        class="py-5 border-b-[1px] border-gray-400 block w-full text-[20px] font-bold inter">
                        <div class="flex justify-between items-center">
                            <span :class="portfolio ? 'text-[#004AAD]' : 'text-black'">Portfolios</span>
                            <span :class="portfolio ? 'text-[#A2FF0A]' : 'text-black'"
                                x-text="portfolio ? '▼' : '▲'"></span>
                        </div>
                        <div class="overflow-hidden transition-all duration-500 ease-in-out"
                            :class="portfolio ? 'max-h-[1000px] py-2' : 'max-h-0'">
                            <div class="relative">
                                <div class="absolute z-[101] left-0 w-[20px] h-full bg-[#004AAD]"></div>
                                <div class="w-full pl-[30px] flex justify-start">
                                    <div class="py-5 space-y-5 w-full">
                                        <a class="flex w-full py-2 border-b-[1px] border-gray-200 inter text-[20px]"
                                            href="/portfolio">
                                            Mobile
                                        </a>
                                        <a class="flex w-full py-2 border-b-[1px] border-gray-200 inter text-[20px]"
                                            href="/portfolio">
                                            Desktop
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>

                    {{-- Discover --}}
                    <button @click="discover = !discover"
                        class="py-5 border-b-[1px] border-gray-400 block w-full text-[20px] font-bold inter">
                        <div class="flex justify-between items-center">
                            <span :class="discover ? 'text-[#004AAD]' : 'text-black'">Discover</span>
                            <span :class="discover ? 'text-[#A2FF0A]' : 'text-black'"
                                x-text="discover ? '▼' : '▲'"></span>
                        </div>
                        <div class="overflow-hidden space-y-[30px] transition-all duration-500 ease-in-out"
                            :class="discover ? 'max-h-[1000px] py-2' : 'max-h-0'">
                            <div class="relative">
                                <div class="absolute z-[101] left-0 w-[20px] h-full bg-[#004AAD]"></div>
                                <div class="w-full pl-[30px] flex justify-start">
                                    <div class="py-5 space-y-0 w-full">
                                        @foreach ($discovers as $discover)
                                            <a class="py-5 block border-b-2 border-gray-100 w-full" href="/discover">
                                                <div class="flex items-center gap-3 w-full">
                                                    <div class="{{ $discover->show_name === 0 ? '' : 'w-[40px]' }}">
                                                        <img loading="lazy"
                                                            src="{{ asset('storage/' . $discover->logo) }}"
                                                            class="h-[40px]" alt="">
                                                    </div>
                                                    <p
                                                        class="inter text-[20px] {{ $discover->show_name === 0 ? 'hidden' : '' }}">
                                                        {{ $discover->name }}</p>
                                                </div>
                                                <x-list-warp style="space-y-2 pt-1 pl-[52px]">
                                                    @foreach ($discover->DiscoverLists as $item)
                                                        <x-list-item text="{{ $item->description }}" />
                                                    @endforeach
                                                </x-list-warp>
                                            </a>
                                        @endforeach
                                    </div>
                                </div>
                            </div>
                            <div class="w-full inline-block pl-[30px] justify-start">
                                <a href="/discover"
                                    class="inter {textSeeMoreStyle} flex items-center gap-[5px] text-[14px] font-medium transition-all duration-300 hover:scale-105 hover:text-[#A2FF0A] text-[#1A81E2]">
                                    <p>See All Discover</p>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M10.9445 7.91702L6.53972 12.441C6.35994 12.6257 6.27364 12.8411 6.28083 13.0873C6.28802 13.3335 6.38181 13.5489 6.5622 13.7336C6.74198 13.9029 6.95173 13.9915 7.19145 13.9995C7.43116 14.0075 7.64091 13.9189 7.8207 13.7336L13.7536 7.64004C13.8435 7.54771 13.9074 7.44769 13.9451 7.33998C13.9829 7.23226 14.0011 7.11685 13.9999 6.99375C13.9987 6.87065 13.9799 6.75524 13.9433 6.64753C13.9068 6.53981 13.8432 6.43979 13.7527 6.34746L7.8198 0.253898C7.65499 0.0846325 7.44884 0 7.20133 0C6.95383 0 6.74048 0.0846325 6.5613 0.253898C6.38151 0.438552 6.29162 0.657982 6.29162 0.912188C6.29162 1.16639 6.38151 1.38552 6.5613 1.56955L10.9445 6.07048H0.898933C0.644237 6.07048 0.430592 6.15912 0.257997 6.33638C0.0854015 6.51365 -0.000596046 6.73277 2.86102e-06 6.99375C0.000601768 7.25473 0.0868998 7.47416 0.258895 7.65204C0.43089 7.82992 0.644237 7.91825 0.898933 7.91702H10.9445Z"
                                            fill="currentColor" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>

</div>
