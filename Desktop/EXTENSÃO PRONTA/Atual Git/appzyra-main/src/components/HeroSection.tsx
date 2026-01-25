import { ShoppingCart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import zyraLogo from "@/assets/logo-zyra.png";
import WistiaVideo from "@/components/WistiaVideo";
const HeroSection = () => {
  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({
      behavior: "smooth"
    });
  };
  return <section className="sm:pt-16 sm:pb-20 relative overflow-hidden py-[25px] pt-[55px] pb-[20px]">
      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-7">
          {/* Logo */}
          <div className="flex justify-center">
            <img src={zyraLogo} alt="Zyra Pro" className="h-8 sm:h-10 w-auto" />
          </div>

          {/* Headline */}
          <h1 className="sm:text-4xl md:text-5xl leading-[1.15] tracking-tight font-semibold text-3xl">
            Use o Lovable de<br />
            Forma <span className="text-gradient">ILIMITADA.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-muted-foreground sm:text-lg max-w-lg mx-auto text-lg">
            100% atualizada e funcional, não<br />
            <strong className="text-foreground">gaste mais créditos</strong> com Lovable.
          </p>

          {/* Video */}
          <div className="card-premium rounded-2xl overflow-hidden max-w-2xl mx-auto">
            <WistiaVideo key="hero-video-16-9" aspectRatio="16:9" />
          </div>

          {/* CTA */}
        </div>
      </div>
    </section>;
};
export default HeroSection;