import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import axios from "axios";

const ServiceDetailPage = lazyRouteComponent(
  () => import("@/components/service/ServiceDetailPage"),
  "ServiceDetailPage",
);

export const Route = createFileRoute("/$lang/services/$id")({
  loader: async ({ params: { id } }) => {
    const initialData = typeof window !== "undefined" ? (window as any).__INITIAL_DATA__ : null;
    if (initialData?.service && (String(initialData.id) === String(id) || String(initialData.service.id) === String(id))) {
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

    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: metaTitle,
      description: typeof metaDesc === "string" ? metaDesc.replace(/<[^>]*>?/gm, "") : metaTitle,
      image: ogImg,
      inLanguage: params?.lang || "id",
      provider: {
        "@type": "Organization",
        name: "PT Asta Digital Agency",
        logo: {
          "@type": "ImageObject",
          url: "/images/logo-dark.png",
        },
      },
      ...(seo?.canonical_url ? { url: seo.canonical_url } : {}),
    };

    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify(serviceSchema),
    });

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
