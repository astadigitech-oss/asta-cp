import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/i18n/useTranslation";
import { SectionHeading } from "../common";

export function HomeFAQ() {
  const { t } = useTranslation();

  const faqItems = [
    {
      question: t("faq.q1"),
      answer: t("faq.a1"),
    },
    {
      question: t("faq.q2"),
      answer: t("faq.a2"),
    },
    {
      question: t("faq.q3"),
      answer: t("faq.a3"),
    },
    {
      question: t("faq.q4"),
      answer: t("faq.a4"),
    },
  ];

  return (
    <section id="faq" className="relative overflow-hidden bg-surface py-6 sm:py-6 lg:py-6" itemScope itemType="https://schema.org/FAQPage">
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-ocean opacity-60" />
      <div className="mx-auto max-w-[1440px] xl:max-w-[1600px] 2xl:max-w-[1780px] 3xl:max-w-[1980px] 4xl:max-w-[2240px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 3xl:px-24">
        <div>
          <SectionHeading
            eyebrow={t("faq.eyebrow")}
            title={t("faq.title")}
            desc={t("faq.description")}
          />
        </div>

        <div
          className="mx-auto mt-12 sm:mt-16 max-w-4xl"
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="overflow-hidden rounded sm:rounded px-6 sm:px-8 transition-all duration-300"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <AccordionTrigger className="py-5 text-left font-display text-base sm:text-lg font-bold text-primary hover:underline cursor-pointer">
                  <h3 className="font-display text-base sm:text-lg font-bold text-primary inline m-0" itemProp="name">
                    {faq.question}
                  </h3>
                </AccordionTrigger>
                <AccordionContent
                  className="pb-6 pt-1 text-sm sm:text-base leading-relaxed text-muted-foreground"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground"
                    itemProp="text"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export default HomeFAQ;
