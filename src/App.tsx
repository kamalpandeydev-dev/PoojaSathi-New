import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LangProvider } from "./lib/i18n";
import { registerServiceWorker } from "./lib/sw";
import { ToastHost } from "./components/ui";
import { AppShell } from "./components/AppShell";

import { HomePage } from "./pages/HomePage";
import { BookPoojaPage } from "./pages/yajmaan/BookPoojaPage";
import { YajmaanDashboard } from "./pages/yajmaan/YajmaanDashboard";
import { YajmaanBookingView } from "./pages/yajmaan/YajmaanBookingView";
import { YajmaanSamagriPage } from "./pages/yajmaan/YajmaanSamagriPage";
import { PanditDashboard } from "./pages/pandit/PanditDashboard";
import { PanditBookingView } from "./pages/pandit/PanditBookingView";
import { PanditSamagriBuilder } from "./pages/pandit/PanditSamagriBuilder";
import { LibraryPage } from "./pages/LibraryPage";

registerServiceWorker();

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/yajmaan" element={<YajmaanDashboard />} />
            <Route path="/yajmaan/book" element={<BookPoojaPage />} />
            <Route
              path="/yajmaan/booking/:bookingId"
              element={<YajmaanBookingView />}
            />
            <Route
              path="/yajmaan/booking/:bookingId/samagri"
              element={<YajmaanSamagriPage />}
            />
            <Route path="/pandit" element={<PanditDashboard />} />
            <Route
              path="/pandit/booking/:bookingId"
              element={<PanditBookingView />}
            />
            <Route
              path="/pandit/booking/:bookingId/samagri"
              element={<PanditSamagriBuilder />}
            />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
        <ToastHost />
      </BrowserRouter>
    </LangProvider>
  );
}
