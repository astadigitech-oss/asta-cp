<div>
    <section class="w-full flex py-[57px] px-5 justify-center">
        <div class="w-full max-w-[1155px] space-y-[30px]">
            <h3 class="inter font-bold text-[20px] leading-[28px]">Telah Dipercaya Oleh 500+ Bisnis</h3>
            <div class="swiper {{$swiperName}}">
                <div class="swiper-wrapper">
                    @foreach ($clients as $client)
                        <div class="swiper-slide">
                            <div class="w-full flex h-full items-center min-h-[150px] justify-center">
                                <div class="w-[200px]">
                                    <img loading="lazy" src="{{ asset('storage/' . $client->image) }}" loading="lazy"
                                        class="w-full" alt="">
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </section>
</div>
