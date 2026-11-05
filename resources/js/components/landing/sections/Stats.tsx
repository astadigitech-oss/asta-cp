import { motion } from "motion/react";
import { BriefcaseBusiness, Building2, ContactRound } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { WaveDivider } from "../common";

export function Stats() {
  const { t } = useTranslation();

  const references = [
    { label: t("hero.trust_portfolio"), description: t("home_seo.proof_portfolio"), href: "#portofolio", icon: BriefcaseBusiness },
    { label: t("hero.trust_company"), description: t("home_seo.proof_company"), href: "#tentang", icon: Building2 },
    { label: t("hero.trust_contact"), description: t("home_seo.proof_contact"), href: "#kontak", icon: ContactRound },
  ];

  return (
    <section className="relative -mt-6 pb-6 sm:pb-6">
      <WaveDivider from="var(--surface)" to="var(--background)" />
      <div className="mx-auto max-w-[1440px] xl:max-w-[1600px] 2xl:max-w-[1780px] 3xl:max-w-[1980px] 4xl:max-w-[2240px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 3xl:px-24">
        <h2 className="mb-5 text-center font-display text-xl font-bold text-primary sm:text-2xl">
          {t("home_seo.proof_title")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {references.map((reference, i) => (
            <motion.div
              key={reference.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-[22px] border border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-md sm:rounded-[26px] sm:p-6"
            >
              <a href={reference.href} className="block">
                <reference.icon className="h-5 w-5 text-secondary sm:h-6 sm:w-6" />
                <h3 className="mt-4 font-display font-bold text-primary">{reference.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{reference.description}</p>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
