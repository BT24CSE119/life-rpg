import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import HealthStatus from './components/HealthStatus';

const App: React.FC = () => {
  return (
    <BrowserRouter>
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Catch-all: redirect unknown routes to landing */}
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
    </BrowserRouter>
  );
};

export default App;
