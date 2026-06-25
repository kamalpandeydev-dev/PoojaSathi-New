import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LangProvider } from "./lib/i18n";
import { AuthProvider, useAuth } from "./lib/auth";
import { registerServiceWorker } from "./lib/sw";
import { ToastHost } from "./components/ui";
import { AppShell } from "./components/AppShell";

import { AuthPage } from "./pages/AuthPage";
import { BookPoojaPage } from "./pages/yajmaan/BookPoojaPage";
import { YajmaanDashboard } from "./pages/yajmaan/YajmaanDashboard";
import { YajmaanBookingView } from "./pages/yajmaan/YajmaanBookingView";
import { YajmaanSamagriPage } from "./pages/yajmaan/YajmaanSamagriPage";
import { PanditDashboard } from "./pages/pandit/PanditDashboard";
import { PanditBookingView } from "./pages/pandit/PanditBookingView";
import { PanditSamagriBuilder } from "./pages/pandit/PanditSamagriBuilder";
import { LibraryPage } from "./pages/LibraryPage";

registerServiceWorker();

// ─── Loading spinner (matches app theme) ─────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-temple-bg">
      <p className="font-display text-2xl text-saffron-600">॥ ॐ ॥</p>
      <div className="w-10 h-10 border-4 border-saffron-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Smart root redirect: auth → role-specific dashboard ─────────────────────
function RootRedirect() {
  const { session, profile, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/auth" replace />;
  if (profile?.role === "pandit") return <Navigate to="/pandit" replace />;
  if (profile?.role === "yajmaan") return <Navigate to="/yajmaan" replace />;
  // Profile not yet loaded but session exists — wait one more tick
  return <PageLoader />;
}

// ─── Auth guard: redirect unauthenticated users to /auth ────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

// ─── Role guard: redirect wrong-role users to their own dashboard ─────────────
function RequireRole({
  role,
  children,
}: {
  role: "pandit" | "yajmaan";
  children: React.ReactNode;
}) {
  const { session, profile, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/auth" replace />;
  if (profile && profile.role !== role) {
    return (
      <Navigate
        to={profile.role === "pandit" ? "/pandit" : "/yajmaan"}
        replace
      />
    );
  }
  return <>{children}</>;
}

// ─── Auth page wrapper: redirect logged-in users away from /auth ──────────────
function AuthRoute() {
  const { session, profile, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (session && profile) {
    return (
      <Navigate
        to={profile.role === "pandit" ? "/pandit" : "/yajmaan"}
        replace
      />
    );
  }
  // Not logged in — show auth page without AppShell (full-page design)
  return <AuthPage />;
}

// ─── All routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/auth" element={<AuthRoute />} />

      {/* Root smart redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Yajmaan routes — wrapped in AppShell */}
      <Route
        path="/yajmaan"
        element={
          <RequireRole role="yajmaan">
            <AppShell>
              <YajmaanDashboard />
            </AppShell>
          </RequireRole>
        }
      />
      <Route
        path="/yajmaan/book"
        element={
          <RequireRole role="yajmaan">
            <AppShell>
              <BookPoojaPage />
            </AppShell>
          </RequireRole>
        }
      />
      <Route
        path="/yajmaan/booking/:bookingId"
        element={
          <RequireRole role="yajmaan">
            <AppShell>
              <YajmaanBookingView />
            </AppShell>
          </RequireRole>
        }
      />
      <Route
        path="/yajmaan/booking/:bookingId/samagri"
        element={
          <RequireRole role="yajmaan">
            <AppShell>
              <YajmaanSamagriPage />
            </AppShell>
          </RequireRole>
        }
      />

      {/* Pandit routes — wrapped in AppShell */}
      <Route
        path="/pandit"
        element={
          <RequireRole role="pandit">
            <AppShell>
              <PanditDashboard />
            </AppShell>
          </RequireRole>
        }
      />
      <Route
        path="/pandit/booking/:bookingId"
        element={
          <RequireRole role="pandit">
            <AppShell>
              <PanditBookingView />
            </AppShell>
          </RequireRole>
        }
      />
      <Route
        path="/pandit/booking/:bookingId/samagri"
        element={
          <RequireRole role="pandit">
            <AppShell>
              <PanditSamagriBuilder />
            </AppShell>
          </RequireRole>
        }
      />

      {/* Shared (any authenticated user) */}
      <Route
        path="/library"
        element={
          <RequireAuth>
            <AppShell>
              <LibraryPage />
            </AppShell>
          </RequireAuth>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastHost />
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}
