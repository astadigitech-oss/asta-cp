import { useState, useRef } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useNavigate, useParams, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData } from "@/hooks/useLandingData";
import { SectionHeading, SectionPagination } from "../common";
import { ResponsiveImage } from "../common/ResponsiveImage";
import { PortfolioProject } from "../types";

const PORTFOLIOS_PER_PAGE = 6;

export function Portfolio() {
  const { t, localize, language } = useTranslation();
  const { data: landingData } = useLandingData();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as Record<string, string>;
  const [activeCategory, setActiveCategory] = useState("all");
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

  const projectsList: PortfolioProject[] = (landingData?.portfolios ?? [])
    .map((item, index) => {
      const catLabel = item.type === "mobile" ? "Mobile" : "Desktop";
      return {
        id: item.id,
        img: item.image,
        title: localize(item.name) || "Portfolio Item",
        category: catLabel,
        type: item.type || "desktop",
        description: localize(item.description) || "",
        demo_url: item.demo_url,
        span: spans[index % spans.length],
      };
    });

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
      <div className="mx-auto max-w-[1440px] xl:max-w-[1600px] 2xl:max-w-[1780px] 3xl:max-w-[1980px] 4xl:max-w-[2240px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 3xl:px-24">
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
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-touch scroll-pl-4 px-4 pb-4 sm:mx-0 sm:grid sm:auto-rows-[240px] sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-2 sm:scroll-pl-0 lg:grid-cols-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {paginatedProjects.length > 0 ? (
              paginatedProjects.map((p, i) => (
                <motion.article
                  key={`${p.id}-${i}`}
                  layout
                  initial={{ opacity: 0, y: 25, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => {
                    const lang = params?.lang || language || "id";
                    navigate({ to: "/$lang/portfolio/$id", params: { lang, id: String(p.id) } });
                  }}
                  className={`group relative aspect-[4/5] w-[85%] shrink-0 snap-start overflow-hidden rounded-[28px] border border-white/60 bg-primary shadow-glass sm:aspect-auto sm:w-auto sm:shrink cursor-pointer transition-all duration-300 hover:shadow-2xl ${p.span}`}
                >
                  {p.img ? (
                    <ResponsiveImage
                      source={p.img}
                      alt={p.title}
                      width={800}
                      height={1000}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/80 to-secondary/70" aria-hidden="true" />
                  )}
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

        {/* View All Portfolios Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 sm:mt-12 text-center"
        >
          <Button
            asChild
            size="lg"
            className="rounded-full bg-[#004AAD] hover:bg-blue-800 text-white font-semibold px-8 h-12 shadow-md cursor-pointer transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            <Link to="/$lang/portfolio" params={{ lang: params?.lang || language || "id" }} preload="intent">
              <span>{t("nav.all_portfolios")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
