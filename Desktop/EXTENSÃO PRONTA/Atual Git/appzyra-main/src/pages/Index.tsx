import { useEffect } from "react";
import StickyBar from "@/components/StickyBar";
import HeroSection from "@/components/HeroSection";
import ProductShowcase from "@/components/ProductShowcase";
import PricingSection from "@/components/PricingSection";
import TargetAudienceSection from "@/components/TargetAudienceSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import CinematicBackground from "@/components/CinematicBackground";
import { trackViewContent } from "@/hooks/useFacebookPixel";

const Index = () => {
  useEffect(() => {
    trackViewContent('Página Inicial');
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <CinematicBackground />
      <StickyBar />
      <main className="pt-10 relative z-10">
        <HeroSection />
        <ProductShowcase />
        <PricingSection />
        <TargetAudienceSection />
        <FAQSection />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
