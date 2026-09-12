import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PageContainer from './PageContainer';
import RPGButton from '../components/RPGButton';
import GoldBadge from '../components/GoldBadge';
import { useAuth } from '../hooks/useAuth';
import { getWallet } from '../services/rpg';

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
  const [goldBalance, setGoldBalance] = useState<number | null>(null);
  const isLanding = location.pathname === '/';

  // Fetch wallet balance when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getWallet()
        .then((data) => setGoldBalance(data.goldBalance))
        .catch(() => setGoldBalance(null));
    } else {
      setGoldBalance(null);
    }
  }, [isAuthenticated, location.pathname]);

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

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-rpg-bg/95 backdrop-blur-md border-b border-rpg-border/80 shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
          : 'bg-gradient-to-b from-rpg-bg/80 to-transparent',
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
            className="flex items-center gap-2 group relative py-1"
            aria-label="Life RPG — Home"
          >
            <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" aria-hidden="true">
              ⚔️
            </span>
            <span className="font-display text-xl font-black text-gold-gradient tracking-wide group-hover:brightness-110 transition-all">
              Life RPG
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1.5" role="list">
            {isLanding && NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-rpg-text-muted hover:text-rpg-gold hover:bg-rpg-surface/40 rounded-lg transition-all duration-200 font-medium"
                role="listitem"
              >
                {link.label}
              </a>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`relative px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/dashboard')
                      ? 'text-amber-300 bg-amber-950/30 border border-amber-500/30 shadow-[0_0_12px_rgba(245,200,66,0.15)]'
                      : 'text-rpg-text-muted hover:text-rpg-text hover:bg-rpg-surface/60'
                  }`}
                  role="listitem"
                >
                  <span aria-hidden="true">🏰</span> Dashboard
                </Link>
                <Link
                  to="/quests"
                  className={`relative px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/quests')
                      ? 'text-amber-300 bg-amber-950/30 border border-amber-500/30 shadow-[0_0_12px_rgba(245,200,66,0.15)]'
                      : 'text-rpg-text-muted hover:text-rpg-text hover:bg-rpg-surface/60'
                  }`}
                  role="listitem"
                >
                  <span aria-hidden="true">📜</span> Quests
                </Link>
                <Link
                  to="/rpg"
                  className={`relative px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/rpg')
                      ? 'text-amber-300 bg-amber-950/30 border border-amber-500/30 shadow-[0_0_12px_rgba(245,200,66,0.15)]'
                      : 'text-rpg-text-muted hover:text-rpg-text hover:bg-rpg-surface/60'
                  }`}
                  role="listitem"
                >
                  <span aria-hidden="true">✦</span> Progression
                </Link>
              </>
            )}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoading && isAuthenticated ? (
              <>
                {goldBalance !== null && (
                  <Link
                    to="/rpg"
                    title="View Treasury & Gold Ledger"
                    className="hover:scale-105 active:scale-95 transition-transform"
                  >
                    <GoldBadge amount={goldBalance} size="sm" />
                  </Link>
                )}
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rpg-surface-2 border border-rpg-border text-rpg-text flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                  {user?.username}
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
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-rpg-surface-2 border border-rpg-border/40 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <span
              className={`block w-5 h-0.5 bg-rpg-text-muted transition-all duration-300 ${
                mobileOpen ? 'rotate-45 translate-y-2 bg-amber-400' : ''
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-rpg-text-muted transition-all duration-300 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-rpg-text-muted transition-all duration-300 ${
                mobileOpen ? '-rotate-45 -translate-y-2 bg-amber-400' : ''
              }`}
            />
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            className="md:hidden pb-4 pt-2 border-t border-rpg-border/50 bg-rpg-surface/95 backdrop-blur-md rounded-b-xl px-2 shadow-2xl animate-card-enter"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {isLanding && NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-sm text-rpg-text-muted hover:text-rpg-gold hover:bg-rpg-surface-2 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      isActive('/dashboard') ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-rpg-text-muted hover:text-rpg-gold'
                    }`}
                  >
                    <span>🏰</span> Dashboard
                  </Link>
                  <Link
                    to="/quests"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      isActive('/quests') ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-rpg-text-muted hover:text-rpg-gold'
                    }`}
                  >
                    <span>📜</span> Quests
                  </Link>
                  <Link
                    to="/rpg"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${
                      isActive('/rpg') ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-rpg-text-muted hover:text-rpg-gold'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>✦</span> Progress & Treasury
                    </span>
                    {goldBalance !== null && <GoldBadge amount={goldBalance} size="sm" />}
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
