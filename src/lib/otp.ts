import { supabase } from "./supabase";

function rand6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestOtp(
  phone: string,
  email?: string,
  purpose: "signup" | "login" = "signup",
): Promise<{ ok: boolean; otp?: string; error?: string }> {
  // Invalidate any previous unused OTPs for this phone
  await supabase
    .from("otp_verifications")
    .update({ used: true })
    .eq("phone", phone)
    .eq("purpose", purpose)
    .eq("used", false);

  const otp = rand6();
  const { error } = await supabase.from("otp_verifications").insert({
    phone,
    email: email ?? null,
    otp_code: otp,
    purpose,
    used: false,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  // In production: send SMS / email. Demo mode returns OTP directly.
  return { ok: true, otp };
}

export async function verifyOtp(
  phone: string,
  code: string,
  purpose: "signup" | "login" = "signup",
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase
    .from("otp_verifications")
    .select("*")
    .eq("phone", phone)
    .eq("otp_code", code)
    .eq("purpose", purpose)
    .eq("used", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data)
    return { ok: false, error: "OTP गलत है या समय सीमा समाप्त हो गई।" };

  await supabase
    .from("otp_verifications")
    .update({ used: true })
    .eq("id", data.id);
  return { ok: true };
}
