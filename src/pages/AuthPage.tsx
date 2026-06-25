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
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth, type UserRole } from "../lib/auth";
import { requestOtp, verifyOtp } from "../lib/otp";
import { pushToast } from "../components/ui";
import { useLang } from "../lib/i18n";
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
const PANDIT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

function SignUpForm({ role }: { role: UserRole }) {
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [busy, setBusy] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});

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
    if (!form.full_name.trim()) e.full_name = "नाम आवश्यक है";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10)
      e.phone = "सही 10-अंकी मोबाइल नंबर दर्ज करें";
    if (form.password.length < 6)
      e.password = "पासवर्ड कम से कम 6 अक्षर का होना चाहिए";
    if (form.password !== form.confirmPwd)
      e.confirmPwd = "पासवर्ड मेल नहीं खाता";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "ईमेल सही नहीं है";
    setFieldErr(e);
    return Object.keys(e).length === 0;
  }

  async function sendOtp() {
    if (!validate()) return;
    setBusy(true);
    setErr("");
    const res = await requestOtp(
      form.phone.trim(),
      form.email || undefined,
      "signup",
    );
    setBusy(false);
    if (!res.ok) {
      setErr(res.error || "OTP भेजने में विफल");
      return;
    }
    setDemoOtp(res.otp ?? "");
    setStep("otp");
  }

  async function submitSignUp() {
    if (otpCode.replace(/\s/g, "").length < 6) {
      setErr("6 अंकों का OTP दर्ज करें");
      return;
    }
    setBusy(true);
    setErr("");

    // 1. Verify OTP
    const v = await verifyOtp(
      form.phone.trim(),
      otpCode.replace(/\s/g, ""),
      "signup",
    );
    if (!v.ok) {
      setErr(v.error || "OTP गलत है");
      setBusy(false);
      return;
    }

    // 2. Create Supabase auth user
    const emailToUse =
      form.email.trim() || `${form.phone.replace(/\D/g, "")}@poojasathi.app`;
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: emailToUse,
      password: form.password,
      options: { data: { full_name: form.full_name, role } },
    });

    if (authErr || !authData.user) {
      setErr(
        authErr?.message === "User already registered"
          ? "यह नंबर/ईमेल पहले से पंजीकृत है। लॉगिन करें।"
          : (authErr?.message ?? "पंजीकरण विफल"),
      );
      setBusy(false);
      return;
    }

    // 3. Insert user_profile
    const { error: profileErr } = await supabase.from("user_profiles").insert({
      id: authData.user.id,
      role,
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email || null,
      location_text: form.location_text || null,
      city: form.city || null,
      state: form.state || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      pandit_id: role === "pandit" ? PANDIT_ID : null,
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

    // 4. If pandit, update pandits table with their name/phone/city
    if (role === "pandit") {
      await supabase
        .from("pandits")
        .update({
          name: form.full_name.trim(),
          phone: form.phone.trim(),
          city: form.city || null,
        })
        .eq("id", PANDIT_ID);
    }

    await refreshProfile();
    pushToast(
      role === "pandit" ? "पंडित जी, स्वागत है! 🙏" : "यजमान जी, स्वागत है! 🪔",
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
          <h3 className="font-display text-xl text-maroon-900">OTP सत्यापन</h3>
          <p className="text-sm text-temple-muted mt-1">
            <span className="font-bold text-maroon-800">{form.phone}</span> पर
            OTP भेजा गया
          </p>
          {/* Demo mode: show OTP inline */}
          {demoOtp && (
            <div className="mt-3 inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gold-50 border-2 border-gold-300">
              <span className="text-xs font-semibold text-gold-700">
                Demo OTP:
              </span>
              <span className="font-mono font-extrabold text-xl text-maroon-900 tracking-[0.2em]">
                {demoOtp}
              </span>
            </div>
          )}
        </div>

        <OtpBoxes value={otpCode} onChange={setOtpCode} />

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
              <CheckCircle2 className="w-4 h-4" /> OTP सत्यापित करें और पंजीकरण
              पूरा करें
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
            ← पीछे जाएं
          </button>
          <button
            onClick={sendOtp}
            disabled={busy}
            className="flex items-center gap-1 text-maroon-700 font-semibold hover:text-maroon-800"
          >
            <RefreshCw className="w-3 h-3" /> OTP दोबारा भेजें
          </button>
        </div>
      </div>
    );
  }

  // ─── Registration Form ────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Role badge */}
      <div
        className={`py-2 px-4 rounded-xl text-center text-sm font-bold ${role === "pandit" ? "bg-maroon-100 text-maroon-800" : "bg-saffron-100 text-saffron-800"}`}
      >
        {role === "pandit"
          ? "🙏 पंडित के रूप में पंजीकरण"
          : "🪔 यजमान के रूप में पंजीकरण"}
      </div>

      {/* 1. Name */}
      <Field label="नाम / Full Name" required error={fieldErr.full_name}>
        <Input
          icon={<User className="w-4 h-4" />}
          placeholder="पूरा नाम लिखें..."
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
        />
      </Field>

      {/* 2. Mobile */}
      <Field
        label="मोबाइल नंबर / Mobile Number"
        required
        hint="OTP इसी नंबर पर आएगा"
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
      <Field label="ईमेल / Email (वैकल्पिक)" error={fieldErr.email}>
        <Input
          icon={<Mail className="w-4 h-4" />}
          type="email"
          placeholder="name@example.com (जरूरी नहीं)"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </Field>

      {/* 4. Location */}
      <Field label="स्थान / Location">
        <div className="space-y-2">
          {/* GPS + manual address */}
          <div className="flex items-center gap-2">
            <Input
              icon={<MapPin className="w-4 h-4" />}
              placeholder="पता / Address"
              value={form.location_text}
              onChange={(e) => set("location_text", e.target.value)}
            />
            <button
              type="button"
              onClick={useGPS}
              className="shrink-0 flex items-center gap-1.5 px-3 py-3 rounded-xl border border-saffron-300 bg-saffron-50 text-saffron-700 text-xs font-semibold hover:bg-saffron-100 transition-colors whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5" /> GPS से
            </button>
          </div>
          {/* City + State */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="शहर / City"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
            <Input
              placeholder="राज्य / State"
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
        label="पासवर्ड / Password"
        required
        error={fieldErr.password}
        hint="कम से कम 6 अक्षर"
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
        label="पासवर्ड पुष्टि / Confirm Password"
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
            <Phone className="w-4 h-4" /> OTP प्राप्त करें{" "}
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
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [id, setId] = useState(""); // phone or email
  const [pwd, setPwd] = useState("");

  async function login() {
    setErr("");
    if (!id.trim()) {
      setErr("मोबाइल नंबर या ईमेल दर्ज करें");
      return;
    }
    if (!pwd) {
      setErr("पासवर्ड दर्ज करें");
      return;
    }
    setBusy(true);

    // Accept mobile number: convert to our email convention
    const emailToUse = id.trim().includes("@")
      ? id.trim()
      : `${id.trim().replace(/\D/g, "")}@poojasathi.app`;

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: pwd,
    });
    setBusy(false);

    if (error) {
      setErr("मोबाइल/ईमेल या पासवर्ड गलत है। / Invalid credentials.");
      return;
    }

    await refreshProfile();
    pushToast("स्वागत है! 🙏");
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="py-3 px-4 rounded-xl bg-ivory-100 border border-temple-border/60 text-center text-xs text-temple-muted">
        पंडित या यजमान — भूमिका आपके खाते से स्वतः पहचानी जाएगी।
        <br />
        <span className="text-[11px]">
          Role is auto-detected from your account.
        </span>
      </div>

      <Field label="मोबाइल नंबर या ईमेल" required>
        <Input
          icon={<Phone className="w-4 h-4" />}
          type="text"
          placeholder="9876543210 या email@example.com"
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

      <Field label="पासवर्ड / Password" required>
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
            <ArrowRight className="w-4 h-4" /> लॉगिन करें
          </>
        )}
      </button>
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
  const [role, setRole] = useState<UserRole>("yajmaan");

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 bg-gradient-to-b from-ivory-50 via-temple-bg to-ivory-100">
      {/* ── Brand ─────────────────────────────────────────────────────────── */}
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
            onClick={() => setTab("signup")}
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
          {tab === "signup" && (
            <>
              {/* Role picker */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  onClick={() => setRole("yajmaan")}
                  className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${role === "yajmaan" ? "border-saffron-500 bg-saffron-50 shadow-soft" : "border-temple-border hover:border-saffron-300 bg-white"}`}
                >
                  <span className="text-3xl">🪔</span>
                  <span className="font-bold text-sm text-maroon-900">
                    यजमान
                  </span>
                  <span className="text-[11px] text-temple-muted">
                    Yajmaan (Devotee)
                  </span>
                  {role === "yajmaan" && (
                    <span className="w-2 h-2 rounded-full bg-saffron-500" />
                  )}
                </button>

                <button
                  onClick={() => setRole("pandit")}
                  className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${role === "pandit" ? "border-maroon-600 bg-maroon-50 shadow-soft" : "border-temple-border hover:border-maroon-300 bg-white"}`}
                >
                  <span className="font-display text-3xl font-bold text-maroon-800">
                    पं
                  </span>
                  <span className="font-bold text-sm text-maroon-900">
                    पंडित
                  </span>
                  <span className="text-[11px] text-temple-muted">
                    Pandit (Priest)
                  </span>
                  {role === "pandit" && (
                    <span className="w-2 h-2 rounded-full bg-maroon-600" />
                  )}
                </button>
              </div>

              <SignUpForm role={role} />
            </>
          )}

          {tab === "login" && <LoginForm />}
        </div>

        {/* ── Switch hint ───────────────────────────────────────────────── */}
        <p className="text-center text-xs text-temple-muted mt-4">
          {tab === "signup" ? (
            <>
              {" "}
              पहले से खाता है?{" "}
              <button
                onClick={() => setTab("login")}
                className="text-saffron-700 font-bold hover:text-saffron-800"
              >
                लॉगिन करें
              </button>{" "}
            </>
          ) : (
            <>
              {" "}
              नया खाता बनाएं?{" "}
              <button
                onClick={() => setTab("signup")}
                className="text-saffron-700 font-bold hover:text-saffron-800"
              >
                पंजीकरण करें
              </button>{" "}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
