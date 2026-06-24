import type { ReactNode } from "react";
import type { PoojaCover } from "../lib/types";

// Lightweight inline-SVG illustrations — no external image deps, theme-tinted.

export function DiyaIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 80"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="32" cy="30" rx="16" ry="22" fill="url(#dg)" />
      <path
        d="M32 8 C40 22 44 32 40 44 C38 52 34 54 32 54 C30 54 26 52 24 44 C20 32 24 22 32 8 Z"
        fill="currentColor"
        className="text-gold-400"
      />
      <path
        d="M32 18 C37 26 39 32 36 42 C34 48 33 50 32 50 C31 50 30 48 28 42 C25 32 27 26 32 18 Z"
        fill="currentColor"
        className="text-saffron-500"
      />
      <path
        d="M6 56 Q32 82 58 56 Q50 68 32 70 Q14 68 6 56 Z"
        fill="currentColor"
        className="text-beige-800"
      />
      <path
        d="M10 58 Q32 78 54 58 Q47 66 32 67 Q17 66 10 58 Z"
        fill="currentColor"
        className="text-gold-600"
      />
      <ellipse
        cx="32"
        cy="56"
        rx="26"
        ry="4"
        fill="currentColor"
        className="text-gold-400"
      />
      <defs>
        <radialGradient id="dg" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#f3bd19" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f3bd19" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function LotusIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="60" cy="60" rx="54" ry="54" fill="url(#lh)" />
      <g fill="currentColor" className="text-ivory-100" opacity="0.95">
        <path d="M60 8 C70 28 70 28 60 44 C50 28 50 28 60 8 Z" />
        <g transform="rotate(45 60 60)">
          <path d="M60 8 C70 28 70 28 60 44 C50 28 50 28 60 8 Z" />
        </g>
        <g transform="rotate(90 60 60)">
          <path d="M60 8 C70 28 70 28 60 44 C50 28 50 28 60 8 Z" />
        </g>
        <g transform="rotate(135 60 60)">
          <path d="M60 8 C70 28 70 28 60 44 C50 28 50 28 60 8 Z" />
        </g>
        <g transform="rotate(180 60 60)">
          <path d="M60 8 C70 28 70 28 60 44 C50 28 50 28 60 8 Z" />
        </g>
        <g transform="rotate(225 60 60)">
          <path d="M60 8 C70 28 70 28 60 44 C50 28 50 28 60 8 Z" />
        </g>
        <g transform="rotate(270 60 60)">
          <path d="M60 8 C70 28 70 28 60 44 C50 28 50 28 60 8 Z" />
        </g>
        <g transform="rotate(315 60 60)">
          <path d="M60 8 C70 28 70 28 60 44 C50 28 50 28 60 8 Z" />
        </g>
      </g>
      <circle
        cx="60"
        cy="60"
        r="14"
        fill="currentColor"
        className="text-gold-400"
      />
      <circle
        cx="60"
        cy="60"
        r="6"
        fill="currentColor"
        className="text-saffron-500"
      />
      <defs>
        <radialGradient id="lh" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f3bd19" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ff7d0a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function KalashIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 96"
      fill="none"
      aria-hidden="true"
    >
      {/* coconut */}
      <ellipse
        cx="40"
        cy="14"
        rx="10"
        ry="12"
        fill="currentColor"
        className="text-beige-700"
      />
      <path
        d="M40 4 C46 10 46 18 40 24 C34 18 34 10 40 4 Z"
        fill="currentColor"
        className="text-maroon-700"
      />
      {/* mango leaves */}
      <g fill="currentColor" className="text-emerald-600">
        <path d="M28 22 C18 18 14 10 14 4 C24 8 30 16 28 22 Z" />
        <path d="M52 22 C62 18 66 10 66 4 C56 8 50 16 52 22 Z" />
        <path d="M22 26 C12 28 4 24 0 16 C10 14 20 18 22 26 Z" />
        <path d="M58 26 C68 28 76 24 80 16 C70 14 60 18 58 26 Z" />
      </g>
      {/* pot */}
      <ellipse
        cx="40"
        cy="30"
        rx="14"
        ry="3"
        fill="currentColor"
        className="text-gold-500"
      />
      <path
        d="M22 30 C12 44 12 64 22 78 C28 88 52 88 58 78 C68 64 68 44 58 30 Z"
        fill="currentColor"
        className="text-saffron-600"
      />
      <ellipse
        cx="40"
        cy="30"
        rx="18"
        ry="4"
        fill="currentColor"
        className="text-gold-600"
      />
      <ellipse
        cx="40"
        cy="30"
        rx="14"
        ry="2"
        fill="currentColor"
        className="text-gold-300"
      />
      {/* band */}
      <rect
        x="20"
        y="40"
        width="40"
        height="4"
        fill="currentColor"
        className="text-maroon-700"
      />
      <rect
        x="20"
        y="56"
        width="40"
        height="3"
        fill="currentColor"
        className="text-gold-300"
        opacity="0.6"
      />
    </svg>
  );
}

