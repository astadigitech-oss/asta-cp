import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { useLandingData } from "@/hooks/useLandingData";
import {
  Hero,
  About,
  Services,
  Portfolio,
  DiscoverSection,
  WhyUs,
  Stats,
  Process,
  Testimonials,
  CTA,
  Contact,
  Footer,
} from "./sections";

export function LandingPage() {
  const { data: landingData } = useLandingData();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-accent font-sans">
      <Toaster position="top-right" />
      <Navbar />
      <main>
        <Hero clientsList={landingData?.clients} />
        <About discoversList={landingData?.discovers} />
        <Services />
        <Portfolio />
        <DiscoverSection discoversList={landingData?.discovers} />
        <WhyUs />
        <Stats />
        <Process />
        <Testimonials />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;