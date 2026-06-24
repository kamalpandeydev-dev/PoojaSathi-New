import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  PartyPopper,
  Sparkles,
  Star,
  Archive,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { formatIndianDate, daysUntil } from "../../lib/format";
import { Badge, ProgressRing, pushToast } from "../../components/ui";
import { FloralDivider, LotusIcon } from "../../components/SpiritualArt";
import type { PoojaStatus } from "../../lib/types";

export function CompletionModule() {
  const { poojaId } = useParams();
  const {
    getPooja,
    samagriForPooja,
    requestsForPooja,
    responsibilitiesForPooja,
    dispatch,
  } = useStore();
  const pooja = poojaId ? getPooja(poojaId) : undefined;
  if (!pooja) return null;

  const samagri = samagriForPooja(pooja.id);
  const samagriReady = samagri.filter(
    (s) => s.status === "Arranged" || s.status === "Purchased",
  ).length;
  const samagriProgress = samagri.length
    ? Math.round((samagriReady / samagri.length) * 100)
    : 0;
  const tasks = responsibilitiesForPooja(pooja.id);
  const tasksDone = tasks.filter((t) => t.done).length;
  const pendingReqs = requestsForPooja(pooja.id).filter(
    (r) => r.status === "Pending",
  ).length;
  const isCompleted = pooja.status === "Completed";
  const days = daysUntil(pooja.date);

  const canComplete = samagriProgress >= 80 && pendingReqs === 0 && days <= 0;

  function complete() {
    if (!canComplete) {
      pushToast("Pooja is not yet ready to complete", "error");
      return;
    }
    dispatch({
      type: "SET_POOJA_STATUS",
      poojaId: pooja!.id,
      status: "Completed" as PoojaStatus,
    });
    pushToast("Pooja marked complete. Blessings.");
  }

  function reopen() {
    dispatch({
      type: "SET_POOJA_STATUS",
      poojaId: pooja!.id,
      status: "In Preparation" as PoojaStatus,
    });
    pushToast("Pooja reopened", "info");
  }

  const checks = [
    {
      label: "Samagri prepared",
      value: `${samagriReady}/${samagri.length}`,
      pct: samagriProgress,
      ok: samagriProgress >= 80,
    },
    {
      label: "Tasks completed",
      value: `${tasksDone}/${tasks.length}`,
      pct: tasks.length ? Math.round((tasksDone / tasks.length) * 100) : 100,
      ok: tasksDone === tasks.length,
    },
    {
      label: "No pending requests",
      value: pendingReqs === 0 ? "Clean" : `${pendingReqs} pending`,
      pct: pendingReqs === 0 ? 100 : 50,
      ok: pendingReqs === 0,
    },
    {
      label: "Pooja date reached",
      value: days <= 0 ? "Today or past" : `${days}d ahead`,
      pct: days <= 0 ? 100 : 30,
      ok: days <= 0,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <Badge tone="saffron">Completion</Badge>
        <h1 className="mt-2 font-display text-2xl text-maroon-900">
          Seal the pooja
        </h1>
        <p className="text-sm text-temple-muted">
          When all is ready, mark the pooja complete. The samagri sheet can
          become a reusable template.
        </p>
      </header>

      {isCompleted ? (
        <div className="relative overflow-hidden ps-card p-8 text-center bg-gradient-to-br from-emerald-50 to-saffron-50 border-emerald-200">
          <div className="absolute -top-12 -right-12 opacity-10">
            <LotusIcon className="w-48 h-48" />
          </div>
          <div className="relative">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-lotus-bloom">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="mt-4 font-display text-2xl text-maroon-900">
              पूर्ण हुआ
            </h2>
            <p className="mt-1 text-sm text-temple-muted">
              This pooja was completed on {formatIndianDate(pooja.date)}.
            </p>
            <FloralDivider className="my-5" />
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() =>
                  pushToast("Samagri template saved (demo)", "success")
                }
                className="ps-btn-ghost"
              >
                <Archive className="w-4 h-4" /> Save as template
              </button>
              <button
                onClick={() =>
                  pushToast("Ratings module in next release", "info")
                }
                className="ps-btn-ghost"
              >
                <Star className="w-4 h-4" /> Rate experience
              </button>
              <button onClick={reopen} className="ps-btn-ghost text-maroon-700">
                Reopen
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="ps-card p-5">
            <h2 className="font-display text-base text-temple-ink mb-4">
              Readiness checklist
            </h2>
            <ul className="space-y-3">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-3">
                  <ProgressRing value={c.pct} size={40} stroke={4} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-temple-ink">
                      {c.label}
                    </p>
                    <p className="text-xs text-temple-muted">{c.value}</p>
                  </div>
                  {c.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-beige-200" />
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="ps-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base text-temple-ink">
                  Mark pooja complete
                </h3>
                <p className="text-xs text-temple-muted mt-0.5">
                  {canComplete
                    ? "All set — you may proceed."
                    : "Meet readiness criteria above to complete."}
                </p>
              </div>
              <button
                onClick={complete}
                disabled={!canComplete}
                className="ps-btn-primary disabled:opacity-50"
              >
                <PartyPopper className="w-4 h-4" /> Complete pooja
              </button>
            </div>
          </div>

          <div className="ps-card p-5 bg-saffron-50 border-saffron-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-saffron-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-saffron-900">
                  Future modules
                </p>
                <p className="text-xs text-saffron-800 mt-0.5">
                  After completion, this pooja can seed a reusable samagri
                  template, archive to history, link payments and collect
                  ratings — all part of upcoming releases.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
