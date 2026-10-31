import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  description?: string;
  faqs?: FAQItem[];
  className?: string;
}

export function FAQSection({
  title,
  description,
  faqs,
  className = "",
}: FAQSectionProps) {
  const { t, localize } = useTranslation();

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const defaultTitle = t("blog.faq_title");

  return (
    <section className={`my-12 sm:my-16 ${className}`}>
      {/* <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 text-primary">
          <HelpCircle className="h-4 w-4" />
        </span>
        <span className="text-xs font-bold text-primary uppercase tracking-widest">
          FAQ
        </span>
      </div> */}

      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
        {title || defaultTitle}
      </h2>

      {description && (
        <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>
      )}

      <Accordion type="single" collapsible className="w-full space-y-3">
        {faqs.map((faq, index) => {
          const q = localize(faq.question);
          const a = localize(faq.answer);

          return (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="overflow-hidden rounded sm:rounded px-6 sm:px-8 transition-all duration-300"
            >
              <AccordionTrigger className="py-5 text-left font-display text-base sm:text-lg font-bold text-primary hover:underline cursor-pointer">
                {q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-sm sm:text-base leading-relaxed pb-4 pt-1">
                <div
                  className="prose prose-sm max-w-none text-gray-600 break-words"
                  dangerouslySetInnerHTML={{ __html: a }}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}

