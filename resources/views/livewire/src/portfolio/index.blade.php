<div>
    {{-- List Portfolio --}}
    <section class="relative top-[60px] w-full px-5 flex justify-center overflow-hidden">
        <div class=" max-w-[1395px] w-full relative flex justify-center">
            <div class=" max-w-[700px] lg:max-w-[900px] xl:max-w-[1155px] w-full">
                <div class="flex w-full justify-center">
                    <div class="">
                        <h1 class="inter text-[38px] text-center lg:text-[48px] font-bold">Portofolio <span
                                class="text-[#004AAD]">Kami</span></h1>
                        <div class="py-[50px]">
                            <div class="bg-black text-[20px] rounded-[20px] flex justify-between px-[41px] py-[10px]">
                                <div class="text-white font-bold">
                                    <h3 class="inter">Kategori</h3>
                                </div>
                                <div class="border-l border-white self-stretch mx-[20px]"></div>
                                <div class="flex items-center gap-[18px]">
                                    <button wire:click="setCategory('mobile')"
                                        class="inter transition-all duration-300 hover:cursor-pointer 
                                            {{ $activeCategory === 'mobile' ? 'text-[#A2FF0A] font-bold' : 'text-white hover:text-[#A2FF0A]' }}">
                                        Mobile
                                    </button>

                                    <button wire:click="setCategory('desktop')"
                                        class="inter transition-all duration-300 hover:cursor-pointer 
                                            {{ $activeCategory === 'desktop' ? 'text-[#004AAD] font-bold' : 'text-white hover:text-[#004AAD]' }}">
                                        Desktop
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-full {{ $activeCategory === 'mobile' ? 'flex' : 'hidden' }} justify-center pb-[200px]">
                    <div class="w-full max-w-[985px] space-y-[117px]">
                        @foreach ($mobiles as $mobile)
                            <div class="sm:flex space-y-10 sm:space-y-0 justify-between items-center">
                                <div class="w-full lg:w-auto flex justify-center">
                                    <div class="lg:w-[295px] w-[200px]">
                                        <img loading="lazy" class="w-full" loading="lazy"
                                            src="{{ asset('storage/' . $mobile->image) }}" alt="">
                                    </div>
                                </div>
                                <div class="space-y-[34px] text-center sm:text-start max-w-[450px] lg:max-w-[540px]">
                                    <h1 class="text-[48px] inter font-bold leading-[28px]">{{ $mobile->name }}</h1>
                                    <div class="portfolio-content">{!! $mobile->description !!}</div>
                                    @if(!empty($mobile->demo_url))
                                        <div class="pt-2">
                                            <a href="{{ $mobile->demo_url }}" target="_blank" rel="noopener noreferrer"
                                                class="inline-flex items-center gap-2 px-6 py-2.5 bg-[#004AAD] hover:bg-blue-800 text-white font-bold rounded-full transition-all duration-300 shadow-md">
                                                <span>Live Demo</span>
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        @endforeach

                    </div>
                </div>
                <div class="w-full {{ $activeCategory === 'desktop' ? 'flex' : 'hidden' }} justify-center pb-[200px]">
                    <div class="w-full max-w-[985px] space-y-[117px]">
                        @foreach ($desktops as $desktop)
                            <div class="sm:flex space-y-10 sm:space-y-0 justify-between items-center">
                                <div class="w-full lg:w-auto flex justify-center">
                                    <div class="lg:w-[295px] w-[200px]">
                                        <img loading="lazy" class="w-full" loading="lazy"
                                            src="{{ asset('storage/' . $desktop->image) }}" alt="">
                                    </div>
                                </div>
                                <div class="space-y-[34px] text-center sm:text-start max-w-[450px] lg:max-w-[540px]">
                                    <h1 class="text-[48px] inter font-bold leading-[28px]">{{ $desktop->name }}</h1>
                                    <div class="portfolio-content">{!! $desktop->description !!}</div>
                                    @if(!empty($desktop->demo_url))
                                        <div class="pt-2">
                                            <a href="{{ $desktop->demo_url }}" target="_blank" rel="noopener noreferrer"
                                                class="inline-flex items-center gap-2 px-6 py-2.5 bg-[#004AAD] hover:bg-blue-800 text-white font-bold rounded-full transition-all duration-300 shadow-md">
                                                <span>Live Demo</span>
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        @endforeach 
                    </div>
                </div>
            </div>
        </div>
    </section>
    {{-- Keunggulan --}}
    <section class="flex pb-[100px] justify-center w-full">
        <div wire:ignore class="w-full max-w-[700px] lg:max-w-[900px] xl:max-w-[1155px]">
            <x-advantage />
        </div>
    </section>
</div>
