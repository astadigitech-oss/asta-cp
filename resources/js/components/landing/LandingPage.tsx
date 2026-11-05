import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { useLandingData } from "@/hooks/useLandingData";
import { useTranslation } from "@/i18n/useTranslation";
import { Hero } from "./sections/Hero";

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
const HomeFAQ = lazy(() => import("./sections/HomeFAQ").then((m) => ({ default: m.HomeFAQ })));
const CTA = lazy(() => import("./sections/CTA").then((m) => ({ default: m.CTA })));
const Contact = lazy(() => import("./sections/Contact").then((m) => ({ default: m.Contact })));
const Footer = lazy(() => import("./sections/Footer").then((m) => ({ default: m.Footer })));

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

    const loadForHash = () => {
      if (hashTarget && window.location.hash === `#${hashTarget}`) activate();
    };

    loadForHash();
    window.addEventListener("hashchange", loadForHash);
    return () => {
      observer?.disconnect();
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

        <DeferredSection hashTarget="faq" minHeight="min-h-[450px]">
          <HomeFAQ />
        </DeferredSection>

        <DeferredSection minHeight="min-h-[250px]">
          <CTA />
        </DeferredSection>

        <DeferredSection hashTarget="kontak" minHeight="min-h-[600px]">
          <Contact />
        </DeferredSection>
      </main>
      <DeferredSection minHeight="min-h-[250px]">
        <Footer />
      </DeferredSection>
    </div>
  );
}

export default LandingPage;