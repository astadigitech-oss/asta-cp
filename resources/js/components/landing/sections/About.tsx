import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  Shield,
  FileText,
  Sparkles,
  Users,
  Pin,
  ArrowRight,
  Calendar,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { Dialog, DialogContentFullscreen } from "@/components/ui/dialog";
import { SectionHeading } from "../common";
import { DiscoverData, getDiscoverImages } from "../types";
import p3 from "@/assets/portfolio-3.jpg";

const defaultDiscovers: DiscoverData[] = [
  { id: 1, year: "2022", name: "Inisiasi & Pendirian ASTA Digital", short_description: "Asta Digital didirikan untuk menghadirkan solusi software berkualitas tinggi." },
  { id: 2, year: "2023", name: "Ekspansi Layanan Enterprise", short_description: "Mengembangkan aplikasi web & mobile enterprise untuk berbagai instansi." },
  { id: 3, year: "2024", name: "Transformasi Digital Terpadu", short_description: "Menjangkau puluhan mitra bisnis dan instansi publik di seluruh Indonesia." },
];

const values = [
  { icon: Shield, titleKey: "about.val_1_title", descKey: "about.val_1_desc" },
  { icon: FileText, titleKey: "about.val_2_title", descKey: "about.val_2_desc" },
  { icon: Sparkles, titleKey: "about.val_3_title", descKey: "about.val_3_desc" },
  { icon: Users, titleKey: "about.val_4_title", descKey: "about.val_4_desc" },
];

