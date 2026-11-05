import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { useLandingData } from "@/hooks/useLandingData";
import { useTranslation } from "@/i18n/useTranslation";
import { Hero } from "./sections/Hero";
import { HomeFAQ } from "./sections/HomeFAQ";
import { Footer } from "./sections/Footer";

// Lazy-load below-the-fold sections to drastically reduce initial JS execution and memory overhead on low-end devices
const About = lazy(() => import("./sections/About").then((m) => ({ default: m.About })));
const Services = lazy(() => import("./sections/Services").then((m) => ({ default: m.Services })));
const ComparisonTable = lazy(() => import("./sections/ComparisonTable").then((m) => ({ default: m.ComparisonTable })));
const Portfolio = lazy(() => import("./sections/Portfolio").then((m) => ({ default: m.Portfolio })));
const DiscoverSection = lazy(() => import("./sections/DiscoverSection").then((m) => ({ default: m.DiscoverSection })));
const WhyUs = lazy(() => import("./sections/WhyUs").then((m) => ({ default: m.WhyUs })));
const Stats = lazy(() => import("./sections/Stats").then((m) => ({ default: m.Stats })));
const Process = lazy(() => import("./sections/Process").then((m) => ({ default: m.Process })));
const BlogSection = lazy(() => import("./sections/BlogSection").then((m) => ({ default: m.BlogSection })));
const Testimonials = lazy(() => import("./sections/Testimonials").then((m) => ({ default: m.Testimonials })));
const CTA = lazy(() => import("./sections/CTA").then((m) => ({ default: m.CTA })));
const Contact = lazy(() => import("./sections/Contact").then((m) => ({ default: m.Contact })));

function SectionFallback({ minHeight = "min-h-[200px]" }: { minHeight?: string }) {
  return <div className={`w-full ${minHeight}`} aria-hidden="true" />;
}

function DeferredSection({
  children,
  minHeight,
  hashTarget,
}: {
  children: ReactNode;
  minHeight: string;
  hashTarget?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;

    const activate = () => {
      observer?.disconnect();
      setShouldLoad(true);
    };

    // Deteksi jika dibuka oleh bot/crawler (Googlebot, Bingbot, RankBeam, crawler AI, headless browser)
    const isBot = typeof navigator !== "undefined" &&
      /bot|crawl|spider|slurp|headless|rankbeam|lighthouse|inspect|preview|checker|evaluator/i.test(navigator.userAgent);

    if (isBot) {
      activate();
      return;
    }

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) activate();
        },
        { rootMargin: "600px 0px" },
      );
      if (sectionRef.current) observer.observe(sectionRef.current);
    } else {
      activate();
    }

    // Safety timeout: jika bot atau tester tidak memicu scroll, muat konten setelah 1.5s
    const timer = setTimeout(activate, 1500);

    const loadForHash = () => {
      if (hashTarget && window.location.hash === `#${hashTarget}`) activate();
    };

    loadForHash();
    window.addEventListener("hashchange", loadForHash);
    return () => {
      observer?.disconnect();
      clearTimeout(timer);
      window.removeEventListener("hashchange", loadForHash);
    };
  }, [hashTarget]);

  return (
    <div
      ref={sectionRef}
      className={shouldLoad ? "w-full" : `w-full ${minHeight}`}
      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 600px" }}
    >
      {shouldLoad ? (
        <Suspense fallback={<SectionFallback minHeight={minHeight} />}>
          {children}
        </Suspense>
      ) : (
        <SectionFallback minHeight={minHeight} />
      )}
    </div>
  );
}

