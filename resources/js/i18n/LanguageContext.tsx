import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import en from "../locales/en.json";
import id from "../locales/id.json";

import { localizeText } from "./localize";

export { localizeText };
export type Language = "en" | "id";

type TranslationDictionary = typeof en;

const dictionaries: Record<Language, TranslationDictionary> = {
  en,
  id: id as unknown as TranslationDictionary,
};

const STORAGE_KEY = "asta_lang";
const COOKIE_KEY = "asta_lang";

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Set cookie value with 1 year expiration
 */
function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Detect language based on priority:
 * 1. URL path subfolder (/id/ or /en/)
 * 2. Manual user preference (localStorage / cookie)
 * 3. Browser language (navigator.languages / navigator.language)
 * 4. Default fallback: 'id'
 */
function detectLanguage(): Language {
  if (typeof window === "undefined") return "id";

  // 1. URL Path Subfolder Detection
  const pathname = window.location.pathname;
  if (pathname.startsWith("/en") || pathname === "/en") return "en";
  if (pathname.startsWith("/id") || pathname === "/id") return "id";

  // 2. Saved manual preference
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local === "en" || local === "id") return local;
  } catch (e) {
    // Ignore localStorage errors
  }

  const cookie = getCookie(COOKIE_KEY);
  if (cookie === "en" || cookie === "id") return cookie;

  // 3. Browser Language Detection
  const browserLangs = navigator.languages || [navigator.language];
  for (const lang of browserLangs) {
    if (!lang) continue;
    const lower = lang.toLowerCase();
    if (lower.startsWith("id") || lower.startsWith("in")) {
      return "id";
    }
    if (lower.startsWith("en")) {
      return "en";
    }
  }

  // 4. Default Fallback
  return "id";
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  localize: (text?: string | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => detectLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // Ignore localStorage errors
    }
    setCookie(COOKIE_KEY, lang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;

      // Update URL subfolder path prefix gracefully
      const currentPath = window.location.pathname;
      const cleanPath = currentPath.replace(/^\/(id|en)(\/|$)/, "/");
      const targetPath = `/${lang}${cleanPath === "/" ? "" : cleanPath}`;
      if (currentPath !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
    }
  }, []);

  // Listen for browser URL navigation (popstate / back-forward)
  useEffect(() => {
    const handlePopState = () => {
      const detected = detectLanguage();
      setLanguageState(detected);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update HTML lang attribute on mount or language change
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  /**
   * Safe getter function for nested translation keys: t('nav.home')
   * Fallback chain: selected language -> English ('en') -> raw key string
   */
  const t = useCallback(
    (keyPath: string, params?: Record<string, string | number>): string => {
      const keys = keyPath.split(".");
      
      const getFromDict = (dict: any): string | null => {
        let current = dict;
        for (const k of keys) {
          if (current && typeof current === "object" && k in current) {
            current = current[k];
          } else {
            return null;
          }
        }
        return typeof current === "string" ? current : null;
      };

      // 1. Try selected dictionary
      let result = getFromDict(dictionaries[language]);

      // 2. Fallback to English dictionary if missing
      if (result === null && language !== "en") {
        result = getFromDict(dictionaries.en);
      }

      // 3. Fallback to raw keyPath if still missing
      if (result === null) {
        result = keyPath;
      }

      // Replace interpolation parameters if provided, e.g. {name} -> 'Asta'
      if (params && typeof result === "string") {
        Object.entries(params).forEach(([pKey, pVal]) => {
          result = (result as string).replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
        });
      }

      return result;
    },
    [language]
  );

  /**
   * Localize raw dynamic database strings containing [:id]...[:en]... or [id]...[/id][en]...[/en]
   */
  const localize = useCallback(
    (text?: string | null): string => {
      return localizeText(text, language);
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      localize,
    }),
    [language, setLanguage, t, localize]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
