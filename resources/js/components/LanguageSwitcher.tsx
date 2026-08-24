import React from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation, Language } from "../i18n/useTranslation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useTranslation();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "id", label: "Indonesia", flag: "🇮🇩" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#004AAD] transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-[#004AAD]/20 ${className}`}
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-[#004AAD]" />
        <span className="uppercase tracking-wider font-bold">{language}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36 bg-white z-[120]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center justify-between text-xs cursor-pointer font-medium px-3 py-2 ${
              language === lang.code ? "bg-blue-50 text-[#004AAD] font-semibold" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </span>
            {language === lang.code && <Check className="w-3.5 h-3.5 text-[#004AAD]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
