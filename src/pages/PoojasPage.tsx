import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, Plus, Users } from "lucide-react";
import { useStore } from "../lib/store";
import { currentUser, getProfile } from "../lib/profiles";
import { daysUntil, formatIndianDate, formatTime } from "../lib/format";
import { CoverIllustration, FloralDivider } from "../components/SpiritualArt";
import { Avatar, Badge, EmptyState } from "../components/ui";
import type { PoojaStatus } from "../lib/types";

const statusTone: Record<
  PoojaStatus,
  "saffron" | "gold" | "success" | "neutral" | "maroon"
> = {
  "Invitation Pending": "gold",
  Planning: "saffron",
  "In Preparation": "saffron",
  Ready: "success",
  Completed: "neutral",
  Cancelled: "maroon",
};

export function PoojasPage() {
  const { poojas } = useStore();
  const active = poojas.filter(
    (p) => p.status !== "Completed" && p.status !== "Cancelled",
  );
  const completed = poojas.filter((p) => p.status === "Completed");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 animate-fade-in">
      <header className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-maroon-900">
            My Poojas
          </h1>
          <p className="text-sm text-temple-muted mt-1">
            Welcome, {currentUser.name}. Here is everything you are part of.
          </p>
        </div>
        <Link to="/poojas/new" className="ps-btn-primary shrink-0">
          <Plus className="w-4 h-4" /> New pooja
        </Link>
      </header>

      {active.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-10 h-10 text-saffron-400" />}
          title="No poojas in progress"
          body="Start a new pooja to invite a Pandit and begin preparing. Your shared workspace will appear here."
          action={
            <Link to="/poojas/new" className="ps-btn-primary">
              Start a pooja
            </Link>
          }
        />
      ) : (
        <section>
          <h2 className="font-display text-lg text-temple-ink mb-3">
            In progress
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((p, i) => {
              const days = daysUntil(p.date);
              return (
                <Link
                  key={p.id}
                  to={`/pooja/${p.id}`}
                  className="ps-card ps-card-hover p-5 block animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-saffron-50 to-gold-100 flex items-center justify-center">
                        <CoverIllustration
                          cover={p.coverIllustration}
                          className="w-8 h-8"
                        />
                      </div>
                      <div>
                        <h3 className="font-display text-base text-temple-ink leading-tight line-clamp-2">
                          {p.name}
                        </h3>
                        <p className="text-[11px] text-temple-muted">
                          {p.type}
                        </p>
                      </div>
                    </div>
                    <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                  </div>

                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-temple-muted">
                      <CalendarDays className="w-4 h-4" />
                      <dd>
                        {formatIndianDate(p.date)} · {formatTime(p.time)}
                      </dd>
                    </div>
                    <div className="flex items-center gap-2 text-temple-muted">
                      <MapPin className="w-4 h-4" />
                      <dd className="line-clamp-1">
                        {p.venue}, {p.city}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 pt-3 border-t border-temple-border/50 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {p.participants.map((par) => (
                        <Avatar
                          key={par.profileId}
                          initials={getProfile(par.profileId).avatarInitials}
                          size="sm"
                          className="ring-2 ring-white"
                        />
                      ))}
                      {p.participants.length < 2 && (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-beige-100 text-beige-600 ring-2 ring-white text-[10px] font-semibold">
                          <Users className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    {p.status === "Completed" ? null : (
                      <span className="text-xs font-semibold text-saffron-700">
                        {days >= 0 ? `in ${days}d` : `${Math.abs(days)}d ago`}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="mt-12">
          <FloralDivider className="mb-6" />
          <h2 className="font-display text-lg text-temple-ink mb-3">
            Completed
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map((p) => (
              <Link
                key={p.id}
                to={`/pooja/${p.id}`}
                className="ps-card ps-card-hover p-5 block"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base text-temple-ink line-clamp-1">
                    {p.name}
                  </h3>
                  <Badge tone="neutral">Completed</Badge>
                </div>
                <p className="mt-2 text-xs text-temple-muted">
                  {formatIndianDate(p.date)} · {p.city}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-saffron-700">
                  View details <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
