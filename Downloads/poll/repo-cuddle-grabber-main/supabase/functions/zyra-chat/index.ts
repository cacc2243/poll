// ============================================
// ZYRA CHAT - AI Gateway (Só Chat, Sem Edits)
// ============================================
// Usa LOVABLE_API_KEY para respostas IA
// NÃO edita projetos, apenas conversa

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-token, x-device-fingerprint, x-integrity-hash",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ============================================
// LICENSE VALIDATION
// ============================================

async function validateLicense(
  supabase: any,
  licenseKey: string,
  deviceFingerprint: string
): Promise<{ valid: boolean; licenseId?: string; customerName?: string; error?: string }> {
  
  const { data: license, error } = await supabase
    .from("licenses")
    .select("id, status, max_devices, transaction_id")
    .eq("license_key", licenseKey.toUpperCase())
    .maybeSingle();

  if (error || !license) {
    // Try transactions table for legacy licenses
    const { data: txLicense } = await supabase
      .from("transactions")
      .select("id, license_key, access_granted, customer_name")
      .eq("license_key", licenseKey.toUpperCase())
      .maybeSingle();

    if (txLicense && txLicense.access_granted) {
      return { valid: true, licenseId: txLicense.id, customerName: txLicense.customer_name };
    }

    return { valid: false, error: "LICENSE_NOT_FOUND" };
  }

  if (license.status !== "active") {
    return { valid: false, error: "LICENSE_INACTIVE" };
  }

  // Check device
  if (deviceFingerprint) {
    const { data: device } = await supabase
      .from("license_devices")
      .select("id, is_active")
      .eq("license_id", license.id)
      .eq("device_fingerprint", deviceFingerprint)
      .maybeSingle();

    if (device && !device.is_active) {
      return { valid: false, error: "DEVICE_DEACTIVATED" };
    }

    // Update last seen
    if (device) {
      await supabase
        .from("license_devices")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", device.id);
    }
  }

  // Get customer name from transaction
  let customerName: string | undefined;
  if (license.transaction_id) {
    const { data: tx } = await supabase
      .from("transactions")
      .select("customer_name")
      .eq("id", license.transaction_id)
      .maybeSingle();
    customerName = tx?.customer_name;
  }

  return { valid: true, licenseId: license.id, customerName };
}

// ============================================
// AI GATEWAY CALL
// ============================================

async function callAIGateway(
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  systemPrompt?: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  
  if (!apiKey) {
    console.error("[ZYRA-CHAT] LOVABLE_API_KEY not configured");
    return { success: false, error: "AI_NOT_CONFIGURED" };
  }

  const messages = [
    {
      role: "system",
      content: systemPrompt || `Você é o assistente Zyra Pro, uma IA especializada em desenvolvimento web e programação.
Você ajuda desenvolvedores com:
- Dúvidas sobre código e programação
- Explicações técnicas
- Sugestões de arquitetura
- Debugging e solução de problemas
- Melhores práticas de desenvolvimento

Seja conciso, técnico e útil. Responda em português brasileiro.
IMPORTANTE: Você NÃO pode editar projetos diretamente. Apenas fornece orientações e código que o usuário pode copiar.`
    },
    ...conversationHistory,
    { role: "user", content: message }
  ];

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ZYRA-CHAT] AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return { success: false, error: "RATE_LIMIT_EXCEEDED" };
      }
      if (response.status === 402) {
        return { success: false, error: "PAYMENT_REQUIRED" };
      }
      
      return { success: false, error: "AI_ERROR" };
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return { success: false, error: "EMPTY_RESPONSE" };
    }

    return { success: true, response: aiResponse };

  } catch (error) {
    console.error("[ZYRA-CHAT] Gateway error:", error);
    return { success: false, error: "NETWORK_ERROR" };
  }
}

// ============================================
// STREAMING AI GATEWAY CALL
// ============================================

async function streamAIGateway(
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  systemPrompt?: string
): Promise<Response | { success: false; error: string }> {
  
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  
  if (!apiKey) {
    return { success: false, error: "AI_NOT_CONFIGURED" };
  }

  const messages = [
    {
      role: "system",
      content: systemPrompt || `Você é o assistente Zyra Pro, uma IA especializada em desenvolvimento web e programação.
Você ajuda desenvolvedores com dúvidas sobre código, explicações técnicas, sugestões de arquitetura, debugging e melhores práticas.
Seja conciso, técnico e útil. Responda em português brasileiro.
IMPORTANTE: Você NÃO pode editar projetos diretamente. Apenas fornece orientações e código que o usuário pode copiar.`
    },
    ...conversationHistory,
    { role: "user", content: message }
  ];

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: "RATE_LIMIT_EXCEEDED" };
      }
      if (response.status === 402) {
        return { success: false, error: "PAYMENT_REQUIRED" };
      }
      return { success: false, error: "AI_ERROR" };
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("[ZYRA-CHAT] Stream error:", error);
    return { success: false, error: "NETWORK_ERROR" };
  }
}

// ============================================
// MAIN HANDLER
// ============================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { 
      license_key, 
      device_fingerprint, 
      message, 
      history,
      system_prompt,
      stream 
    } = body;

    // Validate credentials
    if (!license_key || !device_fingerprint) {
      return new Response(
        JSON.stringify({ success: false, error: "MISSING_CREDENTIALS" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message) {
      return new Response(
        JSON.stringify({ success: false, error: "MISSING_MESSAGE" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate license
    const licenseResult = await validateLicense(supabase, license_key, device_fingerprint);

    if (!licenseResult.valid) {
      console.log("[ZYRA-CHAT] License validation failed:", licenseResult.error);
      return new Response(
        JSON.stringify({ success: false, error: licenseResult.error }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call AI Gateway
    if (stream) {
      const streamResult = await streamAIGateway(message, history || [], system_prompt);
      
      if ('success' in streamResult && !streamResult.success) {
        return new Response(
          JSON.stringify({ success: false, error: streamResult.error }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return streamResult as Response;
    }

    const aiResult = await callAIGateway(message, history || [], system_prompt);

    // Log (fire and forget)
    try {
      await supabase.from("extension_logs").insert({
        license_key: license_key.toUpperCase(),
        log_type: aiResult.success ? "success" : "error",
        message: aiResult.success ? "AI chat success" : `AI chat failed: ${aiResult.error}`,
        metadata: { messageLength: message.length },
        device_fingerprint,
      });
    } catch {
      // Ignore logging errors
    }

    if (!aiResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: aiResult.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: aiResult.response,
        customerName: licenseResult.customerName
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[ZYRA-CHAT] Server error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "SERVER_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
