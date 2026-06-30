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

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0"))
    return `+91${digits.slice(1)}`;
  return `+${digits}`;
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
        JSON.stringify({ ok: false, error: "Invalid phone number." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const verifyServiceSid = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ─── Dev fallback: if Twilio is not configured OR fails (e.g. trial account
    // sending to unverified numbers), generate a 6-digit code locally and store
    // it in otp_verifications. The verify-otp function checks this table first.
    // This ensures the full registration flow works in development without a
    // paid Twilio account.
    let twilioOk = false;
    let twilioError: string | null = null;

    if (accountSid && authToken && verifyServiceSid) {
      try {
        const twilioUrl = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`;
        const body = new URLSearchParams();
        body.set("To", normalized);
        body.set("Channel", "sms");

        const twilioRes = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        const twilioData = await twilioRes.json();

        if (twilioRes.ok) {
          twilioOk = true;
          // Persist audit record (Twilio manages the actual code)
          await supabase.from("otp_verifications").insert({
            phone: normalized,
            otp_code: "twilio-managed",
            purpose,
            used: false,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          });
          return new Response(
            JSON.stringify({ ok: true, sid: twilioData.sid, mode: "twilio" }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        twilioError =
          twilioData.message || `Twilio error (${twilioRes.status})`;
      } catch (err) {
        twilioError = err.message;
      }
    }

    // ─── Dev fallback: generate and store a local code ──────────────────────
    const code = generateCode();
    await supabase.from("otp_verifications").insert({
      phone: normalized,
      otp_code: code,
      purpose,
      used: false,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    // Log the code to the edge function console for dev testing
    console.log(`[DEV OTP] ${normalized} → ${code} (purpose: ${purpose})`);
    if (twilioError) {
      console.log(`[DEV OTP] Twilio fallback reason: ${twilioError}`);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        mode: "dev",
        devCode: code, // returned to client in dev mode so the UI can display it
        twilioError: twilioError,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
