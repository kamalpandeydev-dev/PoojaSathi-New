import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  MapPin,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { supabase, type PanditRow } from "../../lib/supabase";
import { useLang } from "../../lib/i18n";
import { pushToast } from "../../components/ui";
import { FloralDivider, KalashIcon } from "../../components/SpiritualArt";

const PUJA_TYPES = [
  "सत्यनारायण कथा",
  "गृह प्रवेश",
  "विवाह संस्कार",
  "नामकरण",
  "लक्ष्मी पूजा",
  "गणेश पूजा",
  "हवन",
  "वास्तु शांति",
  "मुंडन संस्कार",
  "कार्यालय उद्घाटन",
  "अन्य",
];

const COVER_OPTS = [
  { v: "kalash", label: "कलश", icon: "🏺" },
  { v: "lotus", label: "कमल", icon: "🪷" },
  { v: "diya", label: "दीया", icon: "🪔" },
  { v: "havan", label: "हवन", icon: "🔥" },
];

export function BookPoojaPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [pandits, setPandits] = useState<PanditRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    yajmaan_name: "",
    yajmaan_name_en: "",
    yajmaan_phone: "",
    yajmaan_city: "",
    pandit_id: "",
    puja_type: "सत्यनारायण कथा",
    puja_date: tomorrow,
    puja_time: "09:00",
    venue: "",
    city: "",
    occasion: "",
    expected_guests: 10,
    notes: "",
    budget: 15000,
    cover_illustration: "kalash",
  });

  useEffect(() => {
    supabase
      .from("pandits")
      .select("*")
      .eq("available", true)
      .then(({ data }) => {
        if (data) setPandits(data);
      });
  }, []);

  const steps = [
    lang === "hi" ? "आपकी जानकारी" : "Your Details",
    lang === "hi" ? "पंडित चुनें" : "Choose Pandit",
    lang === "hi" ? "पूजा विवरण" : "Pooja Details",
    lang === "hi" ? "पुष्टि करें" : "Confirm",
  ];

  function canNext() {
    if (step === 0) return !!form.yajmaan_name && !!form.yajmaan_phone;
    if (step === 1) return !!form.pandit_id;
    if (step === 2) return !!form.puja_date && !!form.venue;
    return true;
  }

  async function submit() {
    setSubmitting(true);
    const { data, error } = await supabase
      .from("puja_bookings")
      .insert({
        yajmaan_name: form.yajmaan_name,
        yajmaan_name_en: form.yajmaan_name_en || null,
        yajmaan_phone: form.yajmaan_phone,
        yajmaan_city: form.yajmaan_city || null,
        pandit_id: form.pandit_id || null,
        puja_type: form.puja_type,
        puja_date: form.puja_date,
        puja_time: form.puja_time,
        venue: form.venue,
        city: form.city || null,
        occasion: form.occasion || null,
        expected_guests: form.expected_guests,
        notes: form.notes || null,
        budget: form.budget,
        cover_illustration: form.cover_illustration,
        status: "pending",
      })
      .select()
      .single();

    setSubmitting(false);
    if (error || !data) {
      pushToast(
        lang === "hi"
          ? "कुछ गड़बड़ हुई, फिर कोशिश करें"
          : "Error creating booking",
        "error",
      );
      return;
    }
    pushToast(
      lang === "hi" ? "पूजा बुकिंग भेजी गई!" : "Booking sent to Pandit!",
    );
    navigate(`/yajmaan/booking/${data.id}`);
  }

  const selectedPandit = pandits.find((p) => p.id === form.pandit_id);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 animate-fade-in">
      <Link
        to="/yajmaan"
        className="inline-flex items-center gap-1 text-sm text-temple-muted hover:text-temple-ink mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === "hi" ? "डैशबोर्ड" : "Dashboard"}
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <KalashIcon className="w-10 h-10" />
        <div>
          <h1 className="font-display text-2xl text-maroon-900">
            {lang === "hi" ? "पूजा बुक करें" : "Book a Pooja"}
          </h1>
          <p className="text-sm text-temple-muted">
            {lang === "hi"
              ? "पंडित जी को बुकिंग भेजें"
              : "Send a booking request to the Pandit"}
          </p>
        </div>
      </div>

      {/* Step progress */}
      <div className="flex gap-2 mb-6">
        {steps.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-saffron-500" : "bg-beige-200"}`}
            />
            <p
              className={`mt-1 text-[10px] font-medium truncate ${i === step ? "text-saffron-700" : "text-temple-muted"}`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="ps-card p-5 sm:p-6 animate-scale-in">
        {/* Step 0: Your details */}
        {step === 0 && (
          <div className="space-y-4">
            <SectionTitle hi="आपकी जानकारी" en="Your Information" lang={lang} />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="ps-label">
                  {lang === "hi" ? "नाम (हिंदी)" : "Name"} *
                </label>
                <input
                  className="ps-input font-deva"
                  placeholder="राहुल शर्मा"
                  value={form.yajmaan_name}
                  onChange={(e) =>
                    setForm({ ...form, yajmaan_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="ps-label">Name (English)</label>
                <input
                  className="ps-input"
                  placeholder="Rahul Sharma"
                  value={form.yajmaan_name_en}
                  onChange={(e) =>
                    setForm({ ...form, yajmaan_name_en: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="ps-label">
                  {lang === "hi" ? "मोबाइल नंबर" : "Mobile Number"} *
                </label>
                <div className="relative">
                  <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-muted" />
                  <input
                    className="ps-input pl-9"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.yajmaan_phone}
                    onChange={(e) =>
                      setForm({ ...form, yajmaan_phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="ps-label">
                  {lang === "hi" ? "शहर" : "City"}
                </label>
                <input
                  className="ps-input"
                  placeholder={lang === "hi" ? "दिल्ली" : "Delhi"}
                  value={form.yajmaan_city}
                  onChange={(e) =>
                    setForm({ ...form, yajmaan_city: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Choose Pandit */}
        {step === 1 && (
          <div className="space-y-4">
            <SectionTitle
              hi="पंडित जी चुनें"
              en="Select a Pandit"
              lang={lang}
            />
            {pandits.length === 0 ? (
              <p className="text-sm text-temple-muted text-center py-6">
                {lang === "hi" ? "लोड हो रहा है..." : "Loading pandits..."}
              </p>
            ) : (
              pandits.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setForm({ ...form, pandit_id: p.id })}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${form.pandit_id === p.id ? "border-saffron-400 bg-saffron-50" : "border-temple-border hover:border-saffron-300 bg-white"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-maroon-700 text-white font-deva text-xl flex items-center justify-center shrink-0">
                      {p.avatar_initials || "पं"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-deva font-bold text-base text-maroon-900">
                            {p.name}
                          </p>
                          {p.name_en && (
                            <p className="text-xs text-temple-muted">
                              {p.name_en}
                            </p>
                          )}
                          {p.qualifications && (
                            <p className="text-xs text-saffron-700 font-medium">
                              {p.qualifications}
                            </p>
                          )}
                        </div>
                        {form.pandit_id === p.id && (
                          <span className="w-5 h-5 rounded-full bg-saffron-500 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </div>
                      {p.phone && (
                        <p className="mt-1 text-xs text-temple-muted flex items-center gap-1">
                          <PhoneCall className="w-3 h-3" /> {p.phone}
                        </p>
                      )}
                      {p.specialty && (
                        <p className="mt-1.5 flex flex-wrap gap-1">
                          {p.specialty.split(",").map((s) => (
                            <span
                              key={s}
                              className="ps-chip bg-saffron-100 text-saffron-800 text-[10px]"
                            >
                              {s.trim()}
                            </span>
                          ))}
                        </p>
                      )}
                      {p.address && (
                        <p className="mt-1.5 text-[11px] text-temple-muted">
                          {p.address}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Step 2: Pooja details */}
        {step === 2 && (
          <div className="space-y-4">
            <SectionTitle hi="पूजा का विवरण" en="Pooja Details" lang={lang} />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="ps-label">
                  {lang === "hi" ? "पूजा का प्रकार" : "Pooja Type"}
                </label>
                <select
                  className="ps-input font-deva"
                  value={form.puja_type}
                  onChange={(e) =>
                    setForm({ ...form, puja_type: e.target.value })
                  }
                >
                  {PUJA_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ps-label">
                  {lang === "hi" ? "अवसर" : "Occasion"}
                </label>
                <input
                  className="ps-input"
                  placeholder={
                    lang === "hi"
                      ? "गृह प्रवेश, वर्षगाँठ..."
                      : "Housewarming, Anniversary..."
                  }
                  value={form.occasion}
                  onChange={(e) =>
                    setForm({ ...form, occasion: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="ps-label">
                  {lang === "hi" ? "दिनांक" : "Date"} *
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-muted" />
                  <input
                    type="date"
                    className="ps-input pl-9"
                    value={form.puja_date}
                    min={tomorrow}
                    onChange={(e) =>
                      setForm({ ...form, puja_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="ps-label">
                  {lang === "hi" ? "समय" : "Time"}
                </label>
                <input
                  type="time"
                  className="ps-input"
                  value={form.puja_time}
                  onChange={(e) =>
                    setForm({ ...form, puja_time: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="ps-label">
                {lang === "hi" ? "स्थान (पूरा पता)" : "Venue (full address)"} *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-temple-muted" />
                <textarea
                  className="ps-input pl-9 min-h-[70px] resize-none"
                  placeholder={
                    lang === "hi"
                      ? "मकान नंबर, मोहल्ला, शहर..."
                      : "House no., street, city..."
                  }
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="ps-label">
                  {lang === "hi" ? "शहर" : "City"}
                </label>
                <input
                  className="ps-input"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="ps-label">
                  {lang === "hi" ? "मेहमान (अनुमानित)" : "Expected Guests"}
                </label>
                <input
                  type="number"
                  min={1}
                  className="ps-input"
                  value={form.expected_guests}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      expected_guests: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="ps-label">
                  {lang === "hi" ? "बजट (₹)" : "Budget (₹)"}
                </label>
                <input
                  type="number"
                  min={0}
                  className="ps-input"
                  value={form.budget}
                  onChange={(e) =>
                    setForm({ ...form, budget: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div>
              <label className="ps-label">
                {lang === "hi" ? "विशेष टिप्पणी" : "Notes"}
              </label>
              <textarea
                className="ps-input min-h-[70px] resize-y"
                placeholder={
                  lang === "hi"
                    ? "कोई विशेष बात जो पंडित जी को जाननी चाहिए..."
                    : "Anything Pandit should know..."
                }
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div>
              <label className="ps-label">
                {lang === "hi" ? "कवर चित्र" : "Cover"}
              </label>
              <div className="flex gap-2 flex-wrap">
                {COVER_OPTS.map((c) => (
                  <button
                    key={c.v}
                    onClick={() =>
                      setForm({ ...form, cover_illustration: c.v })
                    }
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all ${form.cover_illustration === c.v ? "border-saffron-400 bg-saffron-50 text-saffron-800" : "border-temple-border text-temple-muted hover:border-saffron-200"}`}
                  >
                    <span className="text-xl">{c.icon}</span>
                    {lang === "hi" ? c.label : c.v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <SectionTitle hi="पुष्टि करें" en="Confirm Booking" lang={lang} />
            <div className="p-4 rounded-2xl bg-saffron-50 border border-saffron-200 space-y-2">
              <Row hi="आपका नाम" en="Your name" val={form.yajmaan_name} />
              <Row hi="मोबाइल" en="Phone" val={form.yajmaan_phone} />
              {selectedPandit && (
                <Row hi="पंडित जी" en="Pandit" val={selectedPandit.name} />
              )}
              <Row hi="पूजा" en="Pooja" val={form.puja_type} />
              <Row
                hi="दिनांक"
                en="Date"
                val={`${form.puja_date} · ${form.puja_time}`}
              />
              <Row hi="स्थान" en="Venue" val={form.venue} />
              {form.notes && <Row hi="नोट" en="Notes" val={form.notes} />}
            </div>
            <div className="p-3 rounded-xl bg-gold-50 border border-gold-200">
              <p className="text-xs text-gold-800">
                {lang === "hi"
                  ? "बुकिंग भेजने के बाद पंडित जी स्वीकार करेंगे और सामग्री सूची बनाएंगे।"
                  : "Once sent, Pandit will accept your booking and build the samagri list for you."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="ps-btn-ghost disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" /> {lang === "hi" ? "पीछे" : "Back"}
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="ps-btn-primary disabled:opacity-40"
          >
            {lang === "hi" ? "आगे" : "Next"} <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            className="ps-btn-primary disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            {submitting
              ? lang === "hi"
                ? "भेज रहे हैं..."
                : "Sending..."
              : lang === "hi"
                ? "बुकिंग भेजें"
                : "Send Booking"}
          </button>
        )}
      </div>
    </div>
  );
}

function SectionTitle({
  hi,
  en,
  lang,
}: {
  hi: string;
  en: string;
  lang: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-lg text-maroon-900">
        {lang === "hi" ? hi : en}
      </h2>
      <FloralDivider className="mt-2" />
    </div>
  );
}

function Row({
  hi,
  val,
}: {
  hi: string;
  en: string;
  val: string;
  lang?: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-temple-muted w-24 shrink-0">{hi}</span>
      <span className="text-temple-ink font-medium">{val}</span>
    </div>
  );
}
