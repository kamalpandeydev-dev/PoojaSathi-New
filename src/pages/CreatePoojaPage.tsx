import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  MapPin,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useStore, uid } from "../lib/store";
import { currentUser } from "../lib/profiles";
import { inviteCode } from "../lib/format";
import {
  poojaCovers,
  FloralDivider,
  CoverIllustration,
} from "../components/SpiritualArt";
import { pushToast } from "../components/ui";
import type { Pooja, PoojaCover, Role } from "../lib/types";

const poojaTypes = [
  "Griha Pravesh",
  "Satyanarayan Katha",
  "Vivah Sanskar",
  "Namkaran",
  "Lakshmi Puja",
  "Navchandi Yagya",
  "Mundan Sanskar",
  "Office Opening",
  "Vastu Shanti",
  "Ganesh Puja",
  "Other",
];

export function CreatePoojaPage() {
  const navigate = useNavigate();
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    type: "Griha Pravesh",
    occasion: "",
    date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    time: "09:30",
    venue: "",
    city: currentUser.city ?? "",
    budget: 15000,
    cover: "kalash" as PoojaCover,
    inviteName: "",
    invitePhone: "",
    inviteRole: "Pandit" as Role,
    notes: "",
  });

  const steps = ["Pooja details", "Invite participant", "Confirm"];

  function next() {
    setStep((s) => Math.min(2, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function submit() {
    if (!form.name || !form.venue) {
      pushToast("Please fill pooja name and venue", "error");
      return;
    }
    const pooja: Pooja = {
      id: uid("pooja"),
      name: form.name,
      type: form.type,
      occasion: form.occasion || undefined,
      date: form.date,
      time: form.time,
      venue: form.venue,
      city: form.city,
      status: "Planning",
      createdById: currentUser.id,
      participants: [
        {
          profileId: currentUser.id,
          role: currentUser.role,
          invitation: "accepted",
        },
        ...(form.inviteName
          ? [
              {
                profileId: `inv-${uid("u")}`,
                role: form.inviteRole,
                invitation: "pending" as const,
              },
            ]
          : []),
      ],
      inviteCode: inviteCode(),
      notes: form.notes || undefined,
      budget: form.budget,
      coverIllustration: form.cover,
    };
    dispatch({ type: "CREATE_POOJA", pooja });
    pushToast("Pooja created. Workspace ready.");
    navigate(`/pooja/${pooja.id}`);
  }

  const canNext = step === 0 ? !!form.name && !!form.venue : true;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 animate-fade-in">
      <Link
        to="/poojas"
        className="inline-flex items-center gap-1 text-sm text-temple-muted hover:text-temple-ink mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to poojas
      </Link>

      <h1 className="font-display text-2xl text-maroon-900">Create a Pooja</h1>
      <p className="text-sm text-temple-muted mt-1">
        Anyone can start — you as Yajmaan, or a Pandit inviting you.
      </p>

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-2">
        {steps.map((label, i) => (
          <li key={label} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-saffron-500" : "bg-beige-200"}`}
            />
            <p
              className={`mt-1.5 text-[11px] font-medium ${i === step ? "text-saffron-700" : "text-temple-muted"}`}
            >
              {label}
            </p>
          </li>
        ))}
      </ol>

      <FloralDivider className="my-6" />

      <div className="ps-card p-6 animate-scale-in">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="ps-label" htmlFor="name">
                Pooja name
              </label>
              <input
                id="name"
                className="ps-input"
                placeholder="e.g. Griha Pravesh — Bandra Flat"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="ps-label">Type</label>
                <select
                  className="ps-input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {poojaTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ps-label" htmlFor="occasion">
                  Occasion{" "}
                  <span className="text-temple-muted/70">(optional)</span>
                </label>
                <input
                  id="occasion"
                  className="ps-input"
                  placeholder="Anniversary, Housewarming"
                  value={form.occasion}
                  onChange={(e) =>
                    setForm({ ...form, occasion: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="ps-label" htmlFor="date">
                  Date
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-muted" />
                  <input
                    id="date"
                    type="date"
                    className="ps-input pl-9"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="ps-label" htmlFor="time">
                  Time
                </label>
                <input
                  id="time"
                  type="time"
                  className="ps-input"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="ps-label" htmlFor="venue">
                  Venue
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-muted" />
                  <input
                    id="venue"
                    className="ps-input pl-9"
                    placeholder="Full address"
                    value={form.venue}
                    onChange={(e) =>
                      setForm({ ...form, venue: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="ps-label" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  className="ps-input"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="ps-label">Cover motif</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {poojaCovers.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm({ ...form, cover: c.value })}
                    className={`relative p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      form.cover === c.value
                        ? "border-saffron-400 bg-saffron-50"
                        : "border-temple-border hover:border-saffron-300"
                    }`}
                    aria-pressed={form.cover === c.value}
                    aria-label={c.label}
                  >
                    <span className="text-saffron-700">
                      <CoverIllustrationInline cover={c.value} />
                    </span>
                    <span className="text-[10px] text-temple-muted">
                      {c.label}
                    </span>
                    {form.cover === c.value && (
                      <Check className="absolute -top-1 -right-1 w-4 h-4 text-saffron-600 bg-white rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-saffron-50 border border-saffron-200">
              <UserPlus className="w-5 h-5 text-saffron-700 shrink-0 mt-0.5" />
              <p className="text-sm text-saffron-900">
                Invite a partner to this pooja. They will be notified and can
                accept to join the shared workspace. You can also skip this step
                and invite later via code or QR.
              </p>
            </div>
            <div>
              <label className="ps-label">Invite as</label>
              <div className="grid grid-cols-2 gap-2">
                {(["Pandit", "Yajmaan"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, inviteRole: r })}
                    className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${form.inviteRole === r ? "border-saffron-400 bg-saffron-50 text-saffron-800" : "border-temple-border text-temple-muted hover:border-saffron-300"}`}
                    aria-pressed={form.inviteRole === r}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="ps-label" htmlFor="iname">
                Name
              </label>
              <input
                id="iname"
                className="ps-input"
                placeholder={
                  form.inviteRole === "Pandit"
                    ? "Pandit Vijay Shastri"
                    : "Anita Deshpande"
                }
                value={form.inviteName}
                onChange={(e) =>
                  setForm({ ...form, inviteName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="ps-label" htmlFor="iphone">
                WhatsApp / Phone
              </label>
              <input
                id="iphone"
                className="ps-input"
                placeholder="+91 90000 00000"
                value={form.invitePhone}
                onChange={(e) =>
                  setForm({ ...form, invitePhone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="ps-label" htmlFor="pnotes">
                Notes for the workspace
              </label>
              <textarea
                id="pnotes"
                className="ps-input min-h-[80px] resize-y"
                placeholder="Anything the participant should know — vastu direction, diet, timings..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-display text-lg text-temple-ink">
              Review & confirm
            </h3>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Review label="Pooja name" value={form.name || "—"} />
              <Review label="Type" value={form.type} />
              <Review
                label="Date & time"
                value={`${form.date} · ${form.time}`}
              />
              <Review
                label="Venue"
                value={`${form.venue || "—"}, ${form.city}`}
              />
              <Review
                label="Budget"
                value={`₹ ${form.budget.toLocaleString("en-IN")}`}
              />
              <Review
                label="Cover"
                value={
                  poojaCovers.find((c) => c.value === form.cover)?.label ?? "—"
                }
              />
              <Review
                label="Invitee"
                value={
                  form.inviteName
                    ? `${form.inviteName} (${form.inviteRole})`
                    : "Will invite later"
                }
              />
            </dl>
            <p className="text-xs text-temple-muted">
              A unique invitation code will be generated. Both participants
              share one workspace.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={back}
          disabled={step === 0}
          className="ps-btn-ghost disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {step < 2 ? (
          <button onClick={next} disabled={!canNext} className="ps-btn-primary">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={submit} className="ps-btn-primary">
            <Sparkles className="w-4 h-4" /> Create pooja
          </button>
        )}
      </div>
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-temple-muted">
        {label}
      </dt>
      <dd className="text-temple-ink font-medium">{value}</dd>
    </div>
  );
}

function CoverIllustrationInline({ cover }: { cover: PoojaCover }) {
  return <CoverIllustration cover={cover} className="w-6 h-6" />;
}
