<div>
    <button wire:click="toggle" class="group space-y-1">
        <!-- Garis 1 -->
        <!-- Garis 1 -->
        <span
            class="block h-0.5 w-6 {{ $burgerActive === false ? 'translate-y-0 rotate-0' : 'translate-y-2 rotate-45' }} rounded bg-black transition-all duration-300 ease-in-out group-hover:translate-y-2 group-hover:rotate-45"></span>

        <!-- Garis 2 -->
        <span
            class=" block h-0.5 {{ $burgerActive === false ? 'opacity-100' : 'opacity-0' }} w-6 rounded bg-black transition-all duration-300 ease-in-out group-hover:opacity-0"></span>

        <!-- Garis 3 -->
        <span
            class="block h-0.5 w-6 {{ $burgerActive === false ? 'translate-y-0 rotate-0' : '-translate-y-2 -rotate-45' }} rounded bg-black transition-all duration-300 ease-in-out group-hover:-translate-y-2 group-hover:-rotate-45"></span>
    </button>
    <div
        class="absolute bg-white top-[90px] left-0 z-[100] flex w-full py-3 justify-center transition-all duration-500
                {{ $burgerActive === false ? 'pointer-events-none -translate-x-5 opacity-0' : 'translate-x-0 opacity-100' }}">
        <div class="pb-10 w-full flex justify-center">
            <div class="space-y-3 w-full px-5 lg:px-0 max-w-[900px]">
                {{-- Home --}}
                <a href=""
                    class="py-5 border-b-[1px] border-gray-400 flex justify-between items-center text-[20px] font-bold inter">
                    <p>Home</p>
                </a>
                {{-- Product & Services --}}
                <button wire:click="productToggle" href=""
                    class="py-5 border-b-[1px] border-gray-400 block w-full text-[20px] font-bold inter">
                    <div class="flex justify-between w- items-center">
                        <span class="{{ $product === false ? 'text-black' : 'text-[#004AAD]' }}">Product &
                            Services</span>
                        <span
                            class="{{ $product === false ? 'text-black' : 'text-[#A2FF0A]' }}">{{ $product === false ? '▲' : '▼' }}</span>
                    </div>
                    <div
                        class="overflow-hidden transition-all duration-500 ease-in-out {{ $product === false ? 'max-h-0' : 'max-h-[1000px] py-2' }}">

                        <div class="relative">
                            <div class="absolute z-[101] left-0 w-[20px] h-full bg-[#004AAD]"></div>
                            <div class="w-full pl-[30px] flex justify-start">
                                <div class="py-5 space-y-5 w-full">
                                    <a class="py-5 border-b-2 border-gray-100 flex items-center gap-3 w-full"
                                        href="">
                                        <div class="w-[60px]">
                                            <img loading="lazy" src="{{ asset('storage/images/dikedai2.png') }}" class="h-[50px]"
                                                alt="">
                                        </div>
                                        <p class="inter text-[20px]">Dikedai</p>
                                    </a>
                                    <a class="py-5 border-b-2 border-gray-100 flex items-center gap-3 w-full"
                                        href="">
                                        <div class="w-[60px]">
                                            <img loading="lazy" src="{{ asset('storage/images/erp.png') }}" class="h-[50px]"
                                                alt="">
                                        </div>
                                        <p class="inter text-[20px]">ERP Build</p>
                                    </a>
                                    <a class="py-5 border-b-2 border-gray-100 flex items-center gap-3 w-full"
                                        href="">
                                        <div class="w-[60px]">
                                            <img loading="lazy" src="{{ asset('storage/images/cp.png') }}" class="h-[50px]"
                                                alt="">
                                        </div>
                                        <p class="inter text-[20px]">Company Profile</p>
                                    </a>
                                    <a class="py-5 border-b-2 border-gray-100 flex items-center gap-3 w-full"
                                        href="">
                                        <div class="w-[60px]">
                                            <img loading="lazy" src="{{ asset('storage/images/timit.png') }}" class="h-[50px]"
                                                alt="">
                                        </div>
                                        <p class="inter text-[20px]">Jasa Tim IT</p>
                                    </a>
                                    <a class="py-5 border-b-2 border-gray-100 flex items-center gap-3 w-full"
                                        href="">
                                        <div class="w-[60px]">
                                            <img loading="lazy" src="{{ asset('storage/images/kasir.png') }}" class="h-[50px]"
                                                alt="">
                                        </div>
                                        <p class="inter text-[20px]">KasirDigital</p>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                </button>
                {{-- Portfolios --}}
                <button wire:click="portfolioToggle" href=""
                    class="py-5 border-b-[1px] border-gray-400 block w-full text-[20px] font-bold inter">
                    <div class="flex justify-between w- items-center">
                        <span class="{{ $portfolio === false ? 'text-black' : 'text-[#004AAD]' }}">Portfolios</span>
                        <span
                            class="{{ $portfolio === false ? 'text-black' : 'text-[#A2FF0A]' }}">{{ $portfolio === false ? '▲' : '▼' }}</span>
                    </div>
                    <div
                        class="overflow-hidden transition-all duration-500 ease-in-out {{ $portfolio === false ? 'max-h-0' : 'max-h-100 py-2' }}">

                        <div class="relative">
                            <div class="absolute z-[101] left-0 w-[20px] h-full bg-[#004AAD]"></div>
                            <div class="w-full pl-[30px] flex justify-start">
                                <div class="py-5 space-y-5 w-full">
                                    <a class="flex w-full py-2 border-b-[1px] border-gray-200 inter text-[20px]"
                                        href="">Mobile</a>
                                    <a class="flex w-full py-2 border-b-[1px] border-gray-200 inter text-[20px]"
                                        href="">Desktop</a>
                                </div>
                            </div>
                        </div>
                    </div>

                </button>
                {{-- Discover --}}
                <button wire:click="discoverToggle" href=""
                    class="py-5 border-b-[1px] border-gray-400 block w-full text-[20px] font-bold inter">
                    <div class="flex justify-between w- items-center">
                        <span class="{{ $discover === false ? 'text-black' : 'text-[#004AAD]' }}">Discover</span>
                        <span
                            class="{{ $discover === false ? 'text-black' : 'text-[#A2FF0A]' }}">{{ $discover === false ? '▲' : '▼' }}</span>
                    </div>
                    <div
                        class="overflow-hidden transition-all duration-500 ease-in-out {{ $discover === false ? 'max-h-0' : 'max-h-[1000px] py-2' }}">

                        <div class="relative">
                            <div class="absolute z-[101] left-0 w-[20px] h-full bg-[#004AAD]"></div>
                            <div class="w-full pl-[30px] flex justify-start">
                                <div class="py-5 space-y-0 w-full">
                                    {{-- Dikedai --}}
                                    <a class="py-5 block border-b-2 border-gray-100 w-full" href="">
                                        <div class="flex items-center gap-3 w-full">
                                            <div class="w-[40px]">
                                                <img loading="lazy" src="{{ asset('storage/images/dikedai2.png') }}" class="h-[40px]"
                                                    alt="">
                                            </div>
                                            <p class="inter text-[20px]">Dikedai</p>
                                        </div>
                                        <x-list-warp style="space-y-2 pt-1 pl-[52px]">
                                            <x-list-item text="Website auto Live" />
                                            <x-list-item text="Integrasi langsung dengan fitur" />
                                            <x-list-item text="Domain sesuai brand Anda" />
                                            <x-list-item text="Dukungan pelanggan 1/24 jam" />
                                        </x-list-warp>
                                    </a>
                                    {{-- ERP SinarKencana --}}
                                    <a class="py-5 block border-b-2 border-gray-100 w-full" href="">
                                        <div class="flex items-center gap-3 w-full">
                                            <div class="w-[40px]">
                                                <img loading="lazy" src="{{ asset('storage/images/erpsk.png') }}" class="h-[40px]"
                                                    alt="">
                                            </div>
                                            <p class="inter text-[20px]">ERP Sinar Kencana</p>
                                        </div>
                                        <x-list-warp style="space-y-2 pt-3 pl-[52px]">
                                            <x-list-item text="Tenaga ahli memumpuni" />
                                            <x-list-item text="Sesuai dengan kebutuhan " />
                                            <x-list-item text="Bersertifikat dan teruji" />
                                            <x-list-item text="Berpengalaman di bidangnya" />
                                        </x-list-warp>
                                    </a>
                                    {{-- Jasa Tim IT --}}
                                    <a class="py-5 block border-b-2 border-gray-100 w-full" href="">
                                        <div class="flex items-center gap-3 w-full">
                                            <div class="w-[40px]">
                                                <img loading="lazy" src="{{ asset('storage/images/timit.png') }}" class="h-[40px]"
                                                    alt="">
                                            </div>
                                            <p class="inter text-[20px]">Jasa Tim IT</p>
                                        </div>
                                        <x-list-warp style="space-y-2 pt-3 pl-[52px]">
                                            <x-list-item text="Tenaga ahli memumpuni" />
                                            <x-list-item text="Sesuai dengan kebutuhan " />
                                            <x-list-item text="Bersertifikat dan teruji" />
                                            <x-list-item text="Berpengalaman di bidangnya" />
                                        </x-list-warp>
                                    </a>
                                    {{-- Kasir Digital --}}
                                    <a class="py-5 block border-b-2 border-gray-100 w-full" href="">
                                        <div class="flex items-center gap-3 w-full">
                                            <div class="w-[40px]">
                                                <img loading="lazy" src="{{ asset('storage/images/kasir.png') }}" class="h-[40px]"
                                                    alt="">
                                            </div>
                                            <p class="inter text-[20px]">KasirDigital</p>
                                        </div>
                                        <x-list-warp style="space-y-2 pt-3 pl-[52px]">
                                            <x-list-item text="Pencatatan otomatis" />
                                            <x-list-item text="Managemen stok mudah " />
                                            <x-list-item text="Laporan penjualan Instant" />
                                            <x-list-item text="Mudah di operasikan dan dipahami" />
                                        </x-list-warp>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                </button>
            </div>
        </div>
    </div>
</div>
