import { createFileRoute } from "@tanstack/react-router";
import { DiscoverDetailPage } from "@/components/discover/DiscoverDetailPage";
import axios from "axios";

export const Route = createFileRoute("/$lang/discover/$id")({
  loader: async ({ params: { id } }) => {
    try {
      const res = await axios.get(`/api/discovers/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Detail Wawasan & Berita — ASTA Digital Agency" },
          {
            name: "description",
            content:
              "Jelajahi inovasi, cerita perkembangan teknologi, dan wawasan industri dari ASTA Digital Agency.",
          },
        ],
      };
    }

    const { name, short_description, seo, image } = loaderData;
    const metaTitle = seo?.meta_title || `${name} — ASTA Digital Agency`;
    const metaDesc = seo?.meta_description || short_description || name;
    const ogImg = seo?.og_image || (Array.isArray(image) ? image[0] : image) || "";

    const metaTags = [
      { title: metaTitle },
      { name: "description", content: typeof metaDesc === "string" ? metaDesc.replace(/<[^>]*>?/gm, "") : name },
      { name: "robots", content: seo?.robots || "index, follow" },
      { property: "og:type", content: seo?.og_type || "article" },
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

    if (seo?.keywords) {
      metaTags.push({ name: "keywords", content: seo.keywords });
    }

    const links: Array<{ rel: string; href: string }> = [];
    if (seo?.canonical_url) {
      links.push({ rel: "canonical", href: seo.canonical_url });
    }

    return {
      meta: metaTags,
      links,
    };
  },
  component: DiscoverDetailPage,
});
