import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { useTranslation } from "@/i18n/useTranslation";
import enTranslations from "@/locales/en.json";
import idTranslations from "@/locales/id.json";

const LandingPage = lazyRouteComponent(
  () => import("@/components/landing/LandingPage"),
  "LandingPage",
);

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const lang = params?.lang || "id";
    const isEn = lang === "en";

    const professionalServiceSchema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "PT Asta Digital Agency",
      alternateName: "ASTA DIGITAL AGENCY",
      url: typeof window !== "undefined" ? window.location.origin : "https://astadigitalagency.com",
      description: isEn
        ? "ASTA DIGITAL AGENCY engineers high-performance mobile applications, modern web platforms, and scalable enterprise systems."
        : "ASTA DIGITAL AGENCY membangun aplikasi mobile, website, dan sistem informasi enterprise modern untuk instansi, UMKM, dan perusahaan.",
      telephone: "+6281578223564",
      email: "astadigitech@gmail.com",
      sameAs: [
        "https://www.instagram.com/astadigitalagency/",
        "https://www.linkedin.com/in/asta-digital-agency-b9441637a/",
      ],
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Jl. Imogiri Timur, Gng. Tobanan V, dsn. Jati Rt 008, Wonokromo, Kec. Pleret",
        addressLocality: "Bantul",
        addressRegion: "D.I. Yogyakarta",
        postalCode: "55791",
        addressCountry: "ID",
      },
    };

    const faq = isEn ? enTranslations.faq : idTranslations.faq;
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [1, 2, 3, 4].map((number) => ({
        "@type": "Question",
        name: faq[`q${number}` as keyof typeof faq],
        acceptedAnswer: {
          "@type": "Answer",
          text: faq[`a${number}` as keyof typeof faq].replace(/<[^>]*>?/gm, "").trim(),
        },
      })),
    };

    return {
      meta: [
        { title: "ASTA Digital Agency — Solusi Teknologi & Digital Agency" },
        {
          name: "description",
          content: isEn
            ? "PT Asta Digital Agency builds modern applications, websites, and enterprise information systems for institutions, SMEs, schools, and corporations."
            : "PT Asta Digital Agency membangun aplikasi, website, dan sistem informasi modern untuk instansi, UMKM, sekolah, dan perusahaan.",
        },
        {
          property: "og:title",
          content: "ASTA Digital Agency — Solusi Teknologi & Digital Agency",
        },
        {
          property: "og:description",
          content: isEn
            ? "Reliable and trusted digital transformation for enterprises and growing businesses."
            : "Transformasi digital yang andal dan terpercaya untuk instansi dan bisnis.",
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(professionalServiceSchema),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(faqSchema),
        },
      ],
    };
  },
  component: Index,
});

function Index() {
  return <LandingPage />;
}
