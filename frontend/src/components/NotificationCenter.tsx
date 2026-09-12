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

const TYPE_ICONS: Record<string, string> = {
  LEVEL_UP: '👑',
  ACHIEVEMENT_UNLOCKED: '🏆',
  QUEST_COMPLETED: '⚔️',
  DAILY_QUEST: '📜',
  STREAK_MILESTONE: '🔥',
  SHOP_PURCHASE: '🪙',
  SYSTEM: '📢',
};

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
    if (isOpen) {
      fetchList();
    }
  }, [isOpen]);

  // Click outside and Escape key listeners
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
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
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
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        className="relative p-2 rounded-lg text-rpg-text-muted hover:text-amber-300 hover:bg-rpg-surface-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <span className="text-lg" aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notification center"
          className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[480px] bg-rpg-surface border border-rpg-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-card-enter"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-rpg-border/60 bg-rpg-surface-2/60">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-rpg-text">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 divide-y divide-rpg-border/30">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-rpg-text-muted animate-pulse">
                Fetching realm heralds…
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-rpg-text-muted">
                <span className="text-3xl block mb-2" aria-hidden="true">📭</span>
                No notifications in your ledger yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkOne(n.id, n.isRead)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    !n.isRead
                      ? 'bg-amber-500/[0.06] hover:bg-amber-500/[0.1]'
                      : 'hover:bg-rpg-surface-2/50 opacity-75'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">
                    {TYPE_ICONS[n.type] || '🔔'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs font-bold truncate ${!n.isRead ? 'text-amber-200' : 'text-rpg-text'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-xs text-rpg-text-muted leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[10px] font-mono text-rpg-text-faint mt-1 block">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
