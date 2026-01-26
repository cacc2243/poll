import { Users, Sparkles, TrendingUp, Target, Lightbulb, Rocket, ArrowRight, Cpu } from "lucide-react";
import networkingHeader from "@/assets/networking-header.png";

const networkingTopics = [
  { icon: Target, label: "Facebook Ads" },
  { icon: TrendingUp, label: "Google Ads" },
  { icon: Rocket, label: "Ofertas Escaladas" },
  { icon: Lightbulb, label: "Hacks Exclusivos" },
  { icon: Cpu, label: "Todos métodos das IAs" },
];

const NetworkingCard = () => {
  return (
    <div className="mt-16 md:mt-24">
      <div className="max-w-md mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-widest mb-3">
            <Users className="w-4 h-4" />
            Comunidade Exclusiva
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
            Grupo de <span className="text-gradient">Networking</span>
          </h3>
        </div>

        {/* Card */}
        <div className="relative">
          {/* Outer glow */}
          <div 
            className="absolute -inset-1 rounded-2xl opacity-40 blur-xl"
            style={{
              background: 'linear-gradient(135deg, hsl(252 85% 67% / 0.5) 0%, hsl(254 89% 78% / 0.3) 100%)',
            }}
          />
          
          {/* Card with gradient border */}
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-primary/40 via-primary/20 to-accent/10">
            <div className="relative bg-gradient-to-b from-card via-card to-background rounded-2xl overflow-hidden">
              
              {/* Header Image */}
              <div className="w-full">
                <img 
                  src={networkingHeader} 
                  alt="Networking / Ads.sand" 
                  className="w-full h-auto"
                />
              </div>

              {/* Topics List */}
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  O que você encontra no grupo:
                </p>
                
                <div className="space-y-2">
                  {networkingTopics.map((topic, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-background/50 border border-border/30 transition-colors hover:border-primary/30"
                    >
                      <topic.icon className="w-5 h-5 text-primary" />
                      <span className="text-sm text-foreground">{topic.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 bg-gradient-to-r from-primary/10 to-accent/10 border-t border-primary/20">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-foreground/80">
                    <span className="font-semibold text-primary">E muito mais!</span> Novos conteúdos e métodos adicionados toda semana.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4 text-primary" />
            Acesso incluído na sua licença
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkingCard;
