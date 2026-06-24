import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { supabase, type BookingRow } from "../../lib/supabase";
import { useLang } from "../../lib/i18n";
import { FloralDivider } from "../../components/SpiritualArt";

const STATUS_META: Record<
  string,
  { hi: string; en: string; color: string; desc_hi: string; desc_en: string }
> = {
  pending: {
    hi: "⏳ प्रतीक्षारत",
    en: "⏳ Pending",
    color: "bg-gold-100 text-gold-800",
    desc_hi: "पंडित जी के जवाब का इंतजार है",
    desc_en: "Waiting for Pandit to respond",
  },
  accepted: {
    hi: "✅ स्वीकृत",
    en: "✅ Accepted",
    color: "bg-saffron-100 text-saffron-800",
    desc_hi: "पंडित जी सामग्री सूची बना रहे हैं",
    desc_en: "Pandit is building samagri list",
  },
  declined: {
    hi: "❌ अस्वीकृत",
    en: "❌ Declined",
    color: "bg-rose-100 text-rose-800",
    desc_hi: "पंडित जी उपलब्ध नहीं",
    desc_en: "Pandit is not available",
  },
  in_preparation: {
    hi: "📝 सूची तैयार!",
    en: "📝 List Ready!",
    color: "bg-emerald-100 text-emerald-800",
    desc_hi: "सामग्री सूची मिल गई — तैयारी करें!",
    desc_en: "Samagri list received — start preparation!",
  },
  ready: {
    hi: "✨ तैयार",
    en: "✨ Ready",
    color: "bg-emerald-100 text-emerald-800",
    desc_hi: "सब तैयार है",
    desc_en: "All set",
  },
  completed: {
    hi: "🙏 पूर्ण",
    en: "🙏 Completed",
    color: "bg-beige-100 text-beige-700",
    desc_hi: "पूजा पूर्ण हुई",
    desc_en: "Pooja completed",
  },
  cancelled: {
    hi: "—  रद्द",
    en: "—  Cancelled",
    color: "bg-rose-50 text-rose-600",
    desc_hi: "",
    desc_en: "",
  },
};

