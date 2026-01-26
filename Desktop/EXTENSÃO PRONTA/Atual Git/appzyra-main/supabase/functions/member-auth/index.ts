import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { action, email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Validate password strength
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ success: false, error: 'A senha deve ter pelo menos 6 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First, check if user has ANY transaction with access granted
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('id, customer_email, customer_name, customer_document, customer_phone, access_granted, payment_status, license_key')
      .eq('customer_email', emailLower)
      .order('created_at', { ascending: false });

    if (txError) {
      console.error('Error checking transactions:', txError);
      throw txError;
    }

    // Check if email exists in transactions
    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email não encontrado. Verifique se digitou corretamente ou realize uma compra.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if ANY transaction has access granted
    const hasAccess = transactions.some(tx => tx.access_granted === true);
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Acesso bloqueado. Entre em contato com o suporte pelo Instagram @ads.sand' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the transaction WITH a license key (prioritize this for extension download)
    // If no license found, use the most recent transaction for user data
    const transactionWithLicense = transactions.find(tx => tx.license_key !== null);
    const mostRecentTransaction = transactions[0];
    
    // Use transaction with license for license_key, but most recent for user data
    const primaryTransaction = transactionWithLicense || mostRecentTransaction;
    const licenseKey = transactionWithLicense?.license_key || null;

    console.log(`User ${emailLower} has ${transactions.length} transactions, license found: ${licenseKey ? 'yes' : 'no'}`);

    // Check if credentials already exist
    const { data: existingCreds, error: credsError } = await supabase
      .from('member_credentials')
      .select('id, password_hash')
      .eq('email', emailLower)
      .maybeSingle();

    if (credsError) {
      console.error('Error checking credentials:', credsError);
      throw credsError;
    }

    // Get fingerprint from license_devices if license exists
    let fingerprint = null;
    if (licenseKey) {
      const { data: license } = await supabase
        .from('licenses')
        .select('id')
        .eq('license_key', licenseKey)
        .maybeSingle();

      if (license) {
        const { data: device } = await supabase
          .from('license_devices')
          .select('device_fingerprint')
          .eq('license_id', license.id)
          .eq('is_active', true)
          .order('last_seen_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        fingerprint = device?.device_fingerprint || null;
      }
    }

    // Format CPF for display
    const formatCPF = (cpf: string | null) => {
      if (!cpf) return null;
      const cleaned = cpf.replace(/\D/g, '');
      if (cleaned.length !== 11) return cpf;
      return `${cleaned.slice(0,3)}.${cleaned.slice(3,6)}.${cleaned.slice(6,9)}-${cleaned.slice(9)}`;
    };

    const userData = {
      name: mostRecentTransaction?.customer_name || null,
      email: mostRecentTransaction?.customer_email || null,
      document: formatCPF(mostRecentTransaction?.customer_document),
      phone: mostRecentTransaction?.customer_phone || null,
      license_key: licenseKey,
      fingerprint: fingerprint,
    };

    if (action === 'register') {
      // Registration flow
      if (existingCreds) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Este email já possui uma conta. Faça login.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hash password and create credentials
      const passwordHash = await bcrypt.hash(password, 10);

      const { error: insertError } = await supabase
        .from('member_credentials')
        .insert({
          email: emailLower,
          password_hash: passwordHash,
        });

      if (insertError) {
        console.error('Error creating credentials:', insertError);
        throw insertError;
      }

      console.log(`Member registered: ${emailLower}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Conta criada com sucesso!',
          user_data: userData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'login') {
      // Login flow
      if (!existingCreds) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Conta não encontrada. Crie uma conta primeiro.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, existingCreds.password_hash);

      if (!passwordValid) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Senha incorreta. Tente novamente.' 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Member logged in: ${emailLower}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Login realizado com sucesso!',
          user_data: userData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Ação inválida. Use "register" ou "login".' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    console.error('Error in member-auth:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
