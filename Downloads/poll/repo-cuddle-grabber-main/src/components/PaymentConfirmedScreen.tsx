import { CheckCircle } from "lucide-react";

interface PaymentConfirmedScreenProps {
  email: string;
}

const PaymentConfirmedScreen = ({ email }: PaymentConfirmedScreenProps) => {
  return (
    <div className="text-center py-8 space-y-6">
      {/* Success Icon */}
      <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
        <CheckCircle className="w-14 h-14 text-emerald-500" />
      </div>

      {/* Success Message */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-white">
          Pagamento Confirmado!
        </h3>
        <p className="text-white/70 text-sm">
          Seu pagamento foi processado com sucesso.
        </p>
      </div>

      {/* Confirmation Box */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-sm text-emerald-400 font-semibold uppercase tracking-wide">
            Transação Aprovada
          </p>
        </div>
        <p className="text-sm text-white/60">
          Você receberá os detalhes de acesso no email informado.
        </p>
      </div>
    </div>
  );
};

export default PaymentConfirmedScreen;
