import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronRight,
  LogOut,
  Phone,
  Settings,
  Shield,
  Sparkles,
  UserCog,
} from "lucide-react";
import { useStore } from "../lib/store";
import { currentUser } from "../lib/profiles";
import { Avatar, Badge } from "../components/ui";
import { FloralDivider, MandalaIcon } from "../components/SpiritualArt";

export function ProfilePage() {
  const { poojas, unreadCount } = useStore();
  const active = poojas.filter(
    (p) => p.status !== "Completed" && p.status !== "Cancelled",
  ).length;
  const completed = poojas.filter((p) => p.status === "Completed").length;

  const settings = [
    {
      icon: Bell,
      label: "Notifications",
      desc: `${unreadCount} unread`,
      action: "Manage",
    },
    {
      icon: UserCog,
      label: "Profile & language",
      desc: "Name, photo, multilingual (coming)",
      action: "Edit",
    },
    {
      icon: Shield,
      label: "Privacy & security",
      desc: "RLS-protected, Supabase-backed",
      action: "View",
    },
    {
      icon: Sparkles,
      label: "PWA & offline",
      desc: "Installed for offline use",
      action: "Install",
    },
    {
      icon: Settings,
      label: "App preferences",
      desc: "Theme, notifications",
      action: "Open",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 animate-fade-in">
      <header className="ps-card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 opacity-10">
          <MandalaIcon className="w-56 h-56" spin />
        </div>
        <div className="relative flex items-center gap-4">
          <Avatar
            initials={currentUser.avatarInitials}
            size="lg"
            className="w-20 h-20 text-2xl"
          />
          <div>
            <h1 className="font-display text-2xl text-maroon-900">
              {currentUser.name}
            </h1>
            <p className="text-sm text-temple-muted capitalize">
              {currentUser.tradition} · {currentUser.role}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge tone="saffron">{active} active</Badge>
              <Badge tone="neutral">{completed} completed</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Poojas", value: poojas.length },
          { label: "Active", value: active },
          { label: "Unread", value: unreadCount },
        ].map((s) => (
          <div key={s.label} className="ps-card p-4 text-center">
            <p className="font-display text-2xl text-saffron-600">{s.value}</p>
            <p className="text-xs text-temple-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <FloralDivider className="my-6" />

      <section>
        <h2 className="font-display text-base text-temple-ink mb-3">
          Settings
        </h2>
        <ul className="ps-card divide-y divide-temple-border/40 overflow-hidden">
          {settings.map((s) => (
            <li key={s.label}>
              <button className="w-full p-4 flex items-center gap-3 hover:bg-beige-50 transition-colors text-left">
                <span className="w-9 h-9 rounded-xl bg-saffron-50 text-saffron-700 flex items-center justify-center shrink-0">
                  <s.icon className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-temple-ink">
                    {s.label}
                  </p>
                  <p className="text-xs text-temple-muted">{s.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-temple-muted" />
              </button>
            </li>
          ))}
        </ul>
        {currentUser.phone && (
          <a
            href={`tel:${currentUser.phone}`}
            className="mt-3 ps-card p-4 flex items-center gap-3 hover:bg-beige-50"
          >
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-temple-ink">
                {currentUser.phone}
              </p>
              <p className="text-xs text-temple-muted">Saved contact number</p>
            </div>
            <Badge tone="success">
              <Check className="w-3 h-3" /> Verified
            </Badge>
          </a>
        )}
      </section>

      <div className="mt-6 flex flex-col items-center gap-2">
        <Link to="/" className="ps-btn-ghost text-sm">
          <LogOut className="w-4 h-4" /> Switch role (demo)
        </Link>
        <p className="text-[11px] text-temple-muted">
          PoojaSathi · Part 1 · Built with Supabase-ready architecture
        </p>
      </div>
    </div>
  );
}
