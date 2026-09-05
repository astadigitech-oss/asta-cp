import { motion } from "motion/react";
import { Shield, Sparkles, Headphones, Zap } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { SectionHeading } from "../common";

export function WhyUs() {
  const { t } = useTranslation();

  const advantages = [
    { icon: Shield, title: t("why_us.reason_1_title"), text: t("why_us.reason_1_desc") },
    { icon: Sparkles, title: t("why_us.reason_2_title"), text: t("why_us.reason_2_desc") },
    { icon: Headphones, title: t("why_us.reason_3_title"), text: t("why_us.reason_3_desc") },
    { icon: Zap, title: t("why_us.reason_4_title"), text: t("why_us.reason_4_desc") },
  ];

  return (
    <section id="keunggulan" className="relative overflow-hidden bg-surface py-6 sm:py-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-ocean opacity-60" />
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            eyebrow={t("why_us.eyebrow")}
            title={t("why_us.title")}
            desc={t("why_us.description")}
          />
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex items-start gap-5 overflow-hidden rounded-[28px] border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-md transition-all hover:-translate-y-0.5"
            >
              <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl gradient-accent text-accent-foreground shadow-soft">
                <a.icon className="h-6 w-6 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-bold text-primary">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

