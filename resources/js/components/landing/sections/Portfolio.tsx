import { useState, useRef } from "react";
import { motion } from "motion/react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  const { t } = useTranslation();
  const { data: landingData } = useLandingData();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

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
        title: item.name || "Portfolio Item",
        category: catLabel,
        type: item.type || "desktop",
        description: item.description || "",
        demo_url: item.demo_url,
        span: spans[index % spans.length],
      };
    })
    : defaultProjects;

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

        {/* Portfolio Detail Dialog */}
        <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent showClose={false} className="w-[92vw] sm:w-full max-w-3xl overflow-hidden rounded-2xl sm:rounded-3xl bg-white p-0 border border-gray-100 shadow-2xl">
            {selectedProject && (
              <div className="flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
                <div className="relative h-44 sm:h-72 w-full overflow-hidden bg-gray-900 shrink-0">
                  <img
                    src={selectedProject.img}
                    alt={selectedProject.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <span className="inline-block rounded-full bg-[#004AAD] text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-2">
                        {selectedProject.category}
                      </span>
                      <h2 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">
                        {selectedProject.title}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#004AAD]">
                      {t("portfolio.modal.description")}
                    </h4>
                    <div
                      className="mt-3 text-gray-700 text-base leading-relaxed space-y-3 prose prose-blue max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {selectedProject.demo_url && (
                        <Button
                          asChild
                          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-semibold shadow-md transition-all"
                        >
                          <a href={selectedProject.demo_url} target="_blank" rel="noopener noreferrer">
                            {t("portfolio.live_demo")} <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        asChild
                        onClick={() => setSelectedProject(null)}
                        className="rounded-full bg-[#004AAD] text-white hover:bg-blue-800 px-6 py-3 font-semibold shadow-md"
                      >
                        <a href="#kontak">
                          {t("nav.contact")} <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

