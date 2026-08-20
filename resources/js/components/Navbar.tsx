import React, { useState, useEffect } from "react";
import { ChevronDown, Menu, X, ArrowRight, Pin } from "lucide-react";
import logo from "../assets/logo/Logo Hitam 2.png";
import p1 from "../assets/portfolio-1.jpg";
import p2 from "../assets/portfolio-2.jpg";
import p3 from "../assets/portfolio-3.jpg";
import { useLandingData } from "../hooks/useLandingData";

interface ServiceItem {
  id: number;
  name: string;
  short_description?: string;
  logo?: string;
  show_name?: number;
}

interface PortfolioItem {
  id: number;
  name: string;
  description?: string;
  image?: string;
  category?: "Mobile" | "Desktop" | string;
}

interface DiscoverListItem {
  id: number;
  description: string;
}

interface DiscoverItem {
  id: number | string;
  name: string;
  short_description?: string;
  logo?: string;
  image?: string;
  created_at?: string;
  show_name?: number;
  is_pinned?: boolean;
  DiscoverLists?: DiscoverListItem[];
}

const defaultNewsItems: DiscoverItem[] = [
  {
    id: "mock-1",
    name: "Kenapa Bisnis Anda Membutuhkan Sistem Digital Terintegrasi?",
    short_description: "Pelajari bagaimana sistem digital terintegrasi meningkatkan efisiensi.",
    image: p1,
  },
  {
    id: "mock-2",
    name: "ERP: Solusi untuk Mengelola Bisnis dalam Satu Sistem",
    short_description: "Mengintegrasikan berbagai proses bisnis keuangan & operasional.",
    image: p2,
  },
  {
    id: "mock-3",
    name: "Website Saja Tidak Cukup, Saatnya ke Custom System",
    short_description: "Temukan kapan bisnis Anda membutuhkan sistem kustom.",
    image: p3,
  },
];

const stripHtml = (html?: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
};

