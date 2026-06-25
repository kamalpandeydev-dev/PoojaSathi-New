import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { supabase, type BookingRow } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
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
    desc_hi: "पंडित जी के जवाब का इंतजार",
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
    desc_hi: "सूची मिली — तैयारी शुरू करें!",
    desc_en: "Samagri list ready — start prep!",
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
    hi: "— रद्द",
    en: "— Cancelled",
    color: "bg-rose-50 text-rose-600",
    desc_hi: "",
    desc_en: "",
  },
};

export function YajmaanDashboard() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from("puja_bookings")
      .select("*, pandits(*)")
      .eq("yajmaan_phone", profile.phone)
      .order("created_at", { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-xs text-saffron-700 font-bold">ॐ हरी ओम् 🪔</p>
          <h1 className="font-display text-2xl text-maroon-900">
            {lang === "hi"
              ? `${profile?.full_name.split(" ")[0]} जी, मेरी पूजाएँ`
              : `My Poojas`}
          </h1>
          <p className="text-xs text-temple-muted mt-0.5">
            📞 {profile?.phone}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadBookings}
            className="p-2 rounded-lg border border-temple-border hover:bg-beige-100"
          >
            <RefreshCw className="w-4 h-4 text-temple-muted" />
          </button>
          <Link to="/yajmaan/book" className="ps-btn-primary py-2 px-3 text-xs">
            <Plus className="w-4 h-4" />{" "}
            {lang === "hi" ? "नई बुकिंग" : "New Booking"}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-temple-border">
          <ClipboardList className="w-12 h-12 mx-auto text-saffron-300 mb-3" />
          <p className="font-display text-lg text-temple-ink mb-1">
            {lang === "hi" ? "कोई बुकिंग नहीं" : "No bookings yet"}
          </p>
          <p className="text-sm text-temple-muted mb-5">
            {lang === "hi"
              ? "अभी पूजा बुक करें।"
              : "Book your first pooja now."}
          </p>
          <Link to="/yajmaan/book" className="ps-btn-primary">
            <Plus className="w-4 h-4" />{" "}
            {lang === "hi" ? "पूजा बुक करें" : "Book a Pooja"}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const sm = STATUS_META[b.status] ?? STATUS_META.pending;
            const listReady = b.samagri_published;
            const pandit = b.pandits;
            return (
              <div
                key={b.id}
                className={`ps-card overflow-hidden ${listReady ? "border-emerald-400 border-2" : ""}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className={`ps-chip ${sm.color}`}>
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
                      <div className="flex items-center gap-3 mt-1 text-xs text-temple-muted flex-wrap">
                        <span>📅 {b.puja_date}</span>
                        <span className="truncate max-w-[200px]">
                          📍 {b.venue}
                        </span>
                      </div>
                      <p className="text-xs text-temple-muted mt-0.5">
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

                {/* Samagri list ready CTA */}
                {listReady && (
                  <div className="border-t border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-emerald-800">
                        {lang === "hi"
                          ? "🎉 सामग्री सूची आ गई!"
                          : "🎉 Samagri list is ready!"}
                      </p>
                      <p className="text-xs text-emerald-700">
                        {lang === "hi"
                          ? "पंडित जी ने सूची भेजी — तैयारी शुरू करें"
                          : "Pandit sent the list — start marking items"}
                      </p>
                    </div>
                    <Link
                      to={`/yajmaan/booking/${b.id}/samagri`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 whitespace-nowrap"
                    >
                      <ClipboardList className="w-4 h-4" />
                      {lang === "hi" ? "सूची →" : "View →"}
                    </Link>
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
