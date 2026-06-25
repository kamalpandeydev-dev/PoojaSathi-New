import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, RefreshCw, BookOpen } from "lucide-react";
import { supabase, type BookingRow } from "../../lib/supabase";
import { useLang } from "../../lib/i18n";
import { useAuth } from "../../lib/auth";
import { FloralDivider } from "../../components/SpiritualArt";

const PANDIT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export function PanditDashboard() {
  const { lang } = useLang();
  const { profile: _p } = useAuth();
  void _p;
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("puja_bookings")
      .select("*, pandits(*)")
      .eq("pandit_id", PANDIT_ID)
      .order("created_at", { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const newBookings = bookings.filter((b) => b.status === "pending");
  const activeBookings = bookings.filter(
    (b) => b.status === "accepted" || b.status === "in_preparation",
  );
  const doneBookings = bookings.filter(
    (b) =>
      b.status === "completed" ||
      b.status === "cancelled" ||
      b.status === "declined",
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 animate-fade-in">
      {/* Pandit header */}
      <div className="rounded-2xl bg-gradient-to-br from-maroon-700 to-maroon-900 p-5 mb-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 font-deva text-2xl font-bold flex items-center justify-center shrink-0">
            वि
          </div>
          <div className="flex-1">
            <p className="font-deva text-xs text-maroon-200">ॐ हरी ओम्</p>
            <h1 className="font-display text-xl">पंडित विजय कुमार मिश्रा</h1>
            <p className="text-maroon-200 text-xs">
              शास्त्री एम.ए. · 9899769768
            </p>
          </div>
          <button
            onClick={load}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl border-2 border-gold-300 p-3 text-center">
          <p className="font-display text-3xl text-gold-700">
            {newBookings.length}
          </p>
          <p className="text-xs text-temple-muted">
            {lang === "hi" ? "नई बुकिंग" : "New"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-saffron-200 p-3 text-center">
          <p className="font-display text-3xl text-saffron-600">
            {activeBookings.length}
          </p>
          <p className="text-xs text-temple-muted">
            {lang === "hi" ? "सक्रिय" : "Active"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-3 text-center">
          <p className="font-display text-3xl text-emerald-600">
            {doneBookings.length}
          </p>
          <p className="text-xs text-temple-muted">
            {lang === "hi" ? "पूर्ण" : "Done"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-maroon-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-temple-border">
          <ClipboardList className="w-12 h-12 mx-auto text-maroon-300 mb-3" />
          <p className="text-temple-muted">
            {lang === "hi" ? "अभी कोई बुकिंग नहीं।" : "No bookings yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* New bookings — most prominent */}
          {newBookings.length > 0 && (
            <>
              <h2 className="font-display text-base text-temple-ink flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                {lang === "hi"
                  ? "नई बुकिंग — जवाब दें"
                  : "New Bookings — Action Needed"}
              </h2>
              {newBookings.map((b) => (
                <BookingCard key={b.id} booking={b} lang={lang} highlight />
              ))}
            </>
          )}

          {/* Active */}
          {activeBookings.length > 0 && (
            <>
              <h2 className="font-display text-base text-temple-ink mt-4">
                {lang === "hi" ? "सक्रिय पूजाएं" : "Active Poojas"}
              </h2>
              {activeBookings.map((b) => (
                <BookingCard key={b.id} booking={b} lang={lang} />
              ))}
            </>
          )}

          {/* Done */}
          {doneBookings.length > 0 && (
            <>
              <h2 className="font-display text-base text-temple-muted mt-4">
                {lang === "hi" ? "पूर्ण / रद्द" : "Completed / Cancelled"}
              </h2>
              {doneBookings.map((b) => (
                <BookingCard key={b.id} booking={b} lang={lang} dimmed />
              ))}
            </>
          )}
        </div>
      )}

      <FloralDivider className="mt-8" />
      <div className="mt-4 text-center">
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-sm text-saffron-700 hover:text-saffron-800"
        >
          <BookOpen className="w-4 h-4" />
          {lang === "hi"
            ? "मास्टर सामग्री सूची (75 वस्तुएं)"
            : "Master Samagri Library (75 items)"}
        </Link>
      </div>
    </div>
  );
}

function BookingCard({
  booking: b,
  lang,
  highlight,
  dimmed,
}: {
  booking: BookingRow;
  lang: string;
  highlight?: boolean;
  dimmed?: boolean;
}) {
  const samagriDone = b.samagri_published;
  const needsList = b.status === "accepted" && !samagriDone;

  return (
    <div
      className={`bg-white rounded-2xl border-2 overflow-hidden ${
        highlight
          ? "border-gold-400 shadow-lg"
          : samagriDone
            ? "border-saffron-200"
            : "border-temple-border"
      } ${dimmed ? "opacity-70" : ""}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusBadge status={b.status} lang={lang} />
              {samagriDone && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-saffron-100 text-saffron-800">
                  ✓ {lang === "hi" ? "सूची भेजी" : "List Sent"}
                </span>
              )}
              {highlight && !samagriDone && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-maroon-100 text-maroon-800 animate-pulse-soft">
                  ● {lang === "hi" ? "जवाब आवश्यक" : "Response needed"}
                </span>
              )}
            </div>
            <h3 className="font-display text-base text-temple-ink">
              {b.puja_type}
            </h3>
            <p className="text-xs text-temple-muted font-deva mt-0.5">
              {lang === "hi" ? "यजमान:" : "By:"} {b.yajmaan_name} ·{" "}
              {b.puja_date}
            </p>
          </div>
          <Link
            to={`/pandit/booking/${b.id}`}
            className="p-2 rounded-lg hover:bg-beige-100 shrink-0"
          >
            <ArrowRight className="w-4 h-4 text-temple-muted" />
          </Link>
        </div>
      </div>

      {/* Build list CTA */}
      {needsList && (
        <div className="border-t border-saffron-200 bg-saffron-50 p-3 flex items-center gap-3">
          <span className="text-base">📝</span>
          <p className="flex-1 text-xs font-medium text-saffron-900">
            {lang === "hi"
              ? "अब सामग्री सूची बनाएं और यजमान को भेजें"
              : "Now build samagri list and send to Yajmaan"}
          </p>
          <Link
            to={`/pandit/booking/${b.id}/samagri`}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-saffron-500 text-white font-bold text-xs hover:bg-saffron-600"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            {lang === "hi" ? "सूची बनाएं →" : "Build →"}
          </Link>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, lang }: { status: string; lang: string }) {
  const map: Record<string, { hi: string; en: string; cls: string }> = {
    pending: {
      hi: "⏳ नई बुकिंग",
      en: "⏳ New Booking",
      cls: "bg-gold-100 text-gold-800",
    },
    accepted: {
      hi: "✅ स्वीकृत",
      en: "✅ Accepted",
      cls: "bg-saffron-100 text-saffron-800",
    },
    in_preparation: {
      hi: "📝 तैयारी में",
      en: "📝 In Prep",
      cls: "bg-saffron-100 text-saffron-800",
    },
    ready: {
      hi: "✨ तैयार",
      en: "✨ Ready",
      cls: "bg-emerald-100 text-emerald-800",
    },
    completed: {
      hi: "🙏 पूर्ण",
      en: "🙏 Done",
      cls: "bg-beige-100 text-beige-700",
    },
    declined: {
      hi: "❌ अस्वीकृत",
      en: "❌ Declined",
      cls: "bg-rose-100 text-rose-800",
    },
    cancelled: {
      hi: "— रद्द",
      en: "— Cancelled",
      cls: "bg-rose-50 text-rose-600",
    },
  };
  const m = map[status] ?? map.pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${m.cls}`}
    >
      {lang === "hi" ? m.hi : m.en}
    </span>
  );
}
