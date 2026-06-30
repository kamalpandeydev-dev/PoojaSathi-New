import { useState, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Phone,
  Mail,
  User,
  Lock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  Camera,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth, type UserRole } from "../lib/auth";
import { requestOtp, verifyOtp, lookupEmailByPhone } from "../lib/otp";
import { pushToast } from "../components/ui";
import { useLang, LangToggle } from "../lib/i18n";
import { normalizePhone } from "../lib/format";
import { LotusIcon } from "../components/SpiritualArt";

// ─── OTP 6-box input ──────────────────────────────────────────────────────────
function OtpBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  function handleChange(i: number, e: ChangeEvent<HTMLInputElement>) {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const arr = (value + "      ").slice(0, 6).split("");
    arr[i] = digit;
    onChange(arr.join("").trimEnd().slice(0, 6));
    if (i < 5) refs[i + 1].current?.focus();
  }

  function handleKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      const arr = (value + "      ").slice(0, 6).split("");
      arr[i] = " ";
      onChange(arr.join("").trimEnd().slice(0, 6));
      if (i > 0) refs[i - 1].current?.focus();
    }
  }

  return (
    <div className="flex gap-2 justify-center" dir="ltr">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoFocus={i === 0}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 border-temple-border focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none bg-white transition-all"
        />
      ))}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
  hint,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-maroon-800 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-temple-muted mt-1">{hint}</p>}
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
}

// ─── Input component ─────────────────────────────────────────────────────────
function Input({
  icon,
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-temple-muted pointer-events-none">
          {icon}
        </span>
      )}
      <input
        type={type}
        className={`w-full rounded-xl border border-temple-border bg-white/90 py-3 pr-4 text-sm text-temple-ink placeholder:text-temple-muted/60 transition-colors focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 outline-none ${icon ? "pl-10" : "pl-4"}`}
        {...props}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGN UP FORM
// ═══════════════════════════════════════════════════════════════════════════════

