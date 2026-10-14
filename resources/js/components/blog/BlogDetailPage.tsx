import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "motion/react";
import {
  Calendar,
  Clock,
  Share2,
  Check,
  ArrowLeft,
  Tag,
  Home,
  ChevronRight,
  BookOpen,
  ChevronLeft,
  Image as ImageIcon,
  ZoomIn,
  Maximize2,
  X,
  Sparkles,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { useTranslation } from "@/i18n/useTranslation";
import { getYoutubeEmbedUrl } from "@/components/lib/utils";

const Footer = lazy(() => import("@/components/landing/sections/Footer").then((m) => ({ default: m.Footer })));

interface ContentSection {
  media_type?: "image" | "video" | "none";
  image?: string | null;
  video_url?: string | null;
  description?: string;
}

interface ArticleDetailData {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  images?: string[];
  excerpt: string | null;
  body: string | null;
  content_sections?: ContentSection[];
  author: string;
  category: string;
  published_at: string;
  published_at_iso?: string;
  updated_at_iso?: string;
  seo?: {
    meta_title?: string;
    meta_description?: string;
    canonical_url?: string;
    robots?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    og_type?: string;
    twitter_card?: string;
    twitter_title?: string;
    twitter_description?: string;
    twitter_image?: string;
    keywords?: string;
    schema_jsonld?: Record<string, any> | string;
  };
}

export function BlogDetailPage() {
  const { slug, lang } = useParams({ strict: false }) as { slug?: string; lang?: string };
  const { t, localize } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<{ src: string; title?: string } | null>(null);
  const contentTopRef = useRef<HTMLDivElement>(null);

  // Scroll to top saat berpindah slug
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setActiveImgIndex(0);
  }, [slug]);

  // Fetch article data dari API
  const { data: article, isLoading, isError } = useQuery<ArticleDetailData>({
    queryKey: ["article", slug],
    queryFn: async () => {
      const targetSlug = encodeURIComponent(slug || "");
      const res = await axios.get(`/api/articles/${targetSlug}`);
      return res.data;
    },
    enabled: !!slug,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 menit cache
  });

  const localizedTitle = article ? localize(article.title) : "";
  const localizedExcerpt = article?.excerpt ? localize(article.excerpt) : null;
  const localizedBody = article?.body ? localize(article.body) : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success(lang === "en" ? "Link copied to clipboard!" : "Tautan berhasil disalin!");
    setTimeout(() => setCopied(false), 2500);
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = localizedTitle || "ASTA Digital Agency Article";

  const images = article?.images && article.images.length > 0
    ? article.images
    : article?.thumbnail
      ? [article.thumbnail]
      : [];

  const currentCover = images[activeImgIndex] || null;
  const hasMultipleImages = images.length > 1;
  const sections = article?.content_sections || [];

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-gray-900 font-sans selection:bg-primary/20 selection:text-primary flex flex-col justify-between">
      <Toaster position="top-right" richColors />

      {/* ── 1. Header / Navbar Asli ────────────────────────────── */}
      <Navbar />

      {/* ── 2. Blog Main Container ─────────────────────────────── */}
      <main className="flex-1 w-full pt-28 pb-20 sm:pt-32 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1080px]">
          {/* Breadcrumb Navigation Bar */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 mb-8 pb-4 border-b border-gray-200/80"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/$lang"
                params={{ lang: lang || "id" }}
                className="flex items-center gap-1 font-medium hover:text-primary transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                <span>{lang === "en" ? "Home" : "Beranda"}</span>
              </Link>
              <span>/</span>
              <Link
                to="/$lang"
                params={{ lang: lang || "id" }}
                className="font-medium hover:text-primary transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5 inline mr-1" />
                <span>{lang === "en" ? "Articles & Insights" : "Artikel & Wawasan"}</span>
              </Link>
              <span>/</span>
              <span className="font-bold text-gray-800 line-clamp-1 max-w-[200px] sm:max-w-[350px]">
                {localizedTitle || slug}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 h-8 rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-primary shadow-xs transition-all cursor-pointer"
                title="Salin Tautan"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">{lang === "en" ? "Copied" : "Tersalin"}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span>{lang === "en" ? "Share" : "Bagikan"}</span>
                  </>
                )}
              </button>

              <Link
                to="/$lang"
                params={{ lang: lang || "id" }}
                className="inline-flex items-center gap-1.5 h-8 rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-primary shadow-xs transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{lang === "en" ? "Back" : "Kembali"}</span>
              </Link>
            </div>
          </motion.nav>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-[0_10px_40px_rgb(0,0,0,0.04)] border border-gray-100 animate-pulse space-y-6">
              <div className="h-6 w-32 bg-gray-200 rounded-full" />
              <div className="h-12 w-3/4 bg-gray-200 rounded-2xl" />
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
              <div className="h-96 w-full bg-gray-200 rounded-3xl" />
              <div className="space-y-3 pt-6">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-md border border-gray-100">
              <div className="h-16 w-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                404
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {lang === "en" ? "Article Not Found" : "Artikel Tidak Ditemukan"}
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                {lang === "en"
                  ? "The article you are looking for might have been moved or is no longer published."
                  : "Artikel yang Anda cari mungkin telah dipindahkan atau belum dipublikasikan."}
              </p>
              <div className="mt-6">
                <Link
                  to="/$lang"
                  params={{ lang: lang || "id" }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{lang === "en" ? "Back to Home" : "Kembali ke Beranda"}</span>
                </Link>
              </div>
            </div>
          )}

          {/* Main Article Content Card */}
          {article && (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-[0_10px_40px_rgb(0,0,0,0.04)] border border-gray-100/90"
            >
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-bold text-primary uppercase tracking-wider shadow-xs">
                  <Tag className="h-3.5 w-3.5" />
                  {localize(article.category) || "SEO & Technology"}
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  <Calendar className="h-3.5 w-3.5 text-gray-500" />
                  {article.published_at}
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  {lang === "en" ? "Official Post" : "Artikel Resmi"}
                </span>
              </div>

              {/* Main Title */}
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.2] text-gray-900 tracking-tight">
                {localizedTitle}
              </h1>

              {/* Author & Timestamp Bar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    ASTA
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{article.author || "ASTA Digital Editorial"}</div>
                    <div className="text-[11px] text-gray-400">ASTA Digital Agency</div>
                  </div>
                </div>
              </div>

              {/* ── Dynamic Cover Banner & Carousel Slider ────────────── */}
              {currentCover && (
                <div className="mt-8 w-full">
                  <div
                    onClick={() => currentCover && setPreviewImage({ src: currentCover, title: localizedTitle })}
                    className="group/cimg relative w-full aspect-[16/9] overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-900 border border-gray-100 shadow-md cursor-zoom-in"
                  >
                    <img
                      src={currentCover}
                      alt={localizedTitle}
                      fetchPriority="high"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover/cimg:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cimg:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-lg">
                        <ZoomIn className="h-4 w-4" /> {lang === "en" ? "Click to Fullscreen" : "Klik untuk Perbesar"}
                      </span>
                    </div>

                    {/* Multiple Image Carousel Navigation */}
                    {hasMultipleImages && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
                          }}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-lg transition-all active:scale-95 cursor-pointer"
                          title="Previous Image"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImgIndex((prev) => (prev + 1) % images.length);
                          }}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-lg transition-all active:scale-95 cursor-pointer"
                          title="Next Image"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>

                        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium border border-white/20">
                          <ImageIcon className="h-3.5 w-3.5" />
                          <span>{activeImgIndex + 1} / {images.length}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between px-1 text-xs text-gray-500 italic">
                    <span>{localizedTitle}</span>
                    <span
                      onClick={() => setPreviewImage({ src: currentCover, title: localizedTitle })}
                      className="text-primary font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <Maximize2 className="h-3.5 w-3.5" /> {lang === "en" ? "Enlarge Image" : "Lihat Gambar Penuh"}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Lead Excerpt / Short Intro ───────────────────────── */}
              <div ref={contentTopRef} className="mt-8 space-y-6">
                {localizedExcerpt && (
                  <div
                    className="prose prose-blue max-w-none text-gray-800 text-lg sm:text-xl leading-relaxed font-medium border-l-4 border-primary pl-5 py-3 bg-blue-50/50 rounded-r-2xl shadow-xs"
                    dangerouslySetInnerHTML={{ __html: localizedExcerpt }}
                  />
                )}

                {/* ── Modular Dynamic Content Sections (Gambar + Teks Berurutan) ── */}
                {sections.length > 0 && (
                  <div className="space-y-10 pt-4">
                    {sections.map((section, sIdx) => {
                      const sectionIndex = sIdx + 1;
                      const embedUrl = section.video_url ? getYoutubeEmbedUrl(section.video_url) : null;
                      const isVideo = section.media_type === "video" || Boolean(embedUrl);

                      return (
                        <section key={sIdx} className="space-y-4 pt-2">
                          <div className="flex items-center gap-2">
                            <span className="h-6 px-3 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-xs">
                              {lang === "en" ? `Part ${sectionIndex}` : `Bagian ${sectionIndex}`}
                            </span>
                          </div>

                          {/* Video Embed */}
                          {isVideo && embedUrl && (
                            <div className="relative w-full aspect-video overflow-hidden rounded-2xl sm:rounded-3xl bg-black border border-gray-200 shadow-md">
                              <iframe
                                src={embedUrl}
                                title={`Video Part ${sectionIndex}`}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>
                          )}

                          {/* Section Image with Lightbox Zoom */}
                          {!isVideo && section.image && (
                            <div
                              onClick={() => section.image && setPreviewImage({ src: section.image, title: `${localizedTitle} — Bagian ${sectionIndex}` })}
                              className="group/simg relative w-full overflow-hidden rounded-2xl bg-white border border-gray-200/70 shadow-sm cursor-zoom-in"
                            >
                              <img
                                src={section.image}
                                alt={`Bagian ${sectionIndex}`}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-auto max-h-[540px] object-cover mx-auto transition-transform duration-500 group-hover/simg:scale-[1.02]"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/simg:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                                  <ZoomIn className="h-4 w-4" /> {lang === "en" ? "Click to Fullscreen" : "Klik untuk Perbesar"}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Rich Section Description */}
                          {section.description && (
                            <div
                              className="prose prose-blue max-w-none text-gray-700 text-base sm:text-lg leading-relaxed pt-2
                                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
                                prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-6 prose-h2:mb-3
                                prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-4 prose-h3:mb-2
                                prose-p:leading-relaxed prose-p:text-gray-700
                                prose-a:text-primary prose-a:font-semibold hover:prose-a:underline
                                prose-strong:text-gray-900
                                prose-img:rounded-2xl prose-img:shadow-sm"
                              dangerouslySetInnerHTML={{ __html: localize(section.description) }}
                            />
                          )}
                        </section>
                      );
                    })}
                  </div>
                )}

                {/* ── Fallback / Additional Full Body Content ─────────── */}
                {localizedBody && (
                  <div
                    className="prose prose-blue max-w-none text-gray-700 text-base sm:text-lg leading-relaxed pt-4
                      prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
                      prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-3
                      prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-2
                      prose-p:leading-relaxed prose-p:text-gray-700
                      prose-a:text-primary prose-a:font-semibold hover:prose-a:underline
                      prose-strong:text-gray-900
                      prose-img:rounded-2xl prose-img:shadow-sm"
                    dangerouslySetInnerHTML={{ __html: localizedBody }}
                  />
                )}
              </div>

              {/* ── Share Action Footer ───────────────────────────────── */}
              <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  to="/$lang"
                  params={{ lang: lang || "id" }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{lang === "en" ? "Back to All Insights" : "Kembali ke Wawasan Lainnya"}</span>
                </Link>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500">
                    {lang === "en" ? "Share this post:" : "Bagikan artikel ini:"}
                  </span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${currentUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-green-600 hover:border-green-600/30 hover:bg-green-50 shadow-xs transition-colors"
                    title="Share to WhatsApp"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
                    </svg>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-primary hover:border-primary/30 hover:bg-blue-50 shadow-xs transition-colors cursor-pointer"
                    title="Copy Link"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </motion.article>
          )}
        </div>
      </main>

      {/* ── 3. Lightbox Fullscreen Preview Dialog ───────────────── */}
      <Dialog open={Boolean(previewImage)} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-5xl bg-black/95 p-0 border-0 overflow-hidden text-white rounded-2xl">
          <div className="relative flex flex-col items-center justify-center p-4">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
            {previewImage && (
              <>
                <img
                  src={previewImage.src}
                  alt={previewImage.title || "Image Preview"}
                  className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain mt-4"
                />
                {previewImage.title && (
                  <p className="mt-3 text-center text-xs text-white/70">{previewImage.title}</p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 4. Footer Asli ─────────────────────────────────────── */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
