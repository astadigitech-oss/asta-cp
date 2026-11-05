import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";
import { useTranslation } from "@/i18n/useTranslation";
import enTranslations from "@/locales/en.json";
import idTranslations from "@/locales/id.json";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const lang = params?.lang || "id";
    const isEn = lang === "en";
    const initialData = typeof window !== "undefined"
      ? (window as Window & {
        __INITIAL_DATA__?: {
          socialLinks?: Record<string, string | null>;
          agencyGeo?: { latitude: number; longitude: number } | null;
        };
      }).__INITIAL_DATA__
      : undefined;
    const socialLinks = Object.values(initialData?.socialLinks ?? {}).filter(
      (url): url is string => typeof url === "string" && url !== "",
    );

    const professionalServiceSchema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "PT Asta Digital Agency",
      alternateName: "ASTA DIGITAL AGENCY",
      url: typeof window !== "undefined" ? window.location.origin : "https://astadigitalagency.com",
      description: isEn ? enTranslations.meta.description : idTranslations.meta.description,
      telephone: "+6281578223564",
      email: "cs@astadigitalagency.com",
      sameAs: [
        "https://www.instagram.com/astadigitalagency/",
        "https://www.linkedin.com/company/asta-digital-agency/",
        "https://share.google/mde5DANqT5rDfNKfO",
        ...socialLinks,
      ],
      foundingDate: "2022",
      areaServed: [
        { "@type": "City", name: "Yogyakarta" },
        { "@type": "Country", name: "Indonesia" },
      ],
      openingHoursSpecification: [{
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      }],
      ...(initialData?.agencyGeo ? {
        geo: {
          "@type": "GeoCoordinates",
          ...initialData.agencyGeo,
        },
      } : {}),
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
