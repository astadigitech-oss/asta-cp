<div>
    <a href="{{$href}}"
        class="group relative flex hover:scale-105 {{$hoverBg ? 'hover:bg-[#A2FF0A]' : 'hover:bg-[#004AAD]'}} transition-all duration-300 w-full gap-2 justify-center items-center rounded-[4px] text-white {{$hoverBg ? 'bg-[#004AAD]' : 'bg-black'}} h-[40px]">
        <span
            class="flex gap-2 items-center [transform:scale(0.9523809524)] group-hover:[transform:scale(0.9523809524)]">
            <p class="inter font-bold text-[16px]">{{$label}}</p>
            <svg width="17" height="14" viewBox="0 0 17 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M10.625 13.5L9.1375 11.9292L12.9094 8.08333H0V5.91667H12.9094L9.1375 2.07083L10.625 0.5L17 7L10.625 13.5Z"
                    fill="currentColor" />
            </svg>
        </span>
    </a>
</div>
