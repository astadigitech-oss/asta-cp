import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";
import { useTranslation } from "@/i18n/useTranslation";

export const Route = createFileRoute("/$lang/")({
  head: () => ({
    meta: [
      { title: "ASTA Digital Agency — Solusi Teknologi & Digital Agency" },
      {
        name: "description",
        content:
          "PT Asta Digital Agency membangun aplikasi, website, dan sistem informasi modern untuk instansi, UMKM, sekolah, dan perusahaan.",
      },
      {
        property: "og:title",
        content: "ASTA Digital Agency — Solusi Teknologi & Digital Agency",
      },
      {
        property: "og:description",
        content:
          "Transformasi digital yang andal dan terpercaya untuk instansi dan bisnis.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <LandingPage />;
}

