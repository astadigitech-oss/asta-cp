import { useState, useRef, useEffect, Suspense, lazy, useMemo } from "react";
import { Link, useParams, useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { motion } from "motion/react";
import {
  Search,
  ArrowRight,
  Home,
  CheckCircle2,
  Sparkles,
  Layers,
  Globe,
  MessageSquare,
  Mail,
  PhoneCall,
  MapPin,
  X,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData } from "@/hooks/useLandingData";
import { stripHtml } from "@/components/lib/utils";
import { ServiceData } from "@/components/landing/types";

const Footer = lazy(() =>
  import("@/components/landing/sections/Footer").then((m) => ({ default: m.Footer }))
);

export function ServicesListPage() {
  const params = useParams({ strict: false }) as Record<string, string>;
  const { t, localize, language } = useTranslation();
  const navigate = useNavigate();
  const lang = params?.lang || language || "id";
  const { data: landingData, isLoading } = useLandingData();

  const [searchQuery, setSearchQuery] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [mountedAt] = useState(() => Date.now());

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const rawServices = (landingData?.services || []) as ServiceData[];

  const localizedServices = useMemo(() => {
    return rawServices.map((service) => ({
      ...service,
      name: localize(service.name),
      header: service.header ? localize(service.header) : undefined,
      short_description: service.short_description ? localize(service.short_description) : undefined,
      description: service.description ? localize(service.description) : undefined,
      serviceListMains: service.serviceListMains?.map((item) => ({
        ...item,
        description: localize(item.description),
      })),
    }));
  }, [rawServices, localize]);

  // Filter based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return localizedServices;
    const q = searchQuery.toLowerCase();
    return localizedServices.filter((s) => {
      const matchName = s.name?.toLowerCase().includes(q);
      const matchHeader = s.header?.toLowerCase().includes(q);
      const matchDesc = s.short_description?.toLowerCase().includes(q);
      const matchFeatures = s.serviceListMains?.some((item) =>
        item.description?.toLowerCase().includes(q)
      );
      return matchName || matchHeader || matchDesc || matchFeatures;
    });
  }, [localizedServices, searchQuery]);

  const handleOpenContact = (serviceName?: string) => {
    setSelectedServiceName(serviceName || "");
    setContactOpen(true);
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
      toast.error(t("contact.form.error_title"), {
        description: t("contact.form.error_desc"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-[#0b1f33] font-sans selection:bg-[#004AAD]/20 selection:text-[#004AAD] flex flex-col justify-between">
      <Toaster position="top-right" richColors />
      <Navbar />

      <main className="flex-1 pt-24 pb-20 sm:pt-28 sm:pb-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <Link
              to="/$lang"
              params={{ lang }}
              className="inline-flex items-center gap-1.5 hover:text-[#004AAD] transition-colors font-medium"
            >
              <Home className="h-4 w-4" />
              <span>{lang === "en" ? "Home" : "Beranda"}</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900" aria-current="page">
              {t("nav.services")}
            </span>
          </nav>

          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-white via-blue-50/40 to-blue-100/30 border border-blue-100/80 p-8 sm:p-12 lg:p-16 shadow-glass mb-12">
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#004AAD]/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#38B6FF]/15 blur-2xl" />

            <div className="relative z-10 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full bg-[#004AAD]/10 px-4 py-1.5 text-xs font-bold text-[#004AAD] uppercase tracking-wider mb-4 border border-[#004AAD]/20"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#004AAD]" />
                {t("services.eyebrow")}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15]"
              >
                {lang === "en"
                  ? "Explore All Engineering Services & Solutions"
                  : "Daftar Lengkap Layanan & Solusi Digital ASTA"}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed"
              >
                {t("services.description")}
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      lang === "en"
                        ? "Search services by name, keywords, or features..."
                        : "Cari layanan berdasarkan nama, fitur, atau kata kunci..."
                    }
                    className="w-full rounded-full border border-gray-200 bg-white/95 pl-12 pr-10 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#004AAD] focus:outline-none focus:ring-4 focus:ring-blue-100 shadow-sm transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="text-xs font-semibold text-gray-500 px-3 py-2 bg-white/70 rounded-full border border-gray-200/80 text-center">
                  {filteredServices.length}{" "}
                  {lang === "en" ? "services available" : "layanan tersedia"}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Services Grid */}
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#004AAD] border-r-transparent align-[-0.125em]" />
              <p className="mt-4 text-sm font-medium text-gray-500">
                {lang === "en" ? "Loading services..." : "Memuat daftar layanan..."}
              </p>
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {filteredServices.map((service, index) => {
                const features = service.serviceListMains || [];
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.45, delay: (index % 3) * 0.1 }}
                    className="group relative flex flex-col justify-between rounded-[28px] border border-gray-100/90 bg-white p-7 sm:p-8 shadow-glass transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-200"
                  >
                    <div>
                      {/* Top Row: Icon + Index */}
                      <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/80 text-[#004AAD] border border-blue-100 shadow-xs transition-transform duration-300 group-hover:scale-110">
                          {service.logo ? (
                            <img
                              src={service.logo}
                              alt=""
                              className="h-8 w-8 object-contain"
                            />
                          ) : (
                            <Globe className="h-7 w-7 text-[#004AAD]" />
                          )}
                        </div>
                        <span className="font-mono text-xs font-bold text-gray-400 group-hover:text-[#004AAD] transition-colors">
                          0{index + 1}
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#004AAD] transition-colors leading-snug">
                        {service.name}
                      </h3>
                      {service.header && (
                        <p className="mt-1 text-xs font-semibold text-[#004AAD] uppercase tracking-wider">
                          {service.header}
                        </p>
                      )}

                      {/* Description */}
                      <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {stripHtml(service.short_description) ||
                          t("services.default_web_desc")}
                      </p>

                      {/* Key Features Bullet List */}
                      {features.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-gray-100">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                            {lang === "en" ? "Key Capabilities" : "Fitur & Kapabilitas"}
                          </p>
                          <ul className="space-y-2 text-xs text-gray-600">
                            {features.slice(0, 3).map((item) => (
                              <li key={item.id} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{item.description}</span>
                              </li>
                            ))}
                            {features.length > 3 && (
                              <li className="text-[11px] font-medium text-[#004AAD] pt-1">
                                +{features.length - 3}{" "}
                                {lang === "en" ? "more features" : "fitur lainnya"}
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between gap-3">
                      <Button
                        asChild
                        className="flex-1 rounded-full bg-[#004AAD] hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm h-11 shadow-sm transition-all"
                      >
                        <Link
                          to="/$lang/services/$id"
                          params={{ lang, id: String(service.id) }}
                        >
                          {t("services.view_detail")}
                          <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenContact(service.name)}
                        className="rounded-full border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-[#004AAD] h-11 px-4 text-xs font-semibold"
                        title={lang === "en" ? "Consult" : "Konsultasi"}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center rounded-3xl bg-white border border-gray-100 shadow-sm p-8">
              <Layers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800">
                {lang === "en"
                  ? "No services matched your query"
                  : "Tidak ada layanan yang sesuai"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                {lang === "en"
                  ? "Try using different keywords or clear the search input."
                  : "Coba gunakan kata kunci lain atau bersihkan kotak pencarian."}
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-5 rounded-full"
              >
                {lang === "en" ? "Clear Search" : "Reset Pencarian"}
              </Button>
            </div>
          )}

          {/* Bottom Conversion Banner */}
          <div className="mt-16 sm:mt-24 rounded-[32px] sm:rounded-[40px] bg-gradient-to-r from-[#003882] via-[#004AAD] to-[#0072b2] text-white p-8 sm:p-12 lg:p-14 text-center shadow-xl relative overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
              {lang === "en"
                ? "Need a Custom Software Solution Not Listed Here?"
                : "Butuh Solusi Sistem Kustom yang Tidak Ada di Daftar?"}
            </h2>
            <p className="mt-3 text-xs sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
              {lang === "en"
                ? "Every business has unique workflows. Our technical architects build tailored architectures matching your exact specifications."
                : "Setiap proses bisnis memiliki kebutuhan unik. Tim kami siap merancang arsitektur kustom yang sesuai dengan spesifikasi dan alur kerja Anda."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <Button
                onClick={() => handleOpenContact()}
                className="rounded-full bg-white text-[#004AAD] hover:bg-blue-50 px-8 h-12 font-bold shadow-lg text-sm sm:text-base"
              >
                {t("contact.form.submit")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/30 text-white bg-white/10 hover:bg-white/20 px-8 h-12 font-semibold text-sm sm:text-base backdrop-blur-sm"
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
        </div>
      </main>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-[24px] border border-white/60 bg-white shadow-2xl focus:outline-none">
          <div className="grid sm:grid-cols-12">
            {/* Left Panel */}
            <div className="relative overflow-hidden gradient-hero p-8 text-primary-foreground sm:col-span-5">
              <div className="pointer-events-none absolute inset-0 opacity-30 gradient-mesh" />
              <div className="relative">
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                  {lang === "en" ? "Consultation" : "Konsultasi Teknis"}
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold leading-tight">
                  {t("contact.title")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {selectedServiceName
                    ? `${lang === "en" ? "Inquiring about:" : "Mengenai layanan:"} ${selectedServiceName}`
                    : t("contact.description")}
                </p>
                <ul className="mt-8 space-y-5">
                  <li className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl glass-dark">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                        {t("contact.info_email")}
                      </div>
                      <a
                        href="mailto:cs@astadigitalagency.com"
                        className="mt-0.5 block text-sm font-semibold text-white"
                      >
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
                      <a
                        href="tel:+6281578223564"
                        className="mt-0.5 block text-sm font-semibold text-white"
                      >
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
            <form onSubmit={handleContactSubmit} className="p-8 sm:col-span-7">
              <input
                type="text"
                name="website_hp"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden opacity-0 absolute -z-10 pointer-events-none h-0 w-0"
              />
              <input type="hidden" name="_timer" value={mountedAt} />

              <h3 className="font-display text-xl font-bold text-primary">
                {t("contact.form_title")}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t("contact.form_description")}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sl-name">{t("contact.form.full_name")}</Label>
                  <Input
                    id="sl-name"
                    name="name"
                    required
                    placeholder={t("contact.form.placeholder_first_name")}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sl-org">{t("contact.form.organization")}</Label>
                  <Input
                    id="sl-org"
                    name="org"
                    placeholder={t("contact.form.placeholder_organization")}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sl-email">{t("contact.form.email")}</Label>
                  <Input
                    id="sl-email"
                    name="email"
                    type="email"
                    required
                    placeholder={t("contact.form.placeholder_email")}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sl-phone">{t("contact.form.phone")}</Label>
                  <Input
                    id="sl-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    maxLength={20}
                    placeholder={t("contact.form.placeholder_phone")}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="sl-message">{t("contact.form.message")}</Label>
                  <Textarea
                    id="sl-message"
                    name="message"
                    required
                    rows={4}
                    defaultValue={
                      selectedServiceName
                        ? `${lang === "en" ? "Halo ASTA, I would like to consult about:" : "Halo ASTA, saya ingin berkonsultasi mengenai:"} ${selectedServiceName}`
                        : ""
                    }
                    placeholder={t("contact.form.placeholder_message")}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="mt-6 h-11 w-full rounded-full gradient-accent text-accent-foreground shadow-glass sm:w-auto sm:px-8 cursor-pointer"
              >
                {submitting ? (
                  t("contact.form.submitting")
                ) : (
                  <div className="flex items-center justify-center gap-1 text-white">
                    {t("contact.form.submit")}{" "}
                    <MessageSquare className="ml-1.5 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}

export default ServicesListPage;
