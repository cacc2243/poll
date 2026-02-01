import { Download, MessageSquare, Infinity as InfinityIcon, Sparkles, Shield, Zap, X, Check } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: Download,
    title: "Instale",
    description: "Ative a extensão",
    isHighlight: false,
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Use",
    description: "Envie seus prompts",
    isHighlight: false,
  },
  {
    number: "∞",
    icon: InfinityIcon,
    title: "Ilimitado",
    description: "0 créditos gastos",
    isHighlight: true,
  },
];

const DifferentialSection = () => {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      <div className="container px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
            Simples assim
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Como <span className="text-gradient">Funciona?</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="max-w-md mx-auto mb-16">
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-primary rounded-full">
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-primary via-transparent to-primary"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative flex items-center gap-4 group"
                >
                  {/* Icon container */}
                  <div className="relative z-10 flex-shrink-0">
                    {step.isHighlight && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-primary/30"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className={`
                        relative w-12 h-12 rounded-xl flex items-center justify-center
                        ${step.isHighlight 
                          ? "bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30" 
                          : "bg-card border border-border"
                        }
                      `}
                    >
                      <step.icon 
                        className={`w-5 h-5 ${step.isHighlight ? "text-white" : "text-primary"}`} 
                        strokeWidth={1.5} 
                      />
                      
                      <div className={`
                        absolute -top-1 -right-1 w-5 h-5 rounded-md text-[10px] font-bold
                        flex items-center justify-center
                        ${step.isHighlight 
                          ? "bg-primary text-white" 
                          : "bg-primary/20 text-primary border border-primary/30"
                        }
                      `}>
                        {step.number}
                      </div>
                    </motion.div>
                  </div>

                  {/* Content card */}
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`
                      flex-1 py-3 px-4 rounded-xl transition-all duration-300
                      ${step.isHighlight 
                        ? "bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30" 
                        : "bg-card/50 border border-transparent hover:border-border"
                      }
                    `}
                  >
                    <h3 className={`font-semibold text-base ${step.isHighlight ? "text-primary" : "text-foreground"}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Por Dentro Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Main message card */}
          <div className="relative bg-gradient-to-br from-card via-card to-primary/5 border border-border rounded-2xl p-8 md:p-10 mb-8 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-primary/15 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-accent/10 to-transparent rounded-full blur-2xl" />
            
            <div className="relative text-center">
              <motion.div 
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-6"
              >
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Por Dentro</span>
              </motion.div>
              
              <p className="text-muted-foreground text-base md:text-lg mb-4 max-w-md mx-auto">
                Nós processamos sua requisição e enviamos para seu projeto.
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                <span className="text-primary">ZERO</span> CRÉDITOS GASTOS
              </p>
              <p className="text-muted-foreground text-base flex items-center justify-center gap-1">
                O resto é segredinho <span className="text-lg">🤫</span>
              </p>
            </div>
          </div>

          {/* Comparison cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {/* Outras extensões */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative p-6 rounded-2xl bg-gradient-to-br from-card to-destructive/5 border border-destructive/20 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/15 border border-destructive/20 flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-destructive font-semibold uppercase tracking-wide mb-1">Outras Extensões</p>
                  <p className="text-base text-foreground font-semibold mb-2">Enviam direto para API</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Burlam o sistema de créditos. Risco de bloqueio permanente.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* LovaPool */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative p-6 rounded-2xl bg-gradient-to-br from-card to-primary/10 border border-primary/30 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-xl" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">LovaPool</p>
                  <p className="text-base text-foreground font-semibold mb-2">Sistema proprietário</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Método único e seguro. Sem riscos de banimento.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Limit badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-card via-muted/30 to-card border border-border shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-medium">Sua única limitação</p>
                <p className="text-xl font-bold text-foreground">
                  1.200 <span className="text-primary">prompts/dia</span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default DifferentialSection;
