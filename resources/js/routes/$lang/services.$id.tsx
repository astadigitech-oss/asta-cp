import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import axios from "axios";
import { localizeText } from "@/i18n/localize";
import { Language } from "@/i18n/LanguageContext";

const ServiceDetailPage = lazyRouteComponent(
  () => import("@/components/service/ServiceDetailPage"),
  "ServiceDetailPage",
);

export const Route = createFileRoute("/$lang/services/$id")({
  loader: async ({ params: { id } }) => {
    const initialData = typeof window !== "undefined" ? (window as any).__INITIAL_DATA__ : null;
    if (initialData?.service && (String(initialData.id) === String(id) || initialData.service.slug === id || String(initialData.service.id) === String(id))) {
      return initialData.service;
    }
    try {
      const res = await axios.get(`/api/services/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Detail Layanan — ASTA Digital Agency" },
          {
            name: "description",
            content:
              "Jelajahi layanan profesional ASTA Digital Agency: Web Apps, Mobile Apps, IT Consulting, dan solusi digital lainnya.",
          },
        ],
      };
    }

    const { name, short_description, seo, logo, cover_image, image } = loaderData;
    const metaTitle = seo?.meta_title || `${typeof name === "string" ? name : name?.id || name?.en || "Layanan"} — ASTA Digital Agency`;
    const metaDesc = seo?.meta_description || short_description || name;
    const ogImg = seo?.og_image || cover_image || (Array.isArray(image) ? image[0] : image) || logo || "";

    const metaTags = [
      { title: metaTitle },
      { name: "description", content: typeof metaDesc === "string" ? metaDesc.replace(/<[^>]*>?/gm, "") : metaTitle },
      { name: "robots", content: seo?.robots || "index, follow" },
      { property: "og:type", content: seo?.og_type || "website" },
      { property: "og:title", content: seo?.og_title || metaTitle },
      { property: "og:description", content: seo?.og_description || (typeof metaDesc === "string" ? metaDesc.replace(/<[^>]*>?/gm, "") : metaTitle) },
      { property: "twitter:card", content: "summary_large_image" },
      { property: "twitter:title", content: seo?.twitter_title || metaTitle },
      { property: "twitter:description", content: seo?.twitter_description || (typeof metaDesc === "string" ? metaDesc.replace(/<[^>]*>?/gm, "") : metaTitle) },
    ];

    if (ogImg) {
      metaTags.push(
        { property: "og:image", content: ogImg },
        { property: "twitter:image", content: ogImg }
      );
    }

    if (seo?.keywords) {
      metaTags.push({ name: "keywords", content: seo.keywords });
    }

    const links: Array<{ rel: string; href: string }> = [];
    if (seo?.canonical_url) {
      links.push({ rel: "canonical", href: seo.canonical_url });
    }

    const scripts: Array<{ type: string; children: string }> = [];

    const currentLang = (params?.lang || "id") as Language;
    const pageUrl = seo?.canonical_url || `https://astadigitalagency.com/${currentLang}/services/${loaderData.slug || loaderData.id}`;

    // 1. Service Schema
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: metaTitle,
      description: typeof metaDesc === "string" ? metaDesc.replace(/<[^>]*>?/gm, "") : metaTitle,
      image: ogImg,
      inLanguage: currentLang,
      provider: {
        "@type": "Organization",
        name: "PT Asta Digital Agency",
        logo: {
          "@type": "ImageObject",
          url: "/images/logo-dark.png",
        },
      },
      url: pageUrl,
    };

    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify(serviceSchema),
    });

    // 2. BreadcrumbList Schema for Rich Search & GEO
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: currentLang === "en" ? "Home" : "Beranda",
          item: `https://astadigitalagency.com/${currentLang}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: currentLang === "en" ? "Services" : "Layanan",
          item: `https://astadigitalagency.com/${currentLang}/services`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: typeof name === "string" ? name : name?.[currentLang] || name?.id || name?.en || "Service",
          item: pageUrl,
        },
      ],
    };

    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify(breadcrumbSchema),
    });

    // 3. FAQPage Schema for AI/LLM & GEO Search Engines
    const rawFaqs = Array.isArray(loaderData.faqs)
      ? loaderData.faqs
      : typeof loaderData.faqs === "string"
      ? (() => {
          try {
            return JSON.parse(loaderData.faqs);
          } catch {
            return [];
          }
        })()
      : [];

    if (rawFaqs.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: rawFaqs.map((faq: { question?: any; answer?: any }) => ({
          "@type": "Question",
          name: localizeText(faq?.question, currentLang),
          acceptedAnswer: {
            "@type": "Answer",
            text: localizeText(faq?.answer, currentLang).replace(/<[^>]*>?/gm, "").trim(),
          },
        })),
      };

      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify(faqSchema),
      });
    }

    if (seo?.schema_jsonld) {
      const jsonLdString =
        typeof seo.schema_jsonld === "string"
          ? seo.schema_jsonld
          : JSON.stringify(seo.schema_jsonld);

      scripts.push({
        type: "application/ld+json",
        children: jsonLdString,
      });
    }

    return {
      meta: metaTags,
      links,
      scripts,
    };
  },
  component: ServiceDetailPage,
});
