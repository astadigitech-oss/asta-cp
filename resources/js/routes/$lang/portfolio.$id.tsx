import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import axios from "axios";

const PortfolioDetailPage = lazyRouteComponent(
  () => import("@/components/portfolio/PortfolioDetailPage"),
  "PortfolioDetailPage",
);

export const Route = createFileRoute("/$lang/portfolio/$id")({
  loader: async ({ params: { id } }) => {
    const initialData = typeof window !== "undefined" ? (window as any).__INITIAL_DATA__ : null;
    if (initialData?.portfolio && (String(initialData.id) === String(id) || String(initialData.portfolio.id) === String(id))) {
      return initialData.portfolio;
    }
    try {
      const res = await axios.get(`/api/portfolios/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Detail Portofolio — ASTA Digital Agency" },
          {
            name: "description",
            content:
              "Jelajahi portofolio proyek digital, aplikasi mobile, dan sistem informasi yang dibangun oleh ASTA Digital Agency.",
          },
        ],
      };
    }

    const { name, description, seo, image, image_small, type } = loaderData;
    const metaTitle = seo?.meta_title || `${name} — Portofolio ASTA Digital Agency`;
    const cleanDesc = typeof description === "string" ? description.replace(/<[^>]*>?/gm, "").trim() : "";
    const metaDesc = seo?.meta_description || (cleanDesc ? cleanDesc.slice(0, 160) : metaTitle);
    const ogImg = seo?.og_image || image || image_small || "";

    const metaTags = [
      { title: metaTitle },
      { name: "description", content: metaDesc },
      { name: "robots", content: seo?.robots || "index, follow" },
      { property: "og:type", content: seo?.og_type || "website" },
      { property: "og:title", content: seo?.og_title || metaTitle },
      { property: "og:description", content: seo?.og_description || metaDesc },
      { property: "twitter:card", content: "summary_large_image" },
      { property: "twitter:title", content: seo?.twitter_title || metaTitle },
      { property: "twitter:description", content: seo?.twitter_description || metaDesc },
    ];

    if (ogImg) {
      metaTags.push(
        { property: "og:image", content: ogImg },
        { property: "twitter:image", content: ogImg }
      );
    }

    const links: Array<{ rel: string; href: string }> = [];
    if (seo?.canonical_url) {
      links.push({ rel: "canonical", href: seo.canonical_url });
    }

    const scripts: Array<{ type: string; children: string }> = [];

    const isMobile = type === "mobile";
    const appSchema = {
      "@context": "https://schema.org",
      "@type": isMobile ? "MobileApplication" : "SoftwareApplication",
      name: name,
      description: metaDesc,
      applicationCategory: isMobile ? "MobileApp" : "BusinessApplication",
      operatingSystem: isMobile ? "Android, iOS" : "Web, Windows, macOS",
      image: ogImg,
      inLanguage: params?.lang || "id",
      author: {
        "@type": "Organization",
        name: "PT Asta Digital Agency",
        url: "https://astadigital.id",
      },
      ...(seo?.canonical_url ? { url: seo.canonical_url } : {}),
      ...(loaderData.demo_url ? { sameAs: loaderData.demo_url } : {}),
    };

    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify(appSchema),
    });

    return {
      meta: metaTags,
      links,
      scripts,
    };
  },
  component: PortfolioDetailPage,
});
