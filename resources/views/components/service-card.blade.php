<div>
    <div class="bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] relative z-[3] w-[250px] h-[315px] rounded-[8px] pb-[15px] pt-[33px] px-[25px]">
        <div class="flex flex-col h-full justify-between">
            <div class="space-y-[17px]">
                <div class="flex gap-3 items-center flex-1">
                    <img loading="lazy" class="h-[42px]" src="{{ asset('storage/'. $src) }}" alt="">
                    <h1 class="{{$style}} {{$hidden}}">{{ $title }}</h1>
                </div>
                <h1 class="leading-[28px] gortesk font-bold text-[16px]">{{ $title }}</h1>
                <p class="inter leading-[20px] text-[12px]">
                    {{ $slot }}
                </p>
            </div>
            <x-button-second href="{{$link}}" :hoverBg="$secondBg" label="{{$label}}"/>
        </div>
    </div>
</div>

