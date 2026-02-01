import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import SimpleVideoPlayer from "@/components/SimpleVideoPlayer";
import cyberSkullBg from "@/assets/cyber-skull-bg.png";
import lpIcon from "@/assets/lp-icon.png";
import lovapoolHeroLogo from "@/assets/lovapool-hero-logo.png";

const HeroSection = () => {
  const scrollToPricing = () => {
    document.getElementById("pricing-card")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <section className="sm:pt-16 sm:pb-20 relative overflow-hidden py-[25px] pt-[55px] pb-[20px]">
      {/* Skull Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url(${cyberSkullBg})`,
          opacity: 0.12,
        }}
      />
      {/* Subtle dark overlay for text readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/30 via-background/50 to-background/90" />

      <div className="container relative z-10">
      <div className="max-w-2xl mx-auto text-center space-y-7">

          {/* Logo */}
          <div className="flex justify-center">
            <img 
              src={lovapoolHeroLogo} 
              alt="LovaPool" 
              className="w-full max-w-[180px] sm:max-w-[220px] h-auto object-contain"
            />
          </div>

          {/* Headline */}
          <h1 className="sm:text-4xl md:text-5xl leading-[1.15] tracking-tight font-semibold text-3xl">
            Caiu tudo, né?<br />Menos o<br />nosso.. Use o<br /><span className="text-gradient">Lovable Ilimitado</span>
          </h1>

          {/* Subheadline */}
          <p className="text-muted-foreground text-sm sm:text-base font-light max-w-lg mx-auto">
            Caiu tudo... menos aqui, <strong className="text-foreground font-medium">MELHORAMOS</strong> o que já estava bom.
          </p>

          {/* Video */}
          <div className="max-w-[640px] mx-auto">
            <SimpleVideoPlayer mediaId="j5vsiet2uy" />
          </div>

          {/* CTA Button */}
          <Button
            onClick={scrollToPricing}
            className="w-full max-w-[320px] h-12 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 4px 0 #991b1b, 0 8px 20px rgba(0,0,0,0.3)',
            }}
          >
            <img src={lpIcon} alt="LP" className="mr-2 w-5 h-5 object-contain" />
            Quero o LovaPool agora!
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
