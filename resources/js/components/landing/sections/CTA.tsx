import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";

export function CTA() {
  const { t } = useTranslation();

  return (
    <section className="relative py-6 sm:py-6">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[36px] gradient-hero p-10 shadow-glass sm:p-16"
        >
          <div className="relative mx-auto max-w-3xl 2xl:max-w-4xl 3xl:max-w-5xl text-center text-primary-foreground">
            <h2 className="mt-5 font-display text-3xl font-bold leading-[1.05] sm:text-5xl text-white">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-5 max-w-xl 2xl:max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
              {t("cta.description")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-white px-6 text-primary shadow-glass hover:bg-white/90"
              >
                <a href="#kontak">
                  {t("cta.button")} <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

