import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  PhoneCall,
} from "lucide-react";
import { useLang } from "../lib/i18n";
import { FloralDivider } from "../components/SpiritualArt";

export function HomePage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory-50 via-temple-bg to-ivory-100">
      {/* ── TOP HERO ─────────────────────────────────────────────────────── */}
      <section className="pt-8 pb-4 px-4 text-center">
        <div className="inline-block mb-2">
          <p className="font-deva text-base font-bold text-saffron-700">
            ॥ ॐ हरी ओम् · श्री गणेशाय नमः ॥
          </p>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-maroon-900 leading-tight mb-2">
          {lang === "hi" ? "पूजासाथी" : "PoojaSathi"}
        </h1>
        <p className="text-base text-temple-muted max-w-md mx-auto">
          {lang === "hi"
            ? "पूजा बुक करें → पंडित जी सामग्री सूची भेजें → आप तैयारी अपडेट करें"
            : "Book pooja → Pandit sends samagri list → You mark preparation"}
        </p>
      </section>

      {/* ── TWO BIG ROLE BUTTONS ─────────────────────────────────────────── */}
      <section className="px-4 pb-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ── YAJMAAN ─────────────────────────────────────────────────── */}
          <div className="rounded-3xl border-2 border-saffron-300 bg-white shadow-lg overflow-hidden">
            <div className="bg-gradient-to-br from-saffron-500 to-gold-500 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-4xl">🪔</span>
              </div>
              <h2 className="font-display text-2xl text-white font-bold">
                {lang === "hi" ? "मैं यजमान हूँ" : "I am Yajmaan"}
              </h2>
              <p className="text-saffron-100 text-sm mt-1">
                {lang === "hi" ? "(गृहस्थ / परिवार)" : "(Devotee / Family)"}
              </p>
            </div>
            <div className="p-5">
              <div className="space-y-2 mb-5">
                {[
                  { hi: "📋 पूजा बुक करें", en: "📋 Book a pooja" },
                  {
                    hi: "📩 सामग्री सूची प्राप्त करें",
                    en: "📩 Receive samagri list",
                  },
                  {
                    hi: "✅ व्यवस्थित / नहीं मिला",
                    en: "✅ Mark arranged / unavailable",
                  },
                  {
                    hi: "🙏 पंडित जी से माँगें",
                    en: "🙏 Request Pandit to bring",
                  },
                ].map((item) => (
                  <div
                    key={item.hi}
                    className="flex items-center gap-2 text-sm text-temple-ink"
                  >
                    <CheckCircle2 className="w-4 h-4 text-saffron-500 shrink-0" />
                    {lang === "hi" ? item.hi : item.en}
                  </div>
                ))}
              </div>
              <Link
                to="/yajmaan"
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-base transition-all active:scale-95"
              >
                {lang === "hi"
                  ? "यजमान के रूप में आगे बढ़ें"
                  : "Continue as Yajmaan"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* ── PANDIT ──────────────────────────────────────────────────── */}
          <div className="rounded-3xl border-2 border-maroon-300 bg-white shadow-lg overflow-hidden">
            <div className="bg-gradient-to-br from-maroon-700 to-maroon-900 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <span className="font-deva text-3xl font-bold text-white">
                  पं
                </span>
              </div>
              <h2 className="font-display text-2xl text-white font-bold">
                {lang === "hi" ? "मैं पंडित हूँ" : "I am Pandit"}
              </h2>
              <p className="text-maroon-200 text-sm mt-1">
                {lang === "hi" ? "(पुजारी / शास्त्री)" : "(Priest / Shastri)"}
              </p>
            </div>
            <div className="p-5">
              <div className="space-y-2 mb-5">
                {[
                  {
                    hi: "🔔 यजमान की बुकिंग देखें",
                    en: "🔔 See Yajmaan bookings",
                  },
                  { hi: "✅ बुकिंग स्वीकार करें", en: "✅ Accept bookings" },
                  {
                    hi: "📝 सामग्री चेकलिस्ट बनाएं",
                    en: "📝 Build samagri checklist",
                  },
                  {
                    hi: "📤 यजमान को सूची भेजें",
                    en: "📤 Send list to Yajmaan",
                  },
                ].map((item) => (
                  <div
                    key={item.hi}
                    className="flex items-center gap-2 text-sm text-temple-ink"
                  >
                    <CheckCircle2 className="w-4 h-4 text-maroon-600 shrink-0" />
                    {lang === "hi" ? item.hi : item.en}
                  </div>
                ))}
              </div>
              <Link
                to="/pandit"
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold text-base transition-all active:scale-95"
              >
                {lang === "hi"
                  ? "पंडित के रूप में आगे बढ़ें"
                  : "Continue as Pandit"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="px-4 max-w-2xl mx-auto pb-8">
        <FloralDivider className="mb-6" />
        <h2 className="font-display text-xl text-center text-maroon-900 mb-5">
          {lang === "hi" ? "कैसे काम करता है?" : "How does it work?"}
        </h2>
        <div className="space-y-3">
          {[
            {
              n: "1",
              hi: "यजमान पूजा बुक करते हैं",
              en: "Yajmaan books a pooja",
              sub_hi: "पंडित जी, तारीख और स्थान चुनें",
              sub_en: "Choose Pandit, date & venue",
              color: "bg-saffron-100 text-saffron-800",
            },
            {
              n: "2",
              hi: "पंडित जी बुकिंग स्वीकार करते हैं",
              en: "Pandit accepts the booking",
              sub_hi: "बुकिंग कन्फर्म होती है",
              sub_en: "Booking gets confirmed",
              color: "bg-saffron-100 text-saffron-800",
            },
            {
              n: "3",
              hi: "पंडित जी सामग्री सूची बनाते हैं",
              en: "Pandit builds the samagri list",
              sub_hi: "हर वस्तु अनिवार्य ✓ या वैकल्पिक □ चिह्नित करते हैं",
              sub_en: "Mark each item as required ✓ or optional □",
              color: "bg-gold-100 text-gold-800",
            },
            {
              n: "4",
              hi: "सूची यजमान को भेजी जाती है",
              en: "List is sent to Yajmaan",
              sub_hi: "यजमान को सूचना मिलती है",
              sub_en: "Yajmaan gets notified",
              color: "bg-gold-100 text-gold-800",
            },
            {
              n: "5",
              hi: "यजमान तैयारी अपडेट करते हैं",
              en: "Yajmaan updates preparation",
              sub_hi: "व्यवस्थित ✓ | नहीं मिला ✗ | पंडित जी लाएंगे 🙏",
              sub_en: "Arranged ✓ | Unavailable ✗ | Ask Pandit 🙏",
              color: "bg-emerald-100 text-emerald-800",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="flex items-start gap-3 p-3 rounded-xl bg-white border border-temple-border/50"
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 ${s.color}`}
              >
                {s.n}
              </span>
              <div>
                <p className="text-sm font-semibold text-temple-ink">
                  {lang === "hi" ? s.hi : s.en}
                </p>
                <p className="text-xs text-temple-muted mt-0.5">
                  {lang === "hi" ? s.sub_hi : s.sub_en}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PANDIT CARD ──────────────────────────────────────────────────── */}
      <section className="px-4 max-w-2xl mx-auto pb-10">
        <div className="rounded-3xl border-2 border-maroon-200 bg-gradient-to-br from-maroon-50 to-saffron-50 p-5 text-center">
          <p className="font-deva text-sm text-saffron-700 font-bold mb-2">
            ॐ हरी ओम् · श्री गणेशाय नमः
          </p>
          <div className="w-14 h-14 rounded-full bg-maroon-700 text-white font-deva text-xl font-bold flex items-center justify-center mx-auto mb-2">
            वि
          </div>
          <h3 className="font-display text-lg text-maroon-900">
            पंडित विजय कुमार मिश्रा
          </h3>
          <p className="text-sm text-temple-muted">
            शास्त्री एम.ए. · Shastri M.A.
          </p>
          <a
            href="tel:9899769768"
            className="inline-flex items-center gap-2 mt-2 font-bold text-saffron-700"
          >
            <PhoneCall className="w-4 h-4" /> 9899769768
          </a>
          <p className="text-xs text-temple-muted mt-1">
            शिव मंदिर सेवा समिति, सुभाष मार्किट, खिचड़ीपुर, 5 ब्लॉक, दिल्ली -
            110091
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {[
              "सत्यनारायण कथा",
              "गृह प्रवेश",
              "विवाह संस्कार",
              "हवन",
              "नामकरण",
            ].map((s) => (
              <span
                key={s}
                className="ps-chip bg-maroon-100 text-maroon-800 text-[11px]"
              >
                {s}
              </span>
            ))}
          </div>
          <Link
            to="/yajmaan/book"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-sm transition-all"
          >
            <ClipboardList className="w-4 h-4" />
            {lang === "hi"
              ? "इनके साथ पूजा बुक करें"
              : "Book a Pooja with Pandit Ji"}
          </Link>
        </div>
      </section>
    </div>
  );
}
