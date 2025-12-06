@props(['tabs' => []])
<div>
    <div class="group" x-data="{ activeTab: '{{ $default ?? ($tabs[0] ?? '') }}' }">
        <div class="flex items-center gap-2">
            <div class="relative">
                <button
                    class="
          text-[20px]
          group-hover:cursor-pointer group-hover:font-semibold group-hover:text-[#004AAD]
          after:absolute after:bottom-0
          after:left-0 after:h-[2px]
          after:w-full
          after:origin-center after:scale-x-0
          after:bg-[#004AAD] after:transition-transform after:duration-300 after:content-[''] group-hover:after:scale-x-100">
                    {{ $label }}
                </button>
            </div>
            <svg class="group-hover:text-[#A2FF0A]" width="13" height="8" viewBox="0 0 13 8" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M11.7741 1.03583L6.82949 7.23127C6.36043 7.79805 5.6373 7.79805 5.18779 7.23127L0.243169 1.03583C-0.225887 0.449511 0.00864106 0 0.731768 0H11.2855C12.0282 0 12.2432 0.449511 11.7741 1.03583Z"
                    fill="currentColor" />
            </svg>
        </div>
        <div class="absolute z-[100] left-0 hidden w-full py-4 group-hover:block group-hover:cursor-pointer">
            <div class="relative flex w-full bg-white justify-center">
                <div class="relative flex min-h-[400px] w-full max-w-[1395px] justify-center pt-5">
                    {{ $style }}
                    <div class="absolute {{ $hidden }} left-0 h-[333px] w-[33px] bg-[#004AAD]"></div>
                    <div
                        class="absolute {{ $hiddenSecondary }} left-0 z-[3] flex h-[293px] w-[440px] items-center justify-end rounded-r-[20px] bg-[#004AAD]">
                        <div class="">
                            @foreach ($tabs as $tab)
                                <button type="button" @click="activeTab = '{{ $tab }}'"
                                    :class="activeTab === '{{ $tab }}'
                                        ?
                                        'bg-white text-[#004AAD]' :
                                        'bg-[#004AAD] text-white'"
                                    class="hover:cursor-pointer inter font-medium text-[20px] hover:bg-white w-[280px] rounded-l-[20px] h-[75px] flex justify-center items-center hover:text-[#004AAD]">
                                    {{ $tab }}
                                </button>
                            @endforeach
                        </div>
                    </div>
                    <div class="flex h-full w-full max-w-[1155px] items-center">
                        <div class="w-full">
                            {{ $slot }}
                            <div class="flex w-full justify-center py-[24px]">
                                <div class="w-full border-t-2 border-[#8D8D8D]"></div>
                            </div>
                            <div class="inline-block">
                                <a href="{{ $href }}"
                                    class="inter {textSeeMoreStyle} flex items-center gap-[5px] text-[14px] font-medium transition-all duration-300 hover:scale-105 hover:text-[#A2FF0A] text-[#1A81E2]">
                                    <p>{{ $textSeeMore }}</p>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M10.9445 7.91702L6.53972 12.441C6.35994 12.6257 6.27364 12.8411 6.28083 13.0873C6.28802 13.3335 6.38181 13.5489 6.5622 13.7336C6.74198 13.9029 6.95173 13.9915 7.19145 13.9995C7.43116 14.0075 7.64091 13.9189 7.8207 13.7336L13.7536 7.64004C13.8435 7.54771 13.9074 7.44769 13.9451 7.33998C13.9829 7.23226 14.0011 7.11685 13.9999 6.99375C13.9987 6.87065 13.9799 6.75524 13.9433 6.64753C13.9068 6.53981 13.8432 6.43979 13.7527 6.34746L7.8198 0.253898C7.65499 0.0846325 7.44884 0 7.20133 0C6.95383 0 6.74048 0.0846325 6.5613 0.253898C6.38151 0.438552 6.29162 0.657982 6.29162 0.912188C6.29162 1.16639 6.38151 1.38552 6.5613 1.56955L10.9445 6.07048H0.898933C0.644237 6.07048 0.430592 6.15912 0.257997 6.33638C0.0854015 6.51365 -0.000596046 6.73277 2.86102e-06 6.99375C0.000601768 7.25473 0.0868998 7.47416 0.258895 7.65204C0.43089 7.82992 0.644237 7.91825 0.898933 7.91702H10.9445Z"
                                            fill="currentColor" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
