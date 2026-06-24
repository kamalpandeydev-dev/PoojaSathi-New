import { Link } from "react-router-dom";
import { CalendarClock, CheckCircle2, ClipboardList, Flag } from "lucide-react";
import { useStore } from "../lib/store";
import { currentUser } from "../lib/profiles";
import { daysUntil, formatIndianDate } from "../lib/format";
import { Badge, EmptyState, ProgressRing } from "../components/ui";

export function ChecklistPage() {
  const { poojas, responsibilitiesForPooja, samagriForPooja } = useStore();
  const activePoojas = poojas.filter(
    (p) => p.status !== "Completed" && p.status !== "Cancelled",
  );

  const myTasks = activePoojas.flatMap((p) =>
    responsibilitiesForPooja(p.id)
      .filter(
        (t) =>
          (t.owner === currentUser.role || t.owner === "Shared") && !t.done,
      )
      .map((t) => ({ ...t, pooja: p })),
  );

  const upcomingItems = activePoojas
    .flatMap((p) =>
      samagriForPooja(p.id)
        .filter((s) => s.status === "Not Started" || s.status === "Searching")
        .slice(0, 3)
        .map((s) => ({ ...s, pooja: p })),
    )
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 animate-fade-in">
      <header className="mb-6">
        <Badge tone="saffron">
          <ClipboardList className="w-3 h-3" /> My tasks
        </Badge>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl text-maroon-900">
          Everything on your plate
        </h1>
        <p className="text-sm text-temple-muted mt-1">
          Open responsibilities and pending samagri across all your active
          poojas.
        </p>
      </header>

      {activePoojas.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-10 h-10 text-saffron-400" />}
          title="No active poojas"
          body="When you start a pooja, your tasks and pending items will appear here."
          action={
            <Link to="/poojas/new" className="ps-btn-primary">
              Start a pooja
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-base text-temple-ink mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4 text-saffron-600" /> Open
              responsibilities
            </h2>
            {myTasks.length === 0 ? (
              <div className="ps-card p-6 text-center text-sm text-temple-muted">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />{" "}
                All caught up. No pending responsibilities.
              </div>
            ) : (
              <ul className="space-y-2">
                {myTasks.map((t) => {
                  const due = t.dueBy ? daysUntil(t.dueBy) : null;
                  return (
                    <li key={t.id}>
                      <Link
                        to={`/pooja/${t.pooja.id}/responsibilities`}
                        className="ps-card ps-card-hover p-4 flex items-start gap-3"
                      >
                        <span className="mt-0.5 w-2 h-2 rounded-full bg-saffron-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-temple-ink">
                            {t.title}
                          </p>
                          <p className="text-xs text-temple-muted">
                            {t.pooja.name}
                          </p>
                        </div>
                        {due !== null && (
                          <Badge
                            tone={
                              due < 0
                                ? "error"
                                : due <= 2
                                  ? "warning"
                                  : "neutral"
                            }
                          >
                            {due < 0
                              ? `${Math.abs(due)}d overdue`
                              : `${due}d left`}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-display text-base text-temple-ink mb-3 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-saffron-600" /> Pooja
              progress
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {activePoojas.map((p) => {
                const samagri = samagriForPooja(p.id);
                const done = samagri.filter(
                  (s) => s.status === "Arranged" || s.status === "Purchased",
                ).length;
                const pct = samagri.length
                  ? Math.round((done / samagri.length) * 100)
                  : 0;
                const days = daysUntil(p.date);
                return (
                  <Link
                    key={p.id}
                    to={`/pooja/${p.id}`}
                    className="ps-card ps-card-hover p-4 flex items-center gap-3"
                  >
                    <ProgressRing value={pct} size={48} stroke={5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-temple-ink line-clamp-1">
                        {p.name}
                      </p>
                      <p className="text-xs text-temple-muted">
                        {formatIndianDate(p.date)} ·{" "}
                        {days >= 0
                          ? `${days}d left`
                          : `${Math.abs(days)}d past`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {upcomingItems.length > 0 && (
            <section>
              <h2 className="font-display text-base text-temple-ink mb-3">
                Samagri needs attention
              </h2>
              <ul className="space-y-2">
                {upcomingItems.map((s) => (
                  <li key={s.id}>
                    <Link
                      to={`/pooja/${s.pooja.id}/checklist`}
                      className="ps-card ps-card-hover p-3 flex items-center gap-3"
                    >
                      <span className="w-2 h-2 rounded-full bg-gold-500" />
                      <p className="flex-1 text-sm text-temple-ink line-clamp-1">
                        {s.englishName}
                      </p>
                      <span className="text-xs text-temple-muted">
                        {s.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
