import { motion } from "motion/react";
import { ArrowRight, Shield, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import { useLandingData, ClientItem } from "@/hooks/useLandingData";
import { Eyebrow, Counter, OceanBackdrop } from "../common";

import laptopImg from "@/assets/Hero/Laptop.webp";
import robotImg from "@/assets/Hero/Robot.webp";

const defaultClientNames = [
  "Telkom Indonesia",
  "Bank Mandiri",
  "Kemenkes RI",
  "Universitas Indonesia",
  "Pertamina",
  "Astra International",
];

export function Hero({ clientsList }: { clientsList?: ClientItem[] }) {
  const { t } = useTranslation();
  const { data: landingData } = useLandingData();
  const clients = clientsList && clientsList.length > 0 ? clientsList : (landingData?.clients || []);

  const heroStats = [
    { value: 20, suffix: "+", label: t("hero.stat_projects") },
    { value: 8, suffix: "+", label: t("hero.stat_clients") },
    { value: 4, suffix: "+", label: t("hero.stat_years") },
    { value: 98, suffix: "%", label: t("hero.stat_satisfaction") },
  ];

  return (
    <section id="top" className="relative overflow-hidden pt-26 pb-6 sm:pt-26 lg:pb-6 xl:pt-34">
      <OceanBackdrop />

      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
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
            <p className="mt-6 max-w-xl xl:max-w-2xl 2xl:max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg xl:text-xl">
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

            {/* Floating trust chips */}
            <div className="mt-10 flex flex-wrap items-center gap-3 text-xs font-medium text-primary/70">
              <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 shadow-soft">
                <Shield className="h-3.5 w-3.5 text-success" /> {t("hero.trust_security")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 shadow-soft">
                <Award className="h-3.5 w-3.5 text-secondary" /> {t("hero.trust_award")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 shadow-soft">
                <Zap className="h-3.5 w-3.5 text-accent" /> {t("hero.trust_fast")}
              </span>
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:col-span-5"
          >
            <div className="relative mx-auto aspect-square w-full max-w-[520px] xl:max-w-[600px] 2xl:max-w-[680px] 3xl:max-w-[760px]">
              <div className="absolute inset-0 rounded-[42%_58%_45%_55%/55%_40%_60%_45%] gradient-mesh opacity-90 blur-[2px]" />
              <div className="absolute inset-6 rounded-[52%_48%_40%_60%/45%_55%_45%_55%] gradient-hero shadow-glass" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute inset-2 rounded-full border border-dashed border-accent/40" />
              </motion.div>

              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-2">
                <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center z-10 will-change-transform"
                  >
                    <img
                      src={laptopImg}
                      alt="Laptop ASTA Digital Agency"
                      className="w-full h-full object-contain drop-shadow-2xl select-none scale-[1.1] sm:scale-[1.1] lg:scale-[1.2] translate-x-[0.3%] translate-y-[-5.15%]"
                    />
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                      rotate: [-0.8, 0.8, -0.8]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center z-20 will-change-transform"
                  >
                    <img
                      src={robotImg}
                      alt="3D Robot ASTA Digital Agency"
                      className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)] select-none scale-[1.2] sm:scale-[1.1] lg:scale-[1.2] translate-x-[-7.9%] translate-y-[-20.5%]"
                    />
                  </motion.div>
                </div>
              </div>

              {heroStats.map((s, i) => {
                const positions = [
                  "top-4 left-0",
                  "top-12 right-0",
                  "bottom-16 left-2",
                  "bottom-6 right-4",
                ];
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.3 + i * 0.08 }}
                    className={`absolute ${positions[i]} z-20 hidden rounded-2xl glass p-3.5 shadow-glass backdrop-blur-md sm:block`}
                  >
                    <div className="font-display text-xl font-bold leading-none text-primary">
                      <Counter to={s.value} suffix={s.suffix} />
                    </div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Trusted by Clients Bar */}
        <div className="mt-12 rounded-2xl glass px-4 py-5 sm:px-6 shadow-soft sm:mt-14 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-5 sm:gap-6 lg:gap-8">
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-[0.22em] leading-relaxed text-muted-foreground shrink-0 text-center lg:text-left lg:whitespace-nowrap max-w-full">
              {t("hero.trusted_by") || "Dipercaya oleh berbagai organisasi terkemuka"}
            </div>

            {/* Logo Display Area */}
            {(() => {
              const displayClients =
                clients.length > 0
                  ? clients
                  : defaultClientNames.map((name, idx) => ({ id: idx + 1, name, image: undefined as string | undefined }));

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

