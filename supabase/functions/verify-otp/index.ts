import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ─── Step 1: Check local otp_verifications table first (dev mode) ────────
    // The send-otp function stores a locally-generated code when Twilio is
    // unavailable (e.g. trial account). We verify against this table first.
    const { data: localOtp } = await supabase
      .from("otp_verifications")
      .select("id, otp_code, expires_at, used")
      .eq("phone", normalized)
      .eq("purpose", purpose)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (localOtp && localOtp.otp_code !== "twilio-managed") {
      // Dev mode: verify against the locally stored code
      if (new Date(localOtp.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "OTP expired. Please request a new one.",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (localOtp.otp_code !== code.trim()) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Incorrect OTP. Please try again.",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      // Mark as used
      await supabase
        .from("otp_verifications")
        .update({ used: true })
        .eq("id", localOtp.id);
      return new Response(JSON.stringify({ ok: true, mode: "dev" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Step 2: Fall back to Twilio Verify API ─────────────────────────────
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const verifyServiceSid = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");

    if (!accountSid || !authToken || !verifyServiceSid) {
      return new Response(
        JSON.stringify({
          ok: false,
          error:
            "OTP verification failed. No local code found and Twilio not configured.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const twilioUrl = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`;
    const body = new URLSearchParams();
    body.set("To", normalized);
    body.set("Code", code);

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok || twilioData.status !== "approved") {
      return new Response(
        JSON.stringify({
          ok: false,
          error: twilioData.message || "Incorrect OTP or expired.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Mark the most recent pending record as used for audit
    if (localOtp) {
      await supabase
        .from("otp_verifications")
        .update({ used: true })
        .eq("id", localOtp.id);
    }

    return new Response(JSON.stringify({ ok: true, mode: "twilio" }), {
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
