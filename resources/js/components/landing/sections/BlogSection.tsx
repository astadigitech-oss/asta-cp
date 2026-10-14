import { motion } from "motion/react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowRight, Calendar, User, BookOpen } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { SectionHeading } from "../common";
import { ArticleItem } from "@/hooks/useLandingData";

interface BlogSectionProps {
  articlesList?: ArticleItem[];
}


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

  // Sembunyikan section kalau tidak ada artikel dari API
  if (!articlesList || articlesList.length === 0) return null;

  const articlesToDisplay = articlesList.slice(0, 3);

  return (
    <section id="blog" className="relative py-12 sm:py-16 lg:py-20 bg-gray-50/50">
      <div className="mx-auto max-w-[1440px] xl:max-w-[1600px] 2xl:max-w-[1780px] 3xl:max-w-[1980px] 4xl:max-w-[2240px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 3xl:px-24">

        {/* Header — centered seperti section lain */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pb-4"
        >
          <SectionHeading
            center={true}
            eyebrow={t("blog.eyebrow")}
            title={t("blog.title")}
            desc={t("blog.description")}
          />
        </motion.div>

        {/* View All Button — di bawah heading, rata tengah */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mt-4 mb-2"
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


      </div>
    </section>
  );
}

