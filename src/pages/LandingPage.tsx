import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  HandHeart,
  QrCode,
  Sparkles,
  Users,
  CheckCircle2,
  Bell,
} from "lucide-react";
import { useStore } from "../lib/store";
import { daysUntil, formatIndianDate } from "../lib/format";
import {
  DiyaIcon,
  FloralDivider,
  KalashIcon,
  LotusIcon,
  MandalaIcon,
  TempleSilhouette,
} from "../components/SpiritualArt";
import { pushToast } from "../components/ui";
import { useLang } from "../lib/i18n";

export function LandingPage() {
  const { poojas } = useStore();
  const { lang } = useLang();
  const active = poojas.find(
    (p) => p.status === "In Preparation" || p.status === "Planning",
  );
  const upcomingDays = active ? daysUntil(active.date) : null;

  const modules = [
    {
      icon: BookOpen,
      title: lang === "hi" ? "मास्टर सामग्री" : "Master Samagri",
      desc:
        lang === "hi"
          ? "75 असली वस्तुएं — पंडित विजय कुमार मिश्रा की सूची से"
          : "75 real items from Pandit Vijay Kumar Mishra's actual sheet",
    },
    {
      icon: ClipboardCheck,
      title: lang === "hi" ? "तैयारी चेकलिस्ट" : "Preparation Checklist",
      desc:
        lang === "hi"
          ? "व्यवस्थित / नहीं मिला / पंडित जी लाएंगे — तीन त्वरित कार्रवाइयाँ"
          : "Arranged / Unavailable / Ask Pandit — three quick actions",
    },
    {
      icon: HandHeart,
      title: lang === "hi" ? "अनुरोध" : "Requests",
      desc:
        lang === "hi"
          ? "जो वस्तु नहीं मिली उसे पंडित जी से माँगें — सीधा अनुरोध"
          : "Ask Pandit to bring missing items — direct request system",
    },
    {
      icon: Users,
      title: lang === "hi" ? "जिम्मेदारियाँ" : "Responsibilities",
      desc:
        lang === "hi"
          ? "कौन क्या करेगा — पारदर्शी बँटवारा"
          : "Who does what — transparent duty split",
    },
    {
      icon: Bell,
      title: lang === "hi" ? "नोट्स और समयरेखा" : "Notes & Timeline",
      desc:
        lang === "hi"
          ? "WhatsApp की बजाय एक साझा एवं शांत कार्यक्षेत्र"
          : "A calm shared workspace instead of WhatsApp chaos",
    },
    {
      icon: Sparkles,
      title: lang === "hi" ? "समापन" : "Completion",
      desc:
        lang === "hi"
          ? "पूजा सील करें, सामग्री सूची सहेजें, टेम्प्लेट बनाएं"
          : "Seal pooja, save samagri sheet, create reusable template",
    },
  ];

  const entryFlows = [
    {
      icon: Users,
      label: lang === "hi" ? "यजमान पूजा बनाएं" : "Yajmaan creates a pooja",
      desc:
        lang === "hi"
          ? "आप शुरू करें, पंडित को कोड से आमंत्रित करें"
          : "You start, invite Pandit by code",
    },
    {
      icon: BookOpen,
      label: lang === "hi" ? "पंडित जी पूजा बनाएं" : "Pandit creates a pooja",
      desc:
        lang === "hi"
          ? "पंडित जी सामग्री बनाएं और आपको भेजें"
          : "Pandit builds the list and invites you",
    },
    {
      icon: QrCode,
      label: lang === "hi" ? "QR कोड से जुड़ें" : "Scan QR to join",
      desc:
        lang === "hi"
          ? "साझा कोड दोनों को जोड़ता है"
          : "Shared code joins both to same workspace",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 ps-mandala pointer-events-none" />
        <div className="absolute -top-20 -right-16 opacity-[0.06] pointer-events-none">
          <MandalaIcon className="w-96 h-96" spin />
        </div>
        <div className="absolute top-10 -left-20 opacity-[0.05] pointer-events-none">
          <LotusIcon className="w-72 h-72" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-12 sm:pt-20 pb-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left animate-slide-right">
              <span className="ps-chip bg-saffron-100 text-saffron-800 mb-5">
                <DiyaIcon className="w-3.5 h-3.5" />
                {lang === "hi"
                  ? "पारंपरिक कार्यप्रवाह, डिजिटल"
                  : "Sacred workflow, digitised"}
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-maroon-900 leading-[1.05] text-balance">
                {lang === "hi" ? (
                  <>
                    पूजा, <span className="text-saffron-600">साथ मिलकर</span>{" "}
                    योजना बनाइए।
                  </>
                ) : (
                  <>
                    Plan a Pooja,{" "}
                    <span className="text-saffron-600">together.</span>
                  </>
                )}
              </h1>
              <p className="mt-5 text-lg text-temple-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {lang === "hi"
                  ? "पूजासाथी हाथ से लिखी सामग्री की पर्चियों को एक साझा कार्यक्षेत्र में बदलता है जहाँ पंडित और यजमान मिलकर काम करते हैं।"
                  : "PoojaSathi turns handwritten samagri slips into a shared workspace where Pandit and Yajmaan plan, prepare and complete a pooja — side by side."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link to="/poojas/new" className="ps-btn-primary text-base">
                  {lang === "hi" ? "पूजा शुरू करें" : "Start a Pooja"}{" "}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/poojas" className="ps-btn-ghost text-base">
                  {lang === "hi" ? "मेरी पूजाएँ" : "View my poojas"}
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-5 justify-center lg:justify-start text-xs text-temple-muted flex-wrap">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />{" "}
                  {lang === "hi"
                    ? "डेमो — लॉगिन नहीं चाहिए"
                    : "Demo — no login needed"}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />{" "}
                  {lang === "hi" ? "ऑफलाइन काम करता है" : "Works offline (PWA)"}
                </span>
              </div>
            </div>

            {/* Pandit card */}
            <div className="relative animate-lotus-bloom">
              <div className="absolute inset-0 bg-gradient-to-br from-saffron-200/40 to-gold-300/30 rounded-3xl blur-2xl" />
              <div className="relative ps-card p-6 sm:p-7 shadow-lift">
                {/* Actual pandit sheet branding */}
                <div className="text-center mb-4 pb-4 border-b border-temple-border/50">
                  <p className="font-deva text-xs text-saffron-700">
                    ॐ हरी ओम् · श्री गणेशाय नमः
                  </p>
                  <h3 className="font-display text-base text-maroon-900 mt-1">
                    संक्षिप्त पूजन सामग्री
                  </h3>
                  <p className="font-deva font-bold text-sm text-temple-ink mt-0.5">
                    पंडित विजय कुमार मिश्रा
                  </p>
                  <p className="text-xs text-temple-muted">
                    शास्त्री एम.ए. · 📞 9899769768
                  </p>
                  <p className="text-[10px] text-temple-muted mt-0.5">
                    शिव मंदिर सेवा समिति, खिचड़ीपुर, दिल्ली
                  </p>
                </div>

                {active ? (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <KalashIcon className="w-10 h-10 drop-shadow-sm" />
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-temple-muted">
                            {lang === "hi" ? "अगली पूजा" : "Next Pooja"}
                          </p>
                          <h3 className="font-display text-base text-temple-ink leading-tight">
                            {lang === "hi"
                              ? active.name
                              : active.nameEn || active.name}
                          </h3>
                        </div>
                      </div>
                      <span className="ps-chip bg-saffron-100 text-saffron-800 text-[11px]">
                        {lang === "hi" ? "तैयारी में" : "In Prep"}
                      </span>
                    </div>

                    <dl className="grid grid-cols-3 gap-3 text-center mb-4">
                      <div className="p-2 rounded-xl bg-beige-50">
                        <dt className="text-[10px] text-temple-muted">
                          {lang === "hi" ? "दिनांक" : "Date"}
                        </dt>
                        <dd className="font-display text-xs text-temple-ink">
                          {formatIndianDate(active.date)}
                        </dd>
                      </div>
                      <div className="p-2 rounded-xl bg-saffron-50">
                        <dt className="text-[10px] text-temple-muted">
                          {lang === "hi" ? "दिन में" : "In"}
                        </dt>
                        <dd className="font-display text-lg text-saffron-600">
                          {upcomingDays}d
                        </dd>
                      </div>
                      <div className="p-2 rounded-xl bg-beige-50">
                        <dt className="text-[10px] text-temple-muted">
                          {lang === "hi" ? "सामग्री" : "Items"}
                        </dt>
                        <dd className="font-display text-xs text-temple-ink">
                          37
                        </dd>
                      </div>
                    </dl>
                    <Link
                      to={`/pooja/${active.id}`}
                      className="ps-btn-ghost w-full text-sm"
                    >
                      {lang === "hi" ? "कार्यक्षेत्र खोलें" : "Open workspace"}{" "}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <p className="text-center text-sm text-temple-muted py-4">
                    {lang === "hi" ? "कोई सक्रिय पूजा नहीं" : "No active pooja"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <TempleSilhouette className="w-full" />
        </div>
      </section>

      {/* ENTRY FLOWS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl text-maroon-900">
            {lang === "hi"
              ? "पूजा शुरू करने के तीन तरीके"
              : "Three ways a pooja begins"}
          </h2>
          <p className="mt-2 text-sm text-temple-muted">
            {lang === "hi"
              ? "कोई भी शुरू कर सकता है। स्वीकार करते ही साझा कार्यक्षेत्र बन जाता है।"
              : "Either side can start. Accept and a shared workspace is born."}
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {entryFlows.map((f, i) => (
            <div
              key={f.label}
              className="ps-card ps-card-hover p-6 text-center animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-saffron-100 text-saffron-700 flex items-center justify-center">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="mt-4 font-display text-base text-temple-ink">
                {f.label}
              </h3>
              <p className="mt-1 text-xs text-temple-muted">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() =>
              pushToast(
                lang === "hi"
                  ? "QR आमंत्रण जल्द आएगा"
                  : "QR invites coming soon",
                "info",
              )
            }
            className="ps-btn-ghost text-sm"
          >
            <QrCode className="w-4 h-4" />{" "}
            {lang === "hi" ? "QR कोड स्कैन करें" : "Scan a QR code"}
          </button>
        </div>
      </section>

      {/* MODULES */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <FloralDivider className="mb-10" />
        <div className="text-center mb-10">
          <span className="ps-chip bg-gold-100 text-gold-800 mb-3">
            {lang === "hi" ? "कार्यक्षेत्र मॉड्यूल" : "Workspace modules"}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl text-maroon-900">
            {lang === "hi"
              ? "एक कार्यक्षेत्र। हर कदम।"
              : "One workspace. Every step, covered."}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m, i) => (
            <article
              key={m.title}
              className="ps-card ps-card-hover p-6 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-saffron-100 to-gold-100 text-saffron-700 flex items-center justify-center">
                  <m.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base text-temple-ink">
                    {m.title}
                  </h3>
                  <p className="mt-1 text-sm text-temple-muted leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden ps-card p-8 sm:p-12 bg-gradient-to-br from-maroon-800 to-maroon-900 border-maroon-700">
          <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
            <LotusIcon className="w-48 h-48" />
          </div>
          <div className="relative text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl text-ivory-50">
                {lang === "hi"
                  ? "पूजा सही तरीके से शुरू करें।"
                  : "Begin your pooja the right way."}
              </h2>
              <p className="mt-2 text-ivory-200 text-sm max-w-md">
                {lang === "hi"
                  ? "मास्टर सूची बनाएं, पंडित जी को आमंत्रित करें।"
                  : "Set up your master library, invite your Pandit."}
              </p>
            </div>
            <Link
              to="/poojas/new"
              className="mt-5 sm:mt-0 ps-btn bg-ivory-50 text-maroon-900 hover:bg-ivory-100"
            >
              {lang === "hi" ? "पूजा बनाएं" : "Create pooja"}{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <footer className="mt-10 text-center text-xs text-temple-muted">
          <FloralDivider className="mb-4" />
          पूजासाथी · शुभम् भवतु · PoojaSathi — Built with devotion
        </footer>
      </section>
    </div>
  );
}
