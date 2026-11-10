import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "motion/react";
import {
  Home,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Share2,
  Check,
  Smartphone,
  Monitor,
  Sparkles,
  MessageSquare,
  Maximize2,
  X,
  Layers,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData } from "@/hooks/useLandingData";
import { stripHtml } from "@/components/lib/utils";
import { PortfolioData } from "@/components/landing/types";

const Footer = lazy(() => import("@/components/landing/sections/Footer").then((m) => ({ default: m.Footer })));

export function PortfolioDetailPage() {
  const { id, lang } = useParams({ strict: false }) as { id?: string; lang?: string };
  const { t, localize, language } = useTranslation();
  const navigate = useNavigate();
  const { data: landingData } = useLandingData();
  const [copied, setCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Try finding from cached landingData first
  const allPortfolios = (landingData?.portfolios || []) as any[];
  const cachedItem = allPortfolios.find((item) => String(item.id) === String(id));

  // Fallback direct query if not in cache (e.g. direct load)
  const { data: fetchedItem, isLoading, isError } = useQuery<PortfolioData>({
    queryKey: ["portfolio", id],
    queryFn: () => axios.get<PortfolioData>(`/api/portfolios/${id}`).then((res) => res.data),
    enabled: !cachedItem && Boolean(id),
    staleTime: 5 * 60 * 1000,
  });

  const rawPortfolio = (cachedItem || fetchedItem) as PortfolioData | undefined;

  // Scroll to top on mount or portfolio change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  const currentLang = lang || language || "id";

  const portfolio = rawPortfolio
    ? {
        ...rawPortfolio,
        name: localize(rawPortfolio.name),
        description: rawPortfolio.description ? localize(rawPortfolio.description) : undefined,
        category: rawPortfolio.type === "mobile" ? "Mobile" : "Desktop",
      }
    : null;

  // Other portfolios for recommendation
  const otherPortfolios = allPortfolios
    .filter((p) => String(p.id) !== String(id))
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      name: localize(item.name),
      category: item.type === "mobile" ? "Mobile" : "Desktop",
      type: item.type,
      image: item.image_small || item.image,
      demo_url: item.demo_url,
    }));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success(
      currentLang === "en" ? "Portfolio link copied to clipboard!" : "Tautan portofolio berhasil disalin!"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading && !cachedItem) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-between">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-24 flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-[#004AAD]/30 border-t-[#004AAD] animate-spin" />
            <p className="text-sm font-medium text-gray-500">
              {currentLang === "en" ? "Loading portfolio..." : "Memuat detail portofolio..."}
            </p>
          </div>
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    );
  }

  if (isError || (!rawPortfolio && !isLoading)) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-between">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-28 flex-1 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-red-50 text-red-600 grid place-items-center mb-6">
            <Layers className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {currentLang === "en" ? "Portfolio Not Found" : "Portofolio Tidak Ditemukan"}
          </h1>
          <p className="text-gray-500 mb-8 max-w-md text-sm">
            {currentLang === "en"
              ? "The portfolio project you are looking for does not exist or has been removed."
              : "Proyek portofolio yang Anda cari tidak ditemukan atau mungkin telah dipindahkan."}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate({ to: "/$lang", params: { lang: currentLang } })}
              className="rounded-full bg-[#004AAD] text-white hover:bg-blue-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentLang === "en" ? "Back to Home" : "Kembali ke Beranda"}
            </Button>
          </div>
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    );
  }

  if (!portfolio) return null;

  const isMobile = portfolio.type === "mobile";
  const displayImage = portfolio.image || portfolio.image_small;

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-[#004AAD]/20 selection:text-[#004AAD]">
      <Toaster position="bottom-right" richColors />
      <Navbar />

      {/* Breadcrumb Bar */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-gray-100/80 bg-white px-4 sm:px-6 lg:px-12 py-3 shadow-xs"
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <ol className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto no-scrollbar py-0.5">
            <li>
              <Link
                to="/$lang"
                params={{ lang: currentLang }}
                className="flex items-center gap-1 hover:text-[#004AAD] transition-colors font-medium shrink-0"
              >
                <Home className="h-3.5 w-3.5" />
                <span>{currentLang === "en" ? "Home" : "Beranda"}</span>
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link
                to="/$lang/portfolio"
                params={{ lang: currentLang }}
                className="hover:text-[#004AAD] transition-colors font-medium shrink-0"
              >
                {t("nav.portfolio")}
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="font-semibold text-gray-900 truncate max-w-[220px] sm:max-w-xs" aria-current="page">
              {portfolio.name}
            </li>
          </ol>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#004AAD] bg-gray-50 hover:bg-blue-50 border border-gray-200/80 rounded-full px-3 py-1.5 transition-all cursor-pointer"
              title={currentLang === "en" ? "Share portfolio" : "Bagikan portofolio"}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">
                {copied
                  ? currentLang === "en" ? "Copied" : "Tersalin"
                  : currentLang === "en" ? "Share" : "Bagikan"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 pb-16 lg:pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-transparent pt-8 sm:pt-12 pb-10 sm:pb-16">
          <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute top-40 -left-40 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl"
            >
              {/* Category & Type Badges */}
              <div className="flex items-center gap-2.5 flex-wrap mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#004AAD] text-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider shadow-sm">
                  {isMobile ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                  {isMobile ? "Mobile App" : "Desktop & Web App"}
                </span>

                {portfolio.demo_url && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 px-3 py-1 text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Demo Ready
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-[1.15]">
                {portfolio.name}
              </h1>

              {/* Meta information row */}
              <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{currentLang === "en" ? "Category:" : "Kategori:"}</span>
                  <span className="font-semibold text-gray-800">{portfolio.category}</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{currentLang === "en" ? "Platform:" : "Platform:"}</span>
                  <span className="font-semibold text-gray-800">
                    {isMobile ? "Android, iOS" : "Modern Web, Responsive Desktop"}
                  </span>
                </div>
                {portfolio.created_at && (
                  <>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{currentLang === "en" ? "Showcase Date:" : "Waktu Rilis:"}</span>
                      <span className="font-semibold text-gray-800">{portfolio.created_at}</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Layout */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 -mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Main Content Area (8 Cols) */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Showcase Image with Zoom Lightbox */}
              {displayImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="group relative overflow-hidden rounded-[24px] sm:rounded-3xl border border-gray-200/80 bg-gray-900 shadow-xl"
                >
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden flex items-center justify-center bg-gray-950">
                    <img
                      src={displayImage}
                      alt={portfolio.name}
                      width={1200}
                      height={750}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    {/* Gradient Overlay for subtle contrast */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {/* Zoom preview button */}
                    <button
                      type="button"
                      onClick={() => setPreviewImage(displayImage)}
                      className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold border border-white/20 shadow-md transition-all active:scale-95 cursor-pointer"
                      title={currentLang === "en" ? "Enlarge Image" : "Perbesar Gambar"}
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>{currentLang === "en" ? "View Fullscreen" : "Lihat Penuh"}</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3.5 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                {portfolio.demo_url ? (
                  <Button
                    asChild
                    size="lg"
                    className="flex-1 sm:flex-initial rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md text-sm px-6 h-12"
                  >
                    <a href={portfolio.demo_url} target="_blank" rel="noopener noreferrer">
                      <span>{t("portfolio.live_demo")}</span>
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : null}

                <Button
                  asChild
                  size="lg"
                  className="flex-1 sm:flex-initial rounded-full bg-[#004AAD] hover:bg-blue-800 text-white font-semibold shadow-md text-sm px-6 h-12"
                >
                  <a href={`/${currentLang}#kontak`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>{currentLang === "en" ? "Consult Similar Project" : "Konsultasi Proyek Serupa"}</span>
                  </a>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleCopyLink}
                  className="rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 h-12 px-5"
                >
                  {copied ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Share2 className="mr-2 h-4 w-4" />}
                  <span>{copied ? (currentLang === "en" ? "Copied!" : "Tersalin!") : (currentLang === "en" ? "Share" : "Bagikan")}</span>
                </Button>
              </div>

              {/* Description Section */}
              <section className="bg-white rounded-[24px] sm:rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
                  <span className="h-2 w-2 rounded-full bg-[#004AAD]" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {currentLang === "en" ? "Project Overview & Engineering Highlights" : "Gambaran Proyek & Rekayasa Sistem"}
                  </h2>
                </div>

                {portfolio.description ? (
                  <div
                    className="portfolio-content prose prose-base sm:prose-lg prose-blue max-w-none text-gray-700 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: portfolio.description }}
                  />
                ) : (
                  <p className="text-gray-500 italic">
                    {currentLang === "en"
                      ? "Detailed portfolio description will be available soon."
                      : "Deskripsi lengkap portofolio ini akan segera diperbarui."}
                  </p>
                )}
              </section>

              {/* Tech Stack & Key Attributes Grid */}
              <section className="bg-gradient-to-br from-blue-50/60 to-cyan-50/40 rounded-[24px] sm:rounded-3xl p-6 sm:p-8 border border-blue-100/60">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-[#004AAD]" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    {currentLang === "en" ? "Key Project Highlights" : "Keunggulan & Karakteristik Proyek"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/90 p-4 rounded-2xl border border-blue-100/80 shadow-xs">
                    <p className="text-xs text-gray-500 font-medium">{currentLang === "en" ? "Device Architecture" : "Arsitektur Perangkat"}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {isMobile ? "Native / Hybrid Mobile App" : "Cloud Web & Desktop"}
                    </p>
                  </div>

                  <div className="bg-white/90 p-4 rounded-2xl border border-blue-100/80 shadow-xs">
                    <p className="text-xs text-gray-500 font-medium">{currentLang === "en" ? "Delivery Standards" : "Standar Pengerjaan"}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      High Performance & Scalable
                    </p>
                  </div>

                  <div className="bg-white/90 p-4 rounded-2xl border border-blue-100/80 shadow-xs">
                    <p className="text-xs text-gray-500 font-medium">{currentLang === "en" ? "Security & Reliability" : "Keamanan & Stabilitas"}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      Enterprise Grade
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar (4 Cols) */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-[80px]">
              
              {/* Consultation Card */}
              <div className="rounded-[24px] sm:rounded-3xl bg-gradient-to-br from-[#004AAD] to-[#002860] p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
                <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-cyan-400/20 blur-2xl" />
                <div className="relative z-10">
                  <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm mb-3">
                    {currentLang === "en" ? "Custom Development" : "Layanan Kustom"}
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold leading-snug">
                    {currentLang === "en" ? "Need a solution like this?" : "Butuh sistem digital seperti ini?"}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                    {currentLang === "en"
                      ? "Discuss your technical requirements with our engineering team. We deliver tailored, high-performance software."
                      : "Diskusikan kebutuhan spesifikasi teknis dan alur bisnis Anda bersama tim pengembang ASTA Digital Agency."}
                  </p>

                  <div className="mt-6 flex flex-col gap-2.5">
                    <Button
                      asChild
                      className="w-full rounded-full bg-white text-[#004AAD] hover:bg-blue-50 font-semibold shadow-md text-sm h-11"
                    >
                      <a href={`/${currentLang}#kontak`}>
                        {currentLang === "en" ? "Start Discussion" : "Konsultasi Sekarang"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <a
                      href="https://wa.me/6281578223564"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 text-xs text-white/80 hover:text-white py-1.5 transition-colors"
                    >
                      <span>WhatsApp (+62 815 7822 3564)</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Other Portfolios Navigator */}
              {otherPortfolios.length > 0 && (
                <div className="rounded-[24px] sm:rounded-3xl bg-white p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      {currentLang === "en" ? "Other Projects" : "Proyek Lainnya"}
                    </h3>
                    <Link
                      to="/$lang/portfolio"
                      params={{ lang: currentLang }}
                      className="text-xs font-semibold text-[#004AAD] hover:underline"
                    >
                      {currentLang === "en" ? "View All" : "Lihat Semua"}
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {otherPortfolios.map((item) => (
                      <Link
                        key={item.id}
                        to="/$lang/portfolio/$id"
                        params={{ lang: currentLang, id: String(item.id) }}
                        className="group flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-blue-50/60 border border-transparent hover:border-blue-100 transition-all cursor-pointer"
                      >
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/60">
                          {item.image ? (
                            <img src={item.image} alt={item.name} width={48} height={48} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="h-full w-full grid place-items-center bg-blue-100 text-[#004AAD] font-bold text-xs">
                              {item.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#004AAD]">{item.category}</p>
                          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate group-hover:text-[#004AAD] transition-colors">{item.name}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#004AAD] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Back */}
              <div className="pt-2 text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate({ to: "/$lang/portfolio", params: { lang: currentLang } })}
                  className="rounded-full text-xs text-gray-600 hover:text-[#004AAD] hover:bg-blue-50"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  {currentLang === "en" ? "Back to All Portfolios" : "Kembali ke Semua Portofolio"}
                </Button>
              </div>

            </aside>
          </div>
        </div>
      </main>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-1 bg-black/95 border-none rounded-2xl overflow-hidden focus:outline-none">
          {previewImage && (
            <div className="relative flex items-center justify-center p-2">
              <img
                src={previewImage}
                alt="Fullscreen Preview"
                className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl"
              />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 z-30 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-white hover:bg-black transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
