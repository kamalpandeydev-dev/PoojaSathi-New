import { useState } from "react";
import { useParams } from "react-router-dom";
import { Check, Flag, Plus } from "lucide-react";
import { useStore, uid } from "../../lib/store";
import { currentUser } from "../../lib/profiles";
import { formatIndianDate, daysUntil } from "../../lib/format";
import { Badge, EmptyState, Modal, pushToast } from "../../components/ui";
import type { Responsibility, ResponsibleParty } from "../../lib/types";

function isMine(owner: ResponsibleParty, role: string): boolean {
  return owner === "Shared" || owner === role;
}

export function ResponsibilitiesModule() {
  const { poojaId } = useParams();
  const { getPooja, responsibilitiesForPooja, dispatch } = useStore();
  const pooja = poojaId ? getPooja(poojaId) : undefined;
  const [open, setOpen] = useState(false);

  if (!pooja) return null;
  const tasks = responsibilitiesForPooja(pooja.id);
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <header className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between">
        <div>
          <Badge tone="saffron">Responsibilities</Badge>
          <h1 className="mt-2 font-display text-2xl text-maroon-900">
            Who does what
          </h1>
          <p className="text-sm text-temple-muted">
            Split duties transparently. {doneCount}/{tasks.length} complete.
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="ps-btn-primary">
          <Plus className="w-4 h-4" /> Add responsibility
        </button>
      </header>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<Flag className="w-10 h-10 text-saffron-400" />}
          title="No responsibilities yet"
          body="Define duties like catering, decor, transport — and assign owners."
          action={
            <button onClick={() => setOpen(true)} className="ps-btn-primary">
              <Plus className="w-4 h-4" /> Add first duty
            </button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => {
            const overdue = t.dueBy && !t.done && daysUntil(t.dueBy) < 0;
            const soon =
              t.dueBy &&
              !t.done &&
              daysUntil(t.dueBy) >= 0 &&
              daysUntil(t.dueBy) <= 2;
            return (
              <li
                key={t.id}
                className={`ps-card p-4 flex items-start gap-3 ${t.done ? "opacity-70" : ""}`}
              >
                <button
                  onClick={() => {
                    dispatch({
                      type: "TOGGLE_RESPONSIBILITY",
                      responsibilityId: t.id,
                    });
                    pushToast(t.done ? "Reopened" : "Marked done");
                  }}
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${t.done ? "bg-emerald-500 border-emerald-500" : "border-temple-border hover:border-saffron-400"}`}
                  aria-pressed={t.done}
                  aria-label={
                    t.done
                      ? `Mark "${t.title}" as not done`
                      : `Mark "${t.title}" as done`
                  }
                >
                  {t.done && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-sm font-medium ${t.done ? "line-through text-temple-muted" : "text-temple-ink"}`}
                    >
                      {t.title}
                    </p>
                    <Badge
                      tone={
                        t.owner === "Shared"
                          ? "gold"
                          : isMine(t.owner, currentUser.role)
                            ? "saffron"
                            : "neutral"
                      }
                    >
                      {t.owner}
                    </Badge>
                    {overdue && <Badge tone="error">Overdue</Badge>}
                    {soon && <Badge tone="warning">Due soon</Badge>}
                  </div>
                  {t.detail && (
                    <p className="text-xs text-temple-muted mt-0.5">
                      {t.detail}
                    </p>
                  )}
                  {t.dueBy && (
                    <p className="text-[11px] text-temple-muted mt-1">
                      Due: {formatIndianDate(t.dueBy)}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <NewResponsibilityModal
        open={open}
        onClose={() => setOpen(false)}
        poojaId={pooja.id}
      />
    </div>
  );
}

function NewResponsibilityModal({
  open,
  onClose,
  poojaId,
}: {
  open: boolean;
  onClose: () => void;
  poojaId: string;
}) {
  const { dispatch } = useStore();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [owner, setOwner] = useState<ResponsibleParty>("Shared");
  const [dueBy, setDueBy] = useState("");

  function submit() {
    if (!title) {
      pushToast("Title is required", "error");
      return;
    }
    const r: Responsibility = {
      id: uid("resp"),
      poojaId,
      title,
      detail,
      owner,
      dueBy: dueBy || undefined,
      done: false,
    };
    dispatch({ type: "ADD_RESPONSIBILITY", responsibility: r });
    pushToast("Responsibility added");
    setTitle("");
    setDetail("");
    setDueBy("");
    setOwner("Shared");
    onClose();
  }

  const owners: ResponsibleParty[] = ["Pandit", "Yajmaan", "Shared"];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add responsibility"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div>
          <label className="ps-label">Title</label>
          <input
            className="ps-input"
            placeholder="Book caterer for 50 plates"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="ps-label">Detail</label>
          <textarea
            className="ps-input min-h-[70px] resize-y"
            placeholder="Pure veg, no onion-garlic"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="ps-label">Owner</label>
            <div className="flex gap-1">
              {owners.map((o) => (
                <button
                  key={o}
                  onClick={() => setOwner(o)}
                  className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${owner === o ? "bg-saffron-500 text-white" : "bg-beige-100 text-temple-muted"}`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="ps-label">Due by</label>
            <input
              type="date"
              className="ps-input"
              value={dueBy}
              onChange={(e) => setDueBy(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="ps-btn-ghost">
            Cancel
          </button>
          <button onClick={submit} className="ps-btn-primary">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>
    </Modal>
  );
}
