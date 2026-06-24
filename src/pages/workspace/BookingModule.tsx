import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  CalendarClock,
  Check,
  Copy,
  MapPin,
  Pencil,
  Phone,
  QrCode,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { currentUser, getProfile } from "../../lib/profiles";
import {
  formatIndianDate,
  formatTime,
  formatCurrency,
  daysUntil,
} from "../../lib/format";
import { Avatar, Badge, Modal, pushToast } from "../../components/ui";
import { FloralDivider } from "../../components/SpiritualArt";
import type { Pooja } from "../../lib/types";

export function BookingModule() {
  const { poojaId } = useParams();
  const { getPooja, dispatch } = useStore();
  const pooja = poojaId ? getPooja(poojaId) : undefined;
  const [editing, setEditing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [form, setForm] = useState<Pooja | undefined>(pooja);

  if (!pooja || !form) return null;

  function save() {
    dispatch({ type: "UPDATE_POOJA", pooja: form! });
    setEditing(false);
    pushToast("Booking updated");
  }

  function copyInvite() {
    const link = `${window.location.origin}/invite/${pooja!.inviteCode}`;
    navigator.clipboard?.writeText(link).then(
      () => pushToast("Invitation link copied"),
      () => pushToast("Could not copy — please copy manually", "error"),
    );
  }

  const partner = pooja.participants.find(
    (p) => p.profileId !== currentUser.id,
  );
  const days = daysUntil(pooja.date);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-end justify-between gap-3">
        <div>
          <Badge tone="saffron">Booking</Badge>
          <h1 className="mt-2 font-display text-2xl text-maroon-900">
            {pooja.name}
          </h1>
          <p className="text-sm text-temple-muted">
            Manage schedule, venue and access for this pooja.
          </p>
        </div>
        <button
          onClick={() => {
            setForm(pooja);
            setEditing(true);
          }}
          className="ps-btn-ghost"
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
      </header>

      {/* Schedule + venue */}
      <section className="grid lg:grid-cols-3 gap-4">
        <div className="ps-card p-5 lg:col-span-2">
          <h2 className="font-display text-base text-temple-ink mb-4">
            Schedule
          </h2>
          <dl className="grid sm:grid-cols-2 gap-4">
            <Detail
              icon={CalendarClock}
              label="Date"
              value={formatIndianDate(pooja.date)}
            />
            <Detail label="Time" value={formatTime(pooja.time)} />
            <Detail icon={MapPin} label="Venue" value={pooja.venue} />
            <Detail label="City" value={pooja.city} />
            <Detail label="Budget" value={formatCurrency(pooja.budget ?? 0)} />
            <Detail label="Pooja type" value={pooja.type} />
          </dl>
          {pooja.notes && (
            <>
              <FloralDivider className="my-4" />
              <p className="text-xs text-temple-muted uppercase tracking-wider mb-1">
                Notes
              </p>
              <p className="text-sm text-temple-ink leading-relaxed">
                {pooja.notes}
              </p>
            </>
          )}
        </div>

        <div className="ps-card p-5">
          <h2 className="font-display text-base text-temple-ink mb-3">
            Countdown
          </h2>
          <div className="text-center py-2">
            <p className="font-display text-5xl text-saffron-600">
              {Math.abs(days)}
            </p>
            <p className="text-xs text-temple-muted mt-1">
              {days >= 0 ? "days remaining" : "days since pooja"}
            </p>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-saffron-50 to-gold-50 border border-saffron-200">
            <p className="text-xs text-saffron-800 font-medium">Invite code</p>
            <p className="font-mono text-lg text-maroon-900 mt-0.5">
              {pooja.inviteCode}
            </p>
          </div>
          <button
            onClick={() => setShareOpen(true)}
            className="mt-3 ps-btn-ghost w-full"
          >
            <QrCode className="w-4 h-4" /> Share invitation
          </button>
        </div>
      </section>

      {/* Participants */}
      <section className="ps-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base text-temple-ink">
            Participants
          </h2>
          <button
            onClick={() =>
              pushToast(
                "Multi-participant invitations coming with backend sync",
                "info",
              )
            }
            className="ps-btn-ghost text-xs"
          >
            <UserPlus className="w-3.5 h-3.5" /> Invite
          </button>
        </div>
        <ul className="space-y-2">
          {pooja.participants.map((p) => {
            const prof = getProfile(p.profileId);
            return (
              <li
                key={p.profileId}
                className="flex items-center gap-3 p-3 rounded-xl bg-beige-50/60"
              >
                <Avatar initials={prof.avatarInitials} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-temple-ink">
                    {prof.name}
                  </p>
                  <p className="text-xs text-temple-muted capitalize">
                    {p.role}
                    {prof.city ? ` · ${prof.city}` : ""}
                  </p>
                </div>
                <Badge tone={p.invitation === "accepted" ? "success" : "gold"}>
                  {p.invitation === "accepted" ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Clock />
                  )}
                  {p.invitation}
                </Badge>
                {prof.phone && (
                  <a
                    href={`tel:${prof.phone}`}
                    className="p-2 rounded-lg text-temple-muted hover:bg-white hover:text-saffron-700"
                    aria-label={`Call ${prof.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Edit modal */}
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit booking"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="ps-label">Pooja name</label>
            <input
              className="ps-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="ps-label">Date</label>
              <input
                type="date"
                className="ps-input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="ps-label">Time</label>
              <input
                type="time"
                className="ps-input"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="ps-label">Venue</label>
            <input
              className="ps-input"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="ps-label">City</label>
              <input
                className="ps-input"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <label className="ps-label">Budget (₹)</label>
              <input
                type="number"
                className="ps-input"
                value={form.budget ?? 0}
                onChange={(e) =>
                  setForm({ ...form, budget: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div>
            <label className="ps-label">Notes</label>
            <textarea
              className="ps-input min-h-[70px] resize-y"
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setEditing(false)} className="ps-btn-ghost">
              Cancel
            </button>
            <button onClick={save} className="ps-btn-primary">
              <Sparkles className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Share / QR modal */}
      <Modal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share invitation"
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <QRPlaceholder code={pooja.inviteCode} />
          <p className="mt-4 text-sm text-temple-muted">
            Scan to join the pooja workspace, or share the invitation link
            below.
          </p>
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-beige-50 border border-temple-border">
            <code className="flex-1 text-xs text-temple-ink truncate text-left">
              {window.location.origin}/invite/{pooja.inviteCode}
            </code>
            <button
              onClick={copyInvite}
              className="ps-btn-ghost px-2 py-1.5 text-xs"
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
          {partner && partner.invitation !== "accepted" && (
            <div className="mt-4 p-3 rounded-xl bg-gold-50 border border-gold-200">
              <p className="text-xs text-gold-800">
                Waiting for{" "}
                <span className="font-semibold">
                  {getProfile(partner.profileId).name}
                </span>{" "}
                to accept.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-temple-muted flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </dt>
      <dd className="text-temple-ink font-medium mt-0.5">{value}</dd>
    </div>
  );
}

function Clock() {
  return (
    <span
      className="w-2 h-2 rounded-full bg-gold-500 animate-pulse-soft"
      aria-hidden
    />
  );
}

// Inline QR placeholder — visual matrix generated from code, no external dep.
function QRPlaceholder({ code }: { code: string }) {
  const size = 9;
  const cells: boolean[] = [];
  let seed = 0;
  for (let i = 0; i < code.length; i++)
    seed = (seed * 31 + code.charCodeAt(i)) >>> 0;
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    cells.push((seed & 1) === 1);
  }
  // corner finder patterns
  const isFinder = (r: number, c: number) => {
    const inC = (sr: number, sc: number) =>
      r >= sr && r < sr + 3 && c >= sc && c < sc + 3;
    return inC(0, 0) || inC(0, size - 3) || inC(size - 3, 0);
  };
  return (
    <div
      className="inline-block p-3 bg-white rounded-2xl border border-temple-border shadow-soft"
      aria-label="QR code placeholder"
    >
      <svg width="148" height="148" viewBox={`0 0 ${size} ${size}`} role="img">
        {Array.from({ length: size }).map((_, r) =>
          Array.from({ length: size }).map((_, c) => {
            const finder = isFinder(r, c);
            const filled = finder || cells[r * size + c];
            return (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={0.95}
                height={0.95}
                fill={filled ? "#7f3010" : "transparent"}
                rx={0.15}
              />
            );
          }),
        )}
      </svg>
    </div>
  );
}
