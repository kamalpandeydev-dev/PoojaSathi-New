import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  Flag,
  HandHeart,
  MapPin,
  PartyPopper,
  StickyNote,
  Phone,
  TrendingUp,
  ListChecks,
  Clock,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { currentUser, getProfile } from "../../lib/profiles";
import {
  formatIndianDate,
  formatTime,
  daysUntil,
  relativeTime,
} from "../../lib/format";
import { Avatar, ProgressRing } from "../../components/ui";
import { FloralDivider, LotusIcon } from "../../components/SpiritualArt";

export function WorkspaceOverview() {
  const { poojaId } = useParams();
  const {
    getPooja,
    samagriForPooja,
    requestsForPooja,
    responsibilitiesForPooja,
    notesForPooja,
    timelineForPooja,
  } = useStore();
  const pooja = poojaId ? getPooja(poojaId) : undefined;
  if (!pooja) return null;

  const samagri = samagriForPooja(pooja.id);
  const doneCount = samagri.filter(
    (s) => s.status === "Arranged" || s.status === "Purchased",
  ).length;
  const progress = samagri.length
    ? Math.round((doneCount / samagri.length) * 100)
    : 0;
  const pendingReqs = requestsForPooja(pooja.id).filter(
    (r) => r.status === "Pending",
  );
  const tasks = responsibilitiesForPooja(pooja.id);
  const myTasks = tasks
    .filter((t) => t.owner === currentUser.role || t.owner === "Shared")
    .filter((t) => !t.done);
  const notes = notesForPooja(pooja.id);
  const timeline = timelineForPooja(pooja.id).slice(0, 4);
  const days = daysUntil(pooja.date);
  const partner = pooja.participants.find(
    (p) => p.profileId !== currentUser.id,
  );
  const isCompleted = pooja.status === "Completed";

  const quickStats = [
    {
      label: "Samagri items",
      value: samagri.length,
      icon: BookOpen,
      tone: "saffron" as const,
    },
    {
      label: "Prepared",
      value: `${progress}%`,
      icon: TrendingUp,
      tone: "success" as const,
    },
    {
      label: "Open requests",
      value: pendingReqs.length,
      icon: HandHeart,
      tone: "maroon" as const,
    },
    {
      label: "Pending tasks",
      value: myTasks.length,
      icon: ClipboardCheck,
      tone: "gold" as const,
    },
  ];

  const moduleCards = [
    {
      to: "booking",
      label: "Booking",
      desc: "Date, venue, budget & access code",
      icon: CalendarClock,
    },
    {
      to: "samagri",
      label: "Master Samagri",
      desc: `${samagri.length} items in this pooja`,
      icon: BookOpen,
    },
    {
      to: "checklist",
      label: "Preparation",
      desc: `${doneCount}/${samagri.length} arranged`,
      icon: ClipboardCheck,
    },
    {
      to: "requests",
      label: "Requests",
      desc: pendingReqs.length ? `${pendingReqs.length} pending` : "All clear",
      icon: HandHeart,
    },
    {
      to: "responsibilities",
      label: "Responsibilities",
      desc: `${tasks.filter((t) => t.done).length}/${tasks.length} done`,
      icon: Flag,
    },
    {
      to: "notes",
      label: "Notes",
      desc: `${notes.length} shared`,
      icon: StickyNote,
    },
    {
      to: "timeline",
      label: "Timeline",
      desc: "Activity feed",
      icon: ListChecks,
    },
    {
      to: "completion",
      label: "Completion",
      desc: isCompleted ? "Sealed" : "Final blessing",
      icon: PartyPopper,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting + progress */}
      <section className="ps-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-temple-muted">
              {isCompleted
                ? "Pooja completed"
                : days >= 0
                  ? "Coming up"
                  : "Past pooja"}
            </p>
            <h2 className="mt-1 font-display text-2xl text-maroon-900">
              {isCompleted
                ? "May the blessings stay with you."
                : days === 0
                  ? "Today is the day."
                  : days > 0
                    ? `${days} days until your pooja.`
                    : `${Math.abs(days)} days since.`}
            </h2>
            <p className="mt-1 text-sm text-temple-muted">
              {formatIndianDate(pooja.date)} · {formatTime(pooja.time)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing value={progress} size={72} />
            <div className="text-xs text-temple-muted space-y-1">
              <p className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {pooja.time}
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {pooja.city}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map((s, i) => (
          <div
            key={s.label}
            className="ps-card p-4 animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <s.icon className="w-5 h-5 text-saffron-600" />
            </div>
            <p className="mt-2 font-display text-2xl text-temple-ink">
              {s.value}
            </p>
            <p className="text-xs text-temple-muted">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Pinned note + Partner card */}
      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 ps-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <StickyNote className="w-4 h-4 text-gold-600" />
            <h3 className="font-display text-base text-temple-ink">
              Pinned note from{" "}
              {getProfile(pooja.participants[0].profileId).name}
            </h3>
          </div>
          {notes.find((n) => n.pinned) ? (
            <blockquote className="border-l-2 border-gold-400 pl-3 text-sm text-temple-ink leading-relaxed italic">
              {notes.find((n) => n.pinned)?.body}
              <footer className="mt-2 text-xs text-temple-muted not-italic">
                — {getProfile(notes.find((n) => n.pinned)!.authorId).name} ·{" "}
                {relativeTime(notes.find((n) => n.pinned)!.createdAt)}
              </footer>
            </blockquote>
          ) : (
            <p className="text-sm text-temple-muted">
              No pinned note yet. Visit the Notes tab to highlight guidance.
            </p>
          )}
        </div>

        <div className="ps-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <LotusIcon className="w-4 h-4" />
            <h3 className="font-display text-base text-temple-ink">
              Collaboration
            </h3>
          </div>
          {partner ? (
            <div className="flex items-center gap-3">
              <Avatar
                initials={getProfile(partner.profileId).avatarInitials}
                size="lg"
              />
              <div>
                <p className="font-medium text-temple-ink">
                  {getProfile(partner.profileId).name}
                </p>
                <p className="text-xs text-temple-muted capitalize">
                  {partner.role}
                  {partner.invitation !== "accepted"
                    ? " · " + partner.invitation
                    : ""}
                </p>
                {getProfile(partner.profileId).phone && (
                  <a
                    href={`tel:${getProfile(partner.profileId).phone}`}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-saffron-700"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-temple-muted">Solo participant.</p>
          )}
        </div>
      </section>

      {/* Module grid */}
      <section>
        <FloralDivider className="mb-5" />
        <h2 className="font-display text-lg text-temple-ink mb-3">
          Workspace modules
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {moduleCards.map((m, i) => (
            <Link
              key={m.to}
              to={m.to}
              className="ps-card ps-card-hover p-4 group animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron-50 to-gold-100 text-saffron-700 flex items-center justify-center">
                  <m.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-temple-muted/60 group-hover:text-saffron-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="mt-3 font-display text-sm text-temple-ink">
                {m.label}
              </h3>
              <p className="text-xs text-temple-muted">{m.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-temple-ink">
            Recent activity
          </h2>
          <Link
            to="timeline"
            className="text-xs font-semibold text-saffron-700 hover:text-saffron-800 inline-flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <ol className="ps-card p-4 space-y-3">
          {timeline.map((t) => (
            <li key={t.id} className="flex gap-3">
              <span className="mt-1.5 w-2 h-2 rounded-full bg-saffron-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-temple-ink">{t.message}</p>
                <p className="text-[11px] text-temple-muted">
                  {relativeTime(t.createdAt)} · {getProfile(t.actorId).name}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
