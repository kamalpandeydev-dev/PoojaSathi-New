import { useParams } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  HandHeart,
  ListChecks,
  MessageSquarePlus,
  Sticker,
  Flag,
  Sparkles,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { getProfile } from "../../lib/profiles";
import { relativeTime } from "../../lib/format";
import { Badge, EmptyState } from "../../components/ui";
import type { TimelineEventType } from "../../lib/types";

const eventMeta: Record<
  TimelineEventType,
  { icon: typeof CalendarClock; tone: string; label: string }
> = {
  pooja_created: {
    icon: CalendarClock,
    tone: "bg-saffron-100 text-saffron-700",
    label: "Created",
  },
  invitation_sent: {
    icon: HandHeart,
    tone: "bg-gold-100 text-gold-700",
    label: "Invitation",
  },
  invitation_accepted: {
    icon: CheckCircle2,
    tone: "bg-emerald-100 text-emerald-700",
    label: "Accepted",
  },
  samagri_added: {
    icon: ListChecks,
    tone: "bg-saffron-100 text-saffron-700",
    label: "Samagri",
  },
  status_updated: {
    icon: Sticker,
    tone: "bg-beige-100 text-beige-700",
    label: "Status",
  },
  request_raised: {
    icon: MessageSquarePlus,
    tone: "bg-maroon-100 text-maroon-700",
    label: "Request",
  },
  request_resolved: {
    icon: CheckCircle2,
    tone: "bg-emerald-100 text-emerald-700",
    label: "Resolved",
  },
  note_added: {
    icon: MessageSquarePlus,
    tone: "bg-gold-100 text-gold-700",
    label: "Note",
  },
  responsibility_done: {
    icon: Flag,
    tone: "bg-emerald-100 text-emerald-700",
    label: "Done",
  },
  pooja_completed: {
    icon: CheckCircle2,
    tone: "bg-emerald-100 text-emerald-700",
    label: "Completed",
  },
  samagri_published: {
    icon: Sparkles,
    tone: "bg-saffron-100 text-saffron-700",
    label: "Published",
  },
};

export function TimelineModule() {
  const { poojaId } = useParams();
  const { getPooja, timelineForPooja } = useStore();
  const pooja = poojaId ? getPooja(poojaId) : undefined;
  if (!pooja) return null;
  const events = timelineForPooja(pooja.id);

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <Badge tone="saffron">Timeline</Badge>
        <h1 className="mt-2 font-display text-2xl text-maroon-900">
          Activity feed
        </h1>
        <p className="text-sm text-temple-muted">
          Everything that happened on this pooja, in order.
        </p>
      </header>

      {events.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="w-10 h-10 text-saffron-400" />}
          title="No activity yet"
          body="As you and your partner work together, events will appear here."
        />
      ) : (
        <ol className="relative pl-8">
          <span
            className="absolute left-3 top-1 bottom-1 w-px bg-gradient-to-b from-saffron-300 via-temple-border to-transparent"
            aria-hidden
          />
          {events.map((e) => {
            const meta = eventMeta[e.type];
            const Icon = meta.icon;
            const actor = getProfile(e.actorId);
            return (
              <li key={e.id} className="relative pb-5 animate-slide-right">
                <span
                  className={`absolute -left-[1.85rem] w-7 h-7 rounded-full flex items-center justify-center ring-4 ring-temple-bg ${meta.tone}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <div className="ps-card p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`ps-chip ${meta.tone}`}>{meta.label}</span>
                    <span className="text-[11px] text-temple-muted">
                      {relativeTime(e.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-temple-ink">{e.message}</p>
                  {actor && (
                    <p className="mt-0.5 text-[11px] text-temple-muted">
                      by {actor.name}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
