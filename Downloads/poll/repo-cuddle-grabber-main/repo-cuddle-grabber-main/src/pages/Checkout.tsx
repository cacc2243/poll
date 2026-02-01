import { ArrowLeft, Copy, Check, ShieldCheck, Clock, ShoppingCart, QrCode, CheckCircle, Loader2, Pencil, Plus, Zap, Smartphone, User, AlertCircle, Sparkles, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

// Scroll to top on mount
const useScrollToTop = () => {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import CinematicBackground from "@/components/CinematicBackground";
import PaymentConfirmedScreen from "@/components/PaymentConfirmedScreen";
import { useOverflowDebug } from "@/hooks/use-overflow-debug";
import lpIcon from "@/assets/lp-icon.png";
import lovapoolLogo from "@/assets/lovapool-logo.png";
import { trackInitiateCheckout, trackPixGerado, trackPurchase, setAdvancedMatching } from "@/hooks/useFacebookPixel";
const features = [{
  text: "Grupo VIP Networking"
}, {
  text: "Suporte Prioritário"
}];
// Order bumps configuration
const allOrderBumps: Record<string, {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  badge?: string;
  badgeColor?: 'primary' | 'amber' | 'blue';
  isMonthly?: boolean;
}[]> = {
  lovable: [
    {
      id: 'painel-revendas-250',
      name: 'Painel de Revendas',
      subtitle: '250 Licenças',
      description: '250 licenças com 500 prompts/dia cada. Revenda e lucre!',
      price: 19900,
      originalPrice: 39900,
      image: '',
      badge: 'POPULAR',
      badgeColor: 'primary',
      isMonthly: true
    },
    {
      id: 'painel-revendas-800',
      name: 'Painel de Revendas PRO',
      subtitle: '800 Licenças',
      description: '800 licenças com 1.200 prompts/dia cada. Máximo lucro!',
      price: 39900,
      originalPrice: 79900,
      image: '',
      badge: 'MELHOR OFERTA',
      badgeColor: 'amber',
      isMonthly: true
    }
  ],
  default: []
};
interface PixData {
  pix_code: string;
  payment_url: string;
  transaction_id: string;
}
interface PaymentStatus {
  is_paid: boolean;
  customer: {
    name: string;
    email: string;
    phone: string;
    document: string;
  };
  amount: number;
  fbp?: string;
  fbc?: string;
  transaction_id: string;
}
// Unified pricing - All 3 AIs included in one plan
const subscriptionPricing = {
  monthly: { price: 6900, originalPrice: 14900 },
  yearly: { price: 29700, originalPrice: 59700 },
};

type PlanType = 'monthly' | 'yearly';

const planLabels: Record<PlanType, { label: string; period: string; savings?: string }> = {
  monthly: { label: 'Mensal', period: '/mês' },
  yearly: { label: 'Anual', period: '/ano', savings: 'Economia de R$ 867' },
};

// Product configuration
const productConfig = {
  name: 'LovaPool',
  title: 'LovaPool',
  type: 'extension' as const,
  icon: 'lovapool',
  subtitle: 'Acesso imediato',
};

const Checkout = () => {
  useScrollToTop();
  const [searchParams] = useSearchParams();
  const debugOverflow = import.meta.env.DEV && searchParams.get("debugOverflow") === "1";
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editingEmail, setEditingEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: ''
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const {
    toast
  } = useToast();

  // Confetti effect
  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#a855f7', '#c084fc', '#d946ef', '#ec4899', '#f472b6']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#a855f7', '#c084fc', '#d946ef', '#ec4899', '#f472b6']
      });
    }, 250);
  }, []);

  // Get plan from URL params
  const urlPlan = searchParams.get('plan') as PlanType | null;
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    urlPlan === 'yearly' ? 'yearly' : 'monthly'
  );
  
  const isSubscription = true;

  // DEV: helps pinpoint the exact node causing horizontal overflow on mobile
  useOverflowDebug(debugOverflow);
  
  // Calculate prices based on selected plan
  const getBasePrice = () => {
    return subscriptionPricing[selectedPlan]?.price || 6900;
  };
  
  const getBaseOriginalPrice = () => {
    return subscriptionPricing[selectedPlan]?.originalPrice || 14900;
  };
  
  const basePrice = getBasePrice();
  const baseOriginalPrice = getBaseOriginalPrice();
  const productName = productConfig.name;

  // Get order bumps for the unified plan
  const orderBumps = allOrderBumps.lovable || [];

  // Get product icon based on config
  const getProductIcon = () => {
    return lpIcon;
  };
  const productIcon = getProductIcon();

  // Track scroll for header glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track InitiateCheckout on mount (deduped automatically)
  useEffect(() => {
    trackInitiateCheckout(basePrice);
  }, [basePrice]);

  // Payment status polling - check every 3 seconds when PIX is generated
  useEffect(() => {
    if (!pixData?.transaction_id || paymentConfirmed) return;
    const checkPaymentStatus = async () => {
      try {
        setCheckingPayment(true);
        const response = await fetch(`https://gjzhntrcogbamirtudsp.supabase.co/functions/v1/check-payment-status?transaction_id=${encodeURIComponent(pixData.transaction_id)}`);
        const result = await response.json();
        if (result.success && result.data.is_paid) {
          setPaymentConfirmed(true);

          // Fire Facebook Purchase event (deduped automatically by trackPurchase)
          trackPurchase({
            value: result.data.amount,
            transactionId: result.data.transaction_id,
            customerName: result.data.customer.name,
            customerEmail: result.data.customer.email,
            customerPhone: result.data.customer.phone,
            customerDocument: result.data.customer.document
          });
          toast({
            title: "🎉 Pagamento Confirmado!",
            description: "Seu acesso será enviado para o email cadastrado."
          });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      } finally {
        setCheckingPayment(false);
      }
    };

    // Check immediately
    checkPaymentStatus();

    // Then check every 3 seconds
    const intervalId = setInterval(checkPaymentStatus, 3000);

    // Cleanup on unmount or when payment is confirmed
    return () => clearInterval(intervalId);
  }, [pixData?.transaction_id, paymentConfirmed, toast]);
  const calculateTotal = () => {
    let total = basePrice;
    selectedBumps.forEach(bumpId => {
      const bump = orderBumps.find(b => b.id === bumpId);
      if (bump) total += bump.price;
    });
    return total;
  };
  const calculateOriginalTotal = () => {
    let total = baseOriginalPrice;
    selectedBumps.forEach(bumpId => {
      const bump = orderBumps.find(b => b.id === bumpId);
      if (bump) total += bump.originalPrice;
    });
    return total;
  };
  const calculateDiscount = () => {
    return calculateOriginalTotal() - calculateTotal();
  };
  const toggleBump = (bumpId: string) => {
    setSelectedBumps(prev => prev.includes(bumpId) ? prev.filter(id => id !== bumpId) : [...prev, bumpId]);
  };

  // Capture UTM params
  const utmParams = {
    utm_source: searchParams.get('utm_source') || '',
    utm_medium: searchParams.get('utm_medium') || '',
    utm_campaign: searchParams.get('utm_campaign') || '',
    utm_content: searchParams.get('utm_content') || '',
    utm_term: searchParams.get('utm_term') || '',
    src: searchParams.get('src') || ''
  };

  // Get Facebook cookies
  const getFbCookies = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    return {
      fbp: cookies['_fbp'] || '',
      fbc: cookies['_fbc'] || ''
    };
  };
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    return numbers.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numbers.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  };
  const handleInputChange = (field: string, value: string) => {
    if (field === 'document') {
      value = formatCPF(value);
    } else if (field === 'phone') {
      value = formatPhone(value);
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // CPF validation algorithm
  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    
    // Check for known invalid patterns
    if (/^(\d)\1+$/.test(numbers)) return false;
    
    // Validate first digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(9))) return false;
    
    // Validate second digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(10))) return false;
    
    return true;
  };
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      errors.email = 'Digite um email válido';
    }
    
    const cpfNumbers = formData.document.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      errors.document = 'CPF deve ter 11 dígitos';
    } else if (!validateCPF(formData.document)) {
      errors.document = 'CPF inválido';
    }
    
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    
    return true;
  };
  const handleGeneratePix = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setShowLoadingModal(true);
    const fbCookies = getFbCookies();
    
    // Set Advanced Matching data for Facebook Pixel
    const nameParts = formData.name.trim().split(' ');
    setAdvancedMatching({
      email: formData.email,
      phone: formData.phone,
      firstName: nameParts[0],
      lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
      externalId: formData.document,
    });
    try {
      const response = await fetch('https://gjzhntrcogbamirtudsp.supabase.co/functions/v1/create-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_document: formData.document,
          amount: calculateTotal(),
          order_bumps: selectedBumps,
          user_agent: navigator.userAgent,
          // Subscription data - all 3 AIs in one plan
          product_type: 'zyra_pro',
          plan_type: selectedPlan,
          is_subscription: true,
          ...utmParams,
          ...fbCookies
        })
      });
      const result = await response.json();
      if (result.success) {
        setPixData({
          pix_code: result.data.pix_code,
          payment_url: result.data.payment_url,
          transaction_id: result.data.transaction_id
        });
        // Scroll to top immediately
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Trigger confetti celebration
        triggerConfetti();
        // Track PixGerado event (deduped automatically by trackPixGerado)
        trackPixGerado(calculateTotal(), result.data.transaction_id);
        // Don't show toast for PIX generated - only show when copied
      } else {
        throw new Error(result.error || 'Erro ao gerar PIX');
      }
    } catch (error) {
      console.error('Error generating PIX:', error);
      toast({
        title: "Erro ao gerar PIX",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowLoadingModal(false);
    }
  };
  const handleCopyPix = () => {
    if (!pixData?.pix_code) return;
    navigator.clipboard.writeText(pixData.pix_code);
    setCopied(true);
    toast({
      title: "✓ Código PIX copiado!",
      description: "Cole no app do seu banco para pagar.",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 3000);
  };
  const handleEditEmail = () => {
    setEditingEmail(formData.email);
    setIsEditingEmail(true);
  };
  const handleSaveEmail = async () => {
    if (!editingEmail.trim() || !editingEmail.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido",
        variant: "destructive"
      });
      return;
    }
    if (!pixData?.transaction_id) {
      toast({
        title: "Erro",
        description: "Transação não encontrada",
        variant: "destructive"
      });
      return;
    }
    setSavingEmail(true);
    try {
      const response = await fetch('https://gjzhntrcogbamirtudsp.supabase.co/functions/v1/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_id: pixData.transaction_id,
          new_email: editingEmail,
          original_email: formData.email
        })
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar email');
      }
      setFormData(prev => ({
        ...prev,
        email: editingEmail
      }));
      setIsEditingEmail(false);
      toast({
        title: "Email atualizado!",
        description: "O acesso será enviado para o novo email."
      });
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: "Erro ao atualizar email",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setSavingEmail(false);
    }
  };
  const handleCancelEditEmail = () => {
    setIsEditingEmail(false);
    setEditingEmail('');
  };
  return <div className="min-h-screen bg-background relative overflow-hidden" style={{ maxWidth: "100vw" }}>
      {/* Cinematic Background - same as Index */}
      <CinematicBackground />
      
      {/* Fixed Top Bar - Revendas */}
      <div 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'linear-gradient(135deg, #c53030 0%, #9b2c2c 40%, #e53e3e 70%, #f56565 100%)',
          boxShadow: '0 2px 20px rgba(197, 48, 48, 0.3)',
        }}
      >
        <div className="container py-2.5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-white font-medium">Revendas com vagas limitadas.</span>
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
      
      <main
        className={`relative z-10 py-4 sm:py-6 lg:py-8 container px-4 sm:px-6 lg:px-4 xl:px-6 pt-16 sm:pt-18 lg:pt-20`}
        style={{ maxWidth: '100vw', width: '100%', overflowX: 'clip' }}
      >
        <div className={`${!pixData ? 'max-w-5xl lg:max-w-6xl' : 'max-w-md'} mx-auto`} style={{ width: '100%' }}>

          <div
            className={`grid gap-6 ${!pixData ? 'md:grid-cols-2' : ''}`}
            style={{ width: '100%' }}
          >
            
            {/* Left Column - Order Summary - Hide when PIX is generated */}
            {!pixData && <div className="order-2 md:order-1">
              {/* Premium Order Summary Card */}
              <div className="relative">
                {/* Outer glow - red cyber theme */}
                <div className="absolute -inset-1 rounded-2xl opacity-30 blur-xl" style={{
                  background: 'linear-gradient(135deg, hsl(0 85% 50% / 0.4) 0%, hsl(0 70% 35% / 0.2) 100%)'
                }} />
                
                <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-card/95 backdrop-blur-sm">
                  {/* Scan line effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
                  }} />
                  
                  {/* Header */}
                  <div className="relative p-5 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <img src={lpIcon} alt="LovaPool" className="w-6 h-6 object-contain" />
                        </div>
                        <div>
                          <h2 className="text-white font-semibold text-sm">Seu Pedido</h2>
                          <p className="text-[10px] text-white/40">LovaPool • Acesso Vitalício</p>
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded bg-primary/10 border border-primary/20">
                        <span className="text-[10px] font-medium text-primary">VITALÍCIO</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product & Features */}
                  <div className="p-5 space-y-4">
                    {/* Main Product Row */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <img src={lpIcon} alt="" className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">LovaPool Infinito</p>
                          <p className="text-[10px] text-white/40">Lovable Ilimitado</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/30 line-through">R$ {(baseOriginalPrice / 100).toFixed(2).replace('.', ',')}</p>
                        <p className="text-sm font-bold text-primary">R$ {(basePrice / 100).toFixed(2).replace('.', ',')}</p>
                      </div>
                    </div>

                    {/* Features Grid - Compact */}
                    <div className="grid grid-cols-2 gap-2">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-[11px] text-white/60">
                          <div className="w-3.5 h-3.5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Check className="w-2 h-2 text-primary" />
                          </div>
                          <span>{feature.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Bump */}
                    {orderBumps.length > 0 && (
                      <>
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Adicionar ao pedido</p>
                          
                          {orderBumps.map((bump) => {
                            const isSelected = selectedBumps.includes(bump.id);
                            const isRed = bump.badgeColor === 'primary';
                            return (
                              <motion.div
                                key={bump.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => toggleBump(bump.id)}
                                className={`relative cursor-pointer p-3 rounded-xl border transition-all ${
                                  isSelected 
                                    ? 'bg-primary/10 border-primary/40' 
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                    isSelected 
                                      ? 'bg-primary border-primary' 
                                      : 'border-white/20'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-medium text-white">{bump.name}</p>
                                      {bump.badge && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                                          {bump.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-white/40">{bump.description}</p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-[9px] text-white/30 line-through">R$ {(bump.originalPrice / 100).toFixed(2).replace('.', ',')}</p>
                                    <p className="text-xs font-bold text-primary">+ R$ {(bump.price / 100).toFixed(2).replace('.', ',')}</p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Total Section */}
                    <div className="space-y-2">
                      {selectedBumps.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40">Subtotal</span>
                          <span className="text-white/40 line-through">R$ {(calculateOriginalTotal() / 100).toFixed(2).replace('.', ',')}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Total</span>
                        <div className="flex items-baseline gap-2">
                          {calculateDiscount() > 0 && (
                            <span className="text-xs text-emerald-400">-{Math.round((calculateDiscount() / calculateOriginalTotal()) * 100)}%</span>
                          )}
                          <span className="text-xl font-bold text-white">
                            R$ {(calculateTotal() / 100).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button - 3D Effect */}
                    <div className="relative group">
                      {/* 3D shadow layer */}
                      <div 
                        className="absolute inset-0 rounded-xl transition-all duration-200 group-hover:translate-y-1"
                        style={{
                          background: 'hsl(142 76% 25%)',
                          transform: 'translateY(4px)',
                        }}
                      />
                      <Button 
                        onClick={handleGeneratePix} 
                        disabled={loading} 
                        className="relative w-full h-12 text-sm font-bold text-white rounded-xl transition-all duration-200 group-hover:translate-y-[2px] group-active:translate-y-[4px]"
                        style={{
                          background: 'linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 76% 40%) 100%)',
                          boxShadow: 'inset 0 1px 0 hsl(142 71% 60%), inset 0 -2px 0 hsl(142 76% 30%)',
                          border: '1px solid hsl(142 76% 35%)',
                        }}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gerando PIX...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Finalizar Compra
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-[10px] text-white/30">Pagamento 100% seguro</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>}

            {/* Right Column - PIX Payment */}
            <div className={`w-full min-w-0 ${!pixData ? "order-1 md:order-2" : ""}`}>
              {/* Product Preview Image - Hide when PIX is generated */}
              {!pixData && (
                <div className="relative mb-4 overflow-visible">
                  <div className="flex flex-col items-center mb-3">
                    <span className="text-[10px] text-primary/60 uppercase tracking-[0.2em] font-mono">LOVABLE ILIMITADO</span>
                  </div>
                  
                  {/* Product Card - Compact */}
                  <div className="relative z-10">
                    <div className="bg-card/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2.5 flex items-center gap-3">
                      {/* Icon - LP logo */}
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/20">
                        <img src={productIcon} alt={productConfig.title} className="w-6 h-6 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm leading-tight">LovaPool</h3>
                        <span className="text-[11px] text-white/40">Acesso imediato</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              

                {/* Cyber Hacker Form Card */}
                <div className="relative rounded-2xl overflow-hidden" style={{ maxWidth: '100%' }}>
                  {/* Animated border glow */}
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/50 via-red-600/30 to-primary/50 opacity-60" />
                  
                  {/* Scan line effect overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 2px, rgba(255,0,0,0.1) 4px)'
                  }} />
                  
                  <div className="relative bg-card/95 backdrop-blur-sm rounded-2xl border border-primary/20 overflow-hidden">
                    {/* Header with cyber styling */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                    
                <div className="p-4 sm:p-6 overflow-hidden" style={{ maxWidth: '100%' }}>
                {/* Header - Hide when PIX is generated */}
                {!pixData && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-lg bg-primary/30 blur-md" />
                        <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-red-900/50 border border-primary/40 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-white text-base font-semibold tracking-wide">Digite seus dados</h2>
                      </div>
                    </div>
                  </>
                )}

                {!pixData ? (/* Customer Form */
                <div className="space-y-4">
                    <div className="relative">
                      <Label htmlFor="name" className={`text-sm font-medium ${fieldErrors.name ? 'text-red-400' : 'text-white'}`}>
                        <span className="text-primary/60 font-mono">&gt;</span> Nome completo
                      </Label>
                      <div className="relative mt-1">
                        <Input 
                          id="name" 
                          placeholder="Seu nome completo" 
                          value={formData.name} 
                          onChange={e => handleInputChange('name', e.target.value)} 
                          className={`h-12 sm:h-14 text-base transition-all bg-black/40 border-2 ${
                            fieldErrors.name 
                              ? 'border-red-500 focus:border-red-500 pr-10' 
                              : formData.name.trim() 
                                ? 'border-emerald-500 pr-10' 
                                : 'border-primary/30 focus:border-primary/60'
                          }`}
                          style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)' }}
                        />
                        {fieldErrors.name ? (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center animate-scale-in">
                            <AlertCircle className="w-3 h-3 text-white" />
                          </div>
                        ) : formData.name.trim() && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center animate-scale-in">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      {fieldErrors.name && (
                        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <Label htmlFor="email" className={`text-sm font-medium ${fieldErrors.email ? 'text-red-400' : 'text-white'}`}>
                        <span className="text-primary/60 font-mono">&gt;</span> Email
                      </Label>
                      <div className="relative mt-1">
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="seu@email.com" 
                          value={formData.email} 
                          onChange={e => handleInputChange('email', e.target.value)} 
                          className={`h-12 sm:h-14 text-base transition-all bg-black/40 border-2 ${
                            fieldErrors.email 
                              ? 'border-red-500 focus:border-red-500 pr-10' 
                              : formData.email.includes('@') 
                                ? 'border-emerald-500 pr-10' 
                                : 'border-primary/30 focus:border-primary/60'
                          }`}
                          style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)' }}
                        />
                        {fieldErrors.email ? (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center animate-scale-in">
                            <AlertCircle className="w-3 h-3 text-white" />
                          </div>
                        ) : formData.email.includes('@') && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center animate-scale-in">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      {fieldErrors.email && (
                        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <Label htmlFor="phone" className="text-sm font-medium text-white">
                        <span className="text-primary/60 font-mono">&gt;</span> WhatsApp
                      </Label>
                      <div className="relative mt-1">
                        <Input 
                          id="phone" 
                          placeholder="(11) 99999-9999" 
                          value={formData.phone} 
                          onChange={e => handleInputChange('phone', e.target.value)} 
                          className={`h-12 sm:h-14 text-base transition-all bg-black/40 border-2 border-primary/30 focus:border-primary/60 ${
                            formData.phone.replace(/\D/g, '').length >= 10 ? 'border-emerald-500 pr-10' : ''
                          }`}
                          style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)' }}
                        />
                        {formData.phone.replace(/\D/g, '').length >= 10 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center animate-scale-in">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Label htmlFor="document" className={`text-sm font-medium ${fieldErrors.document ? 'text-red-400' : 'text-white'}`}>
                        <span className="text-primary/60 font-mono">&gt;</span> CPF
                      </Label>
                      <div className="relative mt-1">
                        <Input 
                          id="document" 
                          placeholder="000.000.000-00" 
                          value={formData.document} 
                          onChange={e => handleInputChange('document', e.target.value)} 
                          className={`h-12 sm:h-14 text-base transition-all bg-black/40 border-2 ${
                            fieldErrors.document 
                              ? 'border-red-500 focus:border-red-500 pr-10' 
                              : formData.document.replace(/\D/g, '').length === 11 && validateCPF(formData.document)
                                ? 'border-emerald-500 pr-10' 
                                : 'border-primary/30 focus:border-primary/60'
                          }`}
                          style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)' }}
                        />
                        {fieldErrors.document ? (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center animate-scale-in">
                            <AlertCircle className="w-3 h-3 text-white" />
                          </div>
                        ) : formData.document.replace(/\D/g, '').length === 11 && validateCPF(formData.document) && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center animate-scale-in">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      {fieldErrors.document && (
                        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fieldErrors.document}
                        </p>
                      )}
                    </div>

                    {/* Order Bumps Section */}
                    {orderBumps.length > 0 && (
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Aproveite a oferta</span>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </div>
                        
                        {orderBumps.map((bump) => {
                          const isSelected = selectedBumps.includes(bump.id);
                          const isAmber = bump.badgeColor === 'amber';
                          
                          return (
                            <motion.div
                              key={bump.id}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedBumps(selectedBumps.filter(id => id !== bump.id));
                                } else {
                                  setSelectedBumps([...selectedBumps, bump.id]);
                                }
                              }}
                              className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
                                isSelected 
                                  ? isAmber
                                    ? 'ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                                    : 'ring-2 ring-primary/50 shadow-lg shadow-primary/10'
                                  : 'ring-1 ring-white/10 hover:ring-white/20'
                              }`}
                            >
                              {/* Gradient background */}
                              <div className={`absolute inset-0 transition-opacity duration-300 ${
                                isSelected ? 'opacity-100' : 'opacity-50'
                              } ${
                                isAmber 
                                  ? 'bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent' 
                                  : 'bg-gradient-to-br from-primary/10 via-accent/5 to-transparent'
                              }`} />
                              
                              {/* Content */}
                              <div className="relative p-4">
                                {/* Checkbox - top right */}
                                <div className="absolute top-3 right-3">
                                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                    isSelected 
                                      ? isAmber
                                        ? 'bg-amber-500 border-amber-500'
                                        : 'bg-primary border-primary'
                                      : 'border-white/30 bg-white/5'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                </div>
                                
                                {/* Main content row */}
                                <div className="flex gap-3 pr-8">
                                  {/* Icon */}
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                                    isAmber 
                                      ? 'bg-amber-500/15 border-amber-500/20' 
                                      : 'bg-primary/15 border-primary/20'
                                  }`}>
                                    <img src={lpIcon} alt={bump.name} className="w-7 h-7 object-contain" />
                                  </div>
                                  
                                  {/* Text */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-foreground leading-tight">{bump.name}</h4>
                                    <p className={`text-xs font-medium mt-0.5 ${isAmber ? 'text-amber-400/80' : 'text-primary/80'}`}>
                                      {bump.subtitle}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                                      {bump.description}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Price footer */}
                                <div className={`mt-3 pt-3 border-t flex items-center justify-between ${
                                  isAmber ? 'border-amber-500/20' : 'border-primary/20'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground/60 line-through">
                                      R$ {(bump.originalPrice / 100).toFixed(2).replace('.', ',')}
                                    </span>
                                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                      isAmber ? 'bg-amber-500/20 text-amber-300' : 'bg-primary/20 text-primary'
                                    }`}>
                                      -{Math.round((1 - bump.price / bump.originalPrice) * 100)}%
                                    </span>
                                  </div>
                                  <span className={`text-lg font-bold ${isAmber ? 'text-amber-400' : 'text-primary'}`}>
                                    + R$ {(bump.price / 100).toFixed(2).replace('.', ',')}
                                    {bump.isMonthly && <span className="text-xs font-normal text-muted-foreground">/mês</span>}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {/* CTA Button - 3D Effect */}
                    <div className="relative group">
                      {/* 3D shadow layer */}
                      <div 
                        className="absolute inset-0 rounded-xl transition-all duration-200 group-hover:translate-y-1"
                        style={{
                          background: 'hsl(142 76% 25%)',
                          transform: 'translateY(4px)',
                        }}
                      />
                      <Button 
                        onClick={handleGeneratePix} 
                        disabled={loading} 
                        className="relative w-full h-14 text-base font-bold text-white rounded-xl transition-all duration-200 group-hover:translate-y-[2px] group-active:translate-y-[4px]"
                        style={{
                          background: 'linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 76% 40%) 100%)',
                          boxShadow: 'inset 0 1px 0 hsl(142 71% 60%), inset 0 -2px 0 hsl(142 76% 30%)',
                          border: '1px solid hsl(142 76% 35%)',
                        }}
                      >
                        {loading ? <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Gerando PIX...
                          </> : <>
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Finalizar Compra
                          </>}
                      </Button>
                    </div>

                    {/* PIX Payment Instructions - 3 Steps */}
                    <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                      <h3 className="text-sm font-medium text-white text-center">Instruções de Pagamento PIX</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">1</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">Copie o código PIX</p>
                            <p className="text-xs text-white/50">
                              Clique no botão para copiar o código de pagamento.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">2</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">Abra o app do seu banco</p>
                            <p className="text-xs text-white/50">
                              Acesse a área PIX e cole o código copiado.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">3</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">Confirme o pagamento</p>
                            <p className="text-xs text-white/50">
                              Após pagar, aguarde a confirmação automática na tela.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>) : paymentConfirmed ? (
                    <PaymentConfirmedScreen email={formData.email} />
                  ) : (/* PIX Payment Display */
                <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                    {/* Compact Header */}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-white mb-1">Pagamento PIX</h3>
                      <p className="text-xs text-white/50">Escaneie o QR Code ou copie o código</p>
                    </div>

                    {/* QR Code Area - Prominent */}
                    <div className="bg-white rounded-xl p-5 mb-4">
                      <div className="aspect-square max-w-[180px] mx-auto bg-white rounded-lg flex items-center justify-center overflow-hidden relative">
                        {pixData.pix_code ? <>
                            <div className="absolute inset-0 flex items-center justify-center bg-white z-10 transition-opacity duration-300" id="qr-loading">
                              <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData.pix_code)}`} alt="QR Code PIX" className="w-full h-full max-w-full" onLoad={e => {
                          const loader = document.getElementById('qr-loading');
                          if (loader) loader.style.opacity = '0';
                          setTimeout(() => {
                            if (loader) loader.style.display = 'none';
                          }, 300);
                        }} />
                          </> : <div className="text-center">
                            <QrCode className="w-24 h-24 text-gray-800 mx-auto mb-2" />
                            <p className="text-xs text-gray-600">QR Code</p>
                          </div>}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4 text-center">
                      <p className="text-xs text-white/60 mb-1">Valor a pagar</p>
                      <p className="text-2xl font-bold text-primary">R$ {(calculateTotal() / 100).toFixed(2).replace('.', ',')}</p>
                    </div>

                    {/* PIX Copy-Paste */}
                    <div className="space-y-3">
                      <div className="bg-muted/50 border border-border/50 rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Código PIX</p>
                        <p className="text-xs text-foreground font-mono truncate">
                          {pixData.pix_code?.substring(0, 50)}...
                        </p>
                      </div>

                      <Button onClick={handleCopyPix} className="w-full h-12 text-sm font-bold bg-gradient-to-r from-primary to-red-600 hover:opacity-90 text-white rounded-xl">
                        {copied ? <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            CÓDIGO COPIADO!
                          </> : <>
                            <Copy className="w-4 h-4 mr-2" />
                            COPIAR CÓDIGO PIX
                          </>}
                      </Button>
                    </div>
                  </div>)}
                  </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-6 text-center">
              <img src={lovapoolLogo} alt="LovaPool" className="h-8 mx-auto mb-4 opacity-70" />
              <p className="text-xs text-muted-foreground mb-2">
                Pagamento 100% seguro • Garantia de 7 dias
              </p>
              <p className="text-xs text-muted-foreground/60">
                © {new Date().getFullYear()} LovaPool. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Loading Modal for PIX Generation */}
      <AnimatePresence>
        {showLoadingModal && (
          <Dialog open={showLoadingModal} onOpenChange={() => {}}>
            <DialogContent
              className="!left-4 !right-4 !w-auto !max-w-none !translate-x-0 bg-black/95 backdrop-blur-xl border-primary/30 rounded-2xl [&>button]:hidden sm:!left-[50%] sm:!right-auto sm:!w-full sm:!max-w-xs sm:!translate-x-[-50%]"
              onPointerDownOutside={(e) => e.preventDefault()}
            >
              <motion.div 
                className="flex flex-col items-center justify-center py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Simple Pulse Loader */}
                <motion.div 
                  className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </motion.div>

                <p className="text-sm font-medium text-white">Gerando PIX...</p>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>;
};
export default Checkout;