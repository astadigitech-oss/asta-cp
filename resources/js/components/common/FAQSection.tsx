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
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 text-primary">
          <HelpCircle className="h-4 w-4" />
        </span>
        <span className="text-xs font-bold text-primary uppercase tracking-widest">
          FAQ
        </span>
      </div>

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
              className="border border-gray-200/80 rounded-2xl px-5 bg-white shadow-xs data-[state=open]:border-primary/40 data-[state=open]:shadow-md transition-all"
            >
              <AccordionTrigger className="text-left font-semibold text-base text-gray-900 hover:text-primary hover:no-underline py-4">
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

