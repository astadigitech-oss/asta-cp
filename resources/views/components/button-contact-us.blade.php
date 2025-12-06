<div>
    <div x-data="{ open: false }">
        <!-- Trigger Button -->
        <button @click="open = true"
            class="bg-black group hover:cursor-pointer hover:text-[#004AAD] hover:scale-105 transition-all duration-500 hover:bg-[#A2FF0A] text-white rounded-[8px] w-[190px] gap-[12px] h-[46px] flex justify-center items-center">
            <p class="grotesk font-bold text-[20px]">Hubungi Kami</p>
        </button>

        <!-- Modal -->
        <div x-show="open" x-cloak x-transition.opacity
            class="fixed px-5 inset-0 z-[1000] flex items-center justify-center">
            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/70" @click="open = false"></div>

            <!-- Modal Content -->
            <div x-transition.scale
                class="relative bg-white rounded-[20px] px-[50px] lg:px-[109px] py-[69px] shadow-lg z-[1001]">
                <div class="w-full space-y-[27px]">
                    <div class="w-full flex justify-center text-center">
                        <h3 class="text-[36px] inter font-bold"><span class="text-[#004AAD]">Hubungi</span> Kami</h3>
                    </div>
                    <div class="w-full flex justify-center">
                        <img src="{{ asset('storage/images/contactUs.png') }}" class="w-[340px]" loading="lazy"
                            alt="">
                    </div>
                    <div class="w-full flex justify-between items-center">
                        <a class="hover:-translate-y-2 transition-all duration-300 flex items-center" href="https://wa.me/628123456789">
                            <img src="{{ asset('storage/images/waColor.png') }}" class="w-[83px]" alt="">
                        </a>
                        <a class="hover:-translate-y-2 transition-all duration-300 flex items-center" href="https://www.instagram.com/astadigitalagency/">
                            <img src="{{ asset('storage/images/igColor.png') }}" class="w-[83px]" alt="">
                        </a>
                        <a class="hover:-translate-y-2 transition-all duration-300 flex items-center" href="/discover#contact">
                            <img src="{{ asset('storage/images/mailColor.png') }}" class="w-[83px]" alt="">
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
