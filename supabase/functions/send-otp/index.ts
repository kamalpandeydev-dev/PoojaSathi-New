import { createClient } from "npm:@supabase/supabase-js@2.57.4";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers":
//     "Content-Type, Authorization, X-Client-Info, Apikey",
// };
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};
interface SendOtpBody {
  phone: string;
  purpose?: "signup" | "login" | "reset";
}

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  // Indian numbers: assume country code 91 if 10 digits, or already has 91 prefix
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0"))
    return `+91${digits.slice(1)}`;
  return `+${digits}`;
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

    if (!accountSid || !authToken || !verifyServiceSid) {
      return new Response(
        JSON.stringify({
          ok: false,
          error:
            "Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID as edge function secrets.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Call Twilio Verify API to send an OTP via SMS
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

    if (!twilioRes.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: twilioData.message || "Failed to send OTP via Twilio.",
        }),
        {
          status: twilioRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Persist a record in otp_verifications for audit (status pending).
    // Verification itself is done by Twilio Verify, not our table.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await supabase.from("otp_verifications").insert({
      phone: normalized,
      otp_code: "twilio-managed",
      purpose,
      used: false,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    return new Response(JSON.stringify({ ok: true, sid: twilioData.sid }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
