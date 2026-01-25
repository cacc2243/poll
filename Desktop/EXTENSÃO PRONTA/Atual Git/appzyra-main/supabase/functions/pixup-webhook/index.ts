import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

const FB_PIXEL_ID = '1390199348609324';
const FB_ACCESS_TOKEN = Deno.env.get('FB_ACCESS_TOKEN') || '';

// Minimum amount for license generation (R$ 97 = 9700 cents)
const MIN_AMOUNT_FOR_LICENSE = 9700;

// Token expiration time in minutes
const EMAIL_UPDATE_TOKEN_EXPIRATION_MINUTES = 15;

// Generate unique license in ZYRA-XXXX-XXXX-XXXX format using cryptographic randomness
function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = new Uint8Array(12); // 3 segments x 4 chars
  crypto.getRandomValues(randomBytes);
  
  const parts: string[] = ['ZYRA'];
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars[randomBytes[i * 4 + j] % chars.length];
    }
    parts.push(segment);
  }
  
  return parts.join('-');
}

// Generate cryptographically secure email update token
function generateEmailUpdateToken(): string {
  return crypto.randomUUID();
}

// Hash data using SHA-256
async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate unique license and save to transaction and licenses table
async function generateAndSaveLicense(
  supabase: any, 
  transactionId: string, 
  amount: number,
  customerEmail?: string,
  customerDocument?: string
): Promise<string | null> {
  // Validate amount
  if (amount < MIN_AMOUNT_FOR_LICENSE) {
    console.log(`Amount ${amount} is less than minimum ${MIN_AMOUNT_FOR_LICENSE}, skipping license generation`);
    return null;
  }

  // Check if transaction already has a license
  const { data: existingTx } = await supabase
    .from('transactions')
    .select('license_key')
    .eq('id', transactionId)
    .single();

  if (existingTx?.license_key) {
    console.log(`Transaction ${transactionId} already has license: ${existingTx.license_key}`);
    return existingTx.license_key;
  }

  // Generate unique license with retry
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const licenseKey = generateLicenseKey();
    
    // Check if license already exists in licenses table
    const { data: existingLicense } = await supabase
      .from('licenses')
      .select('id')
      .eq('license_key', licenseKey)
      .maybeSingle();

    // Also check transactions table for legacy
    const { data: existingTxLicense } = await supabase
      .from('transactions')
      .select('id')
      .eq('license_key', licenseKey)
      .maybeSingle();

    if (!existingLicense && !existingTxLicense) {
      // Prepare hashes for secure storage
      const emailHash = customerEmail ? await hashData(customerEmail) : null;
      const documentHash = customerDocument ? await hashData(customerDocument.replace(/\D/g, '')) : null;

      // Save to licenses table
      const { error: licenseError } = await supabase
        .from('licenses')
        .insert({
          license_key: licenseKey,
          transaction_id: transactionId,
          customer_email_hash: emailHash,
          customer_document_hash: documentHash,
          status: 'active',
          origin: 'automatic',
          max_devices: 3
        });

      if (licenseError) {
        console.error('Error saving to licenses table:', licenseError.message);
      }

      // Also save to transactions table for backward compatibility
      const { error: txError } = await supabase
        .from('transactions')
        .update({ 
          license_key: licenseKey,
          license_created_at: new Date().toISOString(),
          license_origin: 'automatic'
        })
        .eq('id', transactionId);

      if (!txError) {
        // Log the creation
        await supabase.from('license_logs').insert({
          license_key: licenseKey,
          action: 'created',
          metadata: { 
            origin: 'automatic', 
            transaction_id: transactionId,
            source: 'pixup-webhook'
          }
        });

        console.log(`License ${licenseKey} generated and saved for transaction ${transactionId}`);
        return licenseKey;
      }
      console.error(`Error saving license to transactions: ${txError.message}`);
    }

    attempts++;
    console.log(`License collision, retrying (${attempts}/${maxAttempts})`);
  }

  console.error(`Failed to generate unique license after ${maxAttempts} attempts`);
  return null;
}

// Send Facebook Conversions API event
async function sendFacebookPurchaseEvent(params: {
  value: number;
  currency: string;
  transactionId: string;
  email?: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  if (!FB_ACCESS_TOKEN) {
    console.log('FB_ACCESS_TOKEN not configured, skipping Purchase event');
    return;
  }

  try {
    const eventTime = Math.floor(Date.now() / 1000);
    
    const hashData = async (data: string): Promise<string> => {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const userData: Record<string, string> = {};
    
    if (params.email) userData.em = await hashData(params.email);
    if (params.phone) userData.ph = await hashData(params.phone.replace(/\D/g, ''));
    if (params.fbp) userData.fbp = params.fbp;
    if (params.fbc) userData.fbc = params.fbc;
    if (params.ipAddress) userData.client_ip_address = params.ipAddress;
    if (params.userAgent) userData.client_user_agent = params.userAgent;

    const eventData = {
      data: [{
        event_name: 'Purchase',
        event_time: eventTime,
        action_source: 'website',
        event_id: `purchase_${params.transactionId}`,
        user_data: userData,
        custom_data: {
          value: params.value / 100,
          currency: params.currency,
          transaction_id: params.transactionId,
        }
      }]
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      }
    );

    const result = await response.json();
    console.log('Facebook Purchase event sent:', JSON.stringify(result));
  } catch (error) {
    console.error('Error sending Facebook Purchase event:', error);
  }
}

// Constant-time string comparison to prevent timing attacks
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) {
    // Still do work to prevent length-based timing attacks
    const encoder = new TextEncoder();
    const aBytes = encoder.encode(a);
    await crypto.subtle.digest('SHA-256', aBytes);
    return false;
  }
  
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  
  // XOR all bytes and check if result is zero
  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  
  return result === 0;
}