export function YajmaanDashboard() {
  const { lang } = useLang();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(() => {
    try {
      return localStorage.getItem("ps_yajmaan_phone") || "";
    } catch {
      return "";
    }
  });
  const [phoneInput, setPhoneInput] = useState("");
  const [searched, setSearched] = useState(false);

  async function loadBookings(ph: string) {
    setLoading(true);
    const { data } = await supabase
      .from("puja_bookings")
      .select("*, pandits(*)")
      .eq("yajmaan_phone", ph.trim())
      .order("created_at", { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
    setSearched(true);
  }

  useEffect(() => {
    if (phone) loadBookings(phone);
  }, []);

  function lookup() {
    if (!phoneInput.trim()) return;
    const p = phoneInput.trim();
    setPhone(p);
    try {
      localStorage.setItem("ps_yajmaan_phone", p);
    } catch {
      /* */
    }
    loadBookings(p);
  }

  // ── No phone yet — show phone entry ───────────────────────────────────────
  if (!phone) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🪔</div>
            <h1 className="font-display text-2xl text-maroon-900">
              {lang === "hi" ? "यजमान डैशबोर्ड" : "Yajmaan Dashboard"}
            </h1>
            <p className="text-sm text-temple-muted mt-2">
              {lang === "hi"
                ? "अपनी बुकिंग देखने के लिए मोबाइल नंबर दर्ज करें"
                : "Enter your mobile number to see your bookings"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-temple-border p-6 shadow-card space-y-4">
            <div>
              <label className="ps-label">
                {lang === "hi" ? "मोबाइल नंबर" : "Mobile Number"}
              </label>
              <input
                className="ps-input text-base"
                type="tel"
                placeholder="+91 98765 43210"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookup()}
                autoFocus
              />
            </div>
            <button
              onClick={lookup}
              className="w-full py-3 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-base transition-all"
            >
              {lang === "hi" ? "बुकिंग देखें" : "View My Bookings"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-temple-muted mb-3">
              {lang === "hi" ? "कोई बुकिंग नहीं है अभी?" : "No bookings yet?"}
            </p>
            <Link
              to="/yajmaan/book"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-base transition-all"
            >
              <Plus className="w-5 h-5" />
              {lang === "hi" ? "पूजा बुक करें" : "Book a Pooja Now"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Has phone — show bookings ──────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl text-maroon-900">
            {lang === "hi" ? "मेरी पूजाएँ" : "My Poojas"}
          </h1>
          <p className="text-xs text-temple-muted mt-0.5">
            📞 {phone} ·{" "}
            <button
              onClick={() => {
                setPhone("");
                try {
                  localStorage.removeItem("ps_yajmaan_phone");
                } catch {
                  /* */
                }
              }}
              className="text-saffron-700 underline"
            >
              {lang === "hi" ? "बदलें" : "Change"}
            </button>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadBookings(phone)}
            className="p-2 rounded-lg border border-temple-border hover:bg-beige-100"
          >
            <RefreshCw className="w-4 h-4 text-temple-muted" />
          </button>
          <Link
            to="/yajmaan/book"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-saffron-500 text-white font-semibold text-sm hover:bg-saffron-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            {lang === "hi" ? "नई बुकिंग" : "New Booking"}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 && searched ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-temple-border">
          <ClipboardList className="w-12 h-12 mx-auto text-saffron-300 mb-3" />
          <p className="font-display text-lg text-temple-ink mb-1">
            {lang === "hi" ? "कोई बुकिंग नहीं मिली" : "No bookings found"}
          </p>
          <p className="text-sm text-temple-muted mb-5">
            {lang === "hi"
              ? "अभी पूजा बुक करें।"
              : "Book your first pooja now."}
          </p>
          <Link
            to="/yajmaan/book"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-saffron-500 text-white font-bold hover:bg-saffron-600"
          >
            <Plus className="w-4 h-4" />{" "}
            {lang === "hi" ? "पूजा बुक करें" : "Book a Pooja"}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const sm = STATUS_META[b.status] ?? STATUS_META.pending;
            const isListReady = b.samagri_published;
            const isInPrep = b.status === "in_preparation";
            const pandit = b.pandits;

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border-2 ${isInPrep && isListReady ? "border-emerald-400" : "border-temple-border"} shadow-card overflow-hidden`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${sm.color}`}
                      >
                        {lang === "hi" ? sm.hi : sm.en}
                      </span>
                      <h3 className="font-display text-base text-temple-ink mt-1.5">
                        {b.puja_type}
                      </h3>
                      {pandit && (
                        <p className="text-xs text-temple-muted font-deva">
                          {lang === "hi" ? "पंडित:" : "Pandit:"} {pandit.name}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-temple-muted flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {b.puja_date}
                        </span>
                        <span className="truncate max-w-[200px]">
                          {b.venue}
                        </span>
                      </div>
                      <p className="text-xs text-temple-muted mt-1">
                        {lang === "hi" ? sm.desc_hi : sm.desc_en}
                      </p>
                    </div>
                    <Link
                      to={`/yajmaan/booking/${b.id}`}
                      className="p-2 rounded-lg hover:bg-beige-100 shrink-0"
                    >
                      <ArrowRight className="w-4 h-4 text-temple-muted" />
                    </Link>
                  </div>
                </div>

                {/* ── CTA when samagri list is ready ── */}
                {isListReady && (
                  <div className="border-t border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-emerald-800">
                          {lang === "hi"
                            ? "🎉 सामग्री सूची आ गई!"
                            : "🎉 Samagri list is ready!"}
                        </p>
                        <p className="text-xs text-emerald-700">
                          {lang === "hi"
                            ? "पंडित जी ने सूची भेज दी — अभी तैयारी शुरू करें"
                            : "Pandit has sent the list — start marking items now"}
                        </p>
                      </div>
                      <Link
                        to={`/yajmaan/booking/${b.id}/samagri`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 whitespace-nowrap"
                      >
                        <ClipboardList className="w-4 h-4" />
                        {lang === "hi" ? "सूची देखें →" : "View List →"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <FloralDivider className="mt-8" />
    </div>
  );
}
