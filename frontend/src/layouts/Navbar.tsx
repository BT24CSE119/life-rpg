import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PageContainer from './PageContainer';
import RPGButton from '../components/RPGButton';
import GoldBadge from '../components/GoldBadge';
import NotificationCenter from '../components/NotificationCenter';
import UserMenuDropdown from '../components/UserMenuDropdown';
import { useAuth } from '../hooks/useAuth';
import { useRpg } from '../context/RpgContext';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features',     href: '#features'     },
  { label: 'Preview',      href: '#preview'      },
];

// ── SVG Icon Components ───────────────────────────────────────────────────────

const SwordIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="M13 19l6-6" />
    <path d="M2 2l6 6" />
    <path d="M20 16l2-2" />
    <path d="M16 20l2-2" />
  </svg>
);

const HomeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12L12 3l9 9" />
    <path d="M9 21V12h6v9" />
    <path d="M5 10v11h14V10" />
  </svg>
);

const ScrollIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

const BagIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const TrophyIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 006 6 6 6 0 006-6V2z" />
  </svg>
);

const ChartIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const CoinIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6v12M15 9.5a3.5 3.5 0 0 0-7 0c0 4 7 2 7 6a3.5 3.5 0 0 1-7 0" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { goldBalance, unreadCount, realtimeConnected, equippedCosmetics } = useRpg();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

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
            <span className="text-rpg-gold transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <SwordIcon className="w-6 h-6" />
            </span>
            <span className="font-display text-xl font-black text-gold-gradient tracking-wide group-hover:brightness-110 transition-all">
              Life RPG
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1.5" role="list">
            {isLanding && !isAuthenticated && NAV_LINKS.map((link) => (
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
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/dashboard')
                      ? 'text-amber-300 bg-amber-950/30 border border-amber-500/30 shadow-[0_0_12px_rgba(245,200,66,0.15)]'
                      : 'text-rpg-text-muted hover:text-rpg-text hover:bg-rpg-surface/60'
                  }`}
                  role="listitem"
                >
                  <HomeIcon /> Dashboard
                </Link>
                <Link
                  to="/quests"
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/quests')
                      ? 'text-amber-300 bg-amber-950/30 border border-amber-500/30 shadow-[0_0_12px_rgba(245,200,66,0.15)]'
                      : 'text-rpg-text-muted hover:text-rpg-text hover:bg-rpg-surface/60'
                  }`}
                  role="listitem"
                >
                  <ScrollIcon /> Quests
                </Link>
                <Link
                  to="/inventory"
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/inventory')
                      ? 'text-amber-300 bg-amber-950/30 border border-amber-500/30 shadow-[0_0_12px_rgba(245,200,66,0.15)]'
                      : 'text-rpg-text-muted hover:text-rpg-text hover:bg-rpg-surface/60'
                  }`}
                  role="listitem"
                >
                  <BagIcon /> Inventory
                </Link>
                <Link
                  to="/shop"
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/shop')
                      ? 'text-amber-300 bg-amber-950/40 border border-amber-400/50 shadow-[0_0_15px_rgba(245,200,66,0.25)]'
                      : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/20'
                  }`}
                  role="listitem"
                >
                  <CoinIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guild Bazaar</span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    SHOP
                  </span>
                </Link>
                <Link
                  to="/achievements"
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/achievements')
                      ? 'text-amber-300 bg-amber-950/30 border border-amber-500/30 shadow-[0_0_12px_rgba(245,200,66,0.15)]'
                      : 'text-rpg-text-muted hover:text-rpg-text hover:bg-rpg-surface/60'
                  }`}
                  role="listitem"
                >
                  <TrophyIcon /> Trophies
                </Link>
                <Link
                  to="/leaderboard"
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/leaderboard')
                      ? 'text-amber-300 bg-amber-950/30 border border-amber-500/30 shadow-[0_0_12px_rgba(245,200,66,0.15)]'
                      : 'text-rpg-text-muted hover:text-rpg-text hover:bg-rpg-surface/60'
                  }`}
                  role="listitem"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
                    <path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4" />
                    <circle cx="8" cy="12" r="2" />
                  </svg>
                  Ranks
                </Link>
                <Link
                  to="/rpg"
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/rpg')
                      ? 'text-amber-300 bg-amber-950/30 border border-amber-500/30 shadow-[0_0_12px_rgba(245,200,66,0.15)]'
                      : 'text-rpg-text-muted hover:text-rpg-text hover:bg-rpg-surface/60'
                  }`}
                  role="listitem"
                >
                  <ChartIcon /> Progress
                </Link>
              </>
            )}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoading && isAuthenticated ? (
              <>

                <NotificationCenter initialUnreadCount={unreadCount} />
                <UserMenuDropdown />
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

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && (
              <>
                <NotificationCenter initialUnreadCount={unreadCount} />
                <UserMenuDropdown />
              </>
            )}

            <button
              className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-rpg-surface-2 border border-rpg-border/40 transition-colors"
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
          </div>
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
              {isLanding && !isAuthenticated && NAV_LINKS.map((link) => (
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
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      isActive('/dashboard') ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-rpg-text-muted hover:text-rpg-gold'
                    }`}
                  >
                    <HomeIcon /> Dashboard
                  </Link>
                  <Link
                    to="/quests"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      isActive('/quests') ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-rpg-text-muted hover:text-rpg-gold'
                    }`}
                  >
                    <ScrollIcon /> Quests
                  </Link>
                  <Link
                    to="/inventory"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      isActive('/inventory') ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-rpg-text-muted hover:text-rpg-gold'
                    }`}
                  >
                    <BagIcon /> Inventory
                  </Link>
                  <Link
                    to="/shop"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${
                      isActive('/shop') ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CoinIcon className="w-4 h-4 text-amber-400" />
                      <span>Guild Bazaar</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      SHOP
                    </span>
                  </Link>
                  <Link
                    to="/achievements"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      isActive('/achievements') ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-rpg-text-muted hover:text-rpg-gold'
                    }`}
                  >
                    <TrophyIcon /> Trophies & Achievements
                  </Link>
                  <Link
                    to="/leaderboard"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      isActive('/leaderboard') ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-rpg-text-muted hover:text-rpg-gold'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
                      <path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4" />
                      <circle cx="8" cy="12" r="2" />
                    </svg>
                    Hall of Champions (Leaderboard)
                  </Link>
                  <Link
                    to="/rpg"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      isActive('/rpg') ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-rpg-text-muted hover:text-rpg-gold'
                    }`}
                  >
                    <ChartIcon /> Character Progression
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
