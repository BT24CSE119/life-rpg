import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import OfflineBanner from './components/OfflineBanner';
import MobileBottomNav from './components/MobileBottomNav';
import InstallAppBanner from './components/InstallAppBanner';
import { RpgProvider } from './context/RpgContext';

// ── Lazy-loaded pages (each becomes its own JS chunk) ──────────────────────────
const LandingPage      = lazy(() => import('./pages/LandingPage'));
const LoginPage        = lazy(() => import('./pages/LoginPage'));
const SignupPage       = lazy(() => import('./pages/SignupPage'));
const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
const QuestBoardPage   = lazy(() => import('./pages/QuestBoardPage'));
const RpgPage          = lazy(() => import('./pages/RpgPage'));
const ShopPage         = lazy(() => import('./pages/ShopPage'));
const InventoryPage    = lazy(() => import('./pages/InventoryPage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const LeaderboardPage  = lazy(() => import('./pages/LeaderboardPage'));
const TermsPage        = lazy(() => import('./pages/TermsPage'));
const PrivacyPage      = lazy(() => import('./pages/PrivacyPage'));

// ── Page loading skeleton ──────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      {/* Spinning sword */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-rpg-gold/20 border-t-rpg-gold animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">⚔️</span>
      </div>
      <p className="text-rpg-text-muted text-sm font-medium tracking-wide animate-pulse">
        Loading…
      </p>
    </div>
  </div>
);

const NO_FOOTER_ROUTES = ['/login', '/signup'];

// Redirect logged-in users away from the landing page to dashboard
const RootRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const hideFooter = NO_FOOTER_ROUTES.includes(pathname);
  return (
    <>
      {children}
      {!hideFooter && <Footer />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <OfflineBanner />
      <AuthProvider>
        <RpgProvider>
          {/* Accessible skip-to-content link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-rpg-gold focus:text-rpg-bg focus:rounded-rpg focus:font-semibold"
          >
            Skip to main content
          </a>

          <Navbar />

          <AppLayout>
            <main id="main-content" className="pb-24 md:pb-0">
              {/* Suspense wraps all lazy routes — shows PageLoader while chunk downloads */}
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/"       element={<RootRoute />} />
                  <Route path="/login"  element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />

                  {/* Protected routes */}
                  <Route path="/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/quests"      element={<ProtectedRoute><QuestBoardPage /></ProtectedRoute>} />
                  <Route path="/rpg"         element={<ProtectedRoute><RpgPage /></ProtectedRoute>} />
                  <Route path="/shop"        element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
                  <Route path="/inventory"   element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
                  <Route path="/achievements"element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
                  <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                  <Route path="/terms"       element={<TermsPage />} />
                  <Route path="/privacy"     element={<PrivacyPage />} />

                  {/* 404 catch-all */}
                  <Route
                    path="*"
                    element={
                      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
                        <div className="text-8xl mb-6" aria-hidden="true">🗺️</div>
                        <h1 className="font-display text-4xl font-bold text-rpg-text mb-3">
                          Page Not Found
                        </h1>
                        <p className="text-rpg-text-muted max-w-sm mb-8">
                          This path leads nowhere, adventurer. Return to the realm.
                        </p>
                        <a
                          href="/"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-rpg-lg font-semibold text-rpg-bg bg-rpg-gradient-gold hover:brightness-110 transition-all"
                        >
                          ⚔️ Return to Home
                        </a>
                      </div>
                    }
                  />
                </Routes>
              </Suspense>
            </main>
          </AppLayout>

          {/* Fixed mobile bottom nav — only visible on mobile when authenticated */}
          <MobileBottomNav />

          {/* PWA Install App banner / prompt */}
          <InstallAppBanner />

          </RpgProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
