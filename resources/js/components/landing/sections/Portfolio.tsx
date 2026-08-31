import { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ExternalLink,
  X,
  ZoomIn,
  Maximize2,
  Briefcase,
  Globe,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData } from "@/hooks/useLandingData";
import { SectionHeading, SectionPagination } from "../common";
import { PortfolioProject } from "../types";

import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";

const defaultProjects: PortfolioProject[] = [
  { id: "p1", img: p1, title: "Portal Kominfo", category: "Institutional", type: "desktop", description: "Development of official government information portal with enterprise standards.", span: "lg:col-span-2 lg:row-span-2" },
  { id: "p2", img: p2, title: "Public Service App", category: "Mobile", type: "mobile", description: "Integrated public service mobile app.", span: "lg:col-span-2" },
];

const PORTFOLIOS_PER_PAGE = 6;

export function Portfolio() {
  const { t, localize } = useTranslation();
  const { data: landingData } = useLandingData();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; title?: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  const spans = [
    "lg:col-span-2 lg:row-span-2",
    "lg:col-span-2",
    "lg:col-span-2",
    "lg:col-span-2 lg:row-span-2",
    "lg:col-span-2",
    "lg:col-span-2",
  ];

  const projectsList: PortfolioProject[] = (landingData?.portfolios && landingData.portfolios.length > 0)
    ? landingData.portfolios.map((item: any, index: number) => {
      const catLabel = item.type === "mobile" ? "Mobile" : "Desktop";
      return {
        id: item.id,
        img: item.image || p1,
        title: localize(item.name) || "Portfolio Item",
        category: catLabel,
        type: item.type || "desktop",
        description: localize(item.description) || "",
        demo_url: item.demo_url,
        span: spans[index % spans.length],
      };
    })
    : defaultProjects.map((p) => ({
      ...p,
      title: localize(p.title),
      description: localize(p.description),
    }));

  const categories = [
    { key: "all", label: t("portfolio.tab_all") },
    { key: "mobile", label: t("portfolio.tab_mobile") },
    { key: "desktop", label: t("portfolio.tab_desktop") },
  ];

  const filteredProjects =
    activeCategory === "all"
      ? projectsList
      : projectsList.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase() || p.type?.toLowerCase() === activeCategory.toLowerCase()
      );

  const totalPages = Math.ceil(filteredProjects.length / PORTFOLIOS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * PORTFOLIOS_PER_PAGE,
    currentPage * PORTFOLIOS_PER_PAGE
  );

  const handleCategoryChange = (catKey: string) => {
    setActiveCategory(catKey);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={sectionRef} id="portofolio" className="relative py-6 sm:py-6 lg:py-6">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            eyebrow={t("portfolio.eyebrow")}
            title={t("portfolio.title")}
            desc={t("portfolio.description")}
          />
        </motion.div>

        {/* Filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2"
        >
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => handleCategoryChange(c.key)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                activeCategory === c.key
                  ? "gradient-accent text-accent-foreground shadow-soft scale-105 text-white"
                  : "border border-primary/15 bg-white/70 text-primary/70 hover:text-secondary hover:bg-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </motion.div>

        {/* Grid List */}
        <div className="-mx-4 mt-12 overflow-hidden sm:mx-0 sm:overflow-visible">
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 px-4 pb-4 sm:mx-0 sm:grid sm:auto-rows-[240px] sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-2 sm:scroll-pl-0 lg:grid-cols-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {paginatedProjects.length > 0 ? (
              paginatedProjects.map((p, i) => (
                <motion.article
                  key={`${p.id}-${i}`}
                  layout
                  initial={{ opacity: 0, y: 25, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSelectedProject(p)}
                  className={`group relative aspect-[4/5] w-[85%] shrink-0 snap-start overflow-hidden rounded-[28px] border border-white/60 bg-primary shadow-glass sm:aspect-auto sm:w-auto sm:shrink cursor-pointer transition-all duration-300 hover:shadow-2xl ${p.span}`}
                >
                  <img
                    src={p.img}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-95" />
                  <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 text-primary-foreground">
                    <div>
                      <span className="inline-block rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
                        {p.category}
                      </span>
                      <h3 className="mt-2 font-display text-xl font-bold sm:text-2xl text-white group-hover:text-cyan-300 transition-colors">
                        {p.title}
                      </h3>
                    </div>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full glass-dark text-white transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-[#004AAD] group-hover:scale-110">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="col-span-6 text-center text-muted-foreground py-12">
                {t("portfolio.empty")}
              </div>
            )}
          </div>
        </div>

        <SectionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Portfolio Detail Dialog - Comprehensive Modal Layout */}
        <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent
            showClose={false}
            className="w-[95vw] sm:w-[92vw] max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-100 bg-[#fafcff] p-0 shadow-2xl"
          >
            {selectedProject && (
              <div className="flex max-h-[90vh] flex-col overflow-hidden">
                {/* Top Bar Navigation & Close */}
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-3.5 sm:px-8 backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-3 py-1 text-xs font-bold text-[#004AAD] uppercase tracking-wider">
                      {selectedProject.type === "mobile" ? (
                        <>
                          <Smartphone className="h-3.5 w-3.5 text-[#004AAD]" />
                          {t("portfolio.modal.mobile_app")}
                        </>
                      ) : (
                        <>
                          <Globe className="h-3.5 w-3.5 text-[#004AAD]" />
                          {t("portfolio.modal.desktop_web")}
                        </>
                      )}
                    </span>
                    <span className="hidden sm:inline-block text-xs font-medium text-gray-500">
                      • {selectedProject.category}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedProject(null)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
                    title={t("portfolio.modal.close")}
                    aria-label={t("portfolio.modal.close")}
                  >
                    <X className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Main Scrollable Content */}
                <div ref={modalScrollRef} className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10 scroll-smooth no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Title Header */}
                    <div>
                      <DialogTitle className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug sm:leading-tight text-gray-900">
                        {selectedProject.title}
                      </DialogTitle>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 pb-4 border-b border-gray-100">
                        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-[#004AAD]" /> {t("portfolio.modal.showcase")}
                        </span>
                        <span>•</span>
                        <span>{selectedProject.category}</span>
                      </div>
                    </div>

                    {/* Main Cover Image with Lightbox Zoom */}
                    <div className="w-full">
                      <div
                        onClick={() => selectedProject.img && setPreviewImage({ src: selectedProject.img, title: selectedProject.title })}
                        className={`group/cimg relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-2xl bg-gray-900 border border-gray-100 shadow-md ${selectedProject.img ? "cursor-zoom-in" : ""}`}
                      >
                        {selectedProject.img ? (
                          <>
                            <img
                              src={selectedProject.img}
                              alt={selectedProject.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover/cimg:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cimg:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                                <ZoomIn className="h-4 w-4" /> {t("discover.modal.click_fullscreen")}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#004AAD] via-[#052848] to-[#02182d] p-8 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{selectedProject.title}</span>
                          </div>
                        )}
                      </div>

                      {/* Image Caption */}
                      <p className="mt-2 text-xs text-gray-500 italic text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5">
                        <span>{t("portfolio.modal.doc_caption", { name: selectedProject.title })}</span>
                        {selectedProject.img && (
                          <>
                            <span>•</span>
                            <span
                              className="text-[#004AAD] font-medium flex items-center gap-1 cursor-pointer hover:underline"
                              onClick={() => setPreviewImage({ src: selectedProject.img, title: selectedProject.title })}
                            >
                              <Maximize2 className="h-3 w-3" /> {t("discover.modal.enlarge_photo")}
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Project Overview / Description */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#004AAD] mb-3">
                        {t("portfolio.modal.description")}
                      </h4>
                      <div
                        className="prose prose-blue max-w-none text-gray-700 text-sm sm:text-base leading-relaxed space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm"
                        dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <DialogFooter className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-4 sm:px-8">
                  <div className="flex w-full flex-wrap items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedProject(null)}
                      className="rounded-full border-gray-200 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm px-4"
                    >
                      {t("portfolio.modal.close")}
                    </Button>
                    <div className="flex flex-wrap items-center gap-3">
                      {selectedProject.demo_url && (
                        <Button
                          asChild
                          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs sm:text-sm font-semibold shadow-md transition-all"
                        >
                          <a href={selectedProject.demo_url} target="_blank" rel="noopener noreferrer">
                            {t("portfolio.live_demo")} <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      <Button
                        asChild
                        onClick={() => setSelectedProject(null)}
                        className="rounded-full bg-[#004AAD] px-6 py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-blue-800"
                      >
                        <a href="#kontak">
                          {t("nav.contact")} <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </DialogFooter>
              </div>
            )}
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