function SignUpForm({ role, onBack }: { role: UserRole; onBack: () => void }) {
  const { refreshProfile } = useAuth();
  const { lang } = useLang();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [busy, setBusy] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [devCode, setDevCode] = useState<string>("");
  const [otpMode, setOtpMode] = useState<"twilio" | "dev" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    confirmPwd: "",
    location_text: "",
    city: "",
    state: "",
    latitude: "" as string,
    longitude: "" as string,
  });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErr((e) => ({ ...e, [k]: "" }));
    setErr("");
  }

  async function useGPS() {
    if (!navigator.geolocation) {
      setErr("GPS उपलब्ध नहीं");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("latitude", String(pos.coords.latitude.toFixed(5)));
        set("longitude", String(pos.coords.longitude.toFixed(5)));
        set(
          "location_text",
          `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        );
      },
      () => setErr("GPS अनुमति नहीं मिली"),
    );
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.full_name.trim())
      e.full_name = lang === "hi" ? "नाम आवश्यक है" : "Name is required";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10)
      e.phone =
        lang === "hi"
          ? "सही 10-अंकी मोबाइल नंबर दर्ज करें"
          : "Enter a valid 10-digit mobile number";
    if (form.password.length < 6)
      e.password =
        lang === "hi"
          ? "पासवर्ड कम से कम 6 अक्षर का होना चाहिए"
          : "Password must be at least 6 characters";
    if (form.password !== form.confirmPwd)
      e.confirmPwd =
        lang === "hi" ? "पासवर्ड मेल नहीं खाता" : "Passwords do not match";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = lang === "hi" ? "ईमेल सही नहीं है" : "Invalid email format";
    setFieldErr(e);
    return Object.keys(e).length === 0;
  }

  async function sendOtp() {
    if (!validate()) return;
    setBusy(true);
    setErr("");
    const normalizedPhone = normalizePhone(form.phone.trim());
    if (!normalizedPhone) {
      setErr(
        lang === "hi"
          ? "सही 10-अंकी मोबाइल नंबर दर्ज करें"
          : "Enter a valid 10-digit mobile number",
      );
      setBusy(false);
      return;
    }
    const res = await requestOtp(
      normalizedPhone,
      form.email || undefined,
      "signup",
    );
    setBusy(false);
    if (!res.ok) {
      setErr(
        res.error ||
          (lang === "hi" ? "OTP भेजने में विफल" : "Failed to send OTP"),
      );
      return;
    }
    if (res.devCode) setDevCode(res.devCode);
    if (res.mode) setOtpMode(res.mode);
    setStep("otp");
  }

  function onAvatarPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErr(
        lang === "hi"
          ? "तस्वीर 5MB से कम होनी चाहिए"
          : "Image must be under 5MB",
      );
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErr("");
  }

  async function submitSignUp() {
    if (otpCode.replace(/\s/g, "").length < 6) {
      setErr(
        lang === "hi" ? "6 अंकों का OTP दर्ज करें" : "Enter the 6-digit OTP",
      );
      return;
    }
    setBusy(true);
    setErr("");

    const normalizedPhone = normalizePhone(form.phone.trim());
    if (!normalizedPhone) {
      setErr(
        lang === "hi"
          ? "सही 10-अंकी मोबाइल नंबर दर्ज करें"
          : "Enter a valid 10-digit mobile number",
      );
      setBusy(false);
      return;
    }

    // 1. Verify OTP
    const v = await verifyOtp(
      normalizedPhone,
      otpCode.replace(/\s/g, ""),
      "signup",
    );
    if (!v.ok) {
      setErr(v.error || (lang === "hi" ? "OTP गलत है" : "Incorrect OTP"));
      setBusy(false);
      return;
    }

    // 2. Create Supabase auth user
    const emailToUse = form.email.trim() || `${normalizedPhone}@poojasathi.app`;
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: emailToUse,
      password: form.password,
      options: { data: { full_name: form.full_name, role } },
    });

    if (authErr || !authData.user) {
      setErr(
        authErr?.message === "User already registered"
          ? lang === "hi"
            ? "यह नंबर/ईमेल पहले से पंजीकृत है। लॉगिन करें।"
            : "This number/email is already registered. Please login."
          : (authErr?.message ??
              (lang === "hi" ? "पंजीकरण विफल" : "Registration failed")),
      );
      setBusy(false);
      return;
    }

    // 3. Upload avatar to Supabase Storage (if provided)
    let avatarUrl: string | null = null;
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const path = `${authData.user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, {
          upsert: true,
          contentType: avatarFile.type,
        });
      if (!upErr) {
        const { data: pub } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);
        avatarUrl = pub.publicUrl;
      }
    }

    // 4. For pandit role: create a NEW pandits row for this user
    let panditId: string | null = null;
    if (role === "pandit") {
      const { data: panditRow, error: panditErr } = await supabase
        .from("pandits")
        .insert({
          name: form.full_name.trim(),
          name_en: form.full_name.trim(),
          phone: normalizedPhone,
          city: form.city || null,
          city_en: form.city || null,
          specialty: "",
          qualifications: "",
          address: form.location_text || null,
          address_en: form.location_text || null,
          avatar_initials: form.full_name.trim().charAt(0) || "पं",
          available: true,
        })
        .select("id")
        .maybeSingle();

      if (panditErr) {
        setErr(panditErr.message);
        setBusy(false);
        return;
      }
      panditId = panditRow?.id ?? null;
    }

    // 5. Insert user_profile
    const { error: profileErr } = await supabase.from("user_profiles").insert({
      id: authData.user.id,
      role,
      full_name: form.full_name.trim(),
      phone: normalizedPhone,
      email: form.email || null,
      location_text: form.location_text || null,
      city: form.city || null,
      state: form.state || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      pandit_id: panditId,
      avatar_url: avatarUrl,
      verified: true,
    });

    if (
      profileErr &&
      !profileErr.message.includes("duplicate") &&
      !profileErr.message.includes("already exists")
    ) {
      setErr(profileErr.message);
      setBusy(false);
      return;
    }

    await refreshProfile();
    pushToast(
      role === "pandit"
        ? lang === "hi"
          ? "पंडित जी, स्वागत है! 🙏"
          : "Welcome, Pandit ji! 🙏"
        : lang === "hi"
          ? "यजमान जी, स्वागत है! 🪔"
          : "Welcome, Yajmaan ji! 🪔",
    );
    setBusy(false);
  }

  // ─── OTP Step ─────────────────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-saffron-100 flex items-center justify-center mx-auto mb-3">
            <Phone className="w-7 h-7 text-saffron-600" />
          </div>
          <h3 className="font-display text-xl text-maroon-900">
            {lang === "hi" ? "OTP सत्यापन" : "OTP Verification"}
          </h3>
          <p className="text-sm text-temple-muted mt-1">
            {lang === "hi" ? (
              <>
                <span className="font-bold text-maroon-800">{form.phone}</span>{" "}
                पर OTP भेजा गया
              </>
            ) : (
              <>
                OTP sent to{" "}
                <span className="font-bold text-maroon-800">{form.phone}</span>
              </>
            )}
          </p>
        </div>

        <OtpBoxes value={otpCode} onChange={setOtpCode} />

        {otpMode === "twilio" && !devCode && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <p className="text-xs text-emerald-800 font-semibold">
              {lang === "hi"
                ? "✅ OTP आपके मोबाइल पर SMS के रूप में भेजा गया है"
                : "✅ OTP sent to your phone via SMS"}
            </p>
          </div>
        )}

        {devCode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-xs text-amber-800 font-semibold">
              {lang === "hi" ? "डेव मोड — आपका OTP:" : "Dev mode — your OTP:"}{" "}
              <span className="font-display text-lg tracking-widest text-amber-900">
                {devCode}
              </span>
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5">
              {lang === "hi"
                ? "Twilio ट्रायल अकाउंट सिर्फ सत्यापित नंबर पर SMS भेजता है।"
                : "Twilio trial accounts only send SMS to verified numbers."}
            </p>
          </div>
        )}

        {err && <p className="text-xs text-rose-600 text-center">{err}</p>}

        <button
          onClick={submitSignUp}
          disabled={busy || otpCode.replace(/\s/g, "").length < 6}
          className="ps-btn-primary w-full flex items-center justify-center gap-2"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />{" "}
              {lang === "hi"
                ? "OTP सत्यापित करें और पंजीकरण पूरा करें"
                : "Verify OTP & Complete Registration"}
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => {
              setStep("form");
              setOtpCode("");
              setErr("");
            }}
            className="text-saffron-700 font-semibold hover:text-saffron-800"
          >
            ← {lang === "hi" ? "पीछे जाएं" : "Back"}
          </button>
          <button
            onClick={sendOtp}
            disabled={busy}
            className="flex items-center gap-1 text-maroon-700 font-semibold hover:text-maroon-800"
          >
            <RefreshCw className="w-3 h-3" />{" "}
            {lang === "hi" ? "OTP दोबारा भेजें" : "Resend OTP"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Registration Form ────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Role badge + back button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 w-8 h-8 rounded-lg border border-temple-border hover:bg-beige-50 flex items-center justify-center text-temple-muted hover:text-temple-ink transition-colors"
          title={lang === "hi" ? "वापस" : "Back"}
        >
          ←
        </button>
        <div
          className={`flex-1 py-2 px-4 rounded-xl text-center text-sm font-bold ${role === "pandit" ? "bg-maroon-100 text-maroon-800" : "bg-saffron-100 text-saffron-800"}`}
        >
          {role === "pandit"
            ? lang === "hi"
              ? "🙏 पंडित के रूप में पंजीकरण"
              : "🙏 Register as Pandit"
            : lang === "hi"
              ? "🪔 यजमान के रूप में पंजीकरण"
              : "🪔 Register as Yajmaan"}
        </div>
      </div>

      {/* Avatar upload */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-20 h-20 rounded-full border-2 border-dashed border-temple-border hover:border-saffron-400 bg-beige-50 flex items-center justify-center overflow-hidden transition-colors group"
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-temple-muted">
              <Camera className="w-5 h-5" />
              <span className="text-[10px] font-medium">
                {lang === "hi" ? "तस्वीर" : "Photo"}
              </span>
            </div>
          )}
          {avatarPreview && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setAvatarFile(null);
                setAvatarPreview("");
              }}
              className="absolute top-0 right-0 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </button>
        <p className="text-[11px] text-temple-muted">
          {lang === "hi"
            ? "प्रोफ़ाइल तस्वीर (वैकल्पिक)"
            : "Profile photo (optional)"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onAvatarPick}
          className="hidden"
        />
      </div>

      {/* 1. Name */}
      <Field
        label={lang === "hi" ? "नाम / Full Name" : "Full Name"}
        required
        error={fieldErr.full_name}
      >
        <Input
          icon={<User className="w-4 h-4" />}
          placeholder={
            lang === "hi" ? "पूरा नाम लिखें..." : "Enter your full name..."
          }
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
        />
      </Field>

      {/* 2. Mobile */}
      <Field
        label={lang === "hi" ? "मोबाइल नंबर / Mobile Number" : "Mobile Number"}
        required
        hint={
          lang === "hi"
            ? "OTP इसी नंबर पर आएगा"
            : "OTP will be sent to this number"
        }
        error={fieldErr.phone}
      >
        <Input
          icon={<Phone className="w-4 h-4" />}
          type="tel"
          inputMode="numeric"
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </Field>

      {/* 3. Email (optional) */}
      <Field
        label={lang === "hi" ? "ईमेल / Email (वैकल्पिक)" : "Email (optional)"}
        error={fieldErr.email}
      >
        <Input
          icon={<Mail className="w-4 h-4" />}
          type="email"
          placeholder={
            lang === "hi"
              ? "name@example.com (जरूरी नहीं)"
              : "name@example.com (optional)"
          }
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </Field>

      {/* 4. Location */}
      <Field label={lang === "hi" ? "स्थान / Location" : "Location"}>
        <div className="space-y-2">
          {/* GPS + manual address */}
          <div className="flex items-center gap-2">
            <Input
              icon={<MapPin className="w-4 h-4" />}
              placeholder={lang === "hi" ? "पता / Address" : "Address"}
              value={form.location_text}
              onChange={(e) => set("location_text", e.target.value)}
            />
            <button
              type="button"
              onClick={useGPS}
              className="shrink-0 flex items-center gap-1.5 px-3 py-3 rounded-xl border border-saffron-300 bg-saffron-50 text-saffron-700 text-xs font-semibold hover:bg-saffron-100 transition-colors whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5" />{" "}
              {lang === "hi" ? "GPS से" : "Use GPS"}
            </button>
          </div>
          {/* City + State */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder={lang === "hi" ? "शहर / City" : "City"}
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
            <Input
              placeholder={lang === "hi" ? "राज्य / State" : "State"}
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
            />
          </div>
          {/* Show lat/lng if captured via GPS */}
          {form.latitude && (
            <p className="text-xs text-saffron-700 font-mono bg-saffron-50 px-2 py-1 rounded-lg">
              GPS: {form.latitude}, {form.longitude}
            </p>
          )}
        </div>
      </Field>

      {/* 5. Password */}
      <Field
        label={lang === "hi" ? "पासवर्ड / Password" : "Password"}
        required
        error={fieldErr.password}
        hint={lang === "hi" ? "कम से कम 6 अक्षर" : "At least 6 characters"}
      >
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-muted pointer-events-none" />
          <input
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className="w-full rounded-xl border border-temple-border bg-white/90 py-3 pl-10 pr-10 text-sm text-temple-ink placeholder:text-temple-muted/60 transition-colors focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-temple-muted hover:text-temple-ink"
          >
            {showPwd ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </Field>

      <Field
        label={
          lang === "hi"
            ? "पासवर्ड पुष्टि / Confirm Password"
            : "Confirm Password"
        }
        required
        error={fieldErr.confirmPwd}
      >
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-muted pointer-events-none" />
          <input
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            value={form.confirmPwd}
            onChange={(e) => set("confirmPwd", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendOtp();
            }}
            className="w-full rounded-xl border border-temple-border bg-white/90 py-3 pl-10 pr-4 text-sm text-temple-ink placeholder:text-temple-muted/60 transition-colors focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 outline-none"
          />
        </div>
      </Field>

      {err && <p className="text-xs text-rose-600">{err}</p>}

      {/* 5. Submit → sends OTP */}
      <button
        onClick={sendOtp}
        disabled={busy}
        className="ps-btn-primary w-full flex items-center justify-center gap-2 mt-2"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Phone className="w-4 h-4" />{" "}
            {lang === "hi" ? "OTP प्राप्त करें" : "Get OTP"}{" "}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN FORM
// ═══════════════════════════════════════════════════════════════════════════════
function LoginForm() {
  const { refreshProfile } = useAuth();
  const { lang } = useLang();
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [id, setId] = useState(""); // phone or email
  const [pwd, setPwd] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  async function login() {
    setErr("");
    if (!id.trim()) {
      setErr(
        lang === "hi"
          ? "मोबाइल नंबर या ईमेल दर्ज करें"
          : "Enter mobile number or email",
      );
      return;
    }
    if (!pwd) {
      setErr(lang === "hi" ? "पासवर्ड दर्ज करें" : "Enter password");
      return;
    }
    setBusy(true);

    // Accept mobile number: convert to our email convention (normalized to 10 digits)
    const emailToUse = id.trim().includes("@")
      ? id.trim()
      : `${normalizePhone(id.trim()) || id.trim().replace(/\D/g, "")}@poojasathi.app`;

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: pwd,
    });
    setBusy(false);

    if (error) {
      setErr(
        lang === "hi"
          ? "मोबाइल/ईमेल या पासवर्ड गलत है।"
          : "Invalid mobile/email or password.",
      );
      return;
    }

    await refreshProfile();
    pushToast("स्वागत है! 🙏");
  }

  if (showForgot) {
    return (
      <div className="space-y-4 animate-fade-in">
        <ForgotPassword onClose={() => setShowForgot(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="py-3 px-4 rounded-xl bg-ivory-100 border border-temple-border/60 text-center text-xs text-temple-muted">
        {lang === "hi"
          ? "पंडित या यजमान — भूमिका आपके खाते से स्वतः पहचानी जाएगी।"
          : "Pandit or Yajmaan — your role is auto-detected from your account."}
        <br />
        <span className="text-[11px]">
          {lang === "hi"
            ? "भूमिका आपके खाते से स्वतः पहचानी जाएगी।"
            : "Role is auto-detected from your account."}
        </span>
      </div>

      <Field
        label={lang === "hi" ? "मोबाइल नंबर या ईमेल" : "Mobile Number or Email"}
        required
      >
        <Input
          icon={<Phone className="w-4 h-4" />}
          type="text"
          placeholder={
            lang === "hi"
              ? "9876543210 या email@example.com"
              : "9876543210 or email@example.com"
          }
          value={id}
          autoComplete="username"
          onChange={(e) => {
            setId(e.target.value);
            setErr("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") login();
          }}
        />
      </Field>

      <Field label={lang === "hi" ? "पासवर्ड / Password" : "Password"} required>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-muted pointer-events-none" />
          <input
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            value={pwd}
            onChange={(e) => {
              setPwd(e.target.value);
              setErr("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") login();
            }}
            className="w-full rounded-xl border border-temple-border bg-white/90 py-3 pl-10 pr-10 text-sm text-temple-ink placeholder:text-temple-muted/60 transition-colors focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-temple-muted hover:text-temple-ink"
          >
            {showPwd ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </Field>

      {err && <p className="text-xs text-rose-600">{err}</p>}

      <button
        onClick={login}
        disabled={busy}
        className="ps-btn-primary w-full flex items-center justify-center gap-2"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <ArrowRight className="w-4 h-4" />{" "}
            {lang === "hi" ? "लॉगिन करें" : "Login"}
          </>
        )}
      </button>

      <button
        onClick={() => setShowForgot(true)}
        className="w-full text-center text-xs text-saffron-700 font-semibold hover:text-saffron-800 pt-1"
      >
        {lang === "hi" ? "पासवर्ड भूल गए?" : "Forgot Password?"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════════════════════════
function ForgotPassword({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  const [step, setStep] = useState<"phone" | "otp" | "reset">("phone");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function sendOtp() {
    setErr("");
    const normalizedPhone = normalizePhone(phone.trim());
    if (!normalizedPhone) {
      setErr(
        lang === "hi"
          ? "सही 10-अंकी मोबाइल नंबर दर्ज करें"
          : "Enter a valid 10-digit mobile number",
      );
      return;
    }
    setBusy(true);
    const res = await requestOtp(normalizedPhone, undefined, "reset");
    setBusy(false);
    if (!res.ok) {
      setErr(
        res.error ||
          (lang === "hi" ? "OTP भेजने में विफल" : "Failed to send OTP"),
      );
      return;
    }
    setStep("otp");
  }

  async function verifyAndReset() {
    setErr("");
    if (!otpCode.trim()) {
      setErr(lang === "hi" ? "OTP दर्ज करें" : "Enter OTP");
      return;
    }
    if (newPwd.length < 6) {
      setErr(
        lang === "hi"
          ? "पासवर्ड कम से कम 6 अक्षर का होना चाहिए"
          : "Password must be at least 6 characters",
      );
      return;
    }
    if (newPwd !== confirmPwd) {
      setErr(
        lang === "hi" ? "पासवर्ड मेल नहीं खाता" : "Passwords do not match",
      );
      return;
    }
    setBusy(true);

    const normalizedPhone = normalizePhone(phone.trim());
    if (!normalizedPhone) {
      setErr(
        lang === "hi"
          ? "सही 10-अंकी मोबाइल नंबर दर्ज करें"
          : "Enter a valid 10-digit mobile number",
      );
      setBusy(false);
      return;
    }

    // 1. Verify OTP via Twilio
    const v = await verifyOtp(
      normalizedPhone,
      otpCode.replace(/\s/g, ""),
      "reset",
    );
    if (!v.ok) {
      setErr(v.error || (lang === "hi" ? "OTP गलत है" : "Incorrect OTP"));
      setBusy(false);
      return;
    }

    // 2. Look up the auth email for this phone
    const { email, error: lookupErr } =
      await lookupEmailByPhone(normalizedPhone);
    if (lookupErr || !email) {
      setErr(
        lookupErr ||
          (lang === "hi"
            ? "इस नंबर पर कोई खाता नहीं मिला"
            : "No account found for this number"),
      );
      setBusy(false);
      return;
    }

    // 3. Update the user's password via Supabase admin reset is not possible
    //    from the client. Instead, sign in with the recovered email using
    //    a one-time password update flow: we use updateUser after a fresh
    //    sign-in is not possible without the old password. So we use the
    //    secure password reset via a service-role edge function.
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-password`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword: newPwd }),
      },
    );
    const data = await res.json();
    setBusy(false);

    if (!res.ok || !data.ok) {
      setErr(
        data.error ||
          (lang === "hi"
            ? "पासवर्ड अपडेट करने में विफल"
            : "Failed to update password"),
      );
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
        <p className="text-sm text-temple-ink">
          {lang === "hi"
            ? "पासवर्ड सफलतापूर्वक बदल गया। अब लॉगिन करें।"
            : "Password changed successfully. Please login now."}
        </p>
        <button onClick={onClose} className="ps-btn-primary w-full">
          {lang === "hi" ? "लॉगिन पर वापस" : "Back to Login"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <KeyRound className="w-8 h-8 text-saffron-600 mx-auto mb-2" />
        <h3 className="font-display text-lg text-maroon-900">
          {lang === "hi" ? "पासवर्ड रीसेट" : "Password Reset"}
        </h3>
        <p className="text-xs text-temple-muted">
          {lang === "hi"
            ? "अपना मोबाइल नंबर दर्ज करें — OTP इसी पर आएगा"
            : "Enter your mobile number — OTP will be sent to it"}
        </p>
      </div>

      {step === "phone" && (
        <>
          <Field
            label={lang === "hi" ? "मोबाइल नंबर / Mobile" : "Mobile Number"}
            required
          >
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-muted pointer-events-none" />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="98XXXXXXXX"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErr("");
                }}
                className="w-full rounded-xl border border-temple-border bg-white/90 py-3 pl-10 pr-3 text-sm text-temple-ink placeholder:text-temple-muted/60 focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 outline-none"
              />
            </div>
          </Field>

          {err && <p className="text-xs text-rose-600">{err}</p>}

          <button
            onClick={sendOtp}
            disabled={busy}
            className="ps-btn-primary w-full flex items-center justify-center gap-2"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : lang === "hi" ? (
              "OTP भेजें"
            ) : (
              "Send OTP"
            )}
          </button>
        </>
      )}

      {step === "otp" && (
        <>
          <p className="text-sm text-temple-muted text-center">
            <span className="font-bold text-maroon-800">{phone}</span>{" "}
            {lang === "hi" ? "पर OTP भेजा गया" : "- OTP sent"}
          </p>
          <OtpBoxes value={otpCode} onChange={setOtpCode} />

          <Field
            label={
              lang === "hi" ? "नया पासवर्ड / New Password" : "New Password"
            }
            required
          >
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-muted pointer-events-none" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={newPwd}
                onChange={(e) => {
                  setNewPwd(e.target.value);
                  setErr("");
                }}
                className="w-full rounded-xl border border-temple-border bg-white/90 py-3 pl-10 pr-10 text-sm text-temple-ink placeholder:text-temple-muted/60 focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-temple-muted hover:text-temple-ink"
              >
                {showPwd ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </Field>

          <Field
            label={
              lang === "hi"
                ? "पासवर्ड की पुष्टि करें / Confirm"
                : "Confirm Password"
            }
            required
          >
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-muted pointer-events-none" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPwd}
                onChange={(e) => {
                  setConfirmPwd(e.target.value);
                  setErr("");
                }}
                className="w-full rounded-xl border border-temple-border bg-white/90 py-3 pl-10 pr-3 text-sm text-temple-ink placeholder:text-temple-muted/60 focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 outline-none"
              />
            </div>
          </Field>

          {err && <p className="text-xs text-rose-600">{err}</p>}

          <button
            onClick={verifyAndReset}
            disabled={busy}
            className="ps-btn-primary w-full flex items-center justify-center gap-2"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : lang === "hi" ? (
              "पासवर्ड बदलें"
            ) : (
              "Change Password"
            )}
          </button>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH PAGE (exported)
// ═══════════════════════════════════════════════════════════════════════════════
type Tab = "signup" | "login";

export function AuthPage() {
  const { lang } = useLang();
  const [tab, setTab] = useState<Tab>("signup");
  const [role, setRole] = useState<UserRole | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 bg-gradient-to-b from-ivory-50 via-temple-bg to-ivory-100">
      {/* ── Brand + Lang toggle ──────────────────────────────────────────────── */}
      <div className="w-full max-w-md flex items-center justify-end mb-2">
        <LangToggle />
      </div>
      <div className="text-center mb-6 animate-fade-in">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <LotusIcon className="w-10 h-10" />
          <h1 className="font-display text-3xl text-maroon-900">
            {lang === "hi" ? "पूजासाथी" : "PoojaSathi"}
          </h1>
        </div>
        <p className="text-xs text-temple-muted tracking-wide">
          ॥ ॐ हरी ओम् · श्री गणेशाय नमः ॥
        </p>
        <p className="text-sm text-temple-muted mt-1">
          {lang === "hi"
            ? "पूजा बुक करें · सामग्री सूची पाएं · तैयारी ट्रैक करें"
            : "Book pooja · Get samagri list · Track preparation"}
        </p>
      </div>

      <div className="w-full max-w-md animate-scale-in">
        {/* ── Tab switcher ──────────────────────────────────────────────── */}
        <div className="flex p-1 bg-beige-100 rounded-2xl mb-4 shadow-inner">
          <button
            onClick={() => {
              setTab("signup");
              setRole(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${tab === "signup" ? "bg-white text-maroon-900 shadow-soft" : "text-temple-muted hover:text-temple-ink"}`}
          >
            {lang === "hi" ? "पंजीकरण" : "Sign Up"}
          </button>
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${tab === "login" ? "bg-white text-maroon-900 shadow-soft" : "text-temple-muted hover:text-temple-ink"}`}
          >
            {lang === "hi" ? "लॉगिन" : "Login"}
          </button>
        </div>

        {/* ── Card ──────────────────────────────────────────────────────── */}
        <div className="ps-card p-5 sm:p-6 shadow-lift">
          {tab === "signup" && !role && (
            <>
              {/* Role picker — shown first */}
              <div className="text-center mb-4">
                <h2 className="font-display text-lg text-maroon-900">
                  {lang === "hi" ? "आप कौन हैं?" : "Who are you?"}
                </h2>
                <p className="text-xs text-temple-muted mt-1">
                  {lang === "hi"
                    ? "पंजीकरण के लिए अपनी भूमिका चुनें"
                    : "Select your role to register"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole("yajmaan")}
                  className="flex flex-col items-center gap-2 py-6 rounded-2xl border-2 border-temple-border hover:border-saffron-400 hover:bg-saffron-50 bg-white transition-all group"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">
                    🪔
                  </span>
                  <span className="font-bold text-sm text-maroon-900">
                    {lang === "hi" ? "यजमान" : "Yajmaan"}
                  </span>
                  <span className="text-[11px] text-temple-muted">
                    {lang === "hi" ? "यजमान (भक्त)" : "Devotee"}
                  </span>
                </button>

                <button
                  onClick={() => setRole("pandit")}
                  className="flex flex-col items-center gap-2 py-6 rounded-2xl border-2 border-temple-border hover:border-maroon-500 hover:bg-maroon-50 bg-white transition-all group"
                >
                  <span className="font-display text-4xl font-bold text-maroon-800 group-hover:scale-110 transition-transform">
                    पं
                  </span>
                  <span className="font-bold text-sm text-maroon-900">
                    {lang === "hi" ? "पंडित" : "Pandit"}
                  </span>
                  <span className="text-[11px] text-temple-muted">
                    {lang === "hi" ? "पंडित (पुजारी)" : "Priest"}
                  </span>
                </button>
              </div>
            </>
          )}

          {tab === "signup" && role && (
            <SignUpForm role={role} onBack={() => setRole(null)} />
          )}

          {tab === "login" && <LoginForm />}
        </div>

        {/* ── Switch hint ───────────────────────────────────────────────── */}
        <p className="text-center text-xs text-temple-muted mt-4">
          {tab === "signup" ? (
            <>
              {" "}
              {lang === "hi"
                ? "पहले से खाता है?"
                : "Already have an account?"}{" "}
              <button
                onClick={() => setTab("login")}
                className="text-saffron-700 font-bold hover:text-saffron-800"
              >
                {lang === "hi" ? "लॉगिन करें" : "Login"}
              </button>{" "}
            </>
          ) : (
            <>
              {" "}
              {lang === "hi" ? "नया खाता बनाएं?" : "Create a new account?"}{" "}
              <button
                onClick={() => setTab("signup")}
                className="text-saffron-700 font-bold hover:text-saffron-800"
              >
                {lang === "hi" ? "पंजीकरण करें" : "Sign Up"}
              </button>{" "}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
