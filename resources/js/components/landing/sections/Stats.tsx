import { motion } from "motion/react";
import { Rocket, Users, Award, Sparkles } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { Counter, WaveDivider } from "../common";

export function Stats() {
  const { t } = useTranslation();

  const bigStats = [
    { value: 20, suffix: "+", label: t("hero.stat_projects"), icon: Rocket },
    { value: 8, suffix: "+", label: t("hero.stat_clients"), icon: Users },
    { value: 4, suffix: "+", label: t("hero.stat_years"), icon: Award },
    { value: 98, suffix: "%", label: t("hero.stat_satisfaction"), icon: Sparkles },
  ];

  return (
    <section className="relative -mt-6 pb-6 sm:pb-6">
      <WaveDivider from="var(--surface)" to="var(--background)" />
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {bigStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-[22px] border border-white/60 bg-white/80 p-4 shadow-glass backdrop-blur-md sm:aspect-auto sm:rounded-[26px] sm:p-6"
            >
              <s.icon className="h-5 w-5 text-secondary sm:h-6 sm:w-6" />
              <div>
                <div className="font-display text-3xl font-bold leading-none text-primary sm:mt-3 sm:text-4xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                  {s.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

