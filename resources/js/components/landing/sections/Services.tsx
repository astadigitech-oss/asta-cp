import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams, Link } from "@tanstack/react-router";
import {
  Globe,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData } from "@/hooks/useLandingData";
import { stripHtml } from "@/components/lib/utils";
import { SectionHeading } from "../common";
import { ServiceData, getServiceImages } from "../types";

const defaultServicesData: ServiceData[] = [
  { id: 1, name: "Web Apps Development", short_description: "Aplikasi berbasis web modern, cepat & responsif." },
  { id: 2, name: "Mobile Apps Development", short_description: "Aplikasi Android & iOS performa tinggi." },
  { id: 3, name: "IT Consulting & Services", short_description: "Dukungan IT dan konsultasi arsitektur sistem." },
];

export function Services() {
  const { t, localize, language } = useTranslation();
  const { data: landingData } = useLandingData();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as Record<string, string>;
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<number | string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const loopWidthRef = useRef(0);

  // Drag & Touch interaction references
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const scrollPosRef = useRef(0); // Subpixel accumulator for smooth slow speeds (< 0.5)
  const isDraggingRef = useRef(false);



  const servicesList: ServiceData[] = (landingData?.services && landingData.services.length > 0)
    ? landingData.services.map((s: any) => ({
      ...s,
      name: localize(s.name),
      header: localize(s.header),
      short_description: localize(s.short_description),
      description: localize(s.description),
      cover_image: s.cover_image,
      serviceListMains: s.serviceListMains?.map((item: any) => ({
        ...item,
        description: localize(item.description),
      })),
    }))
    : defaultServicesData.map((s) => ({
      ...s,
      name: localize(s.name),
      short_description: localize(s.short_description),
    }));

  const marqueeServices = servicesList.length > 0
    ? servicesList.length <= 3
      ? [...servicesList, ...servicesList, ...servicesList, ...servicesList, ...servicesList, ...servicesList]
      : [...servicesList, ...servicesList, ...servicesList]
    : [];

  // Initialize scroll position to center set for seamless infinite scroll in both directions
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const updateLoopWidth = () => {
      const oneThird = slider.scrollWidth / 3;
      loopWidthRef.current = oneThird;
      if (oneThird > 0 && slider.scrollLeft === 0) {
        slider.scrollLeft = oneThird;
        scrollPosRef.current = oneThird;
      } else {
        scrollPosRef.current = slider.scrollLeft;
      }
    };

    updateLoopWidth();
    window.addEventListener("resize", updateLoopWidth);
    return () => window.removeEventListener("resize", updateLoopWidth);
  }, [servicesList.length]);

  // Seamless looping check when scrolling (works for native touch, drag, and auto-scroll)
  const handleScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const oneThird = loopWidthRef.current;
    if (oneThird > 0) {
      if (slider.scrollLeft >= oneThird * 2) {
        slider.scrollLeft -= oneThird;
        scrollPosRef.current = slider.scrollLeft;
        if (isDownRef.current) {
          scrollLeftRef.current -= oneThird;
        }
      } else if (slider.scrollLeft <= 5) {
        slider.scrollLeft += oneThird;
        scrollPosRef.current = slider.scrollLeft;
        if (isDownRef.current) {
          scrollLeftRef.current += oneThird;
        }
      } else if (isDownRef.current) {
        scrollPosRef.current = slider.scrollLeft;
      }
    }
  };

  // Continuous auto-scroll effect (paused when hovered, touching, dragging, or modal open)
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let animationFrameId: number;
    // Speed can now be set to any decimal (e.g. 0.35, 0.2, 0.5) without freezing
    const speed = 0.15;

    const step = () => {
      if (!isHovered && !isDownRef.current && slider) {
        scrollPosRef.current += speed;

        const oneThird = loopWidthRef.current;
        if (oneThird > 0) {
          if (scrollPosRef.current >= oneThird * 2) {
            scrollPosRef.current -= oneThird;
          } else if (scrollPosRef.current <= 5) {
            scrollPosRef.current += oneThird;
          }
        }
        slider.scrollLeft = scrollPosRef.current;
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, servicesList.length]);

  // Mouse drag handlers (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    const slider = sliderRef.current;
    if (!slider) return;
    isDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX;
    scrollLeftRef.current = slider.scrollLeft;
    scrollPosRef.current = slider.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current) return;
    const slider = sliderRef.current;
    if (!slider) return;
    e.preventDefault();

    const walk = e.pageX - startXRef.current;

    if (Math.abs(walk) > 5) {
      isDraggingRef.current = true;
    }

    slider.scrollLeft = scrollLeftRef.current - walk;
    scrollPosRef.current = slider.scrollLeft;
    handleScroll();
  };

  const handleMouseUp = useCallback(() => {
    isDownRef.current = false;
    const slider = sliderRef.current;
    if (slider) {
      scrollPosRef.current = slider.scrollLeft;
    }
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDownRef.current) {
        handleMouseUp();
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [handleMouseUp]);

  // Touch handlers (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    isDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.touches[0].clientX;
    const slider = sliderRef.current;
    if (slider) {
      scrollPosRef.current = slider.scrollLeft;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDownRef.current) return;
    const diff = Math.abs(e.touches[0].clientX - startXRef.current);
    if (diff > 8) {
      isDraggingRef.current = true;
    }
  };

  const handleTouchEnd = () => {
    isDownRef.current = false;
    const slider = sliderRef.current;
    if (slider) {
      scrollPosRef.current = slider.scrollLeft;
    }
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 120);
  };

  const handleManualSlide = (direction: "prev" | "next") => {
    const slider = sliderRef.current;
    if (!slider) return;
    const scrollAmount = 380;
    slider.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
    setTimeout(() => {
      if (slider) {
        scrollPosRef.current = slider.scrollLeft;
      }
    }, 450);
  };

  const handleCardClick = (s: ServiceData) => {
    if (isDraggingRef.current) return;
    const lang = params?.lang || language || "id";
    navigate({ to: "/$lang/services/$id", params: { lang, id: String(s.id) } });
  };

  const renderServiceCard = (s: ServiceData, index: number) => {
    const images = getServiceImages(s.image);
    const hoverBg = s.cover_image || (images.length > 0 ? images[0] : null);
    const numberLabel = (index % servicesList.length) + 1 < 10
      ? `0${(index % servicesList.length) + 1}`
      : `${(index % servicesList.length) + 1}`;

    return (
      <div
        key={`${s.id}-${index}`}
        onClick={() => handleCardClick(s)}
        onMouseEnter={() => setHoveredCardId(s.id)}
        onMouseLeave={() => setHoveredCardId(null)}
        className="group relative w-[82vw] max-w-[320px] sm:max-w-none sm:w-[320px] md:w-[350px] lg:w-[380px] h-[330px] sm:h-[350px] shrink-0 overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-6 sm:p-7 shadow-glass backdrop-blur-md transition-all duration-300 sm:hover:-translate-y-2 sm:hover:shadow-2xl cursor-pointer flex flex-col justify-between select-none"
      >
        {/* Cover Background on Hover - Loaded on demand to avoid eager payload */}
        {hoveredCardId === s.id && hoverBg && (
          <div className="hidden sm:block pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[28px]">
            <img
              src={hoverBg}
              alt={s.name}
              width={1200}
              height={900}
              draggable={false}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover opacity-80 transition-opacity duration-300"
            />
            {/* Dark overlay for contrast on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 opacity-100" />
          </div>
        )}

        {/* Ambient glow */}
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-accent/20 blur-2xl sm:group-hover:opacity-0 transition-opacity" />

        {/* Card Content */}
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              {s.logo ? (
                <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-white/90 p-2 sm:p-2.5 shadow-sm backdrop-blur-sm transition-all duration-300 sm:group-hover:scale-105 sm:group-hover:bg-white">
                  <img src={s.logo} alt={s.name} width={56} height={56} draggable={false} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                </div>
              ) : (
                <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl gradient-accent text-accent-foreground shadow-glass transition-all duration-300 sm:group-hover:scale-105">
                  <Globe className="h-6 w-6 text-white" />
                </span>
              )}
              <div className="flex items-center gap-1.5">
                {s.header && (
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-50/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary backdrop-blur-sm sm:group-hover:border-white/30 sm:group-hover:bg-white/20 sm:group-hover:text-white transition-colors">
                    {s.header}
                  </span>
                )}
                <span className="rounded-full border border-primary/10 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary/60 backdrop-blur-sm sm:group-hover:border-white/30 sm:group-hover:bg-white/20 sm:group-hover:text-white transition-colors">
                  {numberLabel}
                </span>
              </div>
            </div>

            {s.show_name !== 0 && (
              <h3 className="mt-4 sm:mt-5 font-display text-lg sm:text-xl font-bold text-primary sm:group-hover:text-white transition-colors duration-300 line-clamp-2">
                {s.name}
              </h3>
            )}
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground sm:group-hover:text-white/85 transition-colors duration-300 line-clamp-3">
              {stripHtml(s.short_description) || s.header || t("services.default_web_desc")}
            </p>
          </div>

          <div className="pt-4 border-t border-primary/5 sm:group-hover:border-white/20 transition-colors">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(s);
              }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-secondary sm:group-hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {t("services.view_detail")}
              <ArrowRight className="h-4 w-4 transition-transform sm:group-hover:translate-x-1.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section ref={sectionRef} id="layanan" className="relative overflow-hidden bg-surface py-6 sm:py-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-ocean opacity-70" />
      <div className="mx-auto max-w-[1440px] xl:max-w-[1600px] 2xl:max-w-[1780px] 3xl:max-w-[1980px] 4xl:max-w-[2240px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 3xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            eyebrow={t("services.eyebrow")}
            title={t("services.title")}
            desc={t("services.description")}
          />
        </motion.div>

        {/* Unified Auto-Slider & Manual Slide Track (Mobile & Desktop) */}
        <div
          className="mt-8 sm:mt-12 relative group/slider"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            handleMouseUp();
          }}
        >
          {/* Floating Left Manual Navigation Arrow (Desktop Only) */}
          <button
            type="button"
            onClick={() => handleManualSlide("prev")}
            className="hidden sm:grid absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-30 h-12 w-12 place-items-center rounded-full bg-white/95 shadow-xl border border-gray-200/80 text-gray-700 hover:bg-[#004AAD] hover:text-white transition-all duration-300 cursor-pointer active:scale-95 opacity-0 group-hover/slider:opacity-100 backdrop-blur-md"
            title="Slide Left"
            aria-label="Slide Left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Floating Right Manual Navigation Arrow (Desktop Only) */}
          <button
            type="button"
            onClick={() => handleManualSlide("next")}
            className="hidden sm:grid absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-30 h-12 w-12 place-items-center rounded-full bg-white/95 shadow-xl border border-gray-200/80 text-gray-700 hover:bg-[#004AAD] hover:text-white transition-all duration-300 cursor-pointer active:scale-95 opacity-0 group-hover/slider:opacity-100 backdrop-blur-md"
            title="Slide Right"
            aria-label="Slide Right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Scrollable Container (Touch swipe on mobile, mouse drag & auto-scroll on desktop) */}
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="overflow-x-auto overflow-touch py-4 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12 2xl:-mx-16 px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16"
          >
            <div className="flex w-max items-stretch gap-4 sm:gap-6">
              {marqueeServices.map((s, idx) => renderServiceCard(s, idx))}
            </div>
          </div>
        </div>

        {/* View All Services Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 sm:mt-10 text-center"
        >
          <Button
            asChild
            size="lg"
            className="rounded-full bg-[#004AAD] hover:bg-blue-800 text-white font-semibold px-8 h-12 shadow-md cursor-pointer transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            <Link to="/$lang/services" params={{ lang: params?.lang || language || "id" }} preload="intent">
              <span>{t("nav.all_services")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

      </div>
    </section>
  );
}
