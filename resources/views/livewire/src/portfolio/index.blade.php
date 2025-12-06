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
                                    {!! $mobile->description !!}
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
                                    {!! $desktop->description !!}
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