export function MandalaIcon({
  className = "w-6 h-6",
  spin = false,
}: {
  className?: string;
  spin?: boolean;
}) {
  return (
    <svg
      className={`${className} ${spin ? "animate-spin-slow" : ""}`}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        className="text-saffron-400"
        strokeWidth="1.2"
        fill="none"
        opacity="0.75"
      >
        <circle cx="60" cy="60" r="56" />
        <circle cx="60" cy="60" r="44" />
        <circle cx="60" cy="60" r="30" />
        <circle cx="60" cy="60" r="16" />
        {Array.from({ length: 16 }).map((_, i) => (
          <g key={i} transform={`rotate(${(360 / 16) * i} 60 60)`}>
            <path
              d="M60 4 C66 22 66 22 60 38 C54 22 54 22 60 4 Z"
              fill="currentColor"
              className="text-gold-300"
              opacity="0.5"
            />
          </g>
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={`b-${i}`} transform={`rotate(${(360 / 8) * i} 60 60)`}>
            <circle
              cx="60"
              cy="22"
              r="4"
              fill="currentColor"
              className="text-maroon-500"
            />
          </g>
        ))}
        <circle
          cx="60"
          cy="60"
          r="6"
          fill="currentColor"
          className="text-saffron-500"
        />
      </g>
    </svg>
  );
}

export function HavanIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      {/* flames */}
      <path
        d="M40 6 C50 22 56 32 50 46 C46 54 42 56 40 56 C38 56 34 54 30 46 C24 32 30 22 40 6 Z"
        fill="currentColor"
        className="text-gold-400"
      />
      <path
        d="M40 16 C46 26 50 34 46 44 C44 50 42 52 40 52 C38 52 36 50 34 44 C30 34 34 26 40 16 Z"
        fill="currentColor"
        className="text-saffron-500"
      />
      {/* kund */}
      <path
        d="M14 56 L66 56 L58 74 Q40 82 22 74 Z"
        fill="currentColor"
        className="text-beige-800"
      />
      <path
        d="M14 56 L66 56 L62 64 L18 64 Z"
        fill="currentColor"
        className="text-gold-600"
      />
      <rect
        x="18"
        y="48"
        width="44"
        height="8"
        rx="2"
        fill="currentColor"
        className="text-beige-900"
      />
      <rect
        x="22"
        y="50"
        width="36"
        height="2"
        rx="1"
        fill="currentColor"
        className="text-gold-400"
        opacity="0.5"
      />
    </svg>
  );
}

export function RangoliIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <g opacity="0.85">
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i} transform={`rotate(${(360 / 8) * i} 60 60)`}>
            <ellipse
              cx="60"
              cy="40"
              rx="6"
              ry="16"
              fill="currentColor"
              className={i % 2 ? "text-saffron-400" : "text-maroon-400"}
              opacity="0.7"
            />
            <circle
              cx="60"
              cy="22"
              r="4"
              fill="currentColor"
              className="text-gold-400"
            />
          </g>
        ))}
      </g>
      <circle
        cx="60"
        cy="60"
        r="12"
        fill="currentColor"
        className="text-gold-400"
      />
      <circle
        cx="60"
        cy="60"
        r="5"
        fill="currentColor"
        className="text-maroon-600"
      />
    </svg>
  );
}

export function TempleSilhouette({
  className = "w-full",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 120"
      preserveAspectRatio="xMidYMax meet"
      fill="none"
      aria-hidden="true"
    >
      <g fill="currentColor" className="text-saffron-700/15">
        <path d="M30 120 V70 L50 70 L50 60 L70 60 L70 50 L90 50 L90 40 L110 40 L110 30 L130 30 L130 40 L150 40 L150 50 L170 50 L170 60 L190 60 L190 70 L210 70 V120 Z" />
        <path d="M260 120 V80 L280 80 L280 65 L300 65 L300 50 L320 50 L320 35 L340 35 L340 25 L360 25 L360 35 L380 35 L380 50 L400 50 L400 65 L420 65 L420 80 L440 80 V120 Z" />
        <path d="M470 120 V72 L490 72 L490 55 L510 55 L510 40 L530 40 L530 30 L550 30 L550 40 L570 40 L570 55 L570 72 L570 72 V120 Z" />
      </g>
    </svg>
  );
}

export function FloralDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      role="separator"
      aria-hidden="true"
    >
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-temple-border" />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3" className="fill-saffron-400" />
        {Array.from({ length: 6 }).map((_, i) => (
          <ellipse
            key={i}
            cx="10"
            cy="5"
            rx="1.6"
            ry="3.4"
            className="fill-gold-300"
            transform={`rotate(${60 * i} 10 10)`}
          />
        ))}
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-temple-border" />
    </div>
  );
}

export function CoverIllustration({
  cover,
  className = "w-10 h-10",
}: {
  cover: PoojaCover;
  className?: string;
}) {
  const map: Record<PoojaCover, ReactNode> = {
    diya: <DiyaIcon className={className} />,
    kalash: <KalashIcon className={className} />,
    lotus: <LotusIcon className={className} />,
    mandala: <MandalaIcon className={className} />,
    havan: <HavanIcon className={className} />,
    rangoli: <RangoliIcon className={className} />,
  };
  return <>{map[cover]}</>;
}

export const poojaCovers: { value: PoojaCover; label: string }[] = [
  { value: "kalash", label: "Kalash" },
  { value: "lotus", label: "Lotus" },
  { value: "diya", label: "Diya" },
  { value: "havan", label: "Havan" },
  { value: "mandala", label: "Mandala" },
  { value: "rangoli", label: "Rangoli" },
];
