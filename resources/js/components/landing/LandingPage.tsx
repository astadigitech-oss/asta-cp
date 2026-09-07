import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { useLandingData } from "@/hooks/useLandingData";
import { Hero } from "./sections/Hero";

// Lazy-load below-the-fold sections to drastically reduce initial JS execution and memory overhead on low-end devices
const About = lazy(() => import("./sections/About").then((m) => ({ default: m.About })));
const Services = lazy(() => import("./sections/Services").then((m) => ({ default: m.Services })));
const Portfolio = lazy(() => import("./sections/Portfolio").then((m) => ({ default: m.Portfolio })));
const DiscoverSection = lazy(() => import("./sections/DiscoverSection").then((m) => ({ default: m.DiscoverSection })));
const WhyUs = lazy(() => import("./sections/WhyUs").then((m) => ({ default: m.WhyUs })));
const Stats = lazy(() => import("./sections/Stats").then((m) => ({ default: m.Stats })));
const Process = lazy(() => import("./sections/Process").then((m) => ({ default: m.Process })));
const Testimonials = lazy(() => import("./sections/Testimonials").then((m) => ({ default: m.Testimonials })));
const CTA = lazy(() => import("./sections/CTA").then((m) => ({ default: m.CTA })));
const Contact = lazy(() => import("./sections/Contact").then((m) => ({ default: m.Contact })));
const Footer = lazy(() => import("./sections/Footer").then((m) => ({ default: m.Footer })));

function SectionFallback({ minHeight = "min-h-[200px]" }: { minHeight?: string }) {
  return <div className={`w-full ${minHeight}`} aria-hidden="true" />;
}

export function LandingPage() {
  const { data: landingData } = useLandingData();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-accent font-sans">
      <Toaster position="top-right" />
      <Navbar />
      <main>
        {/* Above-the-fold critical content (loaded immediately) */}
        <Hero clientsList={landingData?.clients} />

        {/* Below-the-fold deferred content (lazy loaded chunks) */}
        <Suspense fallback={<SectionFallback minHeight="min-h-[400px]" />}>
          <About discoversList={landingData?.discovers} />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight="min-h-[400px]" />}>
          <Services />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight="min-h-[400px]" />}>
          <Portfolio />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight="min-h-[400px]" />}>
          <DiscoverSection discoversList={landingData?.discovers} />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight="min-h-[300px]" />}>
          <WhyUs />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight="min-h-[250px]" />}>
          <Stats />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight="min-h-[350px]" />}>
          <Process />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight="min-h-[350px]" />}>
          <Testimonials />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight="min-h-[250px]" />}>
          <CTA />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight="min-h-[400px]" />}>
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={<SectionFallback minHeight="min-h-[250px]" />}>
        <Footer />
      </Suspense>
    </div>
  );
}

export default LandingPage;