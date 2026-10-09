import { useState, useRef, useEffect, Suspense, lazy, useMemo } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "motion/react";
import {
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Home,
  Tag,
  Calendar,
  BookOpen,
  X,
} from "lucide-react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useTranslation } from "@/i18n/useTranslation";

const Footer = lazy(() =>
  import("@/components/landing/sections/Footer").then((m) => ({ default: m.Footer }))
);

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  excerpt: string | null;
  author: string;
  category: string;
  published_at: string;
}

interface ArticlePaginated {
  data: ArticleItem[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const ITEMS_PER_PAGE = 9;

const stripHtml = (html?: string | null): string => {
  if (!html) return "";
  return html
    .replace(/<\/(p|h[1-6]|li|blockquote|div|br)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

export function BlogListPage() {
  const params = useParams({ strict: false }) as Record<string, string>;
  const { t, localize, language } = useTranslation();
  const lang = params?.lang || language || "id";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const { data, isLoading, isError } = useQuery<ArticlePaginated>({
    queryKey: ["articles", currentPage, activeCategory, searchQuery],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        limit: ITEMS_PER_PAGE,
        page: currentPage,
      };
      if (activeCategory && activeCategory !== "All") {
        params.category = activeCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const res = await axios.get<ArticlePaginated>("/api/articles", { params });
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const articles = data?.data || [];
  const totalPages = data?.last_page || 1;
  const totalArticles = data?.total || 0;

  // Collect unique categories from current page (a simpler approach)
  const categories = useMemo(() => {
    const cats = new Set<string>(["All"]);
    articles.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [articles]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-gray-900 font-sans flex flex-col justify-between">
      <Toaster position="top-right" richColors />
      <Navbar />

      <main className="flex-1 w-full pt-28 pb-20 sm:pt-32 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1080px]">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-8 pb-4 border-b border-gray-200/80"
          >
            <Link
              to="/$lang"
              params={{ lang }}
              className="flex items-center gap-1 font-medium hover:text-primary transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>{lang === "en" ? "Home" : "Beranda"}</span>
            </Link>
            <span>/</span>
            <span className="font-bold text-gray-800">
              {lang === "en" ? "Articles & Insights" : "Artikel & Wawasan"}
            </span>
          </motion.nav>

          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-3.5 py-1 text-[11px] font-bold tracking-widest text-primary shadow-sm uppercase mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              {lang === "en" ? "Knowledge Hub" : "Pusat Pengetahuan"}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-gray-900">
              {lang === "en" ? "Articles & Insights" : "Artikel & Wawasan"}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
              {lang === "en"
                ? "Explore our collection of articles on digital transformation, technology, and business growth."
                : "Jelajahi koleksi artikel kami seputar transformasi digital, teknologi, dan pertumbuhan bisnis."}
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <div className="mb-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center" ref={listTopRef}>
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "en" ? "Search articles…" : "Cari artikel…"}
                className="w-full h-10 pl-10 pr-10 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            {/* Category tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`h-9 rounded-full px-4 text-xs font-semibold transition-all border cursor-pointer ${
                    activeCategory === cat
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {cat === "All" ? (lang === "en" ? "All" : "Semua") : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Total count */}
          {!isLoading && totalArticles > 0 && (
            <p className="text-xs text-gray-500 mb-4">
              {lang === "en"
                ? `Showing ${articles.length} of ${totalArticles} articles`
                : `Menampilkan ${articles.length} dari ${totalArticles} artikel`}
            </p>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
                  <div className="aspect-[16/9] rounded-xl bg-gray-200" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-4/5" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="text-center py-20 text-gray-500">
              <p className="text-sm">
                {lang === "en"
                  ? "Failed to load articles. Please try again."
                  : "Gagal memuat artikel. Silakan coba lagi."}
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && articles.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-base font-semibold text-gray-500">
                {lang === "en" ? "No articles found" : "Belum ada artikel"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {lang === "en"
                  ? "Try adjusting your search or filter."
                  : "Coba ubah kata kunci atau filter."}
              </p>
              {(searchQuery || activeCategory !== "All") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); setCurrentPage(1); }}
                  className="mt-4 rounded-full border-gray-300 text-xs font-semibold"
                >
                  {lang === "en" ? "Reset Filter" : "Reset Filter"}
                </Button>
              )}
            </div>
          )}

          {/* Articles Grid */}
          {!isLoading && articles.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <Link
                    to="/$lang/$slug"
                    params={{ slug: article.slug, lang }}
                    className="block cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-gray-100 relative">
                      {article.thumbnail ? (
                        <img
                          src={article.thumbnail}
                          alt={localize(article.title)}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-blue-50">
                          <BookOpen className="h-10 w-10 text-primary/30" />
                        </div>
                      )}

                      {/* Category badge */}
                      {article.category && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                          <Tag className="h-3 w-3" />
                          {localize(article.category)}
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{article.published_at}</span>
                      {article.author && (
                        <>
                          <span>·</span>
                          <span className="font-medium text-gray-500 truncate">{article.author}</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-bold text-base sm:text-lg text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {localize(article.title)}
                    </h2>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="mt-2.5 text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3 font-normal">
                        {stripHtml(localize(article.excerpt))}
                      </p>
                    )}
                  </Link>

                  {/* Read more */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-primary">
                    <Link
                      to="/$lang/$slug"
                      params={{ slug: article.slug, lang }}
                      className="inline-flex items-center gap-1.5 hover:underline"
                    >
                      <span>{lang === "en" ? "Read Article" : "Baca Artikel"}</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Pagination */}
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
                {lang === "en" ? "Previous" : "Sebelumnya"}
              </Button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  // Show limited page buttons
                  if (totalPages > 7 && Math.abs(pNum - currentPage) > 2 && pNum !== 1 && pNum !== totalPages) {
                    if (pNum === 2 || pNum === totalPages - 1) {
                      return <span key={pNum} className="text-gray-400 text-xs px-1">…</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => handlePageChange(pNum)}
                      className={`h-9 w-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pNum
                          ? "bg-primary text-white shadow-sm"
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
                {lang === "en" ? "Next" : "Berikutnya"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}

