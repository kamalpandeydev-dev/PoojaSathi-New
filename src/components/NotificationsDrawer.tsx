import { Link } from "react-router-dom";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { useStore } from "../lib/store";
import { relativeTime } from "../lib/format";
import { Modal } from "./ui";

const kindMeta: Record<string, { label: string; tone: string }> = {
  invitation: { label: "Invitation", tone: "bg-saffron-100 text-saffron-800" },
  request: { label: "Request", tone: "bg-maroon-100 text-maroon-800" },
  status: { label: "Update", tone: "bg-gold-100 text-gold-800" },
  note: { label: "Note", tone: "bg-emerald-100 text-emerald-800" },
  responsibility: { label: "Task", tone: "bg-beige-100 text-beige-800" },
  system: { label: "System", tone: "bg-beige-100 text-beige-800" },
};

export function NotificationsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { notifications, dispatch, unreadCount, getPooja } = useStore();
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Notifications"
      maxWidth="max-w-md"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-temple-muted">
          {unreadCount > 0 ? `${unreadCount} unread` : "You are all caught up"}
        </p>
        {unreadCount > 0 && (
          <button
            onClick={() => dispatch({ type: "MARK_ALL_READ" })}
            className="text-xs font-semibold text-saffron-700 hover:text-saffron-800 inline-flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="py-10 text-center text-temple-muted">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No notifications yet
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((n) => {
            const pooja = getPooja(n.poojaId);
            const meta = kindMeta[n.kind] ?? kindMeta.system;
            return (
              <li key={n.id}>
                <Link
                  to={n.link ?? "#"}
                  onClick={() => {
                    if (!n.read)
                      dispatch({
                        type: "MARK_NOTIFICATION_READ",
                        notificationId: n.id,
                      });
                    onClose();
                  }}
                  className={`block p-3 rounded-xl border transition-colors ${
                    n.read
                      ? "bg-white/40 border-temple-border/40"
                      : "bg-saffron-50/70 border-saffron-200 hover:bg-saffron-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`ps-chip ${meta.tone}`}>
                          {meta.label}
                        </span>
                        {!n.read && (
                          <span
                            className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse-soft"
                            aria-label="Unread"
                          />
                        )}
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-temple-ink truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-temple-muted line-clamp-2">
                        {n.body}
                      </p>
                      {pooja && (
                        <p className="mt-1 text-[11px] text-saffron-700 font-medium">
                          · {pooja.name}
                        </p>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-temple-muted whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {relativeTime(n.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