export function Navbar() {
  const { data: landingData } = useLandingData();
  const [portfolioTab, setPortfolioTab] = useState<"Mobile" | "Desktop">("Mobile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const services = (landingData?.services || []) as ServiceItem[];
  const allPortfolios = (landingData?.portfolios || []) as PortfolioItem[];
  const mobiles = allPortfolios.filter((p) => p.category?.toLowerCase() === "mobile");
  const desktops = allPortfolios.filter((p) => p.category?.toLowerCase() === "desktop" || p.category?.toLowerCase() === "web");
  const discovers = (landingData?.discovers || []) as DiscoverItem[];

  // Keep pinned discoveries first, then show the newest discoveries.
  const discoversWithImages = discovers.filter((d) => Boolean(d.image));
  const newsItems = discoversWithImages.length > 0
    ? [...discoversWithImages].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) {
          return Number(b.is_pinned) - Number(a.is_pinned);
        }
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        const aId = typeof a.id === "number" ? a.id : Number.parseInt(a.id, 10) || 0;
        const bId = typeof b.id === "number" ? b.id : Number.parseInt(b.id, 10) || 0;
        return bId - aId;
      })
    : defaultNewsItems;

  const totalSlides = 1 + newsItems.length;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="relative z-[100] w-full flex justify-center">
        <div className="w-full max-w-[1395px] items-center h-[90px] flex justify-between px-5 lg:px-10">
          
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 transition-transform hover:scale-105">
            <img src={logo} alt="Asta Digital Agency" className="w-[115px] mt-2 h-auto" onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }} />
            {/* <span className="font-bold text-xl text-[#004AAD] tracking-tight">ASTA</span> */}
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-[40px] h-full">
            {/* Home */}
            <a
              href="/"
              className="relative text-[18px] font-medium text-gray-700 hover:text-[#004AAD] transition-colors py-8
                after:content-[''] after:absolute after:left-0 after:bottom-4 after:w-full after:h-[2px] after:bg-[#004AAD]
                after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Beranda
            </a>

            {/* Product & Services Dropdown */}
            <div className="relative group h-full flex items-center">
              <button
                className="flex items-center gap-1.5 text-[18px] font-medium text-gray-700 group-hover:text-[#004AAD] transition-colors py-8 cursor-pointer"
              >
                Produk & Layanan
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-[#004AAD] transition-transform group-hover:rotate-180" />
              </button>

              {/* Mega Dropdown Panel - Pure CSS Group Hover (100% Bulletproof) */}
              <div
                className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[900px] bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 z-50
                  opacity-0 invisible pointer-events-none
                  group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
                  transition-all duration-200 ease-out transform translate-y-2 group-hover:translate-y-0
                  before:absolute before:-top-6 before:inset-x-0 before:w-full before:h-8 before:content-['']"
              >
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Produk & Layanan
                  </p>
                  <div className="grid grid-cols-3 gap-6">
                    {services.length > 0 ? (
                      services.map((service) => (
                        <a
                          key={service.id}
                          href="/#layanan"
                          className="p-4 rounded-xl hover:bg-blue-50/60 transition-all border border-transparent hover:border-blue-100 group/item"
                        >
                          {service.logo && (
                            <img src={service.logo} alt={service.name} className="w-10 h-10 mb-2 object-contain" />
                          )}
                          <h4 className="font-bold text-gray-900 group-hover/item:text-[#004AAD] text-base">
                            {service.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {stripHtml(service.short_description) || "Solusi teknologi terbaik dari Asta Digital."}
                          </p>
                        </a>
                      ))
                    ) : (
                      // Default mock services
                      [
                        { title: "Web Apps Development", desc: "Aplikasi berbasis web modern, cepat & responsif." },
                        { title: "Mobile Apps Development", desc: "Aplikasi Android & iOS performa tinggi." },
                        { title: "Layanan IT & Konsultasi", desc: "Dukungan IT dan konsultasi arsitektur sistem." },
                      ].map((s, idx) => (
                        <a
                          key={idx}
                          href="/#layanan"
                          className="p-4 rounded-xl hover:bg-blue-50/60 transition-all border border-transparent hover:border-blue-100 group/item"
                        >
                          <h4 className="font-bold text-gray-900 group-hover/item:text-[#004AAD] text-base">
                            {s.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.desc}</p>
                        </a>
                      ))
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <a
                      href="/#layanan"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#004AAD] hover:text-[#38B6FF] transition-colors"
                    >
                      Lihat Semua Layanan <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolios Dropdown */}
            <div className="relative group h-full flex items-center">
              <button
                className="flex items-center gap-1.5 text-[18px] font-medium text-gray-700 group-hover:text-[#004AAD] transition-colors py-8 cursor-pointer"
              >
                Portofolio
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-[#004AAD] transition-transform group-hover:rotate-180" />
              </button>

              {/* Mega Dropdown Panel - Pure CSS Group Hover */}
              <div
                className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[850px] bg-white shadow-2xl rounded-2xl border border-gray-100 z-50 overflow-hidden flex
                  opacity-0 invisible pointer-events-none
                  group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
                  transition-all duration-200 ease-out transform translate-y-2 group-hover:translate-y-0
                  before:absolute before:-top-6 before:inset-x-0 before:w-full before:h-8 before:content-['']"
              >
                {/* Left Tabs */}
                <div className="w-[220px] bg-[#004AAD] p-6 text-white flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">Platform</p>
                  <button
                    onClick={() => setPortfolioTab("Mobile")}
                    className={`w-full py-3 px-4 rounded-xl text-left font-semibold text-base transition-all cursor-pointer ${
                      portfolioTab === "Mobile"
                        ? "bg-white text-[#004AAD] shadow-md"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Mobile Apps
                  </button>
                  <button
                    onClick={() => setPortfolioTab("Desktop")}
                    className={`w-full py-3 px-4 rounded-xl text-left font-semibold text-base transition-all cursor-pointer ${
                      portfolioTab === "Desktop"
                        ? "bg-white text-[#004AAD] shadow-md"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Desktop & Web
                  </button>
                </div>

                {/* Right Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 pb-3">
                      Portofolio {portfolioTab}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {(portfolioTab === "Mobile" ? mobiles : desktops).length > 0 ? (
                        (portfolioTab === "Mobile" ? mobiles : desktops).slice(0, 4).map((p) => (
                          <a
                            key={p.id}
                            href={`/#portofolio`}
                            className="flex gap-3 items-center p-2 rounded-lg hover:bg-blue-50 transition-colors group/item border border-transparent hover:border-blue-100"
                          >
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#004AAD] to-[#38B6FF] flex items-center justify-center shrink-0">
                                <span className="text-white text-xs font-bold">{p.name.charAt(0)}</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <h5 className="font-bold text-sm text-gray-900 group-hover/item:text-[#004AAD] truncate">{p.name}</h5>
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{stripHtml(p.description) || "Lihat detail portofolio"}</p>
                              </div>
                          </a>
                        ))
                      ) : (
                        <div className="col-span-2 text-sm text-gray-500 py-6 text-center">
                          Portofolio {portfolioTab} akan ditampilkan di sini.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-6">
                    <a
                      href="/#portofolio"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#004AAD] hover:text-[#38B6FF] transition-colors"
                    >
                      Lihat Semua Portofolio <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Discover Dropdown */}
            <div className="relative group h-full flex items-center">
              <button
                className="flex items-center gap-1.5 text-[18px] font-medium text-gray-700 group-hover:text-[#004AAD] transition-colors py-8 cursor-pointer"
              >
                Temukan
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-[#004AAD] transition-transform group-hover:rotate-180" />
              </button>

              {/* Mega Dropdown Panel - Pure CSS Group Hover */}
              <div
                className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[900px] bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 z-50
                  opacity-0 invisible pointer-events-none
                  group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto
                  transition-all duration-200 ease-out transform translate-y-2 group-hover:translate-y-0
                  before:absolute before:-top-6 before:inset-x-0 before:w-full before:h-8 before:content-['']"
              >
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-8 border-r border-gray-100 pr-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Temukan</p>
                    <div className="grid grid-cols-2 gap-4">
                      {discovers.length > 0 ? (
                        discovers.map((disc) => (
                          <a key={disc.id} href="/#discover" className="p-3 rounded-xl hover:bg-blue-50/60 transition-all border border-transparent hover:border-blue-100 flex items-start gap-3 group/disc">
                            {disc.logo && (
                              <img src={disc.logo} alt={disc.name} className="w-8 h-8 object-contain shrink-0 mt-0.5" />
                            )}
                            <div>
                              <h5 className="flex items-start gap-1 font-bold text-gray-900 text-sm group-hover/disc:text-[#004AAD] transition-colors">
                                {disc.is_pinned && <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-[#004AAD] text-[#004AAD]" aria-label="Pinned" />}
                                <span>{disc.name}</span>
                              </h5>
                              {disc.short_description && (
                                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{stripHtml(disc.short_description)}</p>
                              )}
                            </div>
                          </a>
                        ))
                      ) : (
                        <>
                          <a href="/#discover" className="p-3 rounded-xl hover:bg-blue-50/60 transition-all border border-transparent hover:border-blue-100">
                            <h5 className="font-bold text-gray-900 text-sm">Tentang Asta</h5>
                            <p className="text-xs text-gray-500 mt-0.5">Profil dan visi misi perusahaan.</p>
                          </a>
                          <a href="/#discover" className="p-3 rounded-xl hover:bg-blue-50/60 transition-all border border-transparent hover:border-blue-100">
                            <h5 className="font-bold text-gray-900 text-sm">Karir & Mitraship</h5>
                            <p className="text-xs text-gray-500 mt-0.5">Gabung dengan tim Asta Digital.</p>
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Story card box with Auto-Sliding News */}
                  <div
                    className="col-span-4 flex flex-col justify-between"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-[#004AAD]">
                          Cerita <span className="text-[#38B6FF]">Asta</span>
                        </h4>
                        {/* Slide dots indicator */}
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: totalSlides }).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentSlide(idx)}
                              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                currentSlide === idx
                                  ? "w-5 bg-[#004AAD]"
                                  : "w-2 bg-gray-300 hover:bg-gray-400"
                              }`}
                              aria-label={`Slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Sliding Container */}
                      <div className="relative mt-3 h-[135px] overflow-hidden rounded-xl border border-blue-100 bg-[#E7F6FF]">
                        <div
                          className="flex h-full transition-transform duration-500 ease-in-out"
                          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                          {/* Slide 0: Default Text */}
                          <div className="w-full shrink-0 h-full p-4 text-xs text-gray-700 leading-relaxed flex items-center select-none">
                            <p>
                              Di balik layar setiap sistem yang berjalan lancar, ada tim IT kami yang selalu siap memecahkan setiap tantangan teknologi.
                            </p>
                          </div>

                          {/* Slide 1..N: Image Berita (Sorted by newest) */}
                          {newsItems.map((item, idx) => (
                            <a
                              key={item.id || idx}
                              href="/#discover"
                              className="relative w-full shrink-0 h-full group/slide overflow-hidden block"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/slide:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-900/40 to-transparent p-3.5 flex flex-col justify-end text-white">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#38B6FF]">
                                    Berita Terbaru
                                  </span>
                                  {item.is_pinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#A2FF0A]">
                                      <Pin className="h-3 w-3 fill-[#A2FF0A]" aria-hidden="true" />
                                      Pinned
                                    </span>
                                  )}
                                </div>
                                <h5 className="font-bold text-xs line-clamp-1 text-white group-hover/slide:text-[#38B6FF] transition-colors mt-0.5">
                                  {item.name}
                                </h5>
                                {item.short_description && (
                                  <p className="text-[11px] text-gray-200 line-clamp-1 mt-0.5 opacity-90">
                                    {stripHtml(item.short_description)}
                                  </p>
                                )}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    <a
                      href="/#discover"
                      className="inline-flex items-center justify-between text-xs font-semibold text-white bg-[#004AAD] px-4 py-2.5 rounded-lg hover:bg-blue-800 transition-colors mt-4 shadow-sm"
                    >
                      Pelajari Selengkapnya <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Right Contact Button */}
          <div className="hidden xl:block">
            <a
              href="/#kontak"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#004AAD] text-white font-semibold text-base hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Hubungi Kami
            </a>
          </div>

          {/* Mobile Burger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer"
            aria-label="Buka/Tutup Navigasi"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden fixed inset-0 top-[90px] bg-white z-40 p-6 flex flex-col justify-between shadow-2xl border-t border-gray-100 overflow-y-auto animate-in slide-in-from-top duration-200">
            <div className="space-y-4">
              <a
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-lg font-semibold text-gray-800 hover:text-[#004AAD] border-b border-gray-100"
              >
                Beranda
              </a>
              <a
                href="/#layanan"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-lg font-semibold text-gray-800 hover:text-[#004AAD] border-b border-gray-100"
              >
                Produk & Layanan
              </a>
              <a
                href="/#portofolio"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-lg font-semibold text-gray-800 hover:text-[#004AAD] border-b border-gray-100"
              >
                Portofolio
              </a>
              <a
                href="/#discover"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-lg font-semibold text-gray-800 hover:text-[#004AAD] border-b border-gray-100"
              >
                Temukan
              </a>
            </div>

            <div className="pt-6">
              <a
                href="/#kontak"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3.5 rounded-xl bg-[#004AAD] text-white font-bold text-base shadow-md"
              >
                Hubungi Kami
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
