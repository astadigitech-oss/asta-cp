import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Globe,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  const { t, localize } = useTranslation();
  const { data: landingData } = useLandingData();
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [serviceImageIndex, setServiceImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Drag & Touch interaction references
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const scrollPosRef = useRef(0); // Subpixel accumulator for smooth slow speeds (< 0.5)
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setServiceImageIndex(0);
  }, [selectedService?.id]);

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

    const timer = setTimeout(() => {
      const oneThird = slider.scrollWidth / 3;
      if (oneThird > 0 && slider.scrollLeft === 0) {
        slider.scrollLeft = oneThird;
        scrollPosRef.current = oneThird;
      } else {
        scrollPosRef.current = slider.scrollLeft;
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [servicesList.length]);

  // Seamless looping check when scrolling (works for native touch, drag, and auto-scroll)
  const handleScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const oneThird = slider.scrollWidth / 3;
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
      if (!isHovered && !isDownRef.current && !selectedService && slider) {
        scrollPosRef.current += speed;

        const oneThird = slider.scrollWidth / 3;
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
  }, [isHovered, selectedService, servicesList.length]);

  // Mouse drag handlers (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    const slider = sliderRef.current;
    if (!slider) return;
    isDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX - slider.offsetLeft;
    scrollLeftRef.current = slider.scrollLeft;
    scrollPosRef.current = slider.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current) return;
    const slider = sliderRef.current;
    if (!slider) return;
    e.preventDefault();

    const x = e.pageX - slider.offsetLeft;
    const walk = x - startXRef.current;

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
    setSelectedService(s);
  };

  // Multiple image handling for modal
  const serviceImages = selectedService ? getServiceImages(selectedService.image) : [];
  const hasMultipleImages = serviceImages.length > 1;

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (serviceImages.length <= 1) return;
    setServiceImageIndex((prev) => (prev - 1 + serviceImages.length) % serviceImages.length);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (serviceImages.length <= 1) return;
    setServiceImageIndex((prev) => (prev + 1) % serviceImages.length);
  };

  const modalTouchStartX = useRef<number | null>(null);

  const handleModalTouchStart = (e: React.TouchEvent) => {
    modalTouchStartX.current = e.touches[0].clientX;
  };

  const handleModalTouchEnd = (e: React.TouchEvent) => {
    if (modalTouchStartX.current === null || serviceImages.length <= 1) return;
    const diffX = e.changedTouches[0].clientX - modalTouchStartX.current;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        setServiceImageIndex((prev) => (prev + 1) % serviceImages.length);
      } else {
        setServiceImageIndex((prev) => (prev - 1 + serviceImages.length) % serviceImages.length);
      }
    }
    modalTouchStartX.current = null;
  };

  useEffect(() => {
    if (!selectedService || serviceImages.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setServiceImageIndex((prev) => (prev - 1 + serviceImages.length) % serviceImages.length);
      } else if (e.key === "ArrowRight") {
        setServiceImageIndex((prev) => (prev + 1) % serviceImages.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedService, serviceImages.length]);

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
        className="group relative w-[82vw] max-w-[320px] sm:max-w-none sm:w-[320px] md:w-[350px] lg:w-[380px] h-[330px] sm:h-[350px] shrink-0 overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-6 sm:p-7 shadow-glass backdrop-blur-md transition-all duration-300 sm:hover:-translate-y-2 sm:hover:shadow-2xl cursor-pointer flex flex-col justify-between select-none"
      >
        {/* Cover Background on Hover with 80% opacity - Desktop only (touch devices do not trigger hover) */}
        {hoverBg && (
          <div className="hidden sm:block pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[28px]">
            <img
              src={hoverBg}
              alt={s.name}
              draggable={false}
              className="h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-80"
            />
            {/* Dark overlay for contrast on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
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
                  <img src={s.logo} alt={s.name} draggable={false} className="h-full w-full object-contain" />
                </div>
              ) : (
                <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl gradient-accent text-accent-foreground shadow-glass transition-all duration-300 sm:group-hover:scale-105">
                  <Globe className="h-6 w-6 text-white" />
                </span>
              )}
              <span className="rounded-full border border-primary/10 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary/60 backdrop-blur-sm sm:group-hover:border-white/30 sm:group-hover:bg-white/20 sm:group-hover:text-white transition-colors">
                {numberLabel}
              </span>
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
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
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
            className="overflow-x-auto py-4 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12 2xl:-mx-16 px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16"
          >
            <div className="flex w-max items-stretch gap-4 sm:gap-6">
              {marqueeServices.map((s, idx) => renderServiceCard(s, idx))}
            </div>
          </div>
        </div>

        {/* Service Detail Dialog */}
        <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
          <DialogContent showClose={false} className="w-[94vw] sm:w-full max-w-3xl overflow-hidden rounded-[24px] sm:rounded-3xl bg-white p-0 border border-gray-100/80 shadow-2xl focus:outline-none">
            {selectedService && (
              <div className="flex flex-col max-h-[88dvh] sm:max-h-[90vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {/* Banner Header Image with Slider Controls */}
                <div
                  onTouchStart={handleModalTouchStart}
                  onTouchEnd={handleModalTouchEnd}
                  className="relative h-52 sm:h-80 w-full overflow-hidden bg-gray-900 flex items-center justify-center shrink-0 select-none"
                >
                  {serviceImages.length > 0 ? (
                    <img
                      key={serviceImageIndex}
                      src={serviceImages[serviceImageIndex]}
                      alt={selectedService.name}
                      className="h-full w-full object-cover transition-opacity duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#004AAD] via-[#052848] to-[#02182d] p-8 flex flex-col justify-end">
                      {selectedService.logo && (
                        <img src={selectedService.logo} alt={selectedService.name} className="w-16 h-16 object-contain mb-4" />
                      )}
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                  {/* Close Button Top Right */}
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="absolute top-3.5 right-3.5 z-30 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-md active:scale-95 transition-all cursor-pointer"
                    title={t("portfolio.modal.close")}
                    aria-label={t("portfolio.modal.close")}
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  {/* Image Counter Badge Top Left */}
                  {hasMultipleImages && (
                    <div className="absolute top-3.5 left-3.5 z-30 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-white border border-white/20 shadow-md">
                      {serviceImageIndex + 1} / {serviceImages.length}
                    </div>
                  )}

                  {/* Pagination Dots at Top Center - never clashes with bottom text */}
                  {hasMultipleImages && (
                    <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-sm">
                      {serviceImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setServiceImageIndex(idx);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            serviceImageIndex === idx
                              ? "w-5 bg-white shadow-sm"
                              : "w-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Navigation Arrows for Multiple Images */}
                  {hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 z-20 grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
                        title="Previous Image"
                        aria-label="Previous Image"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 z-20 grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
                        title="Next Image"
                        aria-label="Next Image"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </>
                  )}

                  {/* Title and Category at Bottom */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 pointer-events-none">
                    <span className="inline-block rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 backdrop-blur-sm">
                      {t("services.eyebrow")}
                    </span>
                    <DialogTitle className="font-display text-xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                      {selectedService.name}
                    </DialogTitle>
                  </div>
                </div>

                <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                  {selectedService.header && (
                    <div className="bg-blue-50/70 border-l-4 border-[#004AAD] p-3 sm:p-4 rounded-r-xl">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug">
                        {selectedService.header}
                      </h3>
                    </div>
                  )}

                  {selectedService.description && (
                    <div>
                      <div
                        className="portfolio-content text-sm sm:text-base text-gray-700 leading-relaxed space-y-2 prose prose-sm sm:prose-base prose-blue max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedService.description }}
                      />
                    </div>
                  )}

                  {selectedService.serviceListMains && selectedService.serviceListMains.length > 0 && (
                    <div className="pt-2 sm:pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#004AAD]" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#004AAD]">
                          {t("services.modal.features")}
                        </h4>
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        {selectedService.serviceListMains.map((item) => (
                          <li key={item.id} className="flex items-start gap-2.5 bg-blue-50/60 p-3 rounded-xl border border-blue-100/60 text-xs sm:text-sm font-medium text-gray-800">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#004AAD] mt-0.5" />
                            <span className="leading-snug">{stripHtml(item.description)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 sm:pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">{t("services.modal.cta")}</p>
                      <p className="text-[11px] sm:text-xs text-gray-500 hidden sm:block">Konsultasikan kebutuhan proyek Anda dengan tim kami</p>
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedService(null)}
                        className="flex-1 sm:flex-initial rounded-full border-gray-200 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm px-4 h-11"
                      >
                        {t("portfolio.modal.close")}
                      </Button>
                      <Button
                        asChild
                        onClick={() => setSelectedService(null)}
                        className="flex-1 sm:flex-initial rounded-full bg-[#004AAD] text-white hover:bg-blue-800 px-6 h-11 font-semibold shadow-md text-xs sm:text-sm"
                      >
                        <a href="#kontak">
                          {t("contact.form.submit")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
