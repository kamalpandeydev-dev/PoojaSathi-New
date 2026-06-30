import { supabase } from "./supabase";
import { getLang } from "./i18n";

export type OtpPurpose = "signup" | "login" | "reset";

interface OtpResult {
  ok: boolean;
  error?: string;
  devCode?: string;
  mode?: "twilio" | "dev";
}

function edgeUrl(slug: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${slug}`;
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

function t(hi: string, en: string): string {
  return getLang() === "hi" ? hi : en;
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
      return {
        ok: false,
        error: data.error || t("OTP भेजने में विफल।", "Failed to send OTP."),
      };
    }
    return { ok: true, devCode: data.devCode, mode: data.mode };
  } catch {
    return {
      ok: false,
      error: t(
        "नेटवर्क त्रुटि। पुनः प्रयास करें।",
        "Network error. Please retry.",
      ),
    };
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
        error:
          data.error ||
          t(
            "OTP गलत है या समय सीमा समाप्त हो गई।",
            "Incorrect OTP or expired.",
          ),
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: t(
        "नेटवर्क त्रुटि। पुनः प्रयास करें।",
        "Network error. Please retry.",
      ),
    };
  }
}

// Used by the forgot-password flow to look up the auth email for a phone number.
// Phone-only accounts use the synthetic email {digits}@poojasathi.app.
// Uses edge function to bypass RLS (user is not authenticated during password reset).
export async function lookupEmailByPhone(
  phone: string,
): Promise<{ email: string | null; error?: string }> {
  try {
    const res = await fetch(edgeUrl("lookup-email"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        email: null,
        error: data.error || t("खाता नहीं मिला।", "Account not found."),
      };
    }
    return { email: data.email };
  } catch {
    return {
      email: null,
      error: t("नेटवर्क त्रुटि।", "Network error."),
    };
  }
}
