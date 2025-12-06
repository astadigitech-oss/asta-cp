<div>
    <a href="{{$href}}" class="gap-[5px]">
        <div class="flex items-center gap-[5px]">
            <div class="flex items-center gap-[12px]">
                <img loading="lazy" class="h-[36px] w-auto" src="{{asset('storage/' . $src)}}" alt="" />
                <h3 class="{{$font}} {{$size}} {{$hiddenTitle}}">{{$title}}</h3>
            </div>
            <svg class="{{$hidden}}" width="34" height="34" viewBox="0 0 34 34" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M11.2344 30.75L24.9844 17L11.2344 3.25L8.79375 5.69063L20.1031 17L8.79375 28.3094L11.2344 30.75Z"
                    fill="#004AAD" />
            </svg>
        </div>
        <div class="{{$maxW}} text-[12px] text-[#3F3F3F]">
            {{$slot}}
        </div> 
    </a>
</div>
