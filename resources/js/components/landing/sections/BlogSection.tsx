import { motion } from "motion/react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowRight, Calendar, User, BookOpen } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { SectionHeading } from "../common";
import { ArticleItem } from "@/hooks/useLandingData";
import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";

interface BlogSectionProps {
  articlesList?: ArticleItem[];
}

const defaultArticles: ArticleItem[] = [
  {
    id: 1,
    title: {
      id: "Mengapa Bisnis Anda Membutuhkan Sistem Digital Terintegrasi?",
      en: "Why Your Business Needs an Integrated Digital System",
    },
    slug: "mengapa-bisnis-butuh-sistem-digital-terintegrasi",
    thumbnail: p1,
    excerpt: {
      id: "Pelajari bagaimana integrasi sistem informasi, ERP, dan aplikasi mobile dapat meningkatkan efisiensi operasional bisnis secara signifikan.",
      en: "Learn how integrating information systems, ERP, and mobile apps can significantly improve business operational efficiency.",
    },
    author: "ASTA Tech Team",
    category: "Technology",
    published_at: "10 Okt 2026",
  },
  {
    id: 2,
    title: {
      id: "ERP Modern: Solusi Pengelolaan Bisnis dalam Satu Platform Terpadu",
      en: "Modern ERP: All-in-One Business Management Solution",
    },
    slug: "erp-modern-solusi-pengelolaan-bisnis-terpadu",
    thumbnail: p2,
    excerpt: {
      id: "Mengintegrasikan proses keuangan, inventaris, dan SDM ke dalam satu dasbor analitik real-time yang aman dan terukur.",
      en: "Integrating finance, inventory, and HR processes into a single secure, real-time scalable analytics dashboard.",
    },
    author: "ASTA Tech Team",
    category: "Enterprise",
    published_at: "08 Okt 2026",
  },
  {
    id: 3,
    title: {
      id: "Kapan Bisnis Anda Harus Beralih ke Custom Software Development?",
      en: "When Should Your Business Switch to Custom Software Development?",
    },
    slug: "kapan-bisnis-harus-beralih-ke-custom-software",
    thumbnail: p3,
    excerpt: {
      id: "Temukan tanda-tanda ketika software siap pakai sudah tidak lagi mampu mendukung pertumbuhan dan alur kerja unik perusahaan Anda.",
      en: "Discover key signs when off-the-shelf software can no longer accommodate your company's growth and unique workflows.",
    },
    author: "ASTA Tech Team",
    category: "Development",
    published_at: "05 Okt 2026",
  },
];

const stripHtml = (html?: string | null): string => {
  if (!html) return "";
  return html
    .replace(/<\/(p|h[1-6]|li|blockquote|div|br)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

export function BlogSection({ articlesList }: BlogSectionProps) {
  const { t, localize, language } = useTranslation();
  const params = useParams({ strict: false }) as Record<string, string>;
  const lang = params?.lang || language || "id";

  const rawArticles =
    articlesList && articlesList.length > 0 ? articlesList : defaultArticles;
  const articlesToDisplay = rawArticles.slice(0, 3);

  return (
    <section id="blog" className="relative py-12 sm:py-16 lg:py-20 bg-gray-50/50">
      <div className="mx-auto max-w-[1440px] xl:max-w-[1600px] 2xl:max-w-[1780px] 3xl:max-w-[1980px] 4xl:max-w-[2240px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 3xl:px-24">
        
        {/* Header with Title and "View All" Button */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1"
          >
            <SectionHeading
              center={false}
              eyebrow={t("blog.eyebrow")}
              title={t("blog.title")}
              desc={t("blog.description")}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden sm:block shrink-0"
          >
            <Link
              to="/$lang/blog"
              params={{ lang }}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:border-[#004AAD] hover:bg-blue-50/50 hover:text-[#004AAD] transition-all cursor-pointer group"
            >
              <span>{t("blog.view_all")}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-[#004AAD]" />
            </Link>
          </motion.div>
        </div>

        {/* 3 Articles Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {articlesToDisplay.map((article, index) => {
            const localizedTitle = localize(article.title);
            const localizedExcerpt = stripHtml(localize(article.excerpt));
            const category = article.category || "Technology";

            return (
              <motion.article
                key={article.id || index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-200"
              >
                <div>
                  {/* Thumbnail & Category Badge */}
                  <Link
                    to="/$lang/$slug"
                    params={{ slug: article.slug, lang }}
                    className="block aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100 relative mb-4 cursor-pointer"
                  >
                    {article.thumbnail ? (
                      <img
                        src={article.thumbnail}
                        alt={localizedTitle}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#004AAD]/10 to-[#38B6FF]/20 text-[#004AAD]">
                        <BookOpen className="h-10 w-10 opacity-50" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 rounded-md bg-[#004AAD]/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs">
                      {category}
                    </span>
                  </Link>

                  {/* Metadata (Date & Author) */}
                  <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500 mb-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {article.published_at}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{article.author || "ASTA Team"}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <Link
                    to="/$lang/$slug"
                    params={{ slug: article.slug, lang }}
                    className="block group/title cursor-pointer"
                  >
                    <h3 className="font-display text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover/title:text-[#004AAD] transition-colors">
                      {localizedTitle}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  {localizedExcerpt && (
                    <p className="mt-2 text-xs leading-relaxed text-gray-600 line-clamp-3">
                      {localizedExcerpt}
                    </p>
                  )}
                </div>

                {/* Read More Link */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    to="/$lang/$slug"
                    params={{ slug: article.slug, lang }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004AAD] group-hover:gap-2.5 transition-all cursor-pointer"
                  >
                    <span>{t("blog.read_more")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            to="/$lang/blog"
            params={{ lang }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#004AAD] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <span>{t("blog.view_all")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

