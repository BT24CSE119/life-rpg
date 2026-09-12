import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PageContainer from './PageContainer';
import RPGButton from '../components/RPGButton';
import { useAuth } from '../hooks/useAuth';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features',     href: '#features'     },
  { label: 'Preview',      href: '#preview'      },
];

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const isLanding = location.pathname === '/';

  // Detect scroll to add backdrop blur
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-rpg-bg/90 backdrop-blur-md border-b border-rpg-border shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          : 'bg-transparent',
      ].join(' ')}
      role="banner"
    >
      <PageContainer>
        <nav
          className="flex items-center justify-between h-16"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="Life RPG — Home"
          >
            <span className="text-2xl" aria-hidden="true">⚔️</span>
            <span className="font-display text-lg font-bold text-gold-gradient group-hover:brightness-110 transition-all">
              Life RPG
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6" role="list">
            {isLanding && NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-rpg-text-muted hover:text-rpg-gold transition-colors duration-200 font-medium"
                role="listitem"
              >
                {link.label}
              </a>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  to="/quests"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    location.pathname === '/quests'
                      ? 'text-rpg-gold'
                      : 'text-rpg-text-muted hover:text-rpg-gold'
                  }`}
                  role="listitem"
                >
                  📜 Quests
                </Link>
                <Link
                  to="/rpg"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    location.pathname === '/rpg' ? 'text-rpg-gold' : 'text-rpg-text-muted hover:text-rpg-gold'
                  }`}
                  role="listitem"
                >
                  ✦ Progress
                </Link>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    location.pathname === '/dashboard'
                      ? 'text-rpg-gold'
                      : 'text-rpg-text-muted hover:text-rpg-gold'
                  }`}
                  role="listitem"
                >
                  🏰 Dashboard
                </Link>
              </>
            )}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoading && isAuthenticated ? (
              <>
                <span className="text-sm text-rpg-text-muted font-medium">
                  ⚔️ {user?.username}
                </span>
                <RPGButton
                  variant="ghost"
                  size="sm"
                  onClick={async () => { await logout(); navigate('/'); }}
                >
                  Logout
                </RPGButton>
              </>
            ) : !isLoading ? (
              <>
                <Link to="/login">
                  <RPGButton variant="ghost" size="sm">
                    Login
                  </RPGButton>
                </Link>
                <Link to="/signup">
                  <RPGButton variant="gold" size="sm">
                    Begin Your Quest
                  </RPGButton>
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-rpg hover:bg-rpg-surface-3 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <span
              className={`block w-5 h-0.5 bg-rpg-text-muted transition-all duration-300 ${
                mobileOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-rpg-text-muted transition-all duration-300 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-rpg-text-muted transition-all duration-300 ${
                mobileOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            className="md:hidden pb-4 pt-2 border-t border-rpg-border/50 animate-fade-in"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {isLanding && NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-sm text-rpg-text-muted hover:text-rpg-gold hover:bg-rpg-surface-3 rounded-rpg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {isAuthenticated && (
                <>
                  <Link to="/quests" onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm text-rpg-text-muted hover:text-rpg-gold hover:bg-rpg-surface-3 rounded-rpg transition-colors"
                  >
                    📜 Quests
                  </Link>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm text-rpg-text-muted hover:text-rpg-gold hover:bg-rpg-surface-3 rounded-rpg transition-colors"
                  >
                    🏰 Dashboard
                  </Link>
                </>
              )}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-rpg-border/50">
                {isAuthenticated ? (
                  <RPGButton variant="ghost" size="sm" fullWidth
                    onClick={async () => { setMobileOpen(false); await logout(); navigate('/'); }}
                  >
                    Logout
                  </RPGButton>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <RPGButton variant="ghost" size="sm" fullWidth>
                        Login
                      </RPGButton>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)}>
                      <RPGButton variant="gold" size="sm" fullWidth>
                        Begin Your Quest
                      </RPGButton>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </header>
  );
};

export default Navbar;
