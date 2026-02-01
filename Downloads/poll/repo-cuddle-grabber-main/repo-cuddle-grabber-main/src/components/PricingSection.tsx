import { Zap, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import lpIcon from "@/assets/lp-icon.png";

const PricingSection = () => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate(`/checkout?plan=lifetime`);
  };

  return (
    <section id="pricing" className="relative overflow-hidden py-16 md:py-24">
      <div className="container relative z-10 px-4 sm:px-6">
        <div id="pricing-card" className="relative">
          {/* Top Light Blur Effect - Red */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[500px] h-[300px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(0 70% 50% / 0.12) 0%, hsl(0 60% 45% / 0.04) 40%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-10 relative">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Escolha seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">Plano</span>
            </h2>
          </div>

          {/* Biohacking Card */}
          <div className="max-w-sm mx-auto relative">
            
            {/* Mysterious outer glow */}
            <div 
              className="absolute -inset-2 rounded-2xl opacity-60 blur-2xl animate-pulse"
              style={{
                background: 'radial-gradient(ellipse at center, hsl(0 80% 50% / 0.25) 0%, transparent 70%)',
                animationDuration: '3s',
              }}
            />
            
            {/* Card */}
            <div 
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, hsl(0 20% 8%) 0%, hsl(0 15% 5%) 100%)',
                border: '1px solid hsl(0 50% 30% / 0.4)',
                boxShadow: '0 0 40px hsl(0 70% 40% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.03)',
              }}
            >
              {/* Scan line effect */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 70% 50% / 0.1) 2px, hsl(0 70% 50% / 0.1) 4px)',
                }}
              />

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500/50 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500/50 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500/50 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500/50 rounded-br-2xl" />

              <div className="relative p-6">
                
                {/* Header with icon */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center p-2"
                    style={{
                      background: 'linear-gradient(135deg, hsl(0 20% 12%) 0%, hsl(0 15% 8%) 100%)',
                      border: '1px solid hsl(0 50% 30% / 0.3)',
                    }}
                  >
                    <img src={lpIcon} alt="LovaPool" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">LOVABLE INFINITO</h3>
                    <p className="text-[10px] text-red-400/80 uppercase tracking-widest">Acesso Vitalício</p>
                  </div>
                </div>

                {/* Divider with glow */}
                <div className="relative h-px mb-5">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/30 to-transparent blur-sm" />
                </div>

                {/* Features - compact */}
                <div className="space-y-2 mb-5">
                  {[
                    { icon: CheckCircle, text: "100% Funcional e Atualizado" },
                    { icon: Zap, text: "Acesso Instantâneo" },
                    { icon: Lock, text: "Mensalidade justa" },
                  ].map((feature, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg"
                      style={{
                        background: 'hsl(0 20% 10% / 0.6)',
                        border: '1px solid hsl(0 30% 20% / 0.3)',
                      }}
                    >
                      <feature.icon className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-white/80">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="text-center mb-5">
                  <p className="text-xs text-white/40 line-through mb-1">R$ 149,00</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-black text-white">R$ 69</span>
                    <span className="text-sm text-white/50">,00</span>
                  </div>
                  <p className="text-[10px] text-red-400/70 uppercase tracking-wider mt-1">
                    PAGAMENTO MENSAL
                  </p>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full h-11 text-sm font-bold text-white rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                    boxShadow: '0 4px 0 #991b1b, 0 8px 16px rgba(0,0,0,0.3)',
                  }}
                >
                  <img src={lpIcon} alt="LP" className="mr-2 w-5 h-5 object-contain" />
                  LIBERAR ACESSO
                </Button>

                {/* Bottom text */}
                <p className="text-center text-[10px] text-white/30 mt-4">
                  Garantia de 7 dias • Suporte prioritário
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PricingSection;
