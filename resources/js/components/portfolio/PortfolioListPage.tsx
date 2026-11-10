import { useState, useRef, useEffect, Suspense, lazy, useMemo } from "react";
import { Link, useParams, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Search,
  ArrowRight,
  ExternalLink,
  Home,
  Sparkles,
  Smartphone,
  Monitor,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData } from "@/hooks/useLandingData";
import { stripHtml } from "@/components/lib/utils";
import { PortfolioData } from "@/components/landing/types";

const Footer = lazy(() =>
  import("@/components/landing/sections/Footer").then((m) => ({ default: m.Footer }))
);

const ITEMS_PER_PAGE = 9;

export function PortfolioListPage() {
  const params = useParams({ strict: false }) as Record<string, string>;
  const { t, localize, language } = useTranslation();
  const navigate = useNavigate();
  const lang = params?.lang || language || "id";
  const { data: landingData, isLoading } = useLandingData();

  const [activeCategory, setActiveCategory] = useState<"all" | "mobile" | "desktop">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const rawPortfolios = (landingData?.portfolios || []) as PortfolioData[];

  const localizedPortfolios = useMemo(() => {
    return rawPortfolios.map((item) => ({
      ...item,
      name: localize(item.name),
      description: item.description ? localize(item.description) : undefined,
      category: item.type === "mobile" ? "Mobile" : "Desktop",
    }));
  }, [rawPortfolios, localize]);

  // Filter based on category and search query
  const filteredPortfolios = useMemo(() => {
    return localizedPortfolios.filter((p) => {
      // Category filter
      if (activeCategory !== "all") {
        const itemType = p.type?.toLowerCase() || "";
        if (activeCategory === "mobile" && itemType !== "mobile") return false;
        if (activeCategory === "desktop" && itemType === "mobile") return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        return matchName || matchDesc;
      }

      return true;
    });
  }, [localizedPortfolios, activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredPortfolios.length / ITEMS_PER_PAGE) || 1;
  const paginatedPortfolios = useMemo(() => {
    return filteredPortfolios.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredPortfolios, currentPage]);

  const handleCategoryChange = (cat: "all" | "mobile" | "desktop") => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-[#0b1f33] font-sans selection:bg-[#004AAD]/20 selection:text-[#004AAD] flex flex-col justify-between">
      <Toaster position="top-right" richColors />
      <Navbar />

      <main className="flex-1 pt-24 pb-20 sm:pt-28 sm:pb-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <Link
              to="/$lang"
              params={{ lang }}
              className="inline-flex items-center gap-1.5 hover:text-[#004AAD] transition-colors font-medium"
            >
              <Home className="h-4 w-4" />
              <span>{lang === "en" ? "Home" : "Beranda"}</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900" aria-current="page">
              {t("nav.portfolio")}
            </span>
          </nav>

          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-white via-blue-50/40 to-blue-100/30 border border-blue-100/80 p-8 sm:p-12 lg:p-16 shadow-glass mb-10">
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#004AAD]/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#38B6FF]/15 blur-2xl" />

            <div className="relative z-10 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full bg-[#004AAD]/10 px-4 py-1.5 text-xs font-bold text-[#004AAD] uppercase tracking-wider mb-4 border border-[#004AAD]/20"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#004AAD]" />
                {t("portfolio.eyebrow")}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15]"
              >
                {lang === "en"
                  ? "Explore All Projects & Software Showcase"
                  : "Daftar Lengkap Portofolio & Studi Kasus Proyek ASTA"}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed"
              >
                {t("portfolio.description")}
              </motion.p>

              {/* Filters & Search Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between"
              >
                {/* Category Tabs */}
                <div className="inline-flex rounded-full bg-white p-1.5 shadow-xs border border-gray-200/80 self-start">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("all")}
                    className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      activeCategory === "all"
                        ? "bg-[#004AAD] text-white shadow-sm"
                        : "text-gray-600 hover:text-[#004AAD] hover:bg-blue-50/50"
                    }`}
                  >
                    {t("portfolio.tab_all")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("mobile")}
                    className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      activeCategory === "mobile"
                        ? "bg-[#004AAD] text-white shadow-sm"
                        : "text-gray-600 hover:text-[#004AAD] hover:bg-blue-50/50"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    {t("portfolio.tab_mobile")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("desktop")}
                    className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      activeCategory === "desktop"
                        ? "bg-[#004AAD] text-white shadow-sm"
                        : "text-gray-600 hover:text-[#004AAD] hover:bg-blue-50/50"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    {t("portfolio.tab_desktop")}
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={
                      lang === "en"
                        ? "Search projects by name..."
                        : "Cari proyek berdasarkan nama..."
                    }
                    className="w-full rounded-full border border-gray-200 bg-white pl-11 pr-10 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#004AAD] focus:outline-none focus:ring-4 focus:ring-blue-100 shadow-xs transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          <div ref={listTopRef} />

          {/* Portfolio Grid */}
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#004AAD] border-r-transparent align-[-0.125em]" />
              <p className="mt-4 text-sm font-medium text-gray-500">
                {lang === "en" ? "Loading portfolios..." : "Memuat daftar portofolio..."}
              </p>
            </div>
          ) : paginatedPortfolios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {paginatedPortfolios.map((p, index) => {
                const isMobile = p.type === "mobile";
                const displayImage = p.image || p.image_small;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
                  >
                    <Link
                      to="/$lang/portfolio/$id"
                      params={{ lang, id: String(p.id) }}
                      preload="intent"
                      className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-gray-100/90 bg-white shadow-glass transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-200 cursor-pointer h-full"
                    >
                      <div>
                        {/* Image Thumbnail Container */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-900">
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt={p.name}
                              width={640}
                              height={400}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#004AAD] to-[#38B6FF] text-white font-bold text-xl">
                              {p.name.charAt(0)}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                          {/* Category Badge */}
                          <div className="absolute top-3 left-3 z-10">
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-[#004AAD] shadow-xs">
                              {isMobile ? (
                                <Smartphone className="h-3 w-3" />
                              ) : (
                                <Monitor className="h-3 w-3" />
                              )}
                              {p.category}
                            </span>
                          </div>

                          {/* Live Demo badge if available */}
                          {p.demo_url && (
                            <div className="absolute top-3 right-3 z-10">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                Demo
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content Info */}
                        <div className="p-6">
                          <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#004AAD] transition-colors line-clamp-1">
                            {p.name}
                          </h3>
                          <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                            {stripHtml(p.description) ||
                              (lang === "en"
                                ? "Engineered tailored software solution by ASTA Digital."
                                : "Solusi sistem perangkat lunak terintegrasi dari ASTA Digital.")}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-gray-100">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004AAD] group-hover:gap-2 transition-all">
                          <span>{t("services.view_detail")}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>

                        {p.demo_url && (
                          <span
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(p.demo_url, "_blank", "noopener,noreferrer");
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-medium transition-colors"
                          >
                            <span>{t("portfolio.live_demo")}</span>
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center rounded-3xl bg-white border border-gray-100 shadow-sm p-8">
              <Layers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800">
                {lang === "en"
                  ? "No portfolio projects found"
                  : "Tidak ada portofolio yang sesuai"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                {lang === "en"
                  ? "Try resetting the filters or clearing the search bar."
                  : "Coba ubah kategori filter atau bersihkan kotak pencarian."}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="mt-5 rounded-full"
              >
                {lang === "en" ? "Reset Filters" : "Reset Filter"}
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-10 w-10 rounded-full border border-gray-200 bg-white grid place-items-center text-gray-600 hover:bg-blue-50 hover:text-[#004AAD] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-10 w-10 rounded-full text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-[#004AAD] text-white shadow-md"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:text-[#004AAD]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-10 w-10 rounded-full border border-gray-200 bg-white grid place-items-center text-gray-600 hover:bg-blue-50 hover:text-[#004AAD] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Bottom Conversion Banner */}
          <div className="mt-16 sm:mt-24 rounded-[32px] sm:rounded-[40px] bg-gradient-to-r from-[#003882] via-[#004AAD] to-[#0072b2] text-white p-8 sm:p-12 lg:p-14 text-center shadow-xl relative overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
              {lang === "en"
                ? "Interested in Building a Similar Digital Solution?"
                : "Tertarik Mengembangkan Sistem atau Aplikasi Serupa?"}
            </h2>
            <p className="mt-3 text-xs sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
              {lang === "en"
                ? "Consult your technology roadmap, functional requirements, and budget with our engineering team."
                : "Diskusikan rencana spesifikasi teknis, alur proses bisnis, dan estimasi waktu bersama tim arsitek teknologi ASTA Digital Agency."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <Button
                asChild
                className="rounded-full bg-white text-[#004AAD] hover:bg-blue-50 px-8 h-12 font-bold shadow-lg text-sm sm:text-base"
              >
                <a href={`/${lang}#kontak`}>
                  {lang === "en" ? "Consult Project" : "Konsultasikan Proyek"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/30 text-white bg-white/10 hover:bg-white/20 px-8 h-12 font-semibold text-sm sm:text-base backdrop-blur-sm"
              >
                <a
                  href="https://wa.me/6281578223564"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp (+62 815 7822 3564)
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}

export default PortfolioListPage;