// SECURITY: Header-only webhook secret verification with constant-time comparison
async function verifyWebhookSecret(req: Request, expectedSecret: string): Promise<boolean> {
  const headerSecret = req.headers.get('x-webhook-secret');
  
  if (!headerSecret) {
    console.warn('Webhook request missing x-webhook-secret header');
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  return await timingSafeEqual(headerSecret, expectedSecret);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PIXUP_WEBHOOK_SECRET = Deno.env.get('PIXUP_WEBHOOK_SECRET');
    
    // SECURITY: Webhook secret validation is MANDATORY
    if (!PIXUP_WEBHOOK_SECRET) {
      console.error('PIXUP_WEBHOOK_SECRET not configured - rejecting request for security');
      return new Response(
        JSON.stringify({ success: false, error: 'Webhook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!(await verifyWebhookSecret(req, PIXUP_WEBHOOK_SECRET))) {
      const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      console.error(`Invalid webhook secret. IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const payload = await req.json();
    console.log('PixUp Webhook received:', JSON.stringify(payload, null, 2));

    const requestBody = payload.requestBody || payload;
    
    const { 
      transactionId, 
      external_id, 
      status
    } = requestBody;

    if (!transactionId) {
      console.error('No transactionId in webhook payload');
      return new Response(
        JSON.stringify({ success: false, error: 'No transactionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const statusMap: Record<string, string> = {
      'PENDING': 'waiting_payment',
      'PAID': 'paid',
      'EXPIRED': 'cancelled',
      'CANCELLED': 'cancelled',
      'REFUNDED': 'refunded',
      'PROCESSING': 'processing'
    };

    const mappedStatus = statusMap[status?.toUpperCase()] || 'waiting_payment';

    console.log(`Processing transaction ${transactionId} with status: ${status} -> ${mappedStatus}`);
    console.log(`external_id (our reference): ${external_id}`);

    let transaction = null;
    
    if (external_id) {
      const { data: txByExternalId } = await supabase
        .from('transactions')
        .select('id, customer_email, customer_phone, customer_name, customer_document, amount, fbp, fbc, ip_address, user_agent')
        .eq('transaction_hash', external_id)
        .maybeSingle();
      
      if (txByExternalId) {
        transaction = txByExternalId;
        console.log(`Found transaction by external_id: ${external_id}`);
      }
    }
    
    if (!transaction && transactionId) {
      const { data: txByTransactionId } = await supabase
        .from('transactions')
        .select('id, customer_email, customer_phone, customer_name, customer_document, amount, fbp, fbc, ip_address, user_agent')
        .eq('pepper_transaction_id', transactionId)
        .maybeSingle();
      
      if (txByTransactionId) {
        transaction = txByTransactionId;
        console.log(`Found transaction by pepper_transaction_id: ${transactionId}`);
      }
    }

    if (transaction) {
      const updateData: Record<string, any> = {
        payment_status: mappedStatus,
        pepper_transaction_id: transactionId,
        updated_at: new Date().toISOString()
      };

      if (mappedStatus === 'paid') {
        updateData.paid_at = new Date().toISOString();
        updateData.access_granted = true;
        updateData.access_granted_at = new Date().toISOString();
        
        // Generate email update token for secure email changes
        updateData.email_update_token = generateEmailUpdateToken();
        updateData.email_update_token_expires_at = new Date(
          Date.now() + EMAIL_UPDATE_TOKEN_EXPIRATION_MINUTES * 60 * 1000
        ).toISOString();
        
        await sendFacebookPurchaseEvent({
          value: transaction.amount || 0,
          currency: 'BRL',
          transactionId: transaction.id,
          email: transaction.customer_email,
          phone: transaction.customer_phone,
          fbp: transaction.fbp,
          fbc: transaction.fbc,
          ipAddress: transaction.ip_address,
          userAgent: transaction.user_agent,
        });
      }

      await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transaction.id);

      // Generate license if payment is approved and amount >= R$ 97
      if (mappedStatus === 'paid') {
        await generateAndSaveLicense(
          supabase, 
          transaction.id, 
          transaction.amount || 0,
          transaction.customer_email,
          transaction.customer_document
        );
      }

      console.log(`Transaction ${transaction.id} updated to status: ${mappedStatus}`);
    } else {
      console.warn(`Transaction not found. transactionId: ${transactionId}, external_id: ${external_id}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
