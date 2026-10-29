import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface ExecutiveSummaryProps {
  summary?: Array<{ point?: string } | string> | null;
  className?: string;
}

export function ExecutiveSummary({ summary, className = "" }: ExecutiveSummaryProps) {
  const { t, localize } = useTranslation();

  if (!summary || !Array.isArray(summary) || summary.length === 0) {
    return null;
  }

  // Format bold markdown (**text**) menjadi <strong>
  const renderFormattedPoint = (rawPoint: string) => {
    const localized = localize(rawPoint);
    const parts = localized.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-bold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div
      className={`my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border border-blue-200/80 shadow-[0_4px_20px_rgb(0,74,173,0.06)] relative overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-primary text-white shadow-xs">
          <Sparkles className="h-4 w-4" />
        </span>
        <h2 className="text-sm sm:text-base font-bold text-primary uppercase tracking-wider">
          {t("blog.tldr_title")}
        </h2>
      </div>

      <ul className="space-y-3.5">
        {summary.map((item, idx) => {
          const pointText = typeof item === "string" ? item : (item.point || "");
          if (!pointText) return null;

          return (
            <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-gray-700 leading-relaxed">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 break-words">{renderFormattedPoint(pointText)}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

