import { ShoppingCart, Check, ShieldCheck, Lock, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import HowItWorksSection from "./HowItWorksSection";
import WarningSection from "./WarningSection";
import WhyZyraSection from "./WhyZyraSection";
import InstagramSection from "./InstagramSection";
import WhatsAppSupport from "./WhatsAppSupport";
import ActivationGuideModal from "./ActivationGuideModal";
import zyraProLogo from "@/assets/zyra-pro-logo.png";

const features = [
  "1 Ativação de Licença",
  "Acesso a Área de Membros",
  "Grupo VIP Networking",
  "Suporte Direto e Rápido",
  "Todas atualizações",
];

const PricingSection = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [showActivationGuide, setShowActivationGuide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLocked(false);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="pricing" className="relative overflow-hidden py-16 md:py-24">
      <div className="container relative z-10 px-4 sm:px-6">
        {/* How It Works Section */}
        <HowItWorksSection />
        
        {/* Warning Section */}
        <WarningSection />
        
        {/* Why Zyra Section */}
        <WhyZyraSection />

        {/* Instagram Section */}
        <InstagramSection />
        <div className="relative mt-16 md:mt-24">
          {/* Top Light Blur Effect - Purple themed */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[400px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(252 85% 67% / 0.2) 0%, hsl(254 89% 78% / 0.08) 40%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-14 relative">
            <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-widest mb-4">
              <Sparkles className="w-4 h-4" />
              Licença Oficial
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Adquira sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Licença</span>
            </h2>
          </div>

          {/* Pricing Card */}
          <div className="max-w-md mx-auto relative">
            {/* Lock Overlay */}
            {isLocked && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-3xl">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-3 animate-pulse">
                  <Lock className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-base sm:text-lg font-semibold text-foreground text-center px-4">
                  Assista o vídeo primeiro
                </p>
              </div>
            )}

            <div className={`relative transition-all duration-500 ${isLocked ? 'blur-md select-none pointer-events-none' : ''}`}>
              {/* Outer glow */}
              <div 
                className="absolute -inset-1 rounded-3xl opacity-50 blur-xl"
                style={{
                  background: 'linear-gradient(135deg, hsl(252 85% 67% / 0.4) 0%, hsl(254 89% 78% / 0.2) 100%)',
                }}
              />
              
              {/* Card with gradient border */}
              <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-primary/50 via-primary/20 to-accent/10">
                <div className="relative bg-gradient-to-b from-card via-card to-background rounded-3xl p-6 sm:p-8 overflow-hidden">
                  
                  {/* Ambient gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/8 to-transparent rounded-tr-full pointer-events-none" />
                  
                  {/* Content */}
                  <div className="relative">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                      <img 
                        src={zyraProLogo} 
                        alt="Zyra Pro" 
                        className="h-10 sm:h-12 w-auto"
                      />
                    </div>

                    {/* Badge */}
                    <div className="flex justify-center mb-6">
                      <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wide px-4 py-1.5 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        Licença Vitalícia
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-bold text-center text-foreground mb-2">
                      Acesso Completo
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-6">
                      Tudo que você precisa em um só lugar
                    </p>

                    {/* Features List */}
                    <ul className="space-y-3 mb-8">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm text-foreground/80">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Divider with gradient */}
                    <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-6" />

                    {/* Activation Guide Link */}
                    <button
                      onClick={() => setShowActivationGuide(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all group"
                    >
                      <HelpCircle className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-primary">Como ativar minha licença?</span>
                    </button>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground line-through mb-1">R$ 297,00</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-sm text-muted-foreground mr-1">por</span>
                        <span className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                          R$ 197
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Pagamento único • Acesso vitalício</p>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="w-full h-14 text-base font-semibold text-white rounded-xl transition-all hover:scale-[1.02] hover:shadow-2xl"
                      style={{
                        background: 'linear-gradient(135deg, hsl(252 85% 67%) 0%, hsl(254 89% 78%) 100%)',
                        boxShadow: '0 8px 32px hsl(252 85% 67% / 0.35)',
                      }}
                      asChild
                    >
                      <a href="/checkout">
                        <ShoppingCart className="mr-2 w-5 h-5" />
                        Quero Minha Licença
                      </a>
                    </Button>

                    {/* Trust Badge */}
                    <div className="flex items-center justify-center gap-2 mt-5 text-xs text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary/70" />
                      <span>Garantia de 7 dias • Compra 100% segura</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Support */}
          <WhatsAppSupport />
        </div>
      </div>

      {/* Activation Guide Modal */}
      <ActivationGuideModal
        isOpen={showActivationGuide}
        onClose={() => setShowActivationGuide(false)}
      />
    </section>
  );
};

export default PricingSection;