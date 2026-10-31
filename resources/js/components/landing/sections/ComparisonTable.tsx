import { motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { SectionHeading } from "../common";

export function ComparisonTable() {
  const { t } = useTranslation();

  const comparisonRows = [
    {
      param: t("comparison.row_1_param"),
      asta: t("comparison.row_1_asta"),
      traditional: t("comparison.row_1_traditional"),
    },
    {
      param: t("comparison.row_2_param"),
      asta: t("comparison.row_2_asta"),
      traditional: t("comparison.row_2_traditional"),
    },
    {
      param: t("comparison.row_3_param"),
      asta: t("comparison.row_3_asta"),
      traditional: t("comparison.row_3_traditional"),
    },
    {
      param: t("comparison.row_4_param"),
      asta: t("comparison.row_4_asta"),
      traditional: t("comparison.row_4_traditional"),
    },
  ];

  return (
    <section id="komparasi" className="relative overflow-hidden bg-surface py-6 sm:py-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-ocean opacity-60" />
      <div className="mx-auto max-w-[1440px] xl:max-w-[1600px] 2xl:max-w-[1780px] 3xl:max-w-[1980px] 4xl:max-w-[2240px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 3xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            eyebrow={t("comparison.eyebrow")}
            title={t("comparison.title")}
            desc={t("comparison.description")}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 sm:mt-16 overflow-hidden rounded-[28px] sm:rounded-[32px] border border-white/60 bg-white/75 sm:bg-white/80 shadow-glass backdrop-blur-md"
        >
          <div className="overflow-x-auto [scrollbar-width:none]">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/80 bg-gradient-to-r from-blue-50/50 via-white/40 to-slate-50/50 text-xs sm:text-sm">
                  <th className="py-5 px-6 font-display font-bold uppercase tracking-wider text-primary w-[28%]">
                    {t("comparison.col_parameter")}
                  </th>
                  <th className="py-5 px-6 font-display font-bold uppercase tracking-wider text-primary bg-primary/5 border-x border-white/80 w-[42%]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <span>{t("comparison.col_asta")}</span>
                    </div>
                  </th>
                  <th className="py-5 px-6 font-display font-bold uppercase tracking-wider text-muted-foreground w-[30%]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                        <XCircle className="h-4 w-4" />
                      </span>
                      <span>{t("comparison.col_traditional")}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/90 text-xs sm:text-sm">
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="transition-colors hover:bg-blue-50/20"
                  >
                    <td className="py-5 px-6 font-display font-bold text-primary align-top">
                      {row.param}
                    </td>
                    <td className="py-5 px-6 text-foreground bg-primary/[0.02] border-x border-white/60 leading-relaxed font-medium align-top">
                      {row.asta}
                    </td>
                    <td className="py-5 px-6 text-muted-foreground leading-relaxed align-top">
                      {row.traditional}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ComparisonTable;
