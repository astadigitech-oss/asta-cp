import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData } from "@/hooks/useLandingData";
import { stripHtml } from "@/components/lib/utils";
import { SectionHeading, SectionPagination } from "../common";
import { ServiceData, getServiceImages } from "../types";

const defaultServicesData: ServiceData[] = [
  { id: 1, name: "Web Apps Development", short_description: "Aplikasi berbasis web modern, cepat & responsif.", span: "lg:col-span-3" },
  { id: 2, name: "Mobile Apps Development", short_description: "Aplikasi Android & iOS performa tinggi.", span: "lg:col-span-3" },
  { id: 3, name: "IT Consulting & Services", short_description: "Dukungan IT dan konsultasi arsitektur sistem.", span: "lg:col-span-6" },
];

const SERVICES_PER_PAGE = 6;

export function Services() {
  const { t, localize } = useTranslation();
  const { data: landingData } = useLandingData();
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [serviceImageIndex, setServiceImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setServiceImageIndex(0);
  }, [selectedService?.id]);

  const spans = [
    "lg:col-span-3",
    "lg:col-span-3",
    "lg:col-span-2",
    "lg:col-span-2",
    "lg:col-span-2",
  ];

  const servicesList: ServiceData[] = (landingData?.services && landingData.services.length > 0)
    ? landingData.services.map((s: any, i: number) => ({
      ...s,
      name: localize(s.name),
      header: localize(s.header),
      short_description: localize(s.short_description),
      description: localize(s.description),
      serviceListMains: s.serviceListMains?.map((item: any) => ({
        ...item,
        description: localize(item.description),
      })),
      span: spans[i % spans.length],
    }))
    : defaultServicesData.map((s) => ({
      ...s,
      name: localize(s.name),
      short_description: localize(s.short_description),
    }));

  const totalPages = Math.ceil(servicesList.length / SERVICES_PER_PAGE);
  const paginatedServices = servicesList.slice(
    (currentPage - 1) * SERVICES_PER_PAGE,
    currentPage * SERVICES_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

        <div className="-mx-4 mt-12 overflow-hidden sm:mx-0 sm:overflow-visible">
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 px-4 pb-4 sm:mx-0 sm:grid sm:auto-rows-[minmax(220px,auto)] sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-2 sm:scroll-pl-0 lg:grid-cols-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {paginatedServices.map((s, i) => {
              const globalIndex = (currentPage - 1) * SERVICES_PER_PAGE + i;
              return (
                <motion.div
                  key={s.id || i}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSelectedService(s)}
                  className={`${s.span} group relative w-[80%] shrink-0 snap-start overflow-hidden rounded-[28px] border border-white/60 bg-white/75 p-7 shadow-glass backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 cursor-pointer sm:w-auto sm:shrink`}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-accent/20 via-transparent to-secondary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-accent/20 blur-2xl" />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      {s.logo ? (
                        <img src={s.logo} alt={s.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <motion.span
                          whileHover={{ rotate: -8, scale: 1.08 }}
                          className="grid h-14 w-14 place-items-center rounded-2xl gradient-accent text-accent-foreground shadow-glass"
                        >
                          <Globe className="h-6 w-6 text-white" />
                        </motion.span>
                      )}
                      <span className="rounded-full border border-primary/10 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary/60">
                        {globalIndex + 1 < 10 ? `0${globalIndex + 1}` : globalIndex + 1}
                      </span>
                    </div>
                    {s.show_name !== 0 && (
                      <h3 className="mt-5 font-display text-xl font-bold text-primary group-hover:text-[#004AAD] transition-colors">
                        {s.name}
                      </h3>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {stripHtml(s.short_description) || s.header || t("services.default_web_desc")}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(s);
                      }}
                      className="mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-sm font-semibold text-secondary transition-colors hover:text-accent cursor-pointer"
                    >
                      {t("services.view_detail")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <SectionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Service Detail Dialog */}
        <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
          <DialogContent showClose={false} className="w-[92vw] sm:w-full max-w-3xl overflow-hidden rounded-2xl sm:rounded-3xl bg-white p-0 border border-gray-100 shadow-2xl">
            {selectedService && (
              <div className="flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="relative h-44 sm:h-72 w-full overflow-hidden bg-[#004AAD] flex items-center justify-center shrink-0">
                  {getServiceImages(selectedService.image).length > 0 ? (
                    <img
                      src={getServiceImages(selectedService.image)[serviceImageIndex]}
                      alt={selectedService.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#004AAD] via-[#052848] to-[#02182d] p-8 flex flex-col justify-end">
                      {selectedService.logo && (
                        <img src={selectedService.logo} alt={selectedService.name} className="w-16 h-16 object-contain mb-4" />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <span className="inline-block rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-2 backdrop-blur-sm">
                        {t("services.eyebrow")}
                      </span>
                      <h2 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">
                        {selectedService.name}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                  {selectedService.header && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 border-l-4 border-[#004AAD] pl-3">
                        {selectedService.header}
                      </h3>
                    </div>
                  )}

                  {selectedService.description && (
                    <div>
                      <div
                        className="text-gray-700 text-base leading-relaxed space-y-3 prose prose-blue max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedService.description }}
                      />
                    </div>
                  )}

                  {selectedService.serviceListMains && selectedService.serviceListMains.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#004AAD] mb-3">
                        {t("services.modal.features")}
                      </h4>
                      <ul className="grid sm:grid-cols-2 gap-3">
                        {selectedService.serviceListMains.map((item) => (
                          <li key={item.id} className="flex items-start gap-2.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100/60 text-xs font-medium text-gray-800">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#004AAD] mt-0.5" />
                            <span>{stripHtml(item.description)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t("services.modal.cta")}</p>
                    </div>
                    <Button
                      asChild
                      onClick={() => setSelectedService(null)}
                      className="rounded-full bg-[#004AAD] text-white hover:bg-blue-800 px-6 py-3 font-semibold shadow-md"
                    >
                      <a href="#kontak">
                        {t("contact.form.submit")} <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
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

