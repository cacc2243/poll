import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import ProductShowcase from "@/components/ProductShowcase";
import DifferentialSection from "@/components/DifferentialSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import CinematicBackground from "@/components/CinematicBackground";
import AuthDrawer from "@/components/AuthDrawer";
import { trackViewContent } from "@/hooks/useFacebookPixel";
import lovableColorIcon from "@/assets/lovable-color-icon.png";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    trackViewContent('Página Inicial');
  }, []);

  // Check for auth=open parameter to auto-open drawer
  useEffect(() => {
    if (searchParams.get("auth") === "open") {
      setIsAuthDrawerOpen(true);
      // Clean up the URL
      searchParams.delete("auth");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleAuthSuccess = () => {
    setIsAuthDrawerOpen(false);
    navigate("/member");
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <CinematicBackground />
      
      {/* Fixed Top Bar - Logo + Lovable Ilimitado */}
      <div 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'linear-gradient(135deg, #c53030 0%, #9b2c2c 40%, #e53e3e 70%, #f56565 100%)',
          boxShadow: '0 2px 20px rgba(197, 48, 48, 0.3)',
        }}
      >
        <div className="container py-2.5">
          <div className="flex items-center justify-center gap-2">
            <img src={lovableColorIcon} alt="Lovable" className="w-5 h-5 object-contain" />
            <span className="text-sm text-white font-medium">Lovable Ilimitado</span>
          </div>
        </div>
      </div>
      
      {/* Glow light effect */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        style={{
          width: '500px',
          height: '200px',
          background: 'radial-gradient(ellipse 100% 100% at 50% 0%, hsl(0 70% 50% / 0.4) 0%, hsl(0 65% 45% / 0.15) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      
      <main className="relative z-10 pt-10">
        <HeroSection />
        <ProductShowcase />
        <DifferentialSection />
        <PricingSection />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>

      {/* Auth Drawer */}
      <AuthDrawer 
        isOpen={isAuthDrawerOpen}
        onClose={() => setIsAuthDrawerOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;
