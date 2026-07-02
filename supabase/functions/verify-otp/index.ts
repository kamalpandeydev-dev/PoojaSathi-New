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

// Normalize to 10-digit Indian number
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits.slice(-10);
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

    // Find the most recent unused OTP for this phone/purpose
    const { data: otpRecord, error: fetchError } = await supabase
      .from("phone_otps")
      .select("id, otp_code, expires_at, used")
      .eq("phone", normalized)
      .eq("purpose", purpose)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Database error. Please try again.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!otpRecord) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "No OTP found for this number. Please request a new OTP.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      // Delete expired OTP
      await supabase.from("phone_otps").delete().eq("id", otpRecord.id);
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

    // Verify the code
    if (otpRecord.otp_code !== code.trim()) {
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
      .from("phone_otps")
      .update({ used: true })
      .eq("id", otpRecord.id);

    console.log(`[OTP] Verified for ${normalized} (purpose: ${purpose})`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[OTP] Verify error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
