import { motion } from "motion/react";
import {
  Search,
  Lightbulb,
  Palette,
  Code2,
  Rocket,
  Headphones,
} from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { SectionHeading } from "../common";

export function Process() {
  const { t } = useTranslation();

  const steps = [
    { n: "01", title: t("process.step_1_title"), text: t("process.step_1_desc"), icon: Search },
    { n: "02", title: t("process.step_2_title"), text: t("process.step_2_desc"), icon: Lightbulb },
    { n: "03", title: t("process.step_3_title"), text: t("process.step_3_desc"), icon: Palette },
    { n: "04", title: t("process.step_4_title"), text: t("process.step_4_desc"), icon: Code2 },
    { n: "05", title: t("process.step_5_title"), text: t("process.step_5_desc"), icon: Rocket },
    { n: "06", title: t("process.step_6_title"), text: t("process.step_6_desc"), icon: Headphones },
  ];

  return (
    <section id="proses" className="relative py-6 sm:py-6 lg:py-6">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            eyebrow={t("process.eyebrow")}
            title={t("process.title")}
            desc={t("process.description")}
          />
        </motion.div>

        <div className="relative mt-16">
          <ol className="hidden lg:grid lg:grid-cols-6 lg:gap-5">
            {steps.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-[90px] w-[90px] items-center justify-center rounded-full border-4 border-white shadow-glass transition-transform duration-500 group-hover:-translate-y-1 gradient-ocean">
                  <s.icon className="relative h-8 w-8 text-black drop-shadow-md" strokeWidth={2.2} />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/50 bg-white/90 text-[10px] font-bold text-primary shadow-sm">
                    {s.n}
                  </span>
                </div>

                <div className="mt-6 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-5 shadow-glass/60 backdrop-blur-md transition-all duration-500 group-hover:border-accent/50 group-hover:bg-white/90">
                  <h3 className="font-display text-base font-bold text-primary">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </motion.li>
            ))}
          </ol>

          <div className="lg:hidden -mx-4 overflow-hidden sm:-mx-6">
            <div className="overflow-x-auto pb-4 scroll-pl-4 sm:scroll-pl-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ol className="flex snap-x snap-mandatory gap-4 px-4 sm:px-6">
                {steps.map((s, i) => (
                  <motion.li
                    key={s.n}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-[240px] shrink-0 snap-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-glass gradient-ocean">
                        <s.icon className="relative h-7 w-7 text-black drop-shadow" strokeWidth={2.2} />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/50 bg-white/90 text-[9px] font-bold text-primary shadow-sm">
                          {s.n}
                        </span>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-accent/60 to-transparent" />
                    </div>
                    <div className="mt-4 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-md">
                      <h3 className="font-display text-base font-bold text-primary">{s.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

