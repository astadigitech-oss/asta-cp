<div>
    <div class="flex gap-[10px]">
        <img loading="lazy" src="{{asset('storage/' . $src)}}" class="w-[82px]" alt="">
        <div class="inter">
            <h3 class="text-[16px] text-[#004AAD] font-extrabold">{{$title}}</h3>
            <p class="text-[12px] max-w-[270px]">
                {{$slot}}
            </p>
        </div>
    </div>
</div>
