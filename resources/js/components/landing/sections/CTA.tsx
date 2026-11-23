import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";

export function CTA() {
  const { t, language } = useTranslation();

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const elem = document.getElementById("kontak");
    if (elem) {
      e.preventDefault();
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#004AAD] via-[#023377] to-[#011e48] py-16 sm:py-20 text-white shadow-xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-16 text-center text-primary-foreground"
      >
        <h2 className="font-display text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl text-white">
          {t("cta.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-blue-100/90">
          {t("cta.description")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-white px-7 font-bold text-[#004AAD] shadow-glass hover:bg-blue-50 transition-all hover:scale-105 active:scale-95"
          >
            <a href={`/${language}/#kontak`} onClick={handleContactClick}>
              {t("cta.button")} <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </motion.div>

      {/* Decorative ambient glowing orbs matching discover header */}
      <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -top-20 h-60 w-60 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
    </section>
  );
}
