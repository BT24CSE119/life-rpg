import React, { useState, useEffect, useRef } from 'react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notification';
import type { NotificationItem } from '../types';

interface NotificationCenterProps {
  initialUnreadCount?: number;
}

// ── SVG Type Icons ────────────────────────────────────────────────────────────

const IconLevelUp = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconAchievement = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 006 6 6 6 0 006-6V2z" />
  </svg>
);

const IconSword = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="M13 19l6-6" />
    <path d="M2 2l6 6" />
    <path d="M20 16l2-2" />
    <path d="M16 20l2-2" />
  </svg>
);

const IconScroll = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

const IconFlame = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-7 7 7 7 0 01-7-7c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
  </svg>
);

const IconCoin = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v2" />
    <path d="M12 16v2" />
    <path d="M9 9h1a2 2 0 010 4h-1" />
    <path d="M9 13h3a2 2 0 010 4H9" />
  </svg>
);

const IconBell = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

// Map notification type → { icon, color }
const TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  LEVEL_UP:            { icon: <IconLevelUp />,    color: 'text-amber-300',  bg: 'bg-amber-500/15 border-amber-500/30' },
  ACHIEVEMENT_UNLOCKED:{ icon: <IconAchievement />, color: 'text-yellow-300', bg: 'bg-yellow-500/15 border-yellow-500/30' },
  QUEST_COMPLETED:     { icon: <IconSword />,       color: 'text-blue-300',   bg: 'bg-blue-500/15 border-blue-500/30'   },
  DAILY_QUEST:         { icon: <IconScroll />,      color: 'text-emerald-300',bg: 'bg-emerald-500/15 border-emerald-500/30'},
  STREAK_MILESTONE:    { icon: <IconFlame />,       color: 'text-orange-300', bg: 'bg-orange-500/15 border-orange-500/30'},
  SHOP_PURCHASE:       { icon: <IconCoin />,        color: 'text-amber-400',  bg: 'bg-amber-500/15 border-amber-500/30' },
  SYSTEM:              { icon: <IconBell />,        color: 'text-slate-300',  bg: 'bg-slate-500/15 border-slate-500/30' },
};

const DEFAULT_META = { icon: <IconBell />, color: 'text-slate-300', bg: 'bg-slate-500/15 border-slate-500/30' };

// ─────────────────────────────────────────────────────────────────────────────

const formatTimeAgo = (iso: string): string => {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({ initialUnreadCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications(1, 20);
      setNotifications(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  useEffect(() => {
    if (isOpen) fetchList();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkOne = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Silently handle
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silently handle
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* ── Bell Button ─────────────────────────────────────────────────────── */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl text-rpg-text-muted hover:text-amber-300 hover:bg-rpg-surface-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        {/* SVG Bell Icon */}
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.6)]"
            aria-hidden="true"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ──────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notification center"
          className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] max-h-[500px] bg-rpg-surface/95 backdrop-blur-xl border border-rpg-border/80 rounded-2xl shadow-2xl shadow-black/70 z-50 flex flex-col overflow-hidden animate-card-enter"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-rpg-border/60 bg-rpg-surface-2/50">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="font-display font-bold text-sm text-rpg-text">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300">
                  {unreadCount} New
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 transition-colors px-2 py-1 rounded-lg hover:bg-amber-500/10"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1 divide-y divide-rpg-border/20">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-rpg-text-muted animate-pulse">
                Loading notifications…
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-10 h-10 rounded-full bg-rpg-surface-2 flex items-center justify-center mx-auto mb-3 text-rpg-text-faint">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                </div>
                <p className="text-xs text-rpg-text-muted">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const meta = TYPE_META[n.type] || DEFAULT_META;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleMarkOne(n.id, n.isRead)}
                    className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors ${
                      !n.isRead
                        ? 'bg-amber-500/[0.05] hover:bg-amber-500/[0.09]'
                        : 'hover:bg-rpg-surface-2/40 opacity-70'
                    }`}
                  >
                    {/* Type icon badge */}
                    <div className={`shrink-0 mt-0.5 w-8 h-8 rounded-lg border flex items-center justify-center ${meta.bg} ${meta.color}`}>
                      {meta.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-xs font-semibold truncate ${!n.isRead ? 'text-rpg-text' : 'text-rpg-text-muted'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
                        )}
                      </div>
                      <p className="text-[11px] text-rpg-text-muted leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <span className="text-[10px] font-mono text-rpg-text-faint mt-1 block">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
