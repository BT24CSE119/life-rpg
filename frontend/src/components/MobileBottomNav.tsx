import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRpg } from '../context/RpgContext';
import { triggerHaptic } from '../utils/haptics';

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Home',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12L12 3l9 9" />
        <path d="M9 21V12h6v9" />
        <path d="M5 10v11h14V10" />
      </svg>
    ),
  },
  {
    to: '/quests',
    label: 'Quests',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
  },
  {
    to: '/inventory',
    label: 'Inventory',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    to: '/shop',
    label: 'Shop',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v12M15 9.5a3.5 3.5 0 00-7 0c0 4 7 2 7 6a3.5 3.5 0 01-7 0" />
      </svg>
    ),
  },
  {
    to: '/rpg',
    label: 'Progress',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

const MobileBottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const { currentStreak } = useRpg();

  // Only show for logged-in users, hide on auth pages
  if (!isAuthenticated) return null;

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-rpg-bg/95 backdrop-blur-xl border-t border-rpg-border/60 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          const isProgress = item.to === '/rpg';

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => triggerHaptic('light')}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200 group"
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-rpg-gold shadow-[0_0_8px_rgba(245,200,66,0.8)]" />
              )}

              {/* Icon wrapper with optional streak mini badge */}
              <div className="relative">
                <span
                  className={`transition-all duration-200 ${
                    active
                      ? 'text-rpg-gold scale-110 drop-shadow-[0_0_6px_rgba(245,200,66,0.7)]'
                      : 'text-rpg-text-muted/60 group-hover:text-rpg-text-muted group-hover:scale-105'
                  }`}
                >
                  {item.icon(active)}
                </span>

                {/* Streak flame badge over Progress tab */}
                {isProgress && typeof currentStreak === 'number' && currentStreak > 0 && (
                  <span
                    className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-orange-500/90 text-black font-mono font-black text-[9px] leading-tight shadow-sm flex items-center gap-0.5"
                    title={`${currentStreak} day streak`}
                  >
                    🔥{currentStreak}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
                  active ? 'text-rpg-gold' : 'text-rpg-text-muted/50 group-hover:text-rpg-text-muted'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
