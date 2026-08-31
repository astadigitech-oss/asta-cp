import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  BookOpen,
  Pin,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function DiscoverSection({ discoversList = defaultDiscovers }: { discoversList?: DiscoverData[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDiscoverTab, setActiveDiscoverTab] = useState<"all" | "story" | "elearning">("all");
  const sectionRef = useRef<HTMLElement>(null);

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
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <Link
                    to="/discover/$id"
                    params={{ id: String(item.id) }}
                    className="block cursor-pointer"
                  >
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
                      ) : (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#004AAD] shadow-sm">
                          <Sparkles className="h-3 w-3" />
                          {t("discover.badge_story")}
                        </span>
                      )}
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
                  </Link>

                  <div className="mt-5">
                    <Button
                      asChild
                      className="w-full rounded-xl gradient-accent hover:bg-gradient-accent text-white font-semibold text-xs sm:text-sm py-2.5 sm:py-3 transition-all shadow-sm cursor-pointer"
                    >
                      <Link to="/discover/$id" params={{ id: String(item.id) }}>
                        {t("discover.read_more")} <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
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
      </div>
    </section>
  );
}