export function About({ discoversList = defaultDiscovers }: { discoversList?: DiscoverData[] }) {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedTimelineImage, setSelectedTimelineImage] = useState<DiscoverData | null>(null);
  const [timelineImgIndex, setTimelineImgIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomRef = useRef(1);
  const posRef = useRef({ x: 0, y: 0 });
  const dragOrigin = useRef<{ cx: number; cy: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const applyTransform = (zoom: number, x: number, y: number) => {
    if (imgRef.current) {
      imgRef.current.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
    }
  };

  const handleZoomIn = () => {
    const next = Math.min(zoomRef.current + 0.5, 4);
    zoomRef.current = next;
    setZoomLevel(next);
    applyTransform(next, posRef.current.x, posRef.current.y);
  };
  const handleZoomOut = () => {
    const next = Math.max(zoomRef.current - 0.5, 1);
    if (next === 1) posRef.current = { x: 0, y: 0 };
    zoomRef.current = next;
    setZoomLevel(next);
    applyTransform(next, posRef.current.x, posRef.current.y);
  };
  const handleZoomReset = () => {
    zoomRef.current = 1;
    posRef.current = { x: 0, y: 0 };
    setZoomLevel(1);
    applyTransform(1, 0, 0);
  };

  /* ── Mouse drag ── */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomRef.current <= 1) return;
    dragOrigin.current = { cx: e.clientX - posRef.current.x, cy: e.clientY - posRef.current.y };
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragOrigin.current || zoomRef.current <= 1) return;
    posRef.current = { x: e.clientX - dragOrigin.current.cx, y: e.clientY - dragOrigin.current.cy };
    applyTransform(zoomRef.current, posRef.current.x, posRef.current.y);
  };
  const handleMouseUp = () => {
    dragOrigin.current = null;
    if (containerRef.current) containerRef.current.style.cursor = zoomRef.current > 1 ? "grab" : "default";
  };

  /* ── Touch drag ── */
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomRef.current <= 1 || e.touches.length !== 1) return;
    dragOrigin.current = { cx: e.touches[0].clientX - posRef.current.x, cy: e.touches[0].clientY - posRef.current.y };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragOrigin.current || e.touches.length !== 1) return;
    e.preventDefault();
    posRef.current = { x: e.touches[0].clientX - dragOrigin.current.cx, y: e.touches[0].clientY - dragOrigin.current.cy };
    applyTransform(zoomRef.current, posRef.current.x, posRef.current.y);
  };
  const handleTouchEnd = () => { dragOrigin.current = null; };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedTimelineImage(null);
      setTimelineImgIndex(0);
      zoomRef.current = 1;
      posRef.current = { x: 0, y: 0 };
      setZoomLevel(1);
    }
  };

  const handleSwitchTimelineImage = (newIdx: number) => {
    setTimelineImgIndex(newIdx);
    zoomRef.current = 1;
    posRef.current = { x: 0, y: 0 };
    setZoomLevel(1);
    applyTransform(1, 0, 0);
  };

  const allDiscovers = discoversList && discoversList.length > 0 ? discoversList : defaultDiscovers;
  // Hanya ambil item yang di-highlight dari admin (maksimal 4). Jika belum ada yang di-highlight, ambil 4 teratas
  const highlighted = allDiscovers.filter((item) => item.is_highlight);
  const timelineItems = (highlighted.length > 0 ? highlighted : allDiscovers).slice(0, 4);
  const activeItem = timelineItems[selectedIndex] || timelineItems[0];

  useEffect(() => {
    if (timelineItems.length <= 1) return;
    const interval = window.setInterval(() => {
      setSelectedIndex((currentIndex) => (currentIndex + 1) % timelineItems.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [timelineItems.length]);

  const scrollToDiscover = () => {
    const elem = document.getElementById("discover");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="tentang" className="relative overflow-hidden py-6 sm:py-6 lg:py-6">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid items-stretch gap-8 lg:gap-10 xl:gap-14 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 lg:col-span-5 flex flex-col justify-between"
          >
            <div>
              <SectionHeading
                center={false}
                eyebrow={t("about.eyebrow")}
                title={t("about.title")}
                desc={t("about.description")}
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="min-w-0 rounded-2xl glass p-5 shadow-soft">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                    {t("about.vision_title")}
                  </div>
                  <p className="mt-2 break-words text-sm leading-relaxed text-foreground/80">
                    {t("about.vision_desc")}
                  </p>
                </div>
                <div className="min-w-0 rounded-2xl glass p-5 shadow-soft">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                    {t("about.mission_title")}
                  </div>
                  <p className="mt-2 break-words text-sm leading-relaxed text-foreground/80">
                    {t("about.mission_desc")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 min-w-0 rounded-2xl glass p-6 shadow-glass flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between shrink-0 mb-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
                  {t("about.company_story")}
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 flex flex-col justify-between">
                {timelineItems.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <li
                      key={item.id || idx}
                      onClick={() => {
                        setSelectedIndex(idx);
                        scrollToDiscover();
                      }}
                      className={`flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white/95 shadow-sm border border-secondary/30 scale-[1.02]"
                          : "hover:bg-white/60"
                      }`}
                    >
                      <span className="grid text-white h-7 px-2.5 shrink-0 place-items-center rounded-lg gradient-accent text-[11px] font-bold text-accent-foreground shadow-soft">
                        {item.year || "2026"}
                      </span>
                      <span className="min-w-0 break-words text-sm font-semibold text-foreground/90 line-clamp-1">
                        {item.is_pinned && (
                          <Pin className="mr-1 inline-block h-3.5 w-3.5 fill-[#004AAD] text-[#004AAD]" aria-label="Pinned" />
                        )}
                        {item.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>

          <div className="min-w-0 lg:col-span-7 flex flex-col justify-between">
            <div className="-mx-4 overflow-hidden sm:mx-0 sm:overflow-visible">
              <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:p-1 sm:scroll-pl-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {values.map((v, i) => (
                  <motion.div
                    key={v.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className={`group relative w-[78%] shrink-0 snap-start overflow-hidden rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-glass backdrop-blur-md transition-all duration-300 hover:-translate-y-1 sm:w-auto sm:shrink ${
                      i % 3 === 0 ? "rounded-tl-[8px]" : ""
                    } ${i % 3 === 1 ? "rounded-br-[8px]" : ""}`}
                  >
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/15 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="relative grid h-11 w-11 place-items-center rounded-2xl gradient-accent text-accent-foreground shadow-soft transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                      <v.icon className="h-5 w-5 text-white" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold text-primary">{t(v.titleKey)}</h3>
                    <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">{t(v.descKey)}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Large image connected to selected timeline/discover event */}
            <div
              onClick={() => {
                setSelectedTimelineImage(activeItem);
                setTimelineImgIndex(0);
              }}
              className="group relative mt-6 flex-1 min-h-[260px] overflow-hidden rounded-[32px] border border-white/60 shadow-glass cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
            >
              <img
                src={getDiscoverImages(activeItem.image)[0] || p3}
                alt={activeItem.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
              {getDiscoverImages(activeItem.image).length > 1 && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/20">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>{getDiscoverImages(activeItem.image).length} foto</span>
                </div>
              )}
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-primary-foreground">
                <div>
                  {activeItem.year && (
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-cyan-300">
                      {activeItem.year}
                    </div>
                  )}
                  <div className="mt-1 font-display text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {activeItem.name}
                  </div>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full glass-dark text-white transition-all duration-300 group-hover:bg-[#004AAD] group-hover:scale-110">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Timeline News Image Dialog Modal — Full Image + Zoom + Multi-Image Slider */}
      <Dialog open={!!selectedTimelineImage} onOpenChange={handleOpenChange}>
        <DialogContentFullscreen>
          {selectedTimelineImage && (() => {
            const timelineImages = getDiscoverImages(selectedTimelineImage.image);
            const currentImg = timelineImages[timelineImgIndex] || p3;
            const hasMultiple = timelineImages.length > 1;

            return (
              <>
                {/* ── Top bar: nama & tahun ── */}
                <div className="flex items-center justify-between gap-2 px-4 py-3 bg-black/95 border-b border-white/10 shrink-0 z-10">
                  <div className="flex items-center gap-2 min-w-0">
                    {selectedTimelineImage.year && (
                      <span className="flex items-center gap-1 shrink-0 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                        <Calendar className="h-3 w-3" />
                        {selectedTimelineImage.year}
                      </span>
                    )}
                    <h2 className="text-sm font-bold text-white truncate">
                      {selectedTimelineImage.name}
                    </h2>
                    {hasMultiple && (
                      <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full shrink-0">
                        {timelineImgIndex + 1} / {timelineImages.length}
                      </span>
                    )}
                  </div>
                  {/* Desktop zoom controls */}
                  <div className="hidden sm:flex items-center gap-1 shrink-0">
                    <button onClick={handleZoomOut} disabled={zoomLevel <= 1}
                      className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Zoom Out">
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-xs font-mono text-white/50">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={handleZoomIn} disabled={zoomLevel >= 4}
                      className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Zoom In">
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button onClick={handleZoomReset} disabled={zoomLevel === 1}
                      className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Reset">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* ── Image viewer (flex-1 = fills remaining height) ── */}
                <div
                  ref={containerRef}
                  className="relative flex-1 overflow-hidden bg-gray-950 select-none"
                  style={{ cursor: zoomLevel > 1 ? "grab" : "default" }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    ref={imgRef}
                    src={currentImg}
                    alt={selectedTimelineImage.name}
                    draggable={false}
                    className="h-full w-full object-contain"
                    style={{ transformOrigin: "center center" }}
                  />

                  {/* Previous / Next buttons for multiple images */}
                  {hasMultiple && (
                    <>
                      <button
                        onClick={() => handleSwitchTimelineImage((timelineImgIndex - 1 + timelineImages.length) % timelineImages.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-lg transition-all active:scale-95"
                        title="Previous Image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleSwitchTimelineImage((timelineImgIndex + 1) % timelineImages.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-lg transition-all active:scale-95"
                        title="Next Image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Mobile floating zoom buttons */}
                  <div className="sm:hidden absolute bottom-4 right-4 flex flex-col gap-2 z-20">
                    <button onClick={handleZoomIn} disabled={zoomLevel >= 4}
                      className="grid h-11 w-11 place-items-center rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-lg active:scale-95 disabled:opacity-30 transition-all">
                      <ZoomIn className="h-5 w-5" />
                    </button>
                    {zoomLevel > 1 && (
                      <button onClick={handleZoomReset}
                        className="grid h-11 w-11 place-items-center rounded-full bg-cyan-500/80 backdrop-blur-md text-white border border-cyan-400/30 shadow-lg active:scale-95 transition-all">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={handleZoomOut} disabled={zoomLevel <= 1}
                      className="grid h-11 w-11 place-items-center rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-lg active:scale-95 disabled:opacity-30 transition-all">
                        <ZoomOut className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Mobile zoom percent badge */}
                  {zoomLevel > 1 && (
                    <div className="sm:hidden absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-mono text-white/70 pointer-events-none">
                      {Math.round(zoomLevel * 100)}%
                    </div>
                  )}
                </div>

                {/* ── Bottom bar: thumbnail strip or title & year ── */}
                <div className="shrink-0 px-4 py-3 bg-black/95 border-t border-white/10 flex items-center justify-between gap-3 z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <Tag className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="text-white text-sm font-semibold truncate">
                      {selectedTimelineImage.name}
                    </span>
                    {selectedTimelineImage.year && (
                      <span className="text-white/40 text-xs font-mono shrink-0">{selectedTimelineImage.year}</span>
                    )}
                  </div>

                  {/* Thumbnail selectors for multiple images */}
                  {hasMultiple && (
                    <div className="flex items-center gap-2 shrink-0">
                      {timelineImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => handleSwitchTimelineImage(i)}
                          className={`h-9 w-9 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            timelineImgIndex === i
                              ? "border-cyan-400 scale-105 shadow-md shadow-cyan-500/20"
                              : "border-white/30 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContentFullscreen>
      </Dialog>
    </section>
  );
}

