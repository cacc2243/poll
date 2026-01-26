import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import zyraLogo from "@/assets/logo-zyra.png";
import logosHackeados from "@/assets/logos-hackeados-hero.png";
import WistiaVideo from "@/components/WistiaVideo";

const HeroSection = () => {
  const scrollToPricing = () => {
    document.getElementById("pricing-card")?.scrollIntoView({
      behavior: "smooth"
    });
  };
  return <section className="sm:pt-16 sm:pb-20 relative overflow-hidden py-[25px] pt-[55px] pb-[20px]">
      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-7">

          {/* Hacked Logos */}
          <div className="flex justify-center">
            <img src={logosHackeados} alt="Lovable, V0 e Manus hackeados" className="h-6 sm:h-8 w-auto" />
          </div>

          {/* Headline */}
          <h1 className="sm:text-4xl md:text-5xl leading-[1.15] tracking-tight font-semibold text-3xl">
            Use o Lovable, V0 e<br />Manus <span className="text-gradient">INFINITOS</span> sem<br />pagar por créditos.
          </h1>

          {/* Subheadline */}
          <p className="text-muted-foreground text-sm sm:text-base font-light max-w-lg mx-auto">
            100% funcional desde dezembro. Você recebe o que pagou ou te reembolso. Não tem desculpa é o <strong className="text-foreground font-medium">REAL MÉTODO INFINITO</strong>.
          </p>

          {/* Video */}
          <div className="card-premium rounded-2xl overflow-hidden max-w-[290px] mx-auto">
            <WistiaVideo key="hero-video-9-16" aspectRatio="9:16" mediaId="ku7mwl2ram" />
          </div>

          {/* CTA Button */}
          <Button
            onClick={scrollToPricing}
            className="w-full max-w-[290px] h-12 text-sm font-semibold text-white rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, hsl(252 85% 60%) 0%, hsl(252 80% 55%) 50%, hsl(252 75% 50%) 100%)',
            }}
          >
            <ShoppingCart className="mr-2 w-4 h-4" />
            QUERO MEU ACESSO!
          </Button>
        </div>
      </div>
    </section>;
};
export default HeroSection;