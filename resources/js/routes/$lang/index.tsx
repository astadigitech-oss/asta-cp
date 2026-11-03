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
        { title: isEn ? enTranslations.meta.title : idTranslations.meta.title },
        {
          name: "description",
          content: isEn ? enTranslations.meta.description : idTranslations.meta.description,
        },
        {
          property: "og:title",
          content: isEn ? enTranslations.meta.og_title : idTranslations.meta.og_title,
        },
        {
          property: "og:description",
          content: isEn ? enTranslations.meta.og_description : idTranslations.meta.og_description,
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
