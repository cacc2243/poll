import { ArrowLeft, Copy, Check, ShieldCheck, Clock, ShoppingCart, QrCode, CheckCircle, Loader2, Pencil, Plus, Zap, Smartphone, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import CinematicBackground from "@/components/CinematicBackground";
import PaymentConfirmedScreen from "@/components/PaymentConfirmedScreen";
import zyraProLogo from "@/assets/zyra-pro-logo.png";
import zyraCheckoutPreview from "@/assets/zyra-checkout-preview.png";
import zyraLogoIcon from "@/assets/zyra-logo-icon.png";
import zyraProFullLogo from "@/assets/zyra-pro-full-logo.png";
import zyraProLogoWhite from "@/assets/zyra-pro-logo-white.png";
import googleAiIcon from "@/assets/google-ai-icon.png";
import v0IconWhite from "@/assets/v0-icon-white.png";
import lovableColorIcon from "@/assets/lovable-color-icon.png";
import { trackInitiateCheckout, trackPixGerado, trackPurchase, setAdvancedMatching } from "@/hooks/useFacebookPixel";
const features = [{
  text: "1 Ativação de Licença"
}, {
  text: "Acesso a Área de Membros"
}, {
  text: "Grupo VIP Networking"
}, {
  text: "Suporte Direto e Rápido"
}, {
  text: "Todas atualizações"
}];
const orderBumps: {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  badge?: string;
  badgeColor?: 'primary' | 'amber' | 'blue';
}[] = [
  {
    id: 'metodo-google-ai',
    name: 'Método Google AI Ultra',
    subtitle: '45.000 Créditos (INFINITO)',
    description: 'Tenha acesso ILIMITADO ao VEO 3.1, Flow & Whisk, Gemini 2.5 Pro, Nano Banana Pro e muito mais!',
    price: 4700,
    originalPrice: 19700,
    image: '',
    badge: 'NOVO',
    badgeColor: 'amber'
  },
  {
    id: 'metodo-conta-pro',
    name: 'Método Conta PRO Lovable',
    subtitle: 'Sem custos recorrentes',
    description: 'Crie contas PRO no Lovable sem custos mensais recorrentes.',
    price: 3900,
    originalPrice: 7990,
    image: '',
    badge: 'NOVO',
    badgeColor: 'amber'
  },
  {
    id: 'licenca-v0',
    name: 'Licença Extensão V0.dev',
    subtitle: 'Versão Beta',
    description: 'Extensão do V0.dev, ainda na versão beta.',
    price: 14700,
    originalPrice: 29700,
    image: '',
    badge: 'ACESSO ANTECIPADO',
    badgeColor: 'blue'
  }
];
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
// Product configurations for different products
const productConfigs: Record<string, { name: string; title: string; price: number; originalPrice: number; type: 'extension' | 'method'; icon: string; subtitle: string }> = {
  lovable: {
    name: 'Extensão Zyra Pro | Lovable',
    title: 'Zyra Pro Lovable',
    price: 19700,
    originalPrice: 29700,
    type: 'extension',
    icon: 'zyra',
    subtitle: 'Licença Vitalícia',
  },
  v0: {
    name: 'Extensão Zyra Pro | V0.dev',
    title: 'Zyra Pro V0',
    price: 14700,
    originalPrice: 29700,
    type: 'extension',
    icon: 'v0',
    subtitle: 'Acesso Beta Antecipado',
  },
  manus: {
    name: 'Extensão Zyra Pro | Manus AI',
    title: 'Zyra Pro Manus',
    price: 14700,
    originalPrice: 29700,
    type: 'extension',
    icon: 'manus',
    subtitle: 'Acesso Beta Antecipado',
  },
  'metodo-google-ai': {
    name: 'Método Google AI Ultra',
    title: 'Google AI Ultra',
    price: 4700,
    originalPrice: 19700,
    type: 'method',
    icon: 'google',
    subtitle: '45.000 Créditos (INFINITO)',
  },
  'metodo-conta-pro': {
    name: 'Método Conta PRO Lovable',
    title: 'Conta PRO Lovable',
    price: 3900,
    originalPrice: 7990,
    type: 'method',
    icon: 'lovable',
    subtitle: 'Sem custos recorrentes',
  },
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
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

  // Get product from URL params or default to lovable
  const productId = searchParams.get('product') || 'lovable';
  const productConfig = productConfigs[productId] || productConfigs.lovable;
  
  const basePrice = productConfig.price;
  const baseOriginalPrice = productConfig.originalPrice;
  const productName = productConfig.name;
  const isMethodProduct = productConfig.type === 'method';
  const isBetaProduct = productId === 'v0' || productId === 'manus';

  // Get product icon based on config
  const getProductIcon = () => {
    switch (productConfig.icon) {
      case 'google': return googleAiIcon;
      case 'lovable': return lovableColorIcon;
      case 'v0': return v0IconWhite;
      default: return zyraLogoIcon;
    }
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
        // Track PixGerado event (deduped automatically by trackPixGerado)
        trackPixGerado(calculateTotal(), result.data.transaction_id);
        toast({
          title: "PIX gerado com sucesso!",
          description: "Escaneie o QR Code ou copie o código para pagar."
        });
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
    }
  };
  const handleCopyPix = () => {
    if (!pixData?.pix_code) return;
    navigator.clipboard.writeText(pixData.pix_code);
    setCopied(true);
    toast({
      title: "Código PIX copiado!",
      description: "Cole no app do seu banco para pagar."
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
  return <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Cinematic Background - same as Index */}
      <CinematicBackground />
      
      {/* Fixed Top Info Banner */}
      {!pixData && <div className="fixed top-4 left-0 right-0 z-50 py-3">
          <div className="container px-4">
            <div className="max-w-md mx-auto md:max-w-4xl">
              <div className={`border border-primary/20 rounded-xl px-4 py-3 text-center shadow-lg transition-all duration-300 ${
                isScrolled 
                  ? 'bg-card/60 backdrop-blur-xl border-white/10' 
                  : 'bg-card/70'
              }`}>
                <p className="text-sm font-medium text-white">
                  Você está adquirindo <span className="text-primary font-semibold">({selectedBumps.length + 1})</span> {isMethodProduct ? (selectedBumps.length > 0 ? 'acessos' : 'um acesso') : (selectedBumps.length > 0 ? 'licenças' : 'uma licença')}.
                </p>
              </div>
            </div>
          </div>
        </div>}
      <main className={`relative z-10 container px-4 py-8 sm:py-12 ${!pixData ? 'pt-24' : ''}`}>
        <div className="max-w-4xl mx-auto">
          
          <div className={`grid gap-8 ${!pixData ? 'md:grid-cols-2' : 'max-w-md mx-auto'}`}>
            
            {/* Left Column - Order Summary - Hide when PIX is generated */}
            {!pixData && <div className="order-2 md:order-1">
              {/* Premium Order Summary Card */}
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute -inset-1 rounded-3xl opacity-40 blur-xl" style={{
                background: 'linear-gradient(135deg, hsl(252 85% 67% / 0.3) 0%, hsl(254 89% 78% / 0.15) 100%)'
              }} />
                
                <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-primary/40 via-primary/15 to-transparent">
                  <div className="bg-card rounded-3xl overflow-hidden">
                    
                    {/* Header with full logo */}
                    <div className="relative p-6 pb-4 text-center border-b border-white/10">
                      <img src={zyraProFullLogo} alt="Zyra Pro" className="h-10 mx-auto mb-4" />
                      <h2 className="text-white font-normal text-base">Resumo do Pedido</h2>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-6 space-y-5">
                      {/* Base Product */}
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${productConfig.icon === 'v0' ? 'bg-black' : 'bg-gradient-to-br from-primary/20 to-accent/10'}`}>
                          <img src={productIcon} alt={productConfig.title} className="w-9 h-9" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm">{productConfig.title}</h3>
                          <p className="text-xs text-white/50">
                            {productConfig.subtitle}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/40 line-through">R$ {(baseOriginalPrice / 100).toFixed(0).replace('.', ',')}</p>
                          <p className="text-base font-bold text-primary">R$ {(basePrice / 100).toFixed(0).replace('.', ',')}</p>
                        </div>
                      </div>

                      {/* Selected Order Bumps */}
                      {selectedBumps.map(bumpId => {
                        const bump = orderBumps.find(b => b.id === bumpId);
                        if (!bump) return null;
                        return (
                          <div key={bump.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              bump.id === 'licenca-v0' ? 'bg-black' : 'bg-gradient-to-br from-primary/20 to-accent/10'
                            }`}>
                              <img 
                                src={
                                  bump.id === 'metodo-google-ai' ? googleAiIcon :
                                  bump.id === 'metodo-conta-pro' ? lovableColorIcon :
                                  bump.id === 'licenca-v0' ? v0IconWhite :
                                  zyraLogoIcon
                                } 
                                alt={bump.name} 
                                className="w-5 h-5 object-contain" 
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white text-xs">{bump.name}</h3>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-primary">+ R$ {(bump.price / 100).toFixed(2).replace('.', ',')}</p>
                            </div>
                          </div>
                        );
                      })}

                      {/* Features */}
                      <div className="space-y-2.5">
                        {features.map((feature, index) => <div key={index} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-sm text-white/70">{feature.text}</span>
                          </div>)}
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                      {/* Subtotal & Discount (only show when bumps selected) */}
                      {selectedBumps.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/50">Subtotal</span>
                            <span className="text-white/70 line-through">R$ {(calculateOriginalTotal() / 100).toFixed(2).replace('.', ',')}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-emerald-400">Desconto</span>
                            <span className="text-emerald-400">- R$ {(calculateDiscount() / 100).toFixed(2).replace('.', ',')}</span>
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Total</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            R$ {(calculateTotal() / 100).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>}

            {/* Right Column - PIX Payment */}
            <div className={!pixData ? "order-1 md:order-2" : ""}>
              {/* Product Preview Image - Hide when PIX is generated */}
              {!pixData && (
                <div className="relative pt-52 mb-6 overflow-visible">
                  {/* Image behind the card - positioned at top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-0 overflow-visible">
                    <img src={zyraCheckoutPreview} alt="Zyra Pro Preview" className="w-[280px] max-w-none h-auto object-contain" />
                  </div>
                  
                  {/* Product Card - Fully visible in front */}
                  <div className="relative z-10">
                    <div className="relative p-[1px] rounded-xl bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30">
                      <div className="bg-gradient-to-br from-card via-card/95 to-primary/5 backdrop-blur-xl rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${productConfig.icon === 'v0' ? 'bg-black' : 'bg-gradient-to-br from-primary/20 to-accent/10'}`}>
                          <img src={productIcon} alt={productConfig.title} className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm">{productName}</h3>
                          <span className="text-[10px] text-white/60">{productConfig.subtitle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-xs font-medium text-primary">{isMethodProduct ? '1 acesso' : '1 licença'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-card/80 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mt-4">
                <div className="p-6 sm:p-8">
                {/* Header - Hide when PIX is generated */}
                {!pixData && <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="text-white text-base font-medium">Preencha suas informações:</h2>
                  </div>}

                {!pixData ? (/* Customer Form */
                <div className="space-y-4">
                    <div className="relative">
                      <Label htmlFor="name" className={fieldErrors.name ? 'text-red-400' : ''}>Nome completo *</Label>
                      <div className="relative mt-1">
                        <Input 
                          id="name" 
                          placeholder="Seu nome completo" 
                          value={formData.name} 
                          onChange={e => handleInputChange('name', e.target.value)} 
                          className={`h-14 text-base transition-all bg-white/5 ${
                            fieldErrors.name 
                              ? 'border-red-500 focus:border-red-500 pr-10' 
                              : formData.name.trim() 
                                ? 'border-primary pr-10' 
                                : 'border-white/10'
                          }`}
                        />
                        {fieldErrors.name ? (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center animate-scale-in">
                            <AlertCircle className="w-3 h-3 text-white" />
                          </div>
                        ) : formData.name.trim() && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
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
                      <Label htmlFor="email" className={fieldErrors.email ? 'text-red-400' : 'text-white/80'}>Email *</Label>
                      <div className="relative mt-1">
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="seu@email.com" 
                          value={formData.email} 
                          onChange={e => handleInputChange('email', e.target.value)} 
                          className={`h-14 text-base transition-all bg-white/5 ${
                            fieldErrors.email 
                              ? 'border-red-500 focus:border-red-500 pr-10' 
                              : formData.email.includes('@') 
                                ? 'border-primary pr-10' 
                                : 'border-white/10'
                          }`}
                        />
                        {fieldErrors.email ? (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center animate-scale-in">
                            <AlertCircle className="w-3 h-3 text-white" />
                          </div>
                        ) : formData.email.includes('@') && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
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
                      <Label htmlFor="phone" className="text-white/80">WhatsApp</Label>
                      <div className="relative mt-1">
                        <Input 
                          id="phone" 
                          placeholder="(11) 99999-9999" 
                          value={formData.phone} 
                          onChange={e => handleInputChange('phone', e.target.value)} 
                          className={`h-14 text-base transition-all bg-white/5 border-white/10 ${
                            formData.phone.replace(/\D/g, '').length >= 10 ? 'border-primary pr-10' : ''
                          }`}
                        />
                        {formData.phone.replace(/\D/g, '').length >= 10 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Label htmlFor="document" className={fieldErrors.document ? 'text-red-400' : 'text-white/80'}>CPF *</Label>
                      <div className="relative mt-1">
                        <Input 
                          id="document" 
                          placeholder="000.000.000-00" 
                          value={formData.document} 
                          onChange={e => handleInputChange('document', e.target.value)} 
                          className={`h-14 text-base transition-all bg-white/5 ${
                            fieldErrors.document 
                              ? 'border-red-500 focus:border-red-500 pr-10' 
                              : formData.document.replace(/\D/g, '').length === 11 && validateCPF(formData.document)
                                ? 'border-primary pr-10' 
                                : 'border-white/10'
                          }`}
                        />
                        {fieldErrors.document ? (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center animate-scale-in">
                            <AlertCircle className="w-3 h-3 text-white" />
                          </div>
                        ) : formData.document.replace(/\D/g, '').length === 11 && validateCPF(formData.document) && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
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

                    {/* Order Bumps - Hide for method products, filter out current product for extensions */}
                    {(() => {
                      // Don't show bumps for method products
                      if (isMethodProduct) return null;
                      const availableBumps = orderBumps.filter(bump => bump.id !== productId);
                      if (availableBumps.length === 0) return null;
                      return (
                        <div className="pt-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium text-white">Adicione com desconto</span>
                          </div>
                          
                          {availableBumps.map(bump => <div key={bump.id} onClick={() => toggleBump(bump.id)} className={`relative cursor-pointer rounded-xl overflow-hidden transition-all ${selectedBumps.includes(bump.id) ? 'border-2 border-dashed border-primary bg-white/5' : 'border-2 border-dashed border-white/20 bg-white/5 hover:border-primary/50'}`}>
                              {/* Badge */}
                              {bump.badge && (
                                <div className={`absolute top-0 right-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded-bl-lg z-10 ${
                                  bump.badgeColor === 'amber' 
                                    ? 'bg-amber-500 text-amber-950' 
                                    : bump.badgeColor === 'blue'
                                    ? 'bg-blue-500 text-blue-950'
                                    : 'bg-primary text-white'
                                }`}>
                                  {bump.badge}
                                </div>
                              )}
                              {/* Selected overlay - centered */}
                              {selectedBumps.includes(bump.id) && (
                                <div className="absolute inset-0 bg-black/40 pointer-events-none flex items-center justify-center z-[5]">
                                  <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Selecionado</span>
                                </div>
                              )}
                              <div className="relative p-4 space-y-3">
                                {/* Top row: Image + Title + Checkbox */}
                                <div className="flex items-start gap-3">
                                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    bump.id === 'licenca-v0' ? 'bg-black' : 'bg-gradient-to-br from-primary/20 to-accent/10'
                                  }`}>
                                    <img 
                                      src={
                                        bump.id === 'metodo-google-ai' ? googleAiIcon :
                                        bump.id === 'metodo-conta-pro' ? lovableColorIcon :
                                        bump.id === 'licenca-v0' ? v0IconWhite :
                                        zyraLogoIcon
                                      } 
                                      alt={bump.name} 
                                      className="w-8 h-8 object-contain" 
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-white leading-tight">{bump.name}</h4>
                                    <span className="text-xs text-accent">{bump.subtitle}</span>
                                  </div>
                                  <Checkbox checked={selectedBumps.includes(bump.id)} className="flex-shrink-0 mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                </div>
                                
                                {/* Description - full width */}
                                <p className="text-xs text-white/50 leading-relaxed">{bump.description}</p>
                                
                                {/* Price row */}
                                <div className="flex items-center gap-2">
                                  <span className="text-sm line-through text-white/40">R$ {(bump.originalPrice / 100).toFixed(2).replace('.', ',')}</span>
                                  <span className="text-base font-semibold text-primary">+ R$ {(bump.price / 100).toFixed(2).replace('.', ',')}</span>
                                </div>
                              </div>
                            </div>)}
                        </div>
                      );
                    })()}

                    <Button onClick={handleGeneratePix} disabled={loading} className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl shadow-lg shadow-primary/25">
                      {loading ? <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Gerando PIX...
                        </> : <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Pagar R$ {(calculateTotal() / 100).toFixed(2).replace('.', ',')}
                        </>}
                    </Button>

                    {/* How It Works - 3 Steps */}
                    <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                      <h3 className="text-sm font-medium text-white text-center">Como Funciona</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">1</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">Compre sua licença</p>
                            <p className="text-xs text-white/50">
                              Faça o pagamento via PIX e receba o acesso instantaneamente no seu e-mail.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-accent">2</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-accent">Instale a extensão</p>
                            <p className="text-xs text-white/50">
                              Baixe e instale a extensão Zyra Pro no seu navegador em poucos cliques.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">3</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">Ative e use</p>
                            <p className="text-xs text-white/50">
                              Insira sua licença na extensão e comece a usar imediatamente.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>) : paymentConfirmed ? (
                    <PaymentConfirmedScreen email={formData.email} />
                  ) : (/* PIX Payment Display */
                <>
                    {/* Logo at top */}
                    <div className="flex justify-center mb-6">
                      <img src={zyraProLogoWhite} alt="Zyra Pro" className="h-10" />
                    </div>

                    {/* Order Summary */}
                    <div className="bg-muted/30 border border-border/50 rounded-xl p-4 mb-6">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Resumo do Pedido</h3>
                      
                      {/* Main Product */}
                      <div className="flex gap-3 pb-3 border-b border-border/30">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${productConfig.icon === 'v0' ? 'bg-black' : 'bg-gradient-to-br from-primary/20 to-accent/10'}`}>
                          <img src={productIcon} alt={productConfig.title} className="w-6 h-6 object-contain" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground text-xs">{productConfig.title} - {productConfig.subtitle}</h4>
                          <p className="text-xs text-muted-foreground">Acesso Completo</p>
                        </div>
                        <span className="text-xs font-bold text-primary">R$ {(basePrice / 100).toFixed(2).replace('.', ',')}</span>
                      </div>

                      {/* Selected Order Bumps */}
                      {selectedBumps.length > 0 && <div className="py-3 border-b border-border/30 space-y-2">
                          {selectedBumps.map(bumpId => {
                        const bump = orderBumps.find(b => b.id === bumpId);
                        if (!bump) return null;
                        const bumpIcon = bump.id === 'metodo-google-ai' ? googleAiIcon :
                                         bump.id === 'metodo-conta-pro' ? lovableColorIcon :
                                         bump.id === 'licenca-v0' ? v0IconWhite :
                                         zyraLogoIcon;
                        const isV0Bump = bump.id === 'licenca-v0';
                        return <div key={bumpId} className="flex gap-3 items-center">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isV0Bump ? 'bg-black' : 'bg-gradient-to-br from-primary/20 to-accent/10'}`}>
                                  <img src={bumpIcon} alt={bump.name} className="w-5 h-5 object-contain" />
                                </div>
                                <h4 className="flex-1 font-semibold text-foreground text-xs">{bump.name}</h4>
                                <span className="text-xs font-bold text-primary">+ R$ {(bump.price / 100).toFixed(2).replace('.', ',')}</span>
                              </div>;
                      })}
                        </div>}

                      {/* Total */}
                      <div className="flex justify-between items-center pt-3">
                        <span className="text-sm font-bold text-foreground">Total</span>
                        <span className="text-lg font-bold text-primary">R$ {(calculateTotal() / 100).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    {/* License Info Card */}
                    <div className="mb-4 p-4 bg-card/60 backdrop-blur-sm border border-white/10 rounded-xl">
                      <p className="text-xs text-white/60 mb-3 text-center">Sua licença será enviada para:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg">
                          <span className="text-xs text-white/50">Email:</span>
                          <span className="text-sm font-medium text-primary">{formData.email}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg">
                          <span className="text-xs text-white/50">CPF:</span>
                          <span className="text-sm font-medium text-primary">{formData.document}</span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Area */}
                    <div className="bg-white rounded-xl p-6 mb-4">
                      <div className="aspect-square max-w-[200px] mx-auto bg-white rounded-lg flex items-center justify-center overflow-hidden relative">
                        {pixData.pix_code ? <>
                            <div className="absolute inset-0 flex items-center justify-center bg-white z-10 transition-opacity duration-300" id="qr-loading">
                              <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData.pix_code)}`} alt="QR Code PIX" className="w-full h-full" onLoad={e => {
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

                    {/* OR Divider */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/50"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-card px-4 text-sm text-muted-foreground">ou copie o código</span>
                      </div>
                    </div>

                    {/* PIX Copy-Paste */}
                    <div className="space-y-4">
                      <div className="bg-muted/50 border border-border/50 rounded-xl p-4">
                        <p className="text-xs text-muted-foreground mb-2">Código PIX Copia e Cola</p>
                        <p className="text-sm text-foreground font-mono break-all line-clamp-2">
                          {pixData.pix_code?.substring(0, 60)}...
                        </p>
                      </div>

                      <Button onClick={handleCopyPix} className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl shadow-lg shadow-primary/25">
                        {copied ? <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            CÓDIGO COPIADO!
                          </> : <>
                            <Copy className="w-5 h-5 mr-2" />
                            COPIAR CÓDIGO PIX
                          </>}
                      </Button>
                    </div>
                  </>)}
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
              <img src={zyraProFullLogo} alt="Zyra Pro" className="h-8 mx-auto mb-4 opacity-70" />
              <p className="text-xs text-muted-foreground mb-2">
                Pagamento 100% seguro • Garantia de 7 dias
              </p>
              <p className="text-xs text-muted-foreground/60">
                © {new Date().getFullYear()} Zyra Pro. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Checkout;