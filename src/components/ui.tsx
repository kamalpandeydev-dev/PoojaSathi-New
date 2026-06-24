import type { ReactNode } from "react";
import { useLayoutEffect, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

let toastId = 0;
const listeners = new Set<(t: ToastItem) => void>();
export interface ToastItem {
  id: number;
  title: string;
  kind?: "success" | "info" | "error";
}

export function pushToast(title: string, kind: ToastItem["kind"] = "success") {
  const item: ToastItem = { id: ++toastId, title, kind };
  listeners.forEach((l) => l(item));
}

export function Avatar({
  initials,
  size = "md",
  className = "",
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold bg-gradient-to-br from-saffron-400 to-maroon-600 text-white shadow-soft ring-2 ring-white ${sizes[size]} ${className}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?:
    | "neutral"
    | "saffron"
    | "gold"
    | "maroon"
    | "success"
    | "warning"
    | "error";
  children: ReactNode;
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-beige-100 text-beige-800",
    saffron: "bg-saffron-100 text-saffron-800",
    gold: "bg-gold-100 text-gold-800",
    maroon: "bg-maroon-100 text-maroon-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-rose-100 text-rose-800",
  };
  return (
    <span className={`ps-chip ${tones[tone]} ${className}`}>{children}</span>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4 animate-fade-in">
      <div className="mb-4 opacity-70">{icon}</div>
      <h3 className="font-display text-xl text-temple-ink">{title}</h3>
      {body && (
        <p className="mt-1.5 max-w-md text-sm text-temple-muted">{body}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  className = "",
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circ - (pct / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${Math.round(pct)}% complete`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        className="text-beige-200"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        className="text-saffron-500"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
      />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-temple-ink font-bold"
        fontSize={size * 0.26}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  useLayoutEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-maroon-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} ps-card shadow-lift rounded-b-none sm:rounded-2xl animate-slide-up max-h-[90vh] overflow-y-auto ps-scrollbar`}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-white/90 backdrop-blur px-5 py-4 border-b border-temple-border/60">
          <h3 className="font-display text-lg text-temple-ink">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-temple-muted hover:bg-beige-100 hover:text-temple-ink transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

// Toast container — mounted once near the app root.
export function ToastHost() {
  const items = useStateHost();
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center pointer-events-none">
      {items.map((t) => {
        const tone =
          t.kind === "error"
            ? "bg-maroon-700"
            : t.kind === "info"
              ? "bg-beige-800"
              : "bg-emerald-700";
        return (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-2.5 rounded-xl text-white text-sm shadow-lift animate-slide-up ${tone}`}
            role="status"
          >
            {t.title}
          </div>
        );
      })}
    </div>
  );
}

// tiny hook to wire toast pub/sub without pulling a dependency
function useStateHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    const listener = (t: ToastItem) => {
      setItems((cur) => [...cur, t]);
      setTimeout(
        () => setItems((cur) => cur.filter((i) => i.id !== t.id)),
        2600,
      );
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return items;
}
