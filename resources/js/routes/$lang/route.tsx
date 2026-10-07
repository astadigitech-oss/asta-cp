import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation, Language } from "@/i18n/useTranslation";

export const Route = createFileRoute("/$lang")({
  // Validasi: hanya izinkan 'id' dan 'en', redirect ke /id jika tidak valid
  beforeLoad: ({ params }) => {
    const validLangs = ["id", "en"];
    if (!validLangs.includes(params.lang)) {
      throw redirect({ to: "/$lang", params: { lang: "id" }, replace: true });
    }
  },
  component: LangLayout,
});

function LangLayout() {
  const { lang } = Route.useParams();
  const { setLanguage, language } = useTranslation();

  // Sinkronisasi bahasa dari URL ke LanguageContext
  useEffect(() => {
    const targetLang = lang as Language;
    if (targetLang !== language) {
      setLanguage(targetLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return <Outlet />;
}

