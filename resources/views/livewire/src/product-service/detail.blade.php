<div>
    <section class="w-full px-5 flex justify-center">
        <div class="w-full py-[50px] space-y-[50px] max-w-[900px] xl:max-w-[1155px]">
            <a href="{{ url()->previous() }}" class="w-full group flex gap-[30px] items-center">
                <svg class="text-[#004AAD] transition-all duration-300 group-hover:text-[#A2FF0A]" width="28"
                    height="45" viewBox="0 0 28 45" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 22.5L22.7027 45L28 39.75L10.5946 22.5L28 5.25L22.7027 0L0 22.5Z" fill="currentColor" />
                </svg>
                <div class="flex items-center gap-[20px]">
                    <img loading="lazy" class="h-[62px]" src="{{ asset('storage/' . $service->logo) }}" alt="">
                    <h1
                        class="text-[32px] {{ $service->show_name === 0 ? 'hidden' : '' }} lg:text-[48px] inter font-bold">
                        {{ $service->name }}</h1>
                </div>
            </a>

            <div class="w-full flex items-center justify-between">
                <div class="w-full lg:w-[55%] space-y-[30px] ">
                    <h1 class="text-[28px] lg:text-[32px] font-bold inter">
                        {{ $service->header }}
                    </h1>
                    <p class="text-[16px]">{!! $service->description !!}</p>
                    <ul class="font-bold space-y-[20px]">
                        <li class="  flex items-start gap-[10px]">
                            <svg width="23" height="23" viewBox="0 0 23 23" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M9.89 16.79L17.9975 8.6825L16.3875 7.0725L9.89 13.57L6.6125 10.2925L5.0025 11.9025L9.89 16.79ZM11.5 23C9.90916 23 8.41416 22.6979 7.015 22.0938C5.61583 21.4897 4.39875 20.6705 3.36375 19.6362C2.32875 18.602 1.50957 17.3849 0.906201 15.985C0.302835 14.5851 0.000768122 13.0901 1.45569e-06 11.5C-0.00076521 9.90993 0.301301 8.41493 0.906201 7.015C1.5111 5.61507 2.33028 4.39798 3.36375 3.36375C4.39722 2.32952 5.6143 1.51033 7.015 0.9062C8.4157 0.302067 9.9107 0 11.5 0C13.0893 0 14.5843 0.302067 15.985 0.9062C17.3857 1.51033 18.6028 2.32952 19.6362 3.36375C20.6697 4.39798 21.4893 5.61507 22.0949 7.015C22.7006 8.41493 23.0023 9.90993 23 11.5C22.9977 13.0901 22.6956 14.5851 22.0938 15.985C21.492 17.3849 20.6728 18.602 19.6362 19.6362C18.5997 20.6705 17.3826 21.49 15.985 22.0949C14.5874 22.6998 13.0924 23.0015 11.5 23Z"
                                    fill="#004AAD" />
                            </svg>
                            <p>Pencatatan Transaksi Otomatis</p>
                        </li>
                        <li class="flex items-start gap-[10px]">
                            <svg width="23" height="23" viewBox="0 0 23 23" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M9.89 16.79L17.9975 8.6825L16.3875 7.0725L9.89 13.57L6.6125 10.2925L5.0025 11.9025L9.89 16.79ZM11.5 23C9.90916 23 8.41416 22.6979 7.015 22.0938C5.61583 21.4897 4.39875 20.6705 3.36375 19.6362C2.32875 18.602 1.50957 17.3849 0.906201 15.985C0.302835 14.5851 0.000768122 13.0901 1.45569e-06 11.5C-0.00076521 9.90993 0.301301 8.41493 0.906201 7.015C1.5111 5.61507 2.33028 4.39798 3.36375 3.36375C4.39722 2.32952 5.6143 1.51033 7.015 0.9062C8.4157 0.302067 9.9107 0 11.5 0C13.0893 0 14.5843 0.302067 15.985 0.9062C17.3857 1.51033 18.6028 2.32952 19.6362 3.36375C20.6697 4.39798 21.4893 5.61507 22.0949 7.015C22.7006 8.41493 23.0023 9.90993 23 11.5C22.9977 13.0901 22.6956 14.5851 22.0938 15.985C21.492 17.3849 20.6728 18.602 19.6362 19.6362C18.5997 20.6705 17.3826 21.49 15.985 22.0949C14.5874 22.6998 13.0924 23.0015 11.5 23Z"
                                    fill="#004AAD" />
                            </svg>
                            <p>Laporan Penjualan Instan</p>
                        </li>
                        <li class="flex items-start gap-[10px]">
                            <svg width="23" height="23" viewBox="0 0 23 23" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M9.89 16.79L17.9975 8.6825L16.3875 7.0725L9.89 13.57L6.6125 10.2925L5.0025 11.9025L9.89 16.79ZM11.5 23C9.90916 23 8.41416 22.6979 7.015 22.0938C5.61583 21.4897 4.39875 20.6705 3.36375 19.6362C2.32875 18.602 1.50957 17.3849 0.906201 15.985C0.302835 14.5851 0.000768122 13.0901 1.45569e-06 11.5C-0.00076521 9.90993 0.301301 8.41493 0.906201 7.015C1.5111 5.61507 2.33028 4.39798 3.36375 3.36375C4.39722 2.32952 5.6143 1.51033 7.015 0.9062C8.4157 0.302067 9.9107 0 11.5 0C13.0893 0 14.5843 0.302067 15.985 0.9062C17.3857 1.51033 18.6028 2.32952 19.6362 3.36375C20.6697 4.39798 21.4893 5.61507 22.0949 7.015C22.7006 8.41493 23.0023 9.90993 23 11.5C22.9977 13.0901 22.6956 14.5851 22.0938 15.985C21.492 17.3849 20.6728 18.602 19.6362 19.6362C18.5997 20.6705 17.3826 21.49 15.985 22.0949C14.5874 22.6998 13.0924 23.0015 11.5 23Z"
                                    fill="#004AAD" />
                            </svg>
                            <p>Manajemen Stok Lebih Mudah</p>
                        </li>
                    </ul>
                </div>
                <div class="w-[40%] hidden lg:block">
                    @php($serviceImages = is_array($service->image) ? $service->image : [$service->image])
                    @if (!empty($serviceImages[0]))
                        <img loading="lazy" class="w-full" src="{{ asset('storage/' . $serviceImages[0]) }}" alt="">
                    @endif
                </div>
            </div>
        </div>
    </section>

    {{-- Dipercaya --}}
    <x-trusted swiperName="swiperLogoDetail"/>
</div>
