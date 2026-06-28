import { supabase } from "./supabase";

export type OtpPurpose = "signup" | "login" | "reset";

interface OtpResult {
  ok: boolean;
  error?: string;
}

function edgeUrl(slug: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${slug}`;
}

function authHeaders(): Record<string, string> {
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return {
    Authorization: `Bearer ${anon}`,
    apikey: anon,
    "Content-Type": "application/json",
  };
}

export async function requestOtp(
  phone: string,
  _email?: string,
  purpose: OtpPurpose = "signup",
): Promise<OtpResult> {
  try {
    const res = await fetch(edgeUrl("send-otp"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ phone, purpose }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "OTP भेजने में विफल।" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "नेटवर्क त्रुटि। पुनः प्रयास करें।" };
  }
}

export async function verifyOtp(
  phone: string,
  code: string,
  purpose: OtpPurpose = "signup",
): Promise<OtpResult> {
  try {
    const res = await fetch(edgeUrl("verify-otp"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ phone, code, purpose }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.error || "OTP गलत है या समय सीमा समाप्त हो गई।",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "नेटवर्क त्रुटि। पुनः प्रयास करें।" };
  }
}

// Used by the forgot-password flow to look up the auth email for a phone number.
// Phone-only accounts use the synthetic email {digits}@poojasathi.app.
export async function lookupEmailByPhone(
  phone: string,
): Promise<{ email: string | null; error?: string }> {
  const digits = phone.replace(/\D/g, "");
  const { data, error } = await supabase
    .from("user_profiles")
    .select("email, phone")
    .eq("phone", phone)
    .maybeSingle();

  if (error) return { email: null, error: error.message };

  if (!data) {
    return { email: null, error: "इस नंबर पर कोई खाता नहीं मिला।" };
  }

  // Prefer the real email if present; otherwise fall back to synthetic email
  const email = data.email || `${digits}@poojasathi.app`;
  return { email };
}
