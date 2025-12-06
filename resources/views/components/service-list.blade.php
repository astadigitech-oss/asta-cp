<div>
    <div class="gap-[18px] sm:gap-[28px] group hover:cursor-pointer flex">
        <div
            class="w-[62px] group-hover:scale-120 group-hover:bg-[#A2FF0A] transition-all duration-300 h-[42px] sm:h-[62px] {{ $bg }} rounded-[8px] flex justify-center items-center">
            {{$svg}}
        </div>
        <div class="space-y-[3px]">
            <h3 style="--text-color: {{ $text }};"
                class="inter text-[var(--text-color)] group-hover:text-[#A2FF0A] leading-[12px]sm:leading-[28px] text-[16px] sm:text-[24px] font-bold">
                {{$title}}
            </h3>
            <p class="text-start max-w-[478px] text-[12px] sm:text-[16px] inter">{{$slot}}</p>
        </div>
        </svg>
    </div>
</div>


