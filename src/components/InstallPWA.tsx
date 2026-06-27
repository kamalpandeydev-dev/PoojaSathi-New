import { useState } from "react";
import { Download, Share, X } from "lucide-react";
import { usePWAInstall } from "../lib/usePWAInstall";
import { useLang } from "../lib/i18n";

// ─── Full banner — shows at top of HomePage ───────────────────────────────────
export function InstallBanner() {
  const { canInstall, isIOS, install, dismiss } = usePWAInstall();
  const { lang } = useLang();
  const [installing, setInstalling] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (!canInstall) return null;

  async function handleInstall() {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    setInstalling(true);
    const result = await install();
    setInstalling(false);
    if (result === "dismissed") dismiss();
  }

  return (
    <>
      <div className="mx-4 sm:mx-auto sm:max-w-2xl mb-4 rounded-2xl border-2 border-saffron-300 bg-gradient-to-r from-saffron-50 to-gold-50 shadow-soft overflow-hidden animate-slide-up">
        <div className="flex items-center gap-3 p-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-saffron-500 flex items-center justify-center shrink-0 shadow-soft">
            <span className="font-deva text-xl font-bold text-white">पूं</span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-temple-ink">
              {lang === "hi" ? "पूजासाथी इंस्टॉल करें" : "Install PoojaSathi"}
            </p>
            <p className="text-xs text-temple-muted leading-snug">
              {lang === "hi"
                ? "होम स्क्रीन पर जोड़ें — ऑफलाइन भी काम करेगा"
                : "Add to home screen — works offline too"}
            </p>
          </div>

          {/* Install button */}
          <button
            onClick={handleInstall}
            disabled={installing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-sm transition-all active:scale-95 shrink-0 shadow-soft disabled:opacity-60"
          >
            {isIOS ? (
              <Share className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {installing ? "..." : lang === "hi" ? "इंस्टॉल" : "Install"}
          </button>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="p-1.5 rounded-lg text-temple-muted hover:bg-saffron-100 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Manual Guide */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 bg-maroon-950/70 backdrop-blur-sm flex items-end justify-center p-4"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-maroon-900">
                {lang === "hi" ? "iPhone पर इंस्टॉल करें" : "Install on iPhone"}
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg hover:bg-beige-100"
              >
                <X className="w-5 h-5 text-temple-muted" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                {
                  icon: "1️⃣",
                  hi: 'Safari में नीचे "Share" बटन दबाएं',
                  en: 'Tap the "Share" button at the bottom of Safari',
                },
                {
                  icon: "2️⃣",
                  hi: '"Add to Home Screen" पर टैप करें',
                  en: 'Scroll down and tap "Add to Home Screen"',
                },
                {
                  icon: "3️⃣",
                  hi: '"Add" दबाएं — हो गया! 🎉',
                  en: 'Tap "Add" — done! 🎉',
                },
              ].map((s) => (
                <div
                  key={s.icon}
                  className="flex items-start gap-3 p-3 rounded-xl bg-beige-50"
                >
                  <span className="text-xl shrink-0">{s.icon}</span>
                  <p className="text-sm text-temple-ink">
                    {lang === "hi" ? s.hi : s.en}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-saffron-50 border border-saffron-200">
              <p className="text-xs text-saffron-900 flex items-center gap-1.5">
                <Share className="w-3.5 h-3.5 shrink-0" />
                {lang === "hi"
                  ? "Safari का Share आइकन: नीचे toolbar में box से ऊपर arrow"
                  : "Safari Share icon: box with arrow pointing up in the bottom toolbar"}
              </p>
            </div>
            <button
              onClick={() => {
                setShowIOSGuide(false);
                dismiss();
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-saffron-500 text-white font-bold text-sm hover:bg-saffron-600"
            >
              {lang === "hi" ? "समझ गया" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Compact button — for AppShell header ────────────────────────────────────
export function InstallButton() {
  const { canInstall, isIOS, install, dismiss } = usePWAInstall();
  const { lang } = useLang();
  const [installing, setInstalling] = useState(false);

  if (!canInstall) return null;

  async function handleInstall() {
    if (isIOS) {
      alert(
        lang === "hi"
          ? 'Safari में Share बटन → "Add to Home Screen" → Add'
          : 'In Safari: tap Share → "Add to Home Screen" → Add',
      );
      dismiss();
      return;
    }
    setInstalling(true);
    const result = await install();
    setInstalling(false);
    if (result === "dismissed") dismiss();
  }

  return (
    <button
      onClick={handleInstall}
      disabled={installing}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-saffron-400 bg-saffron-50 hover:bg-saffron-100 text-saffron-700 text-xs font-bold transition-all active:scale-95 disabled:opacity-60"
      title={lang === "hi" ? "ऐप इंस्टॉल करें" : "Install App"}
    >
      <Download className="w-3.5 h-3.5" />
      {installing ? "..." : lang === "hi" ? "इंस्टॉल" : "Install"}
    </button>
  );
}
