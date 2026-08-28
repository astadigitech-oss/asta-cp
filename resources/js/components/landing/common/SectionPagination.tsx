import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";

export interface SectionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SectionPagination({ currentPage, totalPages, onPageChange }: SectionPaginationProps) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-9 rounded-full border-primary/20 bg-white/80 px-4 text-xs font-semibold text-primary hover:bg-white disabled:opacity-40 cursor-pointer shadow-sm"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        {t("common.previous")}
      </Button>

      <div className="flex flex-wrap items-center gap-1.5 px-2">
        {getPageNumbers().map((page, idx) =>
          typeof page === "number" ? (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-9 w-9 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentPage === page
                  ? "bg-[#004AAD] text-white shadow-md scale-105"
                  : "border border-primary/15 bg-white/70 text-primary/70 hover:bg-white hover:text-primary"
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground select-none">
              ...
            </span>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-9 rounded-full border-primary/20 bg-white/80 px-4 text-xs font-semibold text-primary hover:bg-white disabled:opacity-40 cursor-pointer shadow-sm"
      >
        {t("common.next")}
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

