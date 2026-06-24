import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Flag,
  HandHeart,
  LayoutDashboard,
  StickyNote,
  CalendarClock,
  BookOpen,
  PartyPopper,
  ListChecks,
  MapPin,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { getProfile } from "../../lib/profiles";
import { daysUntil, formatIndianDate } from "../../lib/format";
import { Avatar, Badge, ProgressRing } from "../../components/ui";
import {
  CoverIllustration,
  FloralDivider,
} from "../../components/SpiritualArt";
import { useLang } from "../../lib/i18n";

export function WorkspaceLayout() {
  const { poojaId } = useParams();
  const { getPooja, samagriForPooja, requestsForPooja } = useStore();
  const { lang } = useLang();
  const pooja = poojaId ? getPooja(poojaId) : undefined;
  if (!pooja) return <MissingWorkspace />;

  const samagri = samagriForPooja(pooja.id);
  const doneCount = samagri.filter(
    (s) => s.status === "Arranged" || s.status === "Purchased",
  ).length;
  const progress = samagri.length
    ? Math.round((doneCount / samagri.length) * 100)
    : 0;
  const pendingReqs = requestsForPooja(pooja.id).filter(
    (r) => r.status === "Pending",
  ).length;
  const days = daysUntil(pooja.date);
  const partner = pooja.participants.find(
    (p) => p.profileId !== pooja.createdById,
  );

  const modules = [
    {
      to: "",
      label: lang === "hi" ? "अवलोकन" : "Overview",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "booking",
      label: lang === "hi" ? "बुकिंग" : "Booking",
      icon: CalendarClock,
    },
    {
      to: "samagri",
      label: lang === "hi" ? "सामग्री" : "Samagri",
      icon: BookOpen,
    },
    {
      to: "checklist",
      label: lang === "hi" ? "चेकलिस्ट" : "Checklist",
      icon: ClipboardCheck,
    },
    {
      to: "requests",
      label: lang === "hi" ? "अनुरोध" : "Requests",
      icon: HandHeart,
    },
    {
      to: "responsibilities",
      label: lang === "hi" ? "जिम्मेदारी" : "Duties",
      icon: Flag,
    },
    { to: "notes", label: lang === "hi" ? "नोट्स" : "Notes", icon: StickyNote },
    {
      to: "timeline",
      label: lang === "hi" ? "समयरेखा" : "Timeline",
      icon: ListChecks,
    },
    {
      to: "completion",
      label: lang === "hi" ? "समापन" : "Completion",
      icon: PartyPopper,
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-temple-surface to-ivory-100 border-b border-temple-border/60">
        <div className="absolute -top-20 -right-16 opacity-[0.06] pointer-events-none">
          <CoverIllustration
            cover={pooja.coverIllustration}
            className="w-80 h-80"
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-7">
          <Link
            to="/poojas"
            className="inline-flex items-center gap-1 text-xs text-temple-muted hover:text-temple-ink mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />{" "}
            {lang === "hi" ? "सभी पूजाएँ" : "All poojas"}
          </Link>
          <div className="flex flex-col lg:flex-row gap-5 lg:items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-white to-gold-50 shadow-soft flex items-center justify-center shrink-0">
                <CoverIllustration
                  cover={pooja.coverIllustration}
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone="saffron">{pooja.type}</Badge>
                  {pooja.status !== "Completed" && (
                    <Badge tone={days < 0 ? "neutral" : "gold"}>
                      {days >= 0
                        ? lang === "hi"
                          ? `${days} दिन में`
                          : `In ${days}d`
                        : lang === "hi"
                          ? `${Math.abs(days)} दिन पूर्व`
                          : `${Math.abs(days)}d ago`}
                    </Badge>
                  )}
                  {pooja.status === "Completed" && (
                    <Badge tone="success">
                      <CheckCircle2 className="w-3 h-3" />{" "}
                      {lang === "hi" ? "पूर्ण" : "Completed"}
                    </Badge>
                  )}
                  {pooja.samagriPublished && (
                    <Badge tone="gold">
                      {lang === "hi" ? "सूची भेजी" : "List Sent"}
                    </Badge>
                  )}
                </div>
                <h1 className="mt-1.5 font-display text-2xl sm:text-3xl text-maroon-900 leading-tight">
                  {lang === "hi" ? pooja.name : pooja.nameEn || pooja.name}
                </h1>
                <p className="mt-1 text-sm text-temple-muted flex items-center gap-1.5 flex-wrap">
                  <MapPin className="w-3.5 h-3.5" /> {pooja.venue}, {pooja.city}
                  <span aria-hidden>·</span>
                  <CalendarClock className="w-3.5 h-3.5" />{" "}
                  {formatIndianDate(pooja.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center">
                <ProgressRing value={progress} size={60} />
                <p className="mt-1 text-[11px] text-temple-muted">
                  {lang === "hi" ? "तैयार" : "Prepared"}
                </p>
              </div>
              <div className="flex -space-x-2">
                {pooja.participants.map((p) => (
                  <Avatar
                    key={p.profileId}
                    initials={getProfile(p.profileId).avatarInitials}
                    size="md"
                    className="ring-2 ring-white"
                  />
                ))}
                {partner && partner.invitation === "pending" && (
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-beige-100 text-beige-600 ring-2 ring-white text-[10px] font-semibold">
                    {lang === "hi" ? "प्रतीक्षा" : "pending"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module tabs */}
      <nav
        aria-label={
          lang === "hi"
            ? "पूजा कार्यक्षेत्र मॉड्यूल"
            : "Pooja workspace modules"
        }
        className="sticky top-16 z-30 bg-temple-bg/90 backdrop-blur-md border-b border-temple-border/60"
      >
        <div className="mx-auto max-w-6xl px-2 sm:px-6 flex gap-0.5 overflow-x-auto no-scrollbar">
          {modules.map((m) => (
            <NavLink
              key={m.label}
              to={m.to}
              end={m.end}
              className={({ isActive }) =>
                `relative whitespace-nowrap px-3 py-3 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? "text-saffron-700"
                    : "text-temple-muted hover:text-temple-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <m.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>{m.label}</span>
                  {m.to === "requests" && pendingReqs > 0 && (
                    <span className="min-w-[16px] h-4 px-1 rounded-full bg-maroon-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {pendingReqs}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-saffron-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-8">
        <FloralDivider />
      </div>
    </div>
  );
}

function MissingWorkspace() {
  const { lang } = useLang();
  return (
    <div className="mx-auto max-w-md py-24 text-center px-4">
      <p className="font-display text-5xl text-saffron-500">ॐ</p>
      <h1 className="mt-4 font-display text-2xl text-temple-ink">
        {lang === "hi" ? "कार्यक्षेत्र नहीं मिला" : "Workspace not found"}
      </h1>
      <Link to="/poojas" className="mt-6 inline-block ps-btn-primary">
        {lang === "hi" ? "पूजाएँ देखें" : "Back to poojas"}
      </Link>
    </div>
  );
}
