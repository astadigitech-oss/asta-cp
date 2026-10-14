import { createFileRoute } from "@tanstack/react-router";
import { BlogDetailPage } from "@/components/blog/BlogDetailPage";
import { localizeText } from "@/i18n/localize";
import { Language } from "@/i18n/LanguageContext";
import axios from "axios";

export const Route = createFileRoute("/$lang/$slug")({
  loader: async ({ params: { slug } }) => {
    try {
      const res = await axios.get(`/api/articles/${slug}`);
      return res.data;
    } catch {
      return null;
    }
  },
  head: ({ loaderData, params }) => {
    const lang = (params?.lang || "id") as Language;

    if (!loaderData) {
      return {
        meta: [
          { title: lang === "en" ? "Article Not Found — ASTA Digital Agency" : "Artikel Tidak Ditemukan — ASTA Digital Agency" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }

    const { title, excerpt, seo, thumbnail } = loaderData;
    const localizedTitle = localizeText(title, lang);
    const localizedExcerpt = localizeText(excerpt, lang);

    const metaTitle = localizeText(seo?.meta_title, lang) || `${localizedTitle} — ASTA Digital Agency`;
    const metaDesc = localizeText(seo?.meta_description, lang) || localizedExcerpt || localizedTitle;
    const ogImage = seo?.og_image || thumbnail || "";
    const canonical = seo?.canonical_url || "";

    const ogTitle = localizeText(seo?.og_title, lang) || metaTitle;
    const ogDesc = localizeText(seo?.og_description, lang) || metaDesc;
    const twitterTitle = localizeText(seo?.twitter_title, lang) || metaTitle;
    const twitterDesc = localizeText(seo?.twitter_description, lang) || metaDesc;
    const keywords = localizeText(seo?.keywords, lang);

    const metaTags = [
      { title: metaTitle },
      { name: "description", content: metaDesc },
      { name: "robots", content: seo?.robots || "index, follow" },
      { property: "og:type", content: seo?.og_type || "article" },
      { property: "og:title", content: ogTitle },
      { property: "og:description", content: ogDesc },
      { property: "twitter:card", content: "summary_large_image" },
      { property: "twitter:title", content: twitterTitle },
      { property: "twitter:description", content: twitterDesc },
    ];

    if (ogImage) {
      metaTags.push(
        { property: "og:image", content: ogImage },
        { property: "twitter:image", content: ogImage }
      );
    }

    if (keywords) {
      metaTags.push({ name: "keywords", content: keywords });
    }

    const links: Array<{ rel: string; href: string }> = [];
    if (canonical) {
      links.push({ rel: "canonical", href: canonical });
    }

    // Inject JSON-LD Schema if available from Rankbeam
    const scripts: Array<{ type: string; children: string }> = [];
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
  component: BlogDetailPage,
});

