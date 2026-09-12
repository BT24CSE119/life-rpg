import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import QuestBoardPage from './pages/QuestBoardPage';
import RpgPage from './pages/RpgPage';
import ShopPage from './pages/ShopPage';
import InventoryPage from './pages/InventoryPage';
import AchievementsPage from './pages/AchievementsPage';
import HealthStatus from './components/HealthStatus';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Accessible skip-to-content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-rpg-gold focus:text-rpg-bg focus:rounded-rpg focus:font-semibold"
        >
          Skip to main content
        </a>

        <Navbar />

        <main id="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quests"
              element={
                <ProtectedRoute>
                  <QuestBoardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/rpg" element={<ProtectedRoute><RpgPage /></ProtectedRoute>} />
            <Route path="/shop" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />

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
        </main>

        <Footer />

        {/* Dev-only health status indicator */}
        {import.meta.env.DEV && <HealthStatus />}
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
