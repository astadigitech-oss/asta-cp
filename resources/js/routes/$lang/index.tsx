import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";
import { useTranslation } from "@/i18n/useTranslation";

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

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: isEn
            ? "What services does ASTA DIGITAL AGENCY provide?"
            : "Apa saja layanan utama yang ditawarkan oleh ASTA DIGITAL AGENCY?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEn
              ? "ASTA DIGITAL AGENCY provides enterprise software development services including mobile app development (iOS and Android), custom modern web applications, and enterprise information systems."
              : "ASTA DIGITAL AGENCY menyediakan layanan rekayasa perangkat lunak mencakup pembuatan aplikasi mobile (Android & iOS), pengembangan web aplikasi modern, serta sistem informasi enterprise kustom.",
          },
        },
        {
          "@type": "Question",
          name: isEn
            ? "How does ASTA DIGITAL AGENCY approach system security and performance?"
            : "Bagaimana pendekatan ASTA DIGITAL AGENCY terhadap keamanan dan performa sistem?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEn
              ? "ASTA DIGITAL AGENCY implements layered security standards, strict input sanitization, automated test coverage, and high-performance clean architecture to ensure system resilience and fast response times."
              : "ASTA DIGITAL AGENCY menerapkan standar keamanan berlapis, sanitasi input ketat, pengujian otomatis, serta arsitektur clean code performa tinggi untuk menjamin ketahanan dan kecepatan respons sistem.",
          },
        },
      ],
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

