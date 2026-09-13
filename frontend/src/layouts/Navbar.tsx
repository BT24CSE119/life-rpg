import React, { useState, useEffect, useRef } from 'react';
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
  const { goldBalance, currentStreak, unreadCount, realtimeConnected, equippedCosmetics } = useRpg();
  const isLanding = location.pathname === '/';

  const mobileNavRef = useRef<HTMLDivElement>(null);
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Close mobile menu when clicking/touching outside or pressing Escape
  useEffect(() => {
    if (!mobileOpen) return;

    const handleClickOrTouchOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      // If tap is inside the menu or on the hamburger button itself, ignore
      if (
        mobileNavRef.current?.contains(target) ||
        hamburgerBtnRef.current?.contains(target)
      ) {
        return;
      }
      setMobileOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOrTouchOutside);
    document.addEventListener('touchstart', handleClickOrTouchOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOrTouchOutside);
      document.removeEventListener('touchstart', handleClickOrTouchOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

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
          {/* ── Left side: Hamburger + Logo grouped together ──────────── */}
          <div className="flex items-center gap-2">
            {/* Hamburger — mobile only */}
            <button
              ref={hamburgerBtnRef}
              className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-rpg-surface-2 border border-rpg-border/40 transition-colors md:hidden"
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
          </div>

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
                {typeof currentStreak === 'number' && (
                  <Link
                    to="/dashboard#streak"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:border-orange-400 hover:bg-orange-500/25 transition-all shadow-[0_0_10px_rgba(249,115,22,0.2)] group"
                    title="View Streak Details"
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform">🔥</span>
                    <span>{currentStreak}d</span>
                  </Link>
                )}
                {typeof goldBalance === 'number' && (
                  <Link to="/shop" title="Guild Shop & Gold">
                    <GoldBadge amount={goldBalance} size="sm" />
                  </Link>
                )}
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

          {/* ── Mobile: Streak + Bell + Profile (right) ── */}
          <div className="flex items-center gap-1.5 md:hidden">
            {isAuthenticated && (
              <>
                {typeof currentStreak === 'number' && (
                  <Link
                    to="/dashboard#streak"
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25 transition-all"
                    title="Streak"
                  >
                    <span className="text-xs">🔥</span>
                    <span>{currentStreak}d</span>
                  </Link>
                )}
                <NotificationCenter initialUnreadCount={unreadCount} />
                <UserMenuDropdown />
              </>
            )}
            {!isLoading && !isAuthenticated && (
              <Link
                to="/login"
                className="text-xs font-semibold text-rpg-gold border border-rpg-gold/40 px-3 py-1.5 rounded-lg hover:bg-rpg-gold/10 transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile menu — Professional 2/3 width slide-out left drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
            {/* Backdrop overlay — tap anywhere to close */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Left Drawer Container (2/3 width, max-w-xs, full height) */}
            <div
              ref={mobileNavRef}
              id="mobile-menu"
              className="relative z-50 w-3/4 max-w-xs h-full bg-[#0d101d] border-r border-amber-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between p-5 animate-slide-in-left overflow-y-auto"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div>
                {/* Drawer Header: Logo + Close Button */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 group"
                  >
                    <span className="text-amber-400">
                      <SwordIcon className="w-5 h-5" />
                    </span>
                    <span className="font-display text-lg font-black text-gold-gradient tracking-wide">
                      Life RPG
                    </span>
                  </Link>

                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-all"
                    aria-label="Close sidebar"
                  >
                    ✕
                  </button>
                </div>

                {/* Authenticated User Status Snippet */}
                {isAuthenticated && (
                  <div className="p-3 mb-5 rounded-xl bg-gradient-to-r from-amber-950/40 to-rpg-surface border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-mono font-bold text-xs text-amber-300">
                        {user?.username?.substring(0, 2).toUpperCase() || 'LV'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-xs text-rpg-text truncate">
                          {user?.username}
                        </p>
                        <p className="text-[10px] font-mono text-amber-400">
                          {currentStreak ?? 0}d Streak
                        </p>
                      </div>
                    </div>
                    {typeof goldBalance === 'number' && (
                      <GoldBadge amount={goldBalance} size="sm" />
                    )}
                  </div>
                )}

                {/* Navigation Links */}
                <div className="flex flex-col gap-1.5">
                  <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Explore Realms
                  </div>

                  <Link
                    to="/leaderboard"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-3 ${
                      isActive('/leaderboard')
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Guild Hall & Roster
                  </Link>

                  <Link
                    to="/achievements"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-3 ${
                      isActive('/achievements')
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <TrophyIcon className="w-4 h-4 text-yellow-400 shrink-0" />
                    Trophies & Feats
                  </Link>

                  {isLanding && !isAuthenticated && NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-white/10">
                {!isAuthenticated ? (
                  <div className="flex flex-col gap-2">
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
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setMobileOpen(false);
                        await logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/15 border border-red-500/30 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Depart Realm (Sign Out)</span>
                    </button>
                    <p className="text-[10px] font-mono text-slate-500 text-center">
                      Life RPG v1.0 · Realm Co-Working
                    </p>
                  </div>
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