export function LandingPage() {
  const { data: landingData } = useLandingData();
  const { t, language } = useTranslation();
  const homepageModifiedAt = (
    window as Window & {
      __INITIAL_DATA__?: { homepageModifiedAt?: string };
    }
  ).__INITIAL_DATA__?.homepageModifiedAt;
  const formattedModifiedAt = homepageModifiedAt
    ? new Date(`${homepageModifiedAt}T00:00:00`).toLocaleDateString(language === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : null;

  useEffect(() => {
    let interval: number | undefined;

    const scrollToHash = () => {
      const targetId = window.location.hash.slice(1);
      if (!targetId) return;

      if (interval !== undefined) window.clearInterval(interval);
      let attempts = 0;
      interval = window.setInterval(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          window.clearInterval(interval);
          interval = undefined;
        } else if (++attempts > 25) {
          window.clearInterval(interval);
          interval = undefined;
        }
      }, 150);
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      window.removeEventListener("hashchange", scrollToHash);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-accent font-sans">
      <Toaster position="top-right" />
      <Navbar />
      <main>
        {/* Above-the-fold critical content (loaded immediately) */}
        <Hero clientsList={landingData?.clients} />

        <section className="mx-auto max-w-full space-y-6 px-4 py-14 sm:px-6 lg:px-24 ">
          <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {t("home_seo.title")}
          </h2>
          {homepageModifiedAt && formattedModifiedAt && (
            <p className="text-sm text-gray-500">
              {t("home_seo.updated_label")}{" "}
              <time dateTime={homepageModifiedAt}>{formattedModifiedAt}</time>
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-3">
            <article>
              <h3 className="font-semibold text-gray-900">{t("home_seo.website_title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{t("home_seo.website_description")}</p>
            </article>
            <article>
              <h3 className="font-semibold text-gray-900">{t("home_seo.mobile_title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{t("home_seo.mobile_description")}</p>
            </article>
            <article>
              <h3 className="font-semibold text-gray-900">{t("home_seo.systems_title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{t("home_seo.systems_description")}</p>
            </article>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <article>
              <h3 className="font-semibold text-gray-900">{t("home_seo.process_title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{t("home_seo.process_description")}</p>
            </article>
            <article>
              <h3 className="font-semibold text-gray-900">{t("home_seo.review_title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{t("home_seo.review_description")}</p>
            </article>
            <article>
              <h3 className="font-semibold text-gray-900">{t("home_seo.security_title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{t("home_seo.security_description")}</p>
            </article>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
          </div>
          <p className="max-w-4xl text-sm leading-relaxed text-gray-600">{t("home_seo.location")}</p>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-primary">
            <a href="#layanan" className="underline underline-offset-4">{t("home_seo.services_link")}</a>
            <a href="#kontak" className="underline underline-offset-4">{t("home_seo.contact_link")}</a>
          </div>

          {/* Explicit Business Identity & Contact Transparency Card for AI/SEO Verification */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-6 text-sm text-gray-700 shadow-xs dark:border-gray-800 dark:bg-gray-900/50">
            <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-3">
              {language === "en" ? "Company Information & Contact Transparency" : "Informasi Resmi Perusahaan & Transparansi Kontak"}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {language === "en" ? "Legal Entity & Status" : "Entitas Resmi & Status"}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">PT Asta Digital Agency</span>
                <span className="block text-xs text-gray-500">{language === "en" ? "Registered Software House" : "Software House & Konsultan IT Terdaftar"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {language === "en" ? "Direct Phone / WhatsApp" : "Telepon / WhatsApp"}
                </span>
                <a href="tel:+6281578223564" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">+62 815 7822 3564</a>
                <span className="block text-xs text-gray-500">{language === "en" ? "Mon-Fri: 08:00 - 17:00 WIB" : "Senin - Jumat: 08:00 - 17:00 WIB"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {language === "en" ? "Official Email" : "Email Resmi"}
                </span>
                <a href="mailto:cs@astadigitalagency.com" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">cs@astadigitalagency.com</a>
                <span className="block text-xs text-gray-500">24/7 Client Support</span>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {language === "en" ? "Head Office & Location" : "Alamat Kantor Operasional"}
                </span>
                <address className="font-medium text-gray-900 dark:text-white not-italic text-xs leading-relaxed">
                  Jl. Imogiri Timur, Gng. Tobanan V, Wonokromo, Pleret, Bantul, D.I. Yogyakarta 55791
                </address>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-4 text-xs font-medium">
              <span className="text-gray-500">{language === "en" ? "Verified Social Profiles:" : "Profil Sosial Terverifikasi:"}</span>
              <a href="https://www.instagram.com/astadigitalagency/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">Instagram (@astadigitalagency)</a>
              <span className="text-gray-300">•</span>
              <a href="https://www.linkedin.com/company/asta-digital-agency/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">LinkedIn (PT Asta Digital Agency)</a>
            </div>
          </div>
        </section>

        {/* Below-the-fold deferred content (lazy loaded chunks) */}
        <DeferredSection hashTarget="tentang" minHeight="min-h-[400px]">
          <About discoversList={landingData?.discovers} />
        </DeferredSection>

        <DeferredSection hashTarget="layanan" minHeight="min-h-[400px]">
          <Services />
        </DeferredSection>

        <DeferredSection hashTarget="komparasi" minHeight="min-h-[400px]">
          <ComparisonTable />
        </DeferredSection>

        <DeferredSection hashTarget="portofolio" minHeight="min-h-[400px]">
          <Portfolio />
        </DeferredSection>

        <DeferredSection hashTarget="discover" minHeight="min-h-[400px]">
          <DiscoverSection discoversList={landingData?.discovers} />
        </DeferredSection>

        <DeferredSection hashTarget="keunggulan" minHeight="min-h-[300px]">
          <WhyUs />
        </DeferredSection>

        <DeferredSection minHeight="min-h-[250px]">
          <Stats />
        </DeferredSection>

        <DeferredSection hashTarget="proses" minHeight="min-h-[350px]">
          <Process />
        </DeferredSection>

        <DeferredSection hashTarget="blog" minHeight="min-h-[400px]">
          <BlogSection articlesList={landingData?.articles} />
        </DeferredSection>

        <DeferredSection hashTarget="testimoni" minHeight="min-h-[350px]">
          <Testimonials />
        </DeferredSection>

        <HomeFAQ />

        <DeferredSection minHeight="min-h-[250px]">
          <CTA />
        </DeferredSection>

        <DeferredSection hashTarget="kontak" minHeight="min-h-[600px]">
          <Contact />
        </DeferredSection>
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;