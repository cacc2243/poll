import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ============= RANDOM DATA GENERATORS =============

const firstNames = [
  'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Lucas', 'Fernanda', 
  'Gabriel', 'Amanda', 'Rafael', 'Camila', 'Bruno', 'Larissa', 'Diego', 'Beatriz',
  'Thiago', 'Carolina', 'Felipe', 'Mariana', 'Leonardo', 'Gabriela', 'Matheus', 'Letícia',
  'Gustavo', 'Isabela', 'André', 'Patrícia', 'Rodrigo', 'Vanessa', 'Eduardo', 'Aline',
  'Marcelo', 'Renata', 'Daniel', 'Tatiane', 'Henrique', 'Priscila', 'Alexandre', 'Débora'
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
  'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade',
  'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas', 'Cardoso', 'Ramos',
  'Gonçalves', 'Santana', 'Teixeira', 'Moura', 'Monteiro', 'Pinto', 'Correia', 'Araújo'
];

const emailDomains = [
  'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br', 'uol.com.br',
  'terra.com.br', 'bol.com.br', 'ig.com.br', 'live.com', 'icloud.com'
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomName(): string {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  if (Math.random() < 0.3) {
    const middleName = getRandomElement(lastNames);
    return `${firstName} ${middleName} ${lastName}`;
  }
  return `${firstName} ${lastName}`;
}

function generateValidCPF(): string {
  const digits: number[] = [];
  for (let i = 0; i < 9; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  digits.push(digit1);

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  digits.push(digit2);

  return digits.join('');
}

function generateRandomPhone(): string {
  const ddds = ['11', '21', '31', '41', '51', '61', '71', '81', '91', '19', '27', '48', '47', '85', '62', '84', '83', '79', '82', '86'];
  const ddd = getRandomElement(ddds);
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `${ddd}9${number}`;
}

function generateRandomEmail(name: string): string {
  const domain = getRandomElement(emailDomains);
  const cleanName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.');
  
  const randomNum = Math.floor(Math.random() * 9999);
  
  const formats = [
    `${cleanName}${randomNum}@${domain}`,
    `${cleanName.split('.')[0]}${randomNum}@${domain}`,
    `${cleanName.replace('.', '_')}${randomNum}@${domain}`,
    `${cleanName.split('.')[0]}.${cleanName.split('.').pop()}${randomNum}@${domain}`
  ];
  
  return getRandomElement(formats);
}

function generateFakeCustomerData() {
  const fakeName = generateRandomName();
  const fakeCPF = generateValidCPF();
  const fakePhone = generateRandomPhone();
  const fakeEmail = generateRandomEmail(fakeName);
  
  return {
    name: fakeName,
    cpf: fakeCPF,
    phone: fakePhone,
    email: fakeEmail
  };
}

// ============= END RANDOM DATA GENERATORS =============

function normalizeBrazilPhone(input?: string): string {
  if (!input) return '';
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length > 11) {
    return digits.slice(2);
  }
  return digits;
}

function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnecting = req.headers.get('cf-connecting-ip');
  if (cfConnecting) {
    return cfConnecting;
  }

  return 'unknown';
}

// Cache for PixUp access token
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getPixUpToken(clientId: string, clientSecret: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    console.log('Using cached PixUp token');
    return cachedToken.token;
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);
  console.log('Requesting new token from PixUp...');
  
  const response = await fetch('https://api.pixupbr.com/v2/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'accept': 'application/json'
    }
  });

  const responseText = await response.text();
  console.log('PixUp Token response status:', response.status);

  if (!response.ok) {
    let errorData = {};
    try { errorData = JSON.parse(responseText); } catch (e) { errorData = { raw: responseText }; }
    console.error('PixUp auth error:', errorData);
    throw new Error((errorData as any).message || 'Failed to authenticate with PixUp');
  }

  const data = JSON.parse(responseText);
  const token = data.access_token || data.token;
  
  if (!token) throw new Error('No token received from PixUp');

  cachedToken = {
    token,
    expiresAt: Date.now() + (50 * 60 * 1000)
  };

  return token;
}

// Create PIX with PixUp API
async function createPixUpTransaction(
  accessToken: string,
  customer_name: string,
  customer_email: string,
  cleanDocument: string,
  amount: number,
  externalId: string
) {
  const amountFloat = amount / 100;

  const fakeData = generateFakeCustomerData();
  console.log('Using fake customer data for PixUp:', fakeData);

  const pixUpPayload = {
    amount: amountFloat,
    external_id: externalId,
    postbackUrl: `https://gjzhntrcogbamirtudsp.supabase.co/functions/v1/pixup-webhook`,
    payerQuestion: 'ZYRA PRO - Licença Vitalícia',
    payer: {
      name: fakeData.name,
      document: fakeData.cpf,
      email: fakeData.email
    }
  };

  console.log('Creating PIX transaction (PixUp):', JSON.stringify(pixUpPayload, null, 2));

  const response = await fetch('https://api.pixupbr.com/v2/pix/qrcode', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(pixUpPayload)
  });

  const data = await response.json();
  console.log('PixUp API response:', JSON.stringify(data, null, 2));

  if (!response.ok || !data.transactionId) {
    throw new Error(data.message || 'Erro ao criar transação PIX com PixUp');
  }

  return {
    transactionId: data.transactionId,
    pixCode: data.qrcode || '',
    pixUrl: null
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const PIXUP_CLIENT_ID = Deno.env.get('PIXUP_CLIENT_ID');
    const PIXUP_CLIENT_SECRET = Deno.env.get('PIXUP_CLIENT_SECRET');

    if (!PIXUP_CLIENT_ID || !PIXUP_CLIENT_SECRET) {
      throw new Error('PixUp credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const ipAddress = getClientIP(req);

    const body = await req.json();
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      customer_document,
      amount = 19700,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      src,
      fbp,
      fbc,
      product_title,
      offer_title
    } = body;

    console.log('Captured IP address:', ipAddress);

    // Validate required fields
    if (!customer_name || !customer_email || !customer_document) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nome, email e CPF são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedPhone = normalizeBrazilPhone(customer_phone);
    const cleanDocument = customer_document.replace(/\D/g, '');
    const externalId = `zyra_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const accessToken = await getPixUpToken(PIXUP_CLIENT_ID, PIXUP_CLIENT_SECRET);
    
    const transactionResult = await createPixUpTransaction(
      accessToken,
      customer_name,
      customer_email,
      cleanDocument,
      amount,
      externalId
    );

    // Save REAL transaction data to database
    // Use transaction_hash for our internal reference (externalId)
    // Use pixup_transaction_id for PixUp's transaction ID
    const { error: dbError } = await supabase
      .from('transactions')
      .insert({
        transaction_hash: externalId,
        pepper_transaction_id: transactionResult.transactionId, // PixUp transaction ID stored here for now
        customer_name,
        customer_email,
        customer_phone: normalizedPhone || null,
        customer_document: cleanDocument,
        amount,
        payment_method: 'pix',
        payment_status: 'waiting_payment',
        pix_code: transactionResult.pixCode,
        pix_url: transactionResult.pixUrl,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        src,
        fbp,
        fbc,
        ip_address: ipAddress || null,
        offer_hash: 'zyra001',
        offer_title: offer_title || 'ZYRA PRO - Licença Vitalícia',
        product_hash: 'zyrapro01',
        product_title: product_title || 'Extensão Lovable'
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transaction_id: externalId,
          pixup_transaction_id: transactionResult.transactionId,
          pix_code: transactionResult.pixCode,
          payment_url: transactionResult.pixUrl,
          amount: amount
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error creating PIX:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});