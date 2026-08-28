import { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  BookOpen,
  Pin,
  X,
  CheckCircle2,
  ArrowRight,
  ZoomIn,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/useTranslation";
import { stripHtml } from "@/components/lib/utils";
import { SectionPagination } from "../common";
import { DiscoverData, getDiscoverImages } from "../types";
import p1 from "@/assets/portfolio-1.jpg";

const defaultDiscovers: DiscoverData[] = [
  { id: 1, year: "2022", name: "Inisiasi & Pendirian ASTA Digital", short_description: "Asta Digital didirikan untuk menghadirkan solusi software berkualitas tinggi." },
  { id: 2, year: "2023", name: "Ekspansi Layanan Enterprise", short_description: "Mengembangkan aplikasi web & mobile enterprise untuk berbagai instansi." },
  { id: 3, year: "2024", name: "Transformasi Digital Terpadu", short_description: "Menjangkau puluhan mitra bisnis dan instansi publik di seluruh Indonesia." },
];

const DISCOVERS_PER_PAGE = 3;
const SECTIONS_PER_ARTICLE_PAGE = 2;

export function DiscoverSection({ discoversList = defaultDiscovers }: { discoversList?: DiscoverData[] }) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDiscoverTab, setActiveDiscoverTab] = useState<"all" | "story" | "elearning">("all");
  const [selectedDiscover, setSelectedDiscover] = useState<DiscoverData | null>(null);
  const [discoverImgIndex, setDiscoverImgIndex] = useState(0);
  const [articlePage, setArticlePage] = useState(1);
  const [previewImage, setPreviewImage] = useState<{ src: string; title?: string } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  const filteredDiscovers = (discoversList && discoversList.length > 0 ? discoversList : defaultDiscovers).filter((item) => {
    if (activeDiscoverTab === "all") return true;
    if (activeDiscoverTab === "story") return !item.type || item.type === "story";
    if (activeDiscoverTab === "elearning") return item.type === "elearning";
    return true;
  });

  const totalPages = Math.ceil(filteredDiscovers.length / DISCOVERS_PER_PAGE) || 1;
  const paginatedDiscovers = filteredDiscovers.slice(
    (currentPage - 1) * DISCOVERS_PER_PAGE,
    currentPage * DISCOVERS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleOpenDiscover = (item: DiscoverData) => {
    setSelectedDiscover(item);
    setDiscoverImgIndex(0);
    setArticlePage(1);
  };

  return (
    <section ref={sectionRef} id="discover" className="relative overflow-hidden bg-[#eef7fa] py-6 sm:py-6 lg:py-6">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl 2xl:max-w-4xl 3xl:max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00a3be]/40 bg-white/90 px-3.5 py-1 text-[11px] font-bold tracking-widest text-[#0093ab] shadow-sm uppercase">
            <span className="h-2 w-2 rounded-full bg-[#00a3be]" />
            {t("discover.eyebrow")}
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold leading-[1.15] sm:text-4xl md:text-5xl text-gray-900 tracking-tight">
            {t("discover.title")}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl 2xl:max-w-3xl mx-auto leading-relaxed">
            {t("discover.description")}
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full bg-white/90 p-1.5 shadow-sm border border-gray-200/80 backdrop-blur-sm">
            <button
              onClick={() => {
                setActiveDiscoverTab("all");
                setCurrentPage(1);
              }}
              className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeDiscoverTab === "all"
                  ? "bg-[#004AAD] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("discover.tab_all")}
            </button>
            <button
              onClick={() => {
                setActiveDiscoverTab("story");
                setCurrentPage(1);
              }}
              className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeDiscoverTab === "story"
                  ? "bg-[#004AAD] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("discover.tab_story")}
            </button>
            <button
              onClick={() => {
                setActiveDiscoverTab("elearning");
                setCurrentPage(1);
              }}
              className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeDiscoverTab === "elearning"
                  ? "bg-[#004AAD] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("discover.tab_elearning")}
            </button>
          </div>
        </div>

        <div className="relative mt-10 flex items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            aria-label={t("common.previous")}
            className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#00a3be] transition-all hover:bg-white/80 hover:scale-110 active:scale-95 disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-9 w-9 stroke-[2.5]" />
          </button>

          <div className="grid flex-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedDiscovers.map((item, index) => {
              const images = getDiscoverImages(item.image);
              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => handleOpenDiscover(item)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                >
                  <div>
                    <div className="w-full aspect-[16/10] rounded-xl overflow-hidden mb-3.5 bg-gray-100 relative">
                      <img
                        src={images[0] || p1}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {images.length > 1 && (
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                          <ImageIcon className="h-3 w-3" />
                          <span>{images.length}</span>
                        </span>
                      )}
                      {item.type === "elearning" ? (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#004AAD] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                          <BookOpen className="h-3 w-3" />
                          {t("discover.badge_elearning")}
                        </span>
                      ) : item.is_pinned ? (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#004AAD] shadow-sm">
                          <Pin className="h-3 w-3 fill-[#004AAD]" aria-hidden="true" />
                          {t("discover.pinned_badge")}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[11px] mb-2 px-0.5">
                      <span className="font-bold text-gray-700 uppercase tracking-wider">
                        {item.year || (item.type === "elearning" ? t("discover.badge_elearning") : t("discover.badge_story"))}
                      </span>
                    </div>

                    {item.name && (
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-snug line-clamp-2 mt-1 group-hover:text-[#00a3be] transition-colors">
                        {item.name}
                      </h3>
                    )}

                    {item.short_description && (
                      <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3 font-normal">
                        {stripHtml(item.short_description)}
                      </p>
                    )}
                  </div>

                  <div className="mt-5">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDiscover(item);
                      }}
                      className="w-full rounded-xl gradient-accent hover:bg-gradient-accent text-white font-semibold text-xs sm:text-sm py-2.5 sm:py-3 transition-all shadow-sm cursor-pointer"
                    >
                      {t("discover.read_more")}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            aria-label={t("common.next")}
            className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#00a3be] transition-all hover:bg-white/80 hover:scale-110 active:scale-95 disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="h-9 w-9 stroke-[2.5]" />
          </button>
        </div>

        {totalPages > 1 && (
          <SectionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {/* Discover Detail Dialog - News & Blog Portal Layout */}
        <Dialog
          open={!!selectedDiscover}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedDiscover(null);
              setDiscoverImgIndex(0);
            }
          }}
        >
          <DialogContent showClose={false} className="w-[95vw] sm:w-[92vw] max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-100 bg-[#fafcff] p-0 shadow-2xl">
            {selectedDiscover && (() => {
              const discoverImages = getDiscoverImages(selectedDiscover.image);
              const hasMultiple = discoverImages.length > 1;
              const currentImg = discoverImages[discoverImgIndex];

              // Article content sections pagination (Jika materi ada 2 atau lebih)
              const allSections = selectedDiscover.content_sections || [];
              const hasMultipleSections = allSections.length >= 2;
              const totalArticlePages = hasMultipleSections
                ? Math.ceil(allSections.length / SECTIONS_PER_ARTICLE_PAGE)
                : 1;

              const paginatedSections = hasMultipleSections
                ? allSections.slice(
                    (articlePage - 1) * SECTIONS_PER_ARTICLE_PAGE,
                    articlePage * SECTIONS_PER_ARTICLE_PAGE
                  )
                : allSections;

              return (
                <div className="flex max-h-[90vh] flex-col overflow-hidden">
                  {/* Top Bar Navigation & Close */}
                  <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-3.5 sm:px-8 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-3 py-1 text-xs font-bold text-[#004AAD] uppercase tracking-wider">
                        {selectedDiscover.type === "elearning" ? (
                          <>
                            <BookOpen className="h-3.5 w-3.5 text-[#004AAD]" />
                            {t("discover.badge_elearning")}
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-[#004AAD]" />
                            {selectedDiscover.year || t("discover.badge_story")}
                          </>
                        )}
                      </span>
                      {selectedDiscover.year && selectedDiscover.type === "elearning" && (
                        <span className="hidden sm:inline-block text-xs font-medium text-gray-500">
                          • {selectedDiscover.year}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedDiscover(null)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
                      title={t("discover.modal.close")}
                      aria-label={t("discover.modal.close")}
                    >
                      <X className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Main Scrollable Content */}
                  <div ref={modalScrollRef} className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10 scroll-smooth">
                    <div className="max-w-3xl mx-auto space-y-6">
                      {/* Title Header */}
                      <div>
                        <DialogTitle className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug sm:leading-tight text-gray-900">
                          {selectedDiscover.name}
                        </DialogTitle>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 pb-4 border-b border-gray-100">
                          <span className="font-semibold text-gray-700">ASTA Digital</span>
                          <span>•</span>
                          <span>{selectedDiscover.year || t("discover.modal.latest_update")}</span>
                          {totalArticlePages > 1 && (
                            <span className="inline-flex items-center rounded-full bg-blue-100/80 px-2.5 py-0.5 text-xs font-bold text-[#004AAD]">
                              {t("discover.modal.page_indicator", { current: articlePage, total: totalArticlePages })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Cover Image (Tampil di Halaman 1 atau jika hanya 1 halaman) */}
                      {articlePage === 1 && (
                        <div className="w-full">
                          <div
                            onClick={() => currentImg && setPreviewImage({ src: currentImg, title: selectedDiscover.name })}
                            className={`group/cimg relative w-full aspect-[16/9] sm:aspect-[16/9] overflow-hidden rounded-2xl bg-gray-900 border border-gray-100 shadow-md ${currentImg ? "cursor-zoom-in" : ""}`}
                          >
                            {currentImg ? (
                              <>
                                <img
                                  src={currentImg}
                                  alt={selectedDiscover.name}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover/cimg:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cimg:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                                    <ZoomIn className="h-4 w-4" /> {t("discover.modal.click_fullscreen")}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-[#004AAD] via-[#052848] to-[#02182d] p-8 flex flex-col justify-end">
                                {selectedDiscover.logo && (
                                  <img src={selectedDiscover.logo} alt={selectedDiscover.name} className="w-16 h-16 object-contain mb-4" />
                                )}
                              </div>
                            )}

                            {/* Multiple image navigation buttons */}
                            {hasMultiple && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDiscoverImgIndex((prev) => (prev - 1 + discoverImages.length) % discoverImages.length);
                                  }}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-lg transition-all active:scale-95 cursor-pointer"
                                  title="Previous Image"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDiscoverImgIndex((prev) => (prev + 1) % discoverImages.length);
                                  }}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-lg transition-all active:scale-95 cursor-pointer"
                                  title="Next Image"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>

                                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-medium border border-white/20">
                                  <span>{discoverImgIndex + 1} / {discoverImages.length}</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Image Caption */}
                          <p className="mt-2 text-xs text-gray-500 italic text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5">
                            <span>{t("discover.modal.doc_caption", { name: selectedDiscover.name })}</span>
                            {currentImg && (
                              <>
                                <span>•</span>
                                <span className="text-[#004AAD] font-medium flex items-center gap-1 cursor-pointer" onClick={() => setPreviewImage({ src: currentImg, title: selectedDiscover.name })}>
                                  <Maximize2 className="h-3 w-3" /> {t("discover.modal.enlarge_photo")}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      )}

                      {/* Short Description / Lead Intro (Tampil di Halaman 1) */}
                      {articlePage === 1 && selectedDiscover.short_description && (
                        <div
                          className="prose prose-blue max-w-none text-gray-800 text-base sm:text-lg leading-relaxed font-medium border-l-4 border-[#004AAD] pl-4 py-2 bg-blue-50/40 rounded-r-xl"
                          dangerouslySetInnerHTML={{ __html: selectedDiscover.short_description }}
                        />
                      )}

                      {/* Modular Content Sections for E-Learning & Blog (Paginated per 2 sections) */}
                      {selectedDiscover.type === "elearning" && paginatedSections.length > 0 && (
                        <div className="space-y-8 pt-2">
                          {paginatedSections.map((section, sIdx) => {
                            const sectionRealIndex = (articlePage - 1) * SECTIONS_PER_ARTICLE_PAGE + sIdx + 1;
                            const sectionTitle = t("discover.modal.section_part", { index: sectionRealIndex });
                            return (
                              <div key={sIdx} className="space-y-4">
                                {section.image && (
                                  <div
                                    onClick={() => section.image && setPreviewImage({ src: section.image, title: `${selectedDiscover.name} — ${sectionTitle}` })}
                                    className="group/simg relative w-full overflow-hidden rounded-2xl bg-white border border-gray-200/60 shadow-sm cursor-zoom-in"
                                  >
                                    <img
                                      src={section.image}
                                      alt={`Gambar ${sectionTitle}`}
                                      className="w-full h-auto max-h-[480px] object-cover mx-auto transition-transform duration-500 group-hover/simg:scale-[1.02]"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/simg:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                                        <ZoomIn className="h-4 w-4" /> {t("discover.modal.click_fullscreen")}
                                      </span>
                                    </div>
                                    <p className="p-2.5 text-center text-xs text-gray-400 italic bg-gray-50/50 border-t border-gray-100 flex items-center justify-center gap-1.5">
                                      <span>{sectionTitle}</span>
                                      <span>•</span>
                                      <span className="text-[#004AAD] font-medium flex items-center gap-1">
                                        <Maximize2 className="h-3 w-3" /> {t("discover.modal.enlarge_photo")}
                                      </span>
                                    </p>
                                  </div>
                                )}
                                {section.description && (
                                  <div
                                    className="prose prose-blue max-w-none text-gray-700 text-sm sm:text-base leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: section.description }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Standard Discover Lists for Story type */}
                      {selectedDiscover.type !== "elearning" && selectedDiscover.DiscoverLists && selectedDiscover.DiscoverLists.length > 0 && (
                        <div className="pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                            {t("discover.modal.key_points")}
                          </h4>
                          <ul className="grid sm:grid-cols-2 gap-3">
                            {selectedDiscover.DiscoverLists.map((list) => (
                              <li key={list.id} className="flex items-start gap-2.5 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/60 text-xs sm:text-sm font-medium text-gray-800">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#004AAD] mt-0.5" />
                                <span className="whitespace-pre-line">{stripHtml(list.description)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Article Pagination Bar for Multiple Sections (Ala Portal Berita) */}
                      {totalArticlePages > 1 && (
                        <div className="pt-6 border-t border-gray-200 mt-8 space-y-4">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-blue-50/70 p-4 sm:p-5 rounded-2xl border border-blue-100">
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
                                        modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                                      }}
                                      className={`h-9 w-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                                    modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  className="rounded-xl border-gray-300 text-xs font-semibold hover:bg-white cursor-pointer"
                                >
                                  <ChevronLeft className="mr-1 h-3.5 w-3.5" /> {t("common.previous")}
                                </Button>
                              )}
                              {articlePage < totalArticlePages ? (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setArticlePage((prev) => prev + 1);
                                    modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
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
                  </div>

                  {/* Footer */}
                  <DialogFooter className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-4 sm:px-8">
                    <div className="flex w-full flex-wrap items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedDiscover(null)}
                        className="rounded-full border-gray-200 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm px-4"
                      >
                        {t("discover.modal.close")}
                      </Button>
                      <Button
                        asChild
                        onClick={() => setSelectedDiscover(null)}
                        className="rounded-full bg-[#004AAD] px-6 py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-blue-800"
                      >
                        <a href="#kontak">
                          {t("contact.form.submit")} <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </DialogFooter>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Full Screen Lightbox / Image Preview Modal */}
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
                {/* Floating Top Header with Title & Close */}
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

                {/* Centered Image */}
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

                {/* Bottom hint */}
                <div className="absolute bottom-3 sm:bottom-4 z-40 text-center text-white/60 text-[11px]">
                  {t("discover.lightbox.hint")}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

