import { useState, useRef, useEffect, Suspense, lazy, useMemo } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Search,
  BookOpen,
  Pin,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Home,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData } from "@/hooks/useLandingData";
import { stripHtml } from "@/components/lib/utils";
import { DiscoverData, getDiscoverImages } from "@/components/landing/types";
import p1 from "@/assets/portfolio-1.jpg";

const Footer = lazy(() =>
  import("@/components/landing/sections/Footer").then((m) => ({ default: m.Footer }))
);

const ITEMS_PER_PAGE = 6;

export function DiscoverListPage() {
  const params = useParams({ strict: false }) as Record<string, string>;
  const { t, localize, language } = useTranslation();
  const lang = params?.lang || language || "id";
  const { data: landingData, isLoading } = useLandingData();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "story" | "elearning">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const rawList = (landingData?.discovers || []) as DiscoverData[];
  const localizedList = useMemo(
    () =>
      rawList.map((item) => ({
        ...item,
        name: localize(item.name),
        short_description: item.short_description ? localize(item.short_description) : undefined,
      })),
    [rawList, localize]
  );

  // Filter based on search and tab
  const filteredList = useMemo(() => {
    return localizedList.filter((item) => {
      // Tab filter
      if (activeTab === "story" && item.type === "elearning") return false;
      if (activeTab === "elearning" && item.type !== "elearning") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchDesc = item.short_description?.toLowerCase().includes(q);
        const matchYear = item.year?.toString().includes(q);
        return matchName || matchDesc || matchYear;
      }

      return true;
    });
  }, [localizedList, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = useMemo(() => {
    return filteredList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-gray-900 font-sans selection:bg-accent/30 selection:text-accent">
      <Toaster position="top-right" />
      <Navbar />

      <main className="pt-28 pb-20 sm:pt-32 sm:pb-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Breadcrumb Bar */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-xs text-gray-500 mb-8 pb-4 border-b border-gray-200/80"
          >
            <Link
              to="/$lang"
              params={{ lang }}
              className="flex items-center gap-1 font-medium hover:text-[#004AAD] transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>{t("nav.home")}</span>
            </Link>
            <span>/</span>
            <span className="font-bold text-gray-800">{t("nav.discover")}</span>
          </motion.nav>

          {/* Hero Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#004AAD] via-[#023377] to-[#011e48] p-8 sm:p-12 lg:p-16 text-white shadow-xl mb-12"
          >
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-200 border border-white/15 mb-4">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                <span>{lang === "en" ? "Knowledge Hub & Stories" : "Pusat Wawasan & Cerita"}</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight">
                {lang === "en"
                  ? "Explore Insights, Stories & Technology Guides"
                  : "Jelajahi Wawasan, Cerita & Panduan Teknologi"}
              </h1>
              <p className="mt-4 text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl">
                {lang === "en"
                  ? "A curated collection of industry perspectives, digital transformation case studies, and engineering practices from ASTA Digital Agency."
                  : "Kumpulan artikel, studi kasus transformasi digital, dan panduan teknis dari para praktisi ASTA Digital Agency."}
              </p>
            </div>

            {/* Background glowing gradients */}
            <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -top-20 h-60 w-60 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
          </motion.div>

          {/* Toolbar: Search & Filter Tabs */}
          <div ref={listTopRef} className="mb-10 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              {/* Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("all");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "all"
                      ? "bg-[#004AAD] text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
                  }`}
                >
                  {t("discover.tab_all")} ({localizedList.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("story");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "story"
                      ? "bg-[#004AAD] text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("discover.tab_story")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("elearning");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "elearning"
                      ? "bg-[#004AAD] text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {t("discover.tab_elearning")}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={lang === "en" ? "Search articles..." : "Cari artikel atau topik..."}
                  className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-200 bg-gray-50/80 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#004AAD] focus:outline-none focus:ring-2 focus:ring-[#004AAD]/15 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Results count text */}
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>
                {lang === "en"
                  ? `Showing ${filteredList.length} articles`
                  : `Menampilkan ${filteredList.length} wawasan`}
              </span>
              {searchQuery && (
                <span className="text-gray-400 italic">
                  {lang === "en" ? `Filtered by "${searchQuery}"` : `Hasil filter "${searchQuery}"`}
                </span>
              )}
            </div>
          </div>

          {/* Loading Skeleton State */}
          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 rounded-2xl bg-white border border-gray-100 p-5 animate-pulse">
                  <div className="w-full aspect-[16/10] bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-4/5 mb-4" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredList.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs max-w-md mx-auto my-12">
              <div className="h-14 w-14 rounded-full bg-blue-50 text-[#004AAD] mx-auto flex items-center justify-center mb-4">
                <SlidersHorizontal className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {lang === "en" ? "No articles found" : "Tidak ada wawasan ditemukan"}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {lang === "en"
                  ? "Try changing your search query or reset category filter."
                  : "Coba gunakan kata kunci lain atau reset filter kategori."}
              </p>
              {(searchQuery || activeTab !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                    setCurrentPage(1);
                  }}
                  className="mt-6 rounded-full border-gray-300 text-xs font-semibold"
                >
                  {lang === "en" ? "Reset Filter" : "Reset Filter"}
                </Button>
              )}
            </div>
          )}

          {/* Articles Grid */}
          {!isLoading && filteredList.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedList.map((item, index) => {
                const images = getDiscoverImages(item.image);
                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link
                      to="/$lang/discover/$id"
                      params={{ id: String(item.id), lang }}
                      className="block cursor-pointer"
                    >
                      <div className="w-full aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-gray-100 relative">
                        <img
                          src={images[0] || p1}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute left-3 top-3 flex items-center gap-1.5 flex-wrap">
                          {item.type === "elearning" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#004AAD] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                              <BookOpen className="h-3 w-3" />
                              {t("discover.badge_elearning")}
                            </span>
                          ) : item.is_pinned ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 shadow-xs">
                              <Pin className="h-3 w-3 fill-amber-700" />
                              {t("discover.pinned_badge")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#004AAD] shadow-xs">
                              <Sparkles className="h-3 w-3" />
                              {t("discover.badge_story")}
                            </span>
                          )}
                        </div>

                        {item.year && (
                          <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white">
                            {item.year}
                          </span>
                        )}
                      </div>

                      <h2 className="font-bold text-lg text-gray-900 leading-snug line-clamp-2 group-hover:text-[#004AAD] transition-colors">
                        {item.name}
                      </h2>

                      {item.short_description && (
                        <p className="mt-2.5 text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3 font-normal">
                          {stripHtml(item.short_description)}
                        </p>
                      )}
                    </Link>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#004AAD]">
                      <Link
                        to="/$lang/discover/$id"
                        params={{ id: String(item.id), lang }}
                        className="inline-flex items-center gap-1.5 hover:underline"
                      >
                        <span>{t("discover.read_more")}</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      {item.year && <span className="text-gray-400 font-normal">{item.year}</span>}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          {/* Pagination Component */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-xl border-gray-300 text-xs font-semibold"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("common.previous")}
              </Button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => handlePageChange(pNum)}
                      className={`h-9 w-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pNum
                          ? "bg-[#004AAD] text-white shadow-sm"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl border-gray-300 text-xs font-semibold"
              >
                {t("common.next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Bottom Consultation CTA */}
          <div className="mt-20 rounded-3xl bg-gradient-to-br from-[#004AAD] via-[#053d86] to-[#02204a] p-8 sm:p-12 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center sm:text-left">
              <h3 className="font-display text-2xl sm:text-3xl font-bold">
                {t("common.cta_similar_title")}
              </h3>
              <p className="mt-2 text-sm text-blue-100 leading-relaxed">
                {t("common.cta_similar_desc")}
              </p>
            </div>
            <Button
              asChild
              className="rounded-full bg-white text-[#004AAD] hover:bg-blue-50 font-bold px-7 py-3 text-sm shadow-lg shrink-0 transition-transform active:scale-95"
            >
              <a href="/#kontak">
                {t("common.consult_now")} <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}

