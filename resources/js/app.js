import "./bootstrap";

const skillSwiper = new Swiper(".section-skill-swiper", {
    loop: true,
    autoplay: {
        delay: 2000,
        disableOnInteraction: false,
    },
    breakpoints: {
        0: {
            slidesPerView: 1, // HP kecil
        },
        750: {
            slidesPerView: 3, // HP sedang
        },
        1024: {
            slidesPerView: 4, // HP besar
        },
    },
});

const swiperService = new Swiper(".swiperService", {
    slidesPerView: 4,
    spaceBetween: 5,
    navigation: {
        nextEl: ".custom-prev",
        prevEl: ".custom-next",
    },
    pagination: {
        el: ".custom-pagination",
    },
    breakpoints: {
        0: {
            slidesPerView: 1, // HP kecil
        },
        750: {
            slidesPerView: 2, // HP sedang
        },
        1024: {
            slidesPerView: 3, // HP besar
        },
        1360: {
            slidesPerView: 4, // HP besar
        },
    },
});

const swiperQuote = new Swiper(".swiperQuote", {
    slidesPerView: 1,
    loop: true,
    autoplay: {
        delay: 5000,
    },
});

const swiperAdvantage = new Swiper(".swiperAdvantage", {
    slidesPerView: 3,
    autoplay: {
        delay: 5000,
    },
    breakpoints: {
        0: {
            slidesPerView: 1, // HP kecil
        },
        750: {
            slidesPerView: 2, // HP sedang
        },
        1024: {
            slidesPerView: 3, // HP besar
        },
        1360: {
            slidesPerView: 3, // HP besar
        },
    },
});

const swiperProduct = new Swiper(".swiperProduct", {
    slidesPerView: 4,
    spaceBetween: 5,
    navigation: {
        nextEl: ".custom-prev",
        prevEl: ".custom-next",
    },
    pagination: {
        el: ".custom-pagination",
    },
    breakpoints: {
        0: {
            slidesPerView: 1, // HP kecil
        },
        750: {
            slidesPerView: 2, // HP sedang
        },
        1024: {
            slidesPerView: 3, // HP besar
        },
        1360: {
            slidesPerView: 4, // HP besar
        },
    },
});

const swiperDiscover = new Swiper(".swiperDiscover", {
    slidesPerView: 4,
    spaceBetween: 5,
    navigation: {
        nextEl: ".discover-next",
        prevEl: ".discover-prev",
    },
    pagination: {
        el: ".custom-pagination",
    },
    breakpoints: {
        0: {
            slidesPerView: 1, // HP kecil
        },
        750: {
            slidesPerView: 2, // HP sedang
        },
        1024: {
            slidesPerView: 3, // HP besar
        },
        1360: {
            slidesPerView: 4, // HP besar
        },
    },
});

const swiperLogo = new Swiper(".swiperLogo", {
    slidesPerView: 4,
    spaceBetween: 5,
    autoplay: {
        delay: 3000,
    },
    loop: true,
    navigation: {
        nextEl: ".custom-prev",
        prevEl: ".custom-next",
    },
    pagination: {
        el: ".custom-pagination",
    },
    breakpoints: {
        0: {
            slidesPerView: 1, // HP kecil
        },
        750: {
            slidesPerView: 2, // HP sedang
        },
        1024: {
            slidesPerView: 3, // HP besar
        },
        1360: {
            slidesPerView: 4, // HP besar
        },
    },
});

const swiperLogoDetail = new Swiper(".swiperLogoDetail", {
        // modules: [Autoplay],
    autoplay: {
        delay: 3000,
    },
    slidesPerView: 4,
    spaceBetween: 5,
    loop: true,
    navigation: {
        nextEl: ".custom-prev",
        prevEl: ".custom-next",
    },
    pagination: {
        el: ".custom-pagination",
    },
    breakpoints: {
        0: {
            slidesPerView: 1, // HP kecil
        },
        750: {
            slidesPerView: 2, // HP sedang
        },
        1024: {
            slidesPerView: 3, // HP besar
        },
        1360: {
            slidesPerView: 4, // HP besar
        },
    },
});

