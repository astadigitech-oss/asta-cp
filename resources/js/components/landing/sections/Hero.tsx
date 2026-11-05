import { ArrowRight, BriefcaseBusiness, Building2, ContactRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData, ClientItem } from "@/hooks/useLandingData";
import { Eyebrow, OceanBackdrop } from "../common";
import { ResponsiveImage } from "../common/ResponsiveImage";

export function Hero({ clientsList }: { clientsList?: ClientItem[] }) {
  const { t } = useTranslation();
  const { data: landingData } = useLandingData();
  const clients = clientsList && clientsList.length > 0 ? clientsList : (landingData?.clients || []);

  return (
    <section id="top" className="relative overflow-hidden pt-26 pb-6 sm:pt-26 lg:pb-6 xl:pt-34">
      <OceanBackdrop />

      <div className="mx-auto max-w-[1440px] xl:max-w-[1600px] 2xl:max-w-[1780px] 3xl:max-w-[1980px] 4xl:max-w-[2240px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 3xl:px-24">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>{t("hero.eyebrow")}</Eyebrow>
            <h1 className="mt-5 font-display text-[2.5rem] font-bold leading-[1.02] tracking-tight text-primary sm:text-6xl lg:text-[4.25rem] 2xl:text-[4.75rem] 3xl:text-[5.25rem]">
              {t("hero.title_1")}{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-l from-secondary via-gradient-accent to-primary bg-clip-text text-transparent">
                  {t("hero.title_highlight")}
                </span>
                <svg
                  className="absolute -bottom-2 left-0 h-2 w-full text-accent/70"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 4 Q 50 -2 100 4 T 200 4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              {t("hero.title_2")}
            </h1>
            <p className="mt-6 max-w-xl xl:max-w-2xl 2xl:max-w-3xl 3xl:max-w-4xl text-base leading-relaxed text-muted-foreground sm:text-lg xl:text-xl 3xl:text-2xl">
              {t("hero.description")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full gradient-accent px-6 text-accent-foreground shadow-glass hover:opacity-95"
              >
                <a href="#kontak" className="text-white">
                  {t("hero.cta_start")} <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-primary/20 bg-white/70 px-6 text-primary backdrop-blur hover:bg-white"
              >
                <a href="#portofolio">{t("hero.cta_portfolio")}</a>
              </Button>
            </div>

            {/* Link to verifiable company information */}
            <div className="mt-10 flex flex-wrap items-center gap-3 text-xs font-medium text-primary/70">
              <a href="#portofolio" className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 shadow-soft hover:text-secondary">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-secondary" /> {t("hero.trust_portfolio")}
              </a>
              <a href="#tentang" className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 shadow-soft hover:text-secondary">
                <Building2 className="h-3.5 w-3.5 text-secondary" /> {t("hero.trust_company")}
              </a>
              <a href="#kontak" className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 shadow-soft hover:text-secondary">
                <ContactRound className="h-3.5 w-3.5 text-secondary" /> {t("hero.trust_contact")}
              </a>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto aspect-square w-full max-w-[520px] xl:max-w-[600px] 2xl:max-w-[680px] 3xl:max-w-[760px] 4xl:max-w-[840px]">
              <div className="absolute inset-0 rounded-[42%_58%_45%_55%/55%_40%_60%_45%] gradient-mesh opacity-90 blur-[2px]" />
              <div className="absolute inset-6 rounded-[52%_48%_40%_60%/45%_55%_45%_55%] gradient-hero shadow-glass" />
              <div className="absolute inset-0 animate-spin [animation-duration:40s]">
                <div className="absolute inset-2 rounded-full border border-dashed border-accent/40" />
              </div>

              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-2">
                <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <ResponsiveImage
                      source="Hero/Laptop.webp"
                      sizes="(min-width: 1280px) 40vw, (min-width: 640px) 50vw, 100vw"
                      alt="Laptop ASTA Digital Agency"
                      width={952}
                      height={714}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-contain drop-shadow-2xl select-none scale-[1.1] sm:scale-[1.1] lg:scale-[1.2] translate-x-[0.3%] translate-y-[-5.15%]"
                    />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center z-20 floating">
                    <ResponsiveImage
                      source="Hero/Robot.webp"
                      sizes="(min-width: 1280px) 40vw, (min-width: 640px) 50vw, 100vw"
                      alt="3D Robot ASTA Digital Agency"
                      width={954}
                      height={715}
                      fetchPriority="high"
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)] select-none scale-[1.2] sm:scale-[1.1] lg:scale-[1.2] translate-x-[-7.9%] translate-y-[-20.5%]"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Trusted by Clients Bar */}
        <div className="mt-12 rounded-2xl glass px-4 py-5 sm:px-6 shadow-soft sm:mt-14 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-5 sm:gap-6 lg:gap-8">
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-[0.22em] leading-relaxed text-muted-foreground shrink-0 text-center lg:text-left lg:whitespace-nowrap max-w-full">
              {t("hero.trusted_by")}
            </div>

            {/* Logo Display Area */}
            {(() => {
              const displayClients = clients;
              if (displayClients.length === 0) return null;

              const isAutoScroll = displayClients.length >= 5;

              if (isAutoScroll) {
                const marqueeList = [...displayClients, ...displayClients];
                return (
                  <div className="relative w-full overflow-hidden flex-1 flex items-center min-h-[48px]">
                    <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/90 via-white/50 to-transparent z-10 hidden sm:block" />
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/90 via-white/50 to-transparent z-10 hidden sm:block" />

                    <div className="flex w-max items-center gap-8 sm:gap-14 animate-marquee">
                      {marqueeList.map((client, idx) => (
                        <div
                          key={`${client.id || client.name}-${idx}`}
                          className="flex shrink-0 items-center justify-center h-12 px-3 transition-transform duration-300 hover:scale-105"
                          title={client.name}
                        >
                          {client.image ? (
                            <img
                              src={client.image}
                              alt={client.name}
                              width={130}
                              height={44}
                              loading="lazy"
                              decoding="async"
                              className="max-h-11 max-w-[130px] object-contain filter opacity-75 hover:opacity-100 transition-all duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLElement;
                                target.style.display = "none";
                                if (target.nextElementSibling) {
                                  (target.nextElementSibling as HTMLElement).style.display = "block";
                                }
                              }}
                            />
                          ) : null}
                          <span
                            className={`text-center text-sm font-bold tracking-tight text-primary/70 whitespace-nowrap ${
                              client.image ? "hidden" : "block"
                            }`}
                          >
                            {client.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 sm:gap-12 w-full flex-1">
                  {displayClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-center h-12 px-3 transition-transform duration-300 hover:scale-105"
                      title={client.name}
                    >
                      {client.image ? (
                        <img
                          src={client.image}
                          alt={client.name}
                          width={130}
                          height={44}
                          loading="lazy"
                          decoding="async"
                          className="max-h-11 max-w-[130px] object-contain filter opacity-75 hover:opacity-100 transition-all duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLElement;
                            target.style.display = "none";
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = "block";
                            }
                          }}
                        />
                      ) : null}
                      <span
                        className={`text-center text-sm font-bold tracking-tight text-primary/70 whitespace-nowrap ${
                          client.image ? "hidden" : "block"
                        }`}
                      >
                        {client.name}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}
