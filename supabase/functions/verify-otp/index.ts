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
interface VerifyOtpBody {
  phone: string;
  code: string;
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const {
      phone,
      code,
      purpose = "signup",
    } = (await req.json()) as VerifyOtpBody;

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ ok: false, error: "Phone and code are required." }),
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

    // Call Twilio Verify API to check the OTP
    const twilioUrl = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`;
    const body = new URLSearchParams();
    // body.set("To", normalized);
    // body.set("Code", code);
    body.set("To", normalized.trim());
    body.set("Code", code.trim());
    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    console.log("Verifying Phone:", normalized);
    console.log("Purpose:", purpose);
    // const twilioData = await twilioRes.json();
    const responseText = await twilioRes.text();
    console.log("Raw Twilio Response:", responseText);
    const twilioData = JSON.parse(responseText);
    console.log("========== VERIFY OTP ==========");
    console.log("Phone:", normalized);
    console.log("OTP:", code);
    console.log("Twilio Status Code:", twilioRes.status);
    console.log("Twilio Response:", JSON.stringify(twilioData));
    console.log("===============================");

    if (!twilioRes.ok || twilioData.status !== "approved") {
      return new Response(
        JSON.stringify({
          ok: false,
          error: twilioData.message || "OTP गलत है या समय सीमा समाप्त हो गई।",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Mark the most recent pending record as used for audit
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: pending } = await supabase
      .from("otp_verifications")
      .select("id")
      .eq("phone", normalized)
      .eq("purpose", purpose)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pending) {
      await supabase
        .from("otp_verifications")
        .update({ used: true })
        .eq("id", pending.id);
    }

    return new Response(JSON.stringify({ ok: true }), {
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
