import { Suspense, lazy, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useLandingData } from "@/hooks/useLandingData";
import { useTranslation } from "@/i18n/useTranslation";
import {
  Hero,
  About,
  Services,
  ComparisonTable,
  Portfolio,
  DiscoverSection,
  WhyUs,
  Stats,
  Process,
  BlogSection,
  Testimonials,
  HomeFAQ,
  CTA,
  Contact,
  Footer,
} from "./sections";

const Toaster = lazy(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })));

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
      <Suspense fallback={null}>
        <Toaster position="top-right" />
      </Suspense>
      <Navbar />
      <main>
        {/* Hero Section */}
        <Hero clientsList={landingData?.clients} />

        {/* SEO Structured Content */}
        <section className="mx-auto max-w-full space-y-6 px-4 py-14 sm:px-6 lg:px-24">
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
          <p className="max-w-4xl text-sm leading-relaxed text-gray-600">{t("home_seo.location")}</p>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-primary">
            <a href="#layanan" className="underline underline-offset-4">{t("home_seo.services_link")}</a>
            <a href="#kontak" className="underline underline-offset-4">{t("home_seo.contact_link")}</a>
          </div>

          {/* Explicit Business Identity & Contact Transparency Card */}
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
                <span className="block text-xs text-gray-500">{language === "en" ? "Mon-Sat: 08:00 - 17:00 WIB" : "Senin - Sabtu: 08:00 - 17:00 WIB"}</span>
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

        {/* Synchronously rendered full-page sections to ensure 0 layout shift and reliable scroll restoration */}
        <div id="tentang">
          <About discoversList={landingData?.discovers} />
        </div>

        <div id="layanan">
          <Services />
        </div>

        <div id="komparasi">
          <ComparisonTable />
        </div>

        <div id="portofolio">
          <Portfolio />
        </div>

        <div id="discover">
          <DiscoverSection discoversList={landingData?.discovers} />
        </div>

        <div id="keunggulan">
          <WhyUs />
        </div>

        <Stats />

        <div id="proses">
          <Process />
        </div>

        <div id="blog">
          <BlogSection articlesList={landingData?.articles} />
        </div>

        <div id="testimoni">
          <Testimonials />
        </div>

        <div id="faq">
          <HomeFAQ />
        </div>

        <CTA />

        <div id="kontak">
          <Contact />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
