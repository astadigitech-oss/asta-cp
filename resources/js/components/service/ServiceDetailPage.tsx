import { useState, useRef, useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  X,
  Share2,
  Check,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Globe,
  Mail,
  PhoneCall,
  MapPin,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData } from "@/hooks/useLandingData";
import { stripHtml } from "@/components/lib/utils";
import { ServiceData, getServiceImages } from "@/components/landing/types";
import { FAQSection } from "../common/FAQSection";

interface ServiceFaq {
  question: string;
  answer: string;
}

const Footer = lazy(() => import("@/components/landing/sections/Footer").then((m) => ({ default: m.Footer })));

export function ServiceDetailPage() {
  const { id, lang } = useParams({ strict: false }) as { id?: string; lang?: string };
  const { t, localize, language } = useTranslation();
  const navigate = useNavigate();
  const { data: landingData } = useLandingData();
  const [copied, setCopied] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<{ src: string; title?: string } | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mountedAt] = useState(() => Date.now());

  // Try finding from cached landingData first for immediate render
  const allServices = (landingData?.services || []) as ServiceData[];
  const cachedItem = allServices.find((item) => String(item.id) === String(id));

  // Query single service detail to ensure full and fresh data (faqs, images, seo)
  const { data: fetchedItem, isLoading, isError } = useQuery<ServiceData>({
    queryKey: ["service", id],
    queryFn: () => axios.get<ServiceData>(`/api/services/${id}`).then((res) => res.data),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });

  const rawService = fetchedItem || cachedItem;

  // Scroll to top on mount or service change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setActiveImgIndex(0);
  }, [id]);

  const rawFaqs: Array<{ question?: any; answer?: any }> = Array.isArray(rawService?.faqs)
    ? (rawService.faqs as Array<{ question?: any; answer?: any }>)
    : typeof rawService?.faqs === "string"
      ? (() => {
        try {
          return JSON.parse(rawService.faqs);
        } catch {
          return [];
        }
      })()
      : [];

  const service = rawService
    ? {
      ...rawService,
      name: localize(rawService.name),
      header: rawService.header ? localize(rawService.header) : undefined,
      short_description: rawService.short_description ? localize(rawService.short_description) : undefined,
      description: rawService.description ? localize(rawService.description) : undefined,
      serviceListMains: rawService.serviceListMains?.map((item) => ({
        ...item,
        description: localize(item.description),
      })),
      faqs: rawFaqs.map(
        (faq: { question?: any; answer?: any }): ServiceFaq => ({
          question: localize(faq?.question),
          answer: localize(faq?.answer),
        })
      ),
    }
    : null;

  const currentLang = lang || language || "id";
  const serviceImages = service ? getServiceImages(service.image) : [];
  const otherServices = allServices
    .filter((s) => String(s.id) !== String(id))
    .slice(0, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success(
      currentLang === "en" ? "Link copied to clipboard!" : "Tautan layanan berhasil disalin!"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await axios.post("/api/contact", {
        name: formData.get("name"),
        organization: formData.get("org"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        message: formData.get("message"),
        website_hp: formData.get("website_hp"),
        _timer: formData.get("_timer"),
      });
      form.reset();
      setContactOpen(false);
      toast.success(t("contact.form.success_title"), {
        description: t("contact.form.success_desc"),
      });
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : t("contact.form.error_desc");
      toast.error(t("contact.form.error_title"), { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevImage = () => {
    if (serviceImages.length <= 1) return;
    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : serviceImages.length - 1));
  };

  const handleNextImage = () => {
    if (serviceImages.length <= 1) return;
    setActiveImgIndex((prev) => (prev < serviceImages.length - 1 ? prev + 1 : 0));
  };

  if (isLoading && !service) {
    return (
      <div className="min-h-screen bg-[#f7fbff] flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#004AAD] border-r-transparent align-[-0.125em]" />
          <p className="mt-4 text-sm font-medium text-gray-500">
            {currentLang === "en" ? "Loading service details..." : "Memuat informasi layanan..."}
          </p>
        </div>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="min-h-screen bg-[#f7fbff] flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-32 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-600">
            <X className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentLang === "en" ? "Service Not Found" : "Layanan Tidak Ditemukan"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {currentLang === "en"
              ? "The service you are looking for may have been moved or is no longer available."
              : "Layanan yang Anda cari mungkin telah dipindahkan atau sudah tidak tersedia."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/$lang", params: { lang: currentLang } })}
              className="rounded-full"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {currentLang === "en" ? "Back to Home" : "Kembali ke Beranda"}
            </Button>
          </div>
        </div>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbff] text-[#0b1f33] selection:bg-accent/30 selection:text-accent font-sans flex flex-col justify-between pt-[90px]">
      <Toaster position="top-right" />
      <Navbar />

      <main className="flex-1">
        {/* Top Breadcrumb Navigation */}
        <div className="border-b border-gray-100 bg-white/70 backdrop-blur-md sticky top-0 z-30">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 sm:gap-2">
              <Link
                to="/$lang"
                params={{ lang: currentLang }}
                className="inline-flex items-center gap-1 text-gray-500 hover:text-[#004AAD] transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{currentLang === "en" ? "Home" : "Beranda"}</span>
              </Link>
              <span className="text-gray-300">/</span>
              <Link
                to="/$lang/services"
                params={{ lang: currentLang }}
                className="text-gray-500 hover:text-[#004AAD] transition-colors"
              >
                {t("nav.services")}
              </Link>
              <span className="text-gray-300">/</span>
              <span className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-md">
                {service.name}
              </span>
            </nav>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#004AAD] transition-all cursor-pointer shadow-xs"
              title={currentLang === "en" ? "Share Service Link" : "Salin Tautan Layanan"}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copied ? (currentLang === "en" ? "Copied" : "Tersalin") : (currentLang === "en" ? "Share" : "Bagikan")}</span>
            </button>
          </div>
        </div>

        {/* Hero Header Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-[#f7fbff] pt-8 sm:pt-14 pb-12 sm:pb-16 border-b border-gray-100">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl"
            >
              {/* Badge & Logo Header */}
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                {service.logo ? (
                  <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-white p-2.5 shadow-md border border-blue-100/60">
                    <img
                      src={service.logo}
                      alt={service.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-[#004AAD] text-white shadow-md">
                    <Globe className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#004AAD]/10 text-[#004AAD] border border-[#004AAD]/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#004AAD]" />
                    {service.header || t("services.eyebrow")}
                  </span>
                </div>
              </div>

              {/* Service H1 Title */}
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {service.name}
              </h1>

              {/* Highlight Short Description */}
              {service.short_description && (
                <div className="mt-5 rounded-2xl bg-blue-50/80 border-l-4 border-[#004AAD] p-4 sm:p-5 shadow-xs">
                  <div
                    className="text-base sm:text-lg text-gray-800 leading-relaxed font-medium prose prose-blue max-w-none [&>p]:m-0"
                    dangerouslySetInnerHTML={{ __html: service.short_description }}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Main Content Layout */}
        <section className="py-2 sm:py-2">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Visual Showcase & Full Description (8 cols) */}
              <div className="lg:col-span-8 space-y-10">
                {/* Visual Showcase Gallery */}
                {serviceImages.length > 0 && (
                  <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-glass p-3 sm:p-4">
                    {/* Main Active Image with Zoom Button */}
                    <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-950 select-none group">
                      <img
                        key={activeImgIndex}
                        src={serviceImages[activeImgIndex]}
                        alt={`${service.name} preview ${activeImgIndex + 1}`}
                        className="h-full w-full object-cover transition-opacity duration-300"
                        loading="eager"
                        decoding="async"
                      />

                      {/* Floating Lightbox Zoom Trigger */}
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImage({
                            src: serviceImages[activeImgIndex],
                            title: `${service.name} (${activeImgIndex + 1}/${serviceImages.length})`,
                          })
                        }
                        className="absolute bottom-3.5 right-3.5 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md px-3 py-1.5 text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
                        title={currentLang === "en" ? "Zoom Image" : "Perbesar Gambar"}
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{currentLang === "en" ? "Full Preview" : "Perbesar"}</span>
                      </button>

                      {/* Navigation Arrows for Multi-image */}
                      {serviceImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={handlePrevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 shadow-md backdrop-blur-sm transition-all active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
                            aria-label="Previous Image"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 shadow-md backdrop-blur-sm transition-all active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
                            aria-label="Next Image"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}

                      {/* Image Counter Badge */}
                      {serviceImages.length > 1 && (
                        <div className="absolute top-3.5 left-3.5 z-20 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-sm border border-white/10">
                          {activeImgIndex + 1} / {serviceImages.length}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Selector Strip */}
                    {serviceImages.length > 1 && (
                      <div className="mt-3.5 flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                        {serviceImages.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImgIndex(idx)}
                            className={`relative h-14 sm:h-18 w-20 sm:w-26 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${activeImgIndex === idx
                                ? "border-[#004AAD] shadow-md ring-2 ring-[#004AAD]/20"
                                : "border-gray-200/80 opacity-60 hover:opacity-100"
                              }`}
                          >
                            <img
                              src={img}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Key Features & Capabilities (from serviceListMains) */}
                {service.serviceListMains && service.serviceListMains.length > 0 && (
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-glass">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-[#004AAD]">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <div>
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900">
                          {t("services.modal.features")}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {currentLang === "en"
                            ? "Core highlights and engineering standards included in this service"
                            : "Standar rekayasa perangkat lunak dan keunggulan utama layanan ini"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {service.serviceListMains.map((feature) => (
                        <div
                          key={feature.id}
                          className="flex items-start gap-3 rounded-2xl border border-blue-100/70 bg-gradient-to-br from-blue-50/50 to-white p-4 shadow-2xs hover:border-[#004AAD]/40 transition-colors"
                        >
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#004AAD] mt-0.5" />
                          <span className="text-sm sm:text-base font-medium text-gray-800 leading-snug">
                            {stripHtml(feature.description)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* In-Depth Service Description */}
                {service.description && (
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-glass">
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-5">
                      {currentLang === "en" ? "Detailed Service Overview" : "Penjelasan Lengkap Layanan"}
                    </h2>
                    <div
                      className="portfolio-content text-base sm:text-lg text-gray-700 leading-relaxed space-y-4 prose prose-blue max-w-none"
                      dangerouslySetInnerHTML={{ __html: service.description }}
                    />
                  </div>
                )}

                {/* Service FAQ (Kesiapan GEO & AI) */}
                {service.faqs && service.faqs.length > 0 && (
                  <div className=" p-6 sm:p-8 ">
                    <FAQSection
                      title={currentLang === "en" ? "Frequently Asked Questions (FAQ)" : "Pertanyaan Seputar Layanan Ini"}
                      description={
                        currentLang === "en"
                          ? "Answers to frequently asked technical and practical questions"
                          : "Jawaban atas pertanyaan teknis dan operasional seputar layanan ini"
                      }
                      faqs={service.faqs}
                      className="!my-0"
                    />
                  </div>
                )}
              </div>

              {/* Right Column: Sticky Sidebar / Consultation Card & Quick Navigator (4 cols) */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
                {/* Consultation Card */}
                <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/30 to-blue-50/70 p-6 sm:p-7 shadow-glass">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#004AAD] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    {currentLang === "en" ? "Consultation" : "Konsultasi Teknis"}
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 leading-snug">
                    {currentLang === "en"
                      ? "Ready to build this project with ASTA?"
                      : "Ingin mendiskusikan kebutuhan layanan ini?"}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {currentLang === "en"
                      ? "Our technical leads will assess your scope, timelines, and architectural requirements."
                      : "Tim konsultan kami siap menganalisis ruang lingkup proyek, arsitektur sistem, dan estimasi waktu pengerjaan."}
                  </p>

                  <div className="mt-6 space-y-3">
                    <Button
                      onClick={() => setContactOpen(true)}
                      className="w-full rounded-full bg-[#004AAD] hover:bg-blue-800 text-white h-11 font-semibold shadow-md text-sm"
                    >
                      {t("contact.form.submit")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full border-gray-200 bg-white hover:bg-gray-50 text-gray-700 h-11 font-semibold text-sm"
                    >
                      <a
                        href="https://wa.me/6281578223564"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp (+62 815 7822 3564)
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Other Services Navigator */}
                {otherServices.length > 0 && (
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-glass">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-base text-gray-900">
                        {currentLang === "en" ? "Other Services & Solutions" : "Layanan Lainnya"}
                      </h3>
                      <Link
                        to="/$lang/services"
                        params={{ lang: currentLang }}
                        className="text-xs font-semibold text-[#004AAD] hover:underline"
                      >
                        {currentLang === "en" ? "View All" : "Lihat Semua"}
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {otherServices.map((other) => (
                        <Link
                          key={other.id}
                          to="/$lang/services/$id"
                          params={{ lang: currentLang, id: String(other.id) }}
                          className="group flex items-start gap-3 rounded-2xl border border-gray-100 p-3 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer"
                        >
                          {other.logo ? (
                            <img
                              src={other.logo}
                              alt=""
                              className="h-10 w-10 rounded-xl object-contain bg-gray-50 p-1.5 border border-gray-100"
                            />
                          ) : (
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-[#004AAD]">
                              <Globe className="h-5 w-5" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#004AAD] transition-colors truncate">
                              {localize(other.name)}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {stripHtml(localize(other.short_description)) || other.header}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#004AAD] group-hover:translate-x-1 transition-all mt-3" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl sm:rounded-[28px] border border-gray-100 bg-white shadow-2xl focus:outline-none">
          <div className="grid sm:grid-cols-12">
            {/* Left Panel */}
            <div className="relative overflow-hidden gradient-hero p-5 sm:p-8 text-primary-foreground sm:col-span-5">
              <div className="pointer-events-none absolute inset-0 opacity-30 gradient-mesh" />
              <div className="relative">
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                  {currentLang === "en" ? "Get in Touch" : "Hubungi Kami"}
                </span>
                <h2 className="mt-2 sm:mt-4 font-display text-xl sm:text-2xl font-bold leading-tight">
                  {t("contact.title")}
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/80">
                  {t("contact.description")}
                </p>
                <ul className="mt-4 sm:mt-8 space-y-3 sm:space-y-5 hidden sm:block">
                  <li className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl glass-dark">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                        {t("contact.info_email")}
                      </div>
                      <a href="mailto:cs@astadigitalagency.com" className="mt-0.5 block text-sm font-semibold text-white">
                        cs@astadigitalagency.com
                      </a>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl glass-dark">
                      <PhoneCall className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                        {t("contact.info_phone")}
                      </div>
                      <a href="tel:+6281578223564" className="mt-0.5 block text-sm font-semibold text-white">
                        +62 815 7822 3564
                      </a>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl glass-dark">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                        {t("contact.info_office")}
                      </div>
                      <address className="mt-0.5 text-sm font-semibold leading-snug text-white not-italic">
                        {t("contact.info_office_address")}
                      </address>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Panel: Form */}
            <form onSubmit={handleContactSubmit} className="p-5 sm:p-8 sm:col-span-7">
              {/* Anti-Spam */}
              <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden opacity-0 absolute -z-10 pointer-events-none h-0 w-0" />
              <input type="hidden" name="_timer" value={mountedAt} />

              <h3 className="font-display text-lg sm:text-xl font-bold text-primary">{t("contact.form_title")}</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{t("contact.form_description")}</p>

              <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="cd-name" className="text-xs sm:text-sm">{t("contact.form.full_name")}</Label>
                  <Input id="cd-name" name="name" required placeholder={t("contact.form.placeholder_first_name")} className="rounded-xl h-10 text-xs sm:text-sm" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cd-org" className="text-xs sm:text-sm">{t("contact.form.organization")}</Label>
                  <Input id="cd-org" name="org" placeholder={t("contact.form.placeholder_organization")} className="rounded-xl h-10 text-xs sm:text-sm" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cd-email" className="text-xs sm:text-sm">{t("contact.form.email")}</Label>
                  <Input id="cd-email" name="email" type="email" required placeholder={t("contact.form.placeholder_email")} className="rounded-xl h-10 text-xs sm:text-sm" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cd-phone" className="text-xs sm:text-sm">{t("contact.form.phone")}</Label>
                  <Input
                    id="cd-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    maxLength={20}
                    placeholder={t("contact.form.placeholder_phone")}
                    className="rounded-xl h-10 text-xs sm:text-sm"
                    onKeyDown={(e) => {
                      if (
                        e.key === "Backspace" || e.key === "Delete" ||
                        e.key === "ArrowLeft" || e.key === "ArrowRight" ||
                        e.key === "ArrowUp" || e.key === "ArrowDown" ||
                        e.key === "Tab" || e.key === "Enter" ||
                        e.ctrlKey || e.metaKey
                      ) return;
                      if (!/[\d+\s-]/.test(e.key)) e.preventDefault();
                    }}
                    onInput={(e) => {
                      const target = e.currentTarget;
                      let val = target.value.replace(/[^\d+\s-]/g, "");
                      if (val.indexOf("+") > 0) {
                        val = (val.startsWith("+") ? "+" : "") + val.replace(/\+/g, "");
                      }
                      target.value = val;
                    }}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="cd-message" className="text-xs sm:text-sm">{t("contact.form.message")}</Label>
                  <Textarea id="cd-message" name="message" required rows={3} placeholder={t("contact.form.placeholder_message")} className="rounded-xl text-xs sm:text-sm resize-none" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="mt-5 h-11 w-full rounded-full gradient-accent text-accent-foreground shadow-glass sm:w-auto sm:px-8 cursor-pointer text-xs sm:text-sm font-semibold"
              >
                {submitting ? (
                  t("contact.form.submitting")
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-white">
                    {t("contact.form.submit")} <MessageSquare className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent
          showClose={false}
          className="max-w-[94vw] sm:max-w-5xl bg-black/95 border-none p-2 sm:p-4 text-white shadow-2xl focus:outline-none"
        >
          {previewImage && (
            <div className="relative flex flex-col items-center">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 z-50 grid h-10 w-10 place-items-center rounded-full bg-black/70 hover:bg-black text-white border border-white/20 shadow-md cursor-pointer transition-all active:scale-95"
                title="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="max-h-[85vh] w-full overflow-hidden flex items-center justify-center p-2">
                <img
                  src={previewImage.src}
                  alt={previewImage.title || ""}
                  className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
                />
              </div>
              {previewImage.title && (
                <p className="mt-2 text-xs sm:text-sm font-medium text-gray-300 text-center">
                  {previewImage.title}
                </p>
              )}
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

export default ServiceDetailPage;
