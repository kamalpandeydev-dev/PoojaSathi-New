import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendOtpBody {
  phone: string;
  purpose?: "signup" | "login" | "reset";
}

// Normalize to 10-digit Indian number or E.164 format
function normalizePhone(
  raw: string,
): { digits10: string; e164: string } | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  let digits10: string;
  if (digits.length === 10) digits10 = digits;
  else if (digits.length === 12 && digits.startsWith("91"))
    digits10 = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0"))
    digits10 = digits.slice(1);
  else digits10 = digits.slice(-10);
  return { digits10, e164: `+91${digits10}` };
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send via WhatsApp Cloud API (free 1000 conversations/month)
async function sendViaWhatsApp(
  phoneE164: string,
  otp: string,
): Promise<{ ok: boolean; error?: string }> {
  const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

  if (!accessToken || !phoneNumberId) {
    return { ok: false, error: "WhatsApp not configured" };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneE164,
          type: "template",
          template: {
            name: "otp_verification",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [{ type: "text", text: otp }],
              },
              {
                type: "button",
                sub_type: "url",
                index: 0,
                parameters: [{ type: "text", text: otp }],
              },
            ],
          },
        }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error: data.error?.message || `WhatsApp error (${res.status})`,
      };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Send via Fast2SMS (Indian SMS gateway - cheap, no DLT needed for transactional OTP)
async function sendViaFast2SMS(
  phone10: string,
  otp: string,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = Deno.env.get("FAST2SMS_API_KEY");

  if (!apiKey) {
    return { ok: false, error: "Fast2SMS not configured" };
  }

  try {
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q", // Quick SMS route for OTP
        message: `Your PoojaSathi verification code is ${otp}. Valid for 10 minutes. Do not share with anyone.`,
        numbers: phone10,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.return !== true) {
      return { ok: false, error: data.message || `Fast2SMS error` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Send via MSG91 (another Indian SMS gateway)
async function sendViaMSG91(
  phone10: string,
  otp: string,
): Promise<{ ok: boolean; error?: string }> {
  const authKey = Deno.env.get("MSG91_AUTH_KEY");
  const templateId = Deno.env.get("MSG91_OTP_TEMPLATE_ID");

  if (!authKey) {
    return { ok: false, error: "MSG91 not configured" };
  }

  try {
    const url = new URL("https://control.msg91.com/api/v5/flow/");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: templateId || "default_otp_template",
        mobiles: `91${phone10}`,
        VAR1: otp,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.type === "error") {
      return { ok: false, error: data.message || `MSG91 error` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { phone, purpose = "signup" } = (await req.json()) as SendOtpBody;

    if (!phone) {
      return new Response(
        JSON.stringify({ ok: false, error: "Phone number is required." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const normalized = normalizePhone(phone);
    if (!normalized) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Invalid phone number. Enter a 10-digit Indian mobile number.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Generate 6-digit OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean up old unused OTPs for this phone/purpose
    await supabase
      .from("phone_otps")
      .delete()
      .eq("phone", normalized.digits10)
      .eq("purpose", purpose)
      .eq("used", false);

    // Store the new OTP
    const { error: insertError } = await supabase.from("phone_otps").insert({
      phone: normalized.digits10,
      otp_code: otp,
      purpose,
      used: false,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Failed to generate OTP. Please try again.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Try WhatsApp first (free, most reliable for India)
    const waResult = await sendViaWhatsApp(normalized.e164, otp);
    if (waResult.ok) {
      console.log(`[OTP] WhatsApp sent to ${normalized.e164}`);
      return new Response(JSON.stringify({ ok: true, mode: "whatsapp" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log(`[OTP] WhatsApp failed: ${waResult.error}`);

    // Try Fast2SMS (cheap Indian SMS gateway)
    const f2sResult = await sendViaFast2SMS(normalized.digits10, otp);
    if (f2sResult.ok) {
      console.log(`[OTP] Fast2SMS sent to ${normalized.digits10}`);
      return new Response(JSON.stringify({ ok: true, mode: "sms" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log(`[OTP] Fast2SMS failed: ${f2sResult.error}`);

    // Try MSG91 (another Indian gateway)
    const msg91Result = await sendViaMSG91(normalized.digits10, otp);
    if (msg91Result.ok) {
      console.log(`[OTP] MSG91 sent to ${normalized.digits10}`);
      return new Response(JSON.stringify({ ok: true, mode: "sms" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log(`[OTP] MSG91 failed: ${msg91Result.error}`);

    // Development mode: return the OTP in response for UI display
    console.log(`[DEV OTP] ${normalized.e164} → ${otp} (purpose: ${purpose})`);
    return new Response(
      JSON.stringify({
        ok: true,
        mode: "dev",
        devCode: otp,
        devMessage: "No SMS gateway configured. OTP shown for development.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("[OTP] Error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
