import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useLang, LangToggle } from "../lib/i18n";
import { useAuth } from "../lib/auth";
import { LotusIcon } from "./SpiritualArt";
import { InstallButton } from "./InstallPWA";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isYajmaan = location.pathname.startsWith("/yajmaan");
  const isPandit = location.pathname.startsWith("/pandit");

  return (
    <div className="min-h-screen flex flex-col bg-temple-bg">
      <header className="sticky top-0 z-40 border-b border-temple-border/60 bg-temple-bg/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <LotusIcon className="w-8 h-8 transition-transform group-hover:scale-105" />
            <div className="leading-none">
              <div className="font-display text-base text-maroon-800">
                {lang === "hi" ? "पूजासाथी" : "PoojaSathi"}
              </div>
              <div className="text-[9px] tracking-[0.12em] text-temple-muted">
                {lang === "hi"
                  ? "पंडित · यजमान · सामग्री"
                  : "Pandit · Yajmaan · Samagri"}
              </div>
            </div>
          </Link>

          {/* Role + user chip */}
          {profile && (isYajmaan || isPandit) && (
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold max-w-[180px] truncate ${isYajmaan ? "bg-saffron-100 text-saffron-800" : "bg-maroon-100 text-maroon-800"}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
              <span className="truncate">
                {profile.full_name.split(" ")[0]}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <InstallButton />
            <LangToggle />
            <Link
              to="/library"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-temple-muted hover:bg-beige-100 hover:text-temple-ink transition-colors"
            >
              {lang === "hi" ? "सूची" : "Library"}
            </Link>
            {/* Sign out */}
            {profile && (
              <button
                onClick={signOut}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-temple-muted hover:bg-beige-100 hover:text-rose-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="sm:hidden p-1.5 rounded-lg hover:bg-beige-100 text-temple-ink"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="sm:hidden border-t border-temple-border/60 bg-temple-bg p-3 space-y-1 animate-slide-up">
            {isYajmaan && (
              <MLink
                to="/yajmaan"
                label={lang === "hi" ? "मेरी पूजाएँ" : "My Poojas"}
              />
            )}
            {isYajmaan && (
              <MLink
                to="/yajmaan/book"
                label={lang === "hi" ? "नई पूजा बुक करें" : "Book a Pooja"}
              />
            )}
            {isPandit && (
              <MLink
                to="/pandit"
                label={lang === "hi" ? "पंडित डैशबोर्ड" : "Pandit Dashboard"}
              />
            )}
            <MLink
              to="/library"
              label={lang === "hi" ? "सामग्री सूची" : "Samagri Library"}
            />
            {profile && (
              <button
                onClick={signOut}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />{" "}
                {lang === "hi" ? "साइन आउट" : "Sign Out"}
              </button>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-temple-border/40 bg-temple-bg/80 py-4 text-center text-[11px] text-temple-muted">
        {lang === "hi"
          ? "पूजासाथी · शुभम् भवतु"
          : "PoojaSathi · Shubham Bhavatu"}
      </footer>
    </div>
  );
}

function MLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="block px-3 py-2 rounded-lg text-sm font-medium text-temple-ink hover:bg-beige-100 transition-colors"
    >
      {label}
    </Link>
  );
}
