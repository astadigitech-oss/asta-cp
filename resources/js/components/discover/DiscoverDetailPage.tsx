import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  BookOpen,
  Pin,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ZoomIn,
  Maximize2,
  X,
  Share2,
  Check,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/landing/sections/Footer";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData } from "@/hooks/useLandingData";
import { stripHtml } from "@/components/lib/utils";
import { DiscoverData, getDiscoverImages } from "@/components/landing/types";
import p1 from "@/assets/portfolio-1.jpg";

const SECTIONS_PER_PAGE = 2;

export function DiscoverDetailPage() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const { t, localize } = useTranslation();
  const { data: landingData } = useLandingData();
  const [copied, setCopied] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [articlePage, setArticlePage] = useState(1);
  const [previewImage, setPreviewImage] = useState<{ src: string; title?: string } | null>(null);
  const contentTopRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount or ID change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setArticlePage(1);
    setActiveImgIndex(0);
  }, [id]);

  // Try finding from cached landingData first
  const allDiscovers = (landingData?.discovers || []) as DiscoverData[];
  const cachedItem = allDiscovers.find((item) => String(item.id) === String(id));

  // Fallback direct query if not in cache (e.g. direct load)
  const { data: fetchedItem, isLoading, isError } = useQuery<DiscoverData>({
    queryKey: ["discover", id],
    queryFn: () => axios.get<DiscoverData>(`/api/discovers/${id}`).then((res) => res.data),
    enabled: !cachedItem && Boolean(id),
    staleTime: 5 * 60 * 1000,
  });

  const rawDiscover = cachedItem || fetchedItem;
  const discover = rawDiscover ? {
    ...rawDiscover,
    name: localize(rawDiscover.name),
    short_description: rawDiscover.short_description ? localize(rawDiscover.short_description) : undefined,
    content_sections: rawDiscover.content_sections?.map((sec) => ({
      ...sec,
      description: localize(sec.description),
    })),
    DiscoverLists: rawDiscover.DiscoverLists?.map((list: any) => ({
      ...list,
      description: localize(list.description),
    })),
  } : null;

  // Handle Share Link
  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success(t("common.share_copied"));
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error(t("common.copy_failed"));
    }
  };

  if (isLoading && !cachedItem) {
    return (
      <div className="min-h-screen bg-[#fafcff] flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#004AAD] border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-gray-600">{t("common.loading_article")}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || (!discover && !isLoading)) {
    return (
      <div className="min-h-screen bg-[#fafcff] flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 text-2xl font-bold">
            404
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t("common.not_found_article")}</h2>
          <p className="mt-2 text-sm text-gray-500">
            {t("common.not_found_article_desc")}
          </p>
          <div className="mt-6">
            <Button asChild className="rounded-full bg-[#004AAD] text-white px-6">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("common.back_home")}
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!discover) return null;

  const images = getDiscoverImages(discover.image);
  const currentCover = images[activeImgIndex] || p1;
  const hasMultipleImages = images.length > 1;

  // Sections pagination
  const allSections = discover.content_sections || [];
  const hasMultipleSections = allSections.length >= 2;
  const totalArticlePages = hasMultipleSections
    ? Math.ceil(allSections.length / SECTIONS_PER_PAGE)
    : 1;

  const paginatedSections = hasMultipleSections
    ? allSections.slice(
        (articlePage - 1) * SECTIONS_PER_PAGE,
        articlePage * SECTIONS_PER_PAGE
      )
    : allSections;

  // Other recommendations
  const otherDiscovers = allDiscovers
    .filter((item) => String(item.id) !== String(discover.id))
    .slice(0, 3)
    .map((item) => ({
      ...item,
      name: localize(item.name),
      short_description: localize(item.short_description),
    }));

  // Prev & Next item
  const currentIndex = allDiscovers.findIndex((item) => String(item.id) === String(discover.id));
  const prevItem = currentIndex > 0 ? allDiscovers[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 && currentIndex < allDiscovers.length - 1 ? allDiscovers[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-gray-900 font-sans selection:bg-accent/30 selection:text-accent">
      <Toaster position="top-right" />
      <Navbar />

      {/* Main Container */}
      <main className="pt-28 pb-20 sm:pt-32 sm:pb-28">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Bar */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 mb-8 pb-4 border-b border-gray-200/80"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/"
                className="flex items-center gap-1 font-medium hover:text-[#004AAD] transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                <span>{t("nav.home")}</span>
              </Link>
              <span>/</span>
              <a
                href="/#discover"
                className="font-medium hover:text-[#004AAD] transition-colors"
              >
                {t("nav.discover")}
              </a>
              <span>/</span>
              <span className="font-bold text-gray-800 line-clamp-1 max-w-[200px] sm:max-w-[350px]">
                {discover.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-8 rounded-full border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#004AAD] shadow-xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> {t("common.copied")}
                  </>
                ) : (
                  <>
                    <Share2 className="mr-1.5 h-3.5 w-3.5" /> {t("common.share")}
                  </>
                )}
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 rounded-full border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#004AAD] shadow-xs"
              >
                <Link to="/">
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> {t("common.back")}
                </Link>
              </Button>
            </div>
          </motion.nav>

          {/* Article Header Card */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-[0_10px_40px_rgb(0,0,0,0.04)] border border-gray-100/90"
          >
            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-bold text-[#004AAD] uppercase tracking-wider shadow-xs">
                {discover.type === "elearning" ? (
                  <>
                    <BookOpen className="h-3.5 w-3.5 text-[#004AAD]" />
                    {t("discover.badge_elearning")}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-[#004AAD]" />
                    {t("discover.badge_story")}
                  </>
                )}
              </span>

              {discover.year && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  <Calendar className="h-3.5 w-3.5 text-gray-500" />
                  {discover.year}
                </span>
              )}

              {discover.is_pinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <Pin className="h-3.5 w-3.5 fill-amber-700" />
                  {t("discover.pinned_badge")}
                </span>
              )}
            </div>

            {/* Main Title */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.2] text-gray-900 tracking-tight">
              {discover.name}
            </h1>

            {/* Author & Timestamp bar */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#004AAD] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  ASTA
                </div>
                <div>
                  <div className="font-bold text-gray-800">{t("common.editorial_name")}</div>
                  <div className="text-[11px] text-gray-400">{t("common.official_article")}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#004AAD]" /> {t("common.read_time")}
                </span>
                {totalArticlePages > 1 && (
                  <span className="inline-flex items-center rounded-full bg-blue-100/90 px-3 py-1 text-xs font-bold text-[#004AAD]">
                    {t("discover.modal.page_indicator", { current: articlePage, total: totalArticlePages })}
                  </span>
                )}
              </div>
            </div>

            {/* Cover Image & Lightbox Trigger */}
            {articlePage === 1 && (
              <div className="mt-8 w-full">
                <div
                  onClick={() => currentCover && setPreviewImage({ src: currentCover, title: discover.name })}
                  className="group/cimg relative w-full aspect-[16/9] overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-900 border border-gray-100 shadow-md cursor-zoom-in"
                >
                  <img
                    src={currentCover}
                    alt={discover.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/cimg:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cimg:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-lg">
                      <ZoomIn className="h-4 w-4" /> {t("discover.modal.click_fullscreen")}
                    </span>
                  </div>

                  {/* Multiple image gallery control */}
                  {hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
                        }}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-lg transition-all active:scale-95 cursor-pointer"
                        title="Previous Image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImgIndex((prev) => (prev + 1) % images.length);
                        }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-lg transition-all active:scale-95 cursor-pointer"
                        title="Next Image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium border border-white/20">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>{activeImgIndex + 1} / {images.length}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-2.5 flex items-center justify-between px-1 text-xs text-gray-500 italic">
                  <span>{t("discover.modal.doc_caption", { name: discover.name })}</span>
                  <span
                    onClick={() => setPreviewImage({ src: currentCover, title: discover.name })}
                    className="text-[#004AAD] font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <Maximize2 className="h-3.5 w-3.5" /> {t("discover.modal.enlarge_photo")}
                  </span>
                </div>
              </div>
            )}

            {/* Lead Intro / Short Description */}
            <div ref={contentTopRef} className="mt-8 space-y-6">
              {articlePage === 1 && discover.short_description && (
                <div
                  className="prose prose-blue max-w-none text-gray-800 text-lg sm:text-xl leading-relaxed font-medium border-l-4 border-[#004AAD] pl-5 py-3 bg-blue-50/50 rounded-r-2xl shadow-xs"
                  dangerouslySetInnerHTML={{ __html: discover.short_description }}
                />
              )}

              {/* Modular Content Sections for E-Learning & Stories */}
              {discover.type === "elearning" && paginatedSections.length > 0 && (
                <div className="space-y-10 pt-4">
                  {paginatedSections.map((section, sIdx) => {
                    const sectionRealIndex = (articlePage - 1) * SECTIONS_PER_PAGE + sIdx + 1;
                    const sectionTitle = t("discover.modal.section_part", { index: sectionRealIndex });
                    return (
                      <section key={sIdx} className="space-y-4 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="h-6 px-3 rounded-full bg-[#004AAD] text-white text-xs font-bold flex items-center justify-center">
                            {t("common.part_indicator", { index: sectionRealIndex })}
                          </span>
                        </div>

                        {section.image && (
                          <div
                            onClick={() => section.image && setPreviewImage({ src: section.image, title: String(discover.name) + " — " + String(sectionTitle) })}
                            className="group/simg relative w-full overflow-hidden rounded-2xl bg-white border border-gray-200/70 shadow-sm cursor-zoom-in"
                          >
                            <img
                              src={section.image}
                              alt={sectionTitle}
                              className="w-full h-auto max-h-[520px] object-cover mx-auto transition-transform duration-500 group-hover/simg:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/simg:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                                <ZoomIn className="h-4 w-4" /> {t("discover.modal.click_fullscreen")}
                              </span>
                            </div>
                          </div>
                        )}

                        {section.description && (
                          <div
                            className="prose prose-blue max-w-none text-gray-700 text-base sm:text-lg leading-relaxed pt-2"
                            dangerouslySetInnerHTML={{ __html: section.description }}
                          />
                        )}
                      </section>
                    );
                  })}
                </div>
              )}

              {/* Key Highlights Checklist for Stories */}
              {discover.type !== "elearning" && discover.DiscoverLists && discover.DiscoverLists.length > 0 && (
                <div className="pt-6 border-t border-gray-100 mt-8">
                  <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#004AAD]" />
                    {t("discover.modal.key_points")}
                  </h3>
                  <ul className="grid sm:grid-cols-2 gap-3.5">
                    {discover.DiscoverLists.map((list) => (
                      <li
                        key={list.id}
                        className="flex items-start gap-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-100 text-sm font-medium text-gray-800 shadow-xs"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#004AAD] mt-0.5" />
                        <span className="whitespace-pre-line leading-relaxed">{stripHtml(list.description)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Multi-page Pagination Controls */}
              {totalArticlePages > 1 && (
                <div className="pt-8 border-t border-gray-200 mt-10 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-blue-50/80 p-5 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider mr-1">
                        {t("discover.modal.pagination_page")}
                      </span>
                      {Array.from({ length: totalArticlePages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => {
                              setArticlePage(pageNum);
                              contentTopRef.current?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className={`h-10 w-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                              articlePage === pageNum
                                ? "bg-[#004AAD] text-white shadow-md shadow-blue-500/20 scale-105"
                                : "bg-white text-gray-700 hover:bg-blue-100/80 border border-blue-200/60"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {articlePage > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setArticlePage((prev) => prev - 1);
                            contentTopRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="rounded-xl border-gray-300 bg-white text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                        >
                          <ChevronLeft className="mr-1 h-3.5 w-3.5" /> {t("common.previous")}
                        </Button>
                      )}
                      {articlePage < totalArticlePages ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setArticlePage((prev) => prev + 1);
                            contentTopRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="rounded-xl bg-[#004AAD] text-white text-xs font-semibold hover:bg-blue-800 shadow-sm cursor-pointer"
                        >
                          {t("common.next")} <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-gray-500 italic">
                          {t("discover.modal.last_page")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prev / Next Article Navigation Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 grid sm:grid-cols-2 gap-4">
              {prevItem ? (
                <Link
                  to="/discover/$id"
                  params={{ id: String(prevItem.id) }}
                  className="group flex flex-col p-4 rounded-2xl border border-gray-200/80 bg-white hover:bg-blue-50/50 hover:border-blue-200 transition-all"
                >
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 group-hover:text-[#004AAD]">
                    <ChevronLeft className="h-3.5 w-3.5" /> {t("common.prev_article")}
                  </span>
                  <span className="mt-1 text-sm font-bold text-gray-900 group-hover:text-[#004AAD] line-clamp-1 transition-colors">
                    {prevItem.name}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextItem && (
                <Link
                  to="/discover/$id"
                  params={{ id: String(nextItem.id) }}
                  className="group flex flex-col p-4 rounded-2xl border border-gray-200/80 bg-white hover:bg-blue-50/50 hover:border-blue-200 transition-all text-right sm:text-right"
                >
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-end gap-1 group-hover:text-[#004AAD]">
                    {t("common.next_article")} <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="mt-1 text-sm font-bold text-gray-900 group-hover:text-[#004AAD] line-clamp-1 transition-colors">
                    {nextItem.name}
                  </span>
                </Link>
              )}
            </div>
          </motion.article>

          {/* Other Recommendations Section */}
          {otherDiscovers.length > 0 && (
            <div className="mt-16 sm:mt-20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
                    {t("common.related_title")}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("common.related_desc")}
                  </p>
                </div>
                <Button asChild variant="outline" className="rounded-full border-gray-200 text-xs font-semibold">
                  <a href="/#discover">
                    {t("common.view_all")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherDiscovers.map((item) => {
                  const itemImgs = getDiscoverImages(item.image);
                  return (
                    <Link
                      key={item.id}
                      to="/discover/$id"
                      params={{ id: String(item.id) }}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                    >
                      <div>
                        <div className="w-full aspect-[16/10] rounded-xl overflow-hidden mb-3.5 bg-gray-100 relative">
                          <img
                            src={itemImgs[0] || p1}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#004AAD] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                            {item.year || (item.type === "elearning" ? t("discover.badge_elearning") : t("discover.badge_story"))}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-gray-900 leading-snug line-clamp-2 group-hover:text-[#004AAD] transition-colors">
                          {item.name}
                        </h4>
                        {item.short_description && (
                          <p className="mt-2 text-xs text-gray-500 line-clamp-2 font-normal leading-relaxed">
                            {stripHtml(item.short_description)}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#004AAD]">
                        <span>{t("discover.read_more")}</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Consultation CTA Card */}
          <div className="mt-16 rounded-3xl bg-gradient-to-br from-[#004AAD] via-[#053d86] to-[#02204a] p-8 sm:p-12 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
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

      {/* Full Screen Lightbox Modal */}
      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null);
        }}
      >
        <DialogContent
          showClose={false}
          className="w-[98vw] sm:w-[95vw] max-w-7xl max-h-[96vh] p-0 border-0 bg-black/90 sm:bg-black/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col items-center justify-center"
        >
          {previewImage && (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-6">
              <div className="absolute top-4 inset-x-4 sm:top-6 sm:inset-x-8 z-50 flex items-center justify-between pointer-events-auto">
                <div className="rounded-full bg-black/60 backdrop-blur-md px-4 py-1.5 border border-white/20 text-white text-xs sm:text-sm font-semibold max-w-[70vw] truncate shadow-lg">
                  {previewImage.title || t("discover.lightbox.preview_title")}
                </div>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-black/70 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
                  title={t("discover.lightbox.close")}
                  aria-label={t("discover.lightbox.close")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                onClick={() => setPreviewImage(null)}
                className="flex-1 w-full flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
              >
                <img
                  src={previewImage.src}
                  alt={previewImage.title || "Full Screen Image"}
                  className="max-h-[82vh] max-w-[92vw] w-auto h-auto object-contain rounded-xl shadow-2xl transition-transform duration-300"
                />
              </div>

              <div className="absolute bottom-3 sm:bottom-4 z-40 text-center text-white/60 text-[11px]">
                {t("discover.lightbox.hint")}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
