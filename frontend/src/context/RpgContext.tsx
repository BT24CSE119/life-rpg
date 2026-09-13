import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getWallet } from '../services/rpg';
import { getUnreadNotificationCount } from '../services/notification';
import { getStreak } from '../services/streak';
import api from '../services/api';
import type { DashboardData } from '../types';

interface EquippedItem {
  id: string;
  itemId?: string;
  name: string;
  category: string;
  iconEmoji?: string | null;
  rarity?: string;
}

interface RpgContextValue {
  goldBalance: number | null;
  unreadCount: number;
  playerLevel: number | null;
  currentStreak: number | null;
  equippedCosmetics: EquippedItem[];
  realtimeConnected: boolean;
  setGoldBalance: React.Dispatch<React.SetStateAction<number | null>>;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
  syncFromDashboard: (data: DashboardData) => void;
  refreshWallet: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshEquipped: () => Promise<void>;
  refreshStreak: () => Promise<void>;
}

const RpgContext = createContext<RpgContextValue | undefined>(undefined);

export const RpgProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [goldBalance, setGoldBalance] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [playerLevel, setPlayerLevel] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState<number | null>(null);
  const [equippedCosmetics, setEquippedCosmetics] = useState<EquippedItem[]>([]);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);

  const refreshWallet = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const wallet = await getWallet();
      setGoldBalance(wallet.goldBalance);
    } catch {
      // Ignore wallet fetch errors gracefully
    }
  }, [isAuthenticated]);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getUnreadNotificationCount();
      setUnreadCount(res.unreadCount);
    } catch {
      // Ignore notification count errors
    }
  }, [isAuthenticated]);

  const refreshEquipped = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const inv = await api.get<{ success: boolean; data: any[] }>('/inventory');
      if (inv.data?.data) {
        const equippedList: EquippedItem[] = inv.data.data
          .filter((item) => item.isEquipped)
          .map((item) => ({
            id: item.id,
            itemId: item.itemId,
            name: item.item?.name,
            category: item.item?.category || item.item?.type,
            iconEmoji: item.item?.iconEmoji,
            rarity: item.item?.rarity,
          }));
        setEquippedCosmetics(equippedList);
      }
    } catch {
      // Ignore
    }
  }, [isAuthenticated]);

  const refreshStreak = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const streakInfo = await getStreak();
      if (streakInfo && typeof streakInfo.currentStreak === 'number') {
        setCurrentStreak(streakInfo.currentStreak);
      }
    } catch {
      // Ignore streak fetch errors gracefully
    }
  }, [isAuthenticated]);

  const syncFromDashboard = useCallback((data: DashboardData) => {
    if (data.player) {
      setGoldBalance(data.player.goldBalance);
      setPlayerLevel(data.player.level);
    }
    if (data.streak) {
      setCurrentStreak(data.streak.currentStreak);
    }
    if (data.equipped && data.equipped.length > 0) {
      setEquippedCosmetics(data.equipped);
    }
    if (typeof data.unreadNotificationsCount === 'number') {
      setUnreadCount(data.unreadNotificationsCount);
    }
  }, []);

  // Initial fetch on authentication
  useEffect(() => {
    if (isAuthenticated) {
      refreshWallet();
      refreshNotifications();
      refreshEquipped();
      refreshStreak();
    } else {
      setGoldBalance(null);
      setUnreadCount(0);
      setPlayerLevel(null);
      setCurrentStreak(null);
      setEquippedCosmetics([]);
      setRealtimeConnected(false);
    }
  }, [isAuthenticated, refreshWallet, refreshNotifications, refreshEquipped, refreshStreak]);


  // Real-Time Server-Sent Events (SSE) stream
  useEffect(() => {
    if (!isAuthenticated) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connectSSE = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      let eventsUrl = `${apiUrl}/events`;

      try {
        // Obtain short-lived single-use SSE ticket (no raw JWT in URL)
        const ticketRes = await api.post<{ success: boolean; ticket: string }>('/events/ticket').catch(() => null);
        if (ticketRes?.data?.ticket) {
          eventsUrl += `?ticket=${ticketRes.data.ticket}`;
        }

        eventSource = new EventSource(eventsUrl, { withCredentials: true });

        eventSource.onopen = () => {
          setRealtimeConnected(true);
        };

        eventSource.addEventListener('connected', () => {
          setRealtimeConnected(true);
        });

        eventSource.addEventListener('GOLD_GAINED', (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if (typeof parsed.data?.goldBalance === 'number') {
              setGoldBalance(parsed.data.goldBalance);
            }
          } catch {
            // Ignore parse errors
          }
        });

        eventSource.addEventListener('QUEST_COMPLETED', (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed.data?.progression?.goldBalance !== undefined) {
              setGoldBalance(parsed.data.progression.goldBalance);
            }
            if (parsed.data?.progression?.newLevel) {
              setPlayerLevel(parsed.data.progression.newLevel);
            }
            setUnreadCount((prev) => prev + 1);
          } catch {
            // Ignore
          }
        });

        eventSource.addEventListener('DAILY_QUEST_COMPLETED', (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed.data?.progression?.goldBalance !== undefined) {
              setGoldBalance(parsed.data.progression.goldBalance);
            }
            if (parsed.data?.streak?.currentStreak) {
              setCurrentStreak(parsed.data.streak.currentStreak);
            }
            setUnreadCount((prev) => prev + 1);
          } catch {
            // Ignore
          }
        });

        eventSource.addEventListener('NOTIFICATION_CREATED', () => {
          setUnreadCount((prev) => prev + 1);
        });

        eventSource.addEventListener('ITEM_PURCHASED', (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if (typeof parsed.data?.newGoldBalance === 'number') {
              setGoldBalance(parsed.data.newGoldBalance);
            }
            setUnreadCount((prev) => prev + 1);
          } catch {
            // Ignore
          }
        });

        eventSource.addEventListener('ITEM_EQUIPPED', (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed.data?.item) {
              const item = parsed.data.item;
              setEquippedCosmetics((prev) => [
                ...prev.filter((p) => (p.category || 'ITEM') !== (item.category || item.type)),
                {
                  id: item.id,
                  itemId: item.id,
                  name: item.name,
                  category: item.category || item.type,
                  iconEmoji: item.iconEmoji,
                  rarity: item.rarity,
                },
              ]);
            }
          } catch {
            // Ignore
          }
        });

        eventSource.addEventListener('ITEM_UNEQUIPPED', (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed.data?.itemId) {
              setEquippedCosmetics((prev) => prev.filter((p) => p.itemId !== parsed.data.itemId && p.id !== parsed.data.itemId));
            }
          } catch {
            // Ignore
          }
        });

        eventSource.onerror = () => {
          setRealtimeConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Exponential backoff reconnect
          reconnectTimeout = setTimeout(connectSSE, 10000);
        };
      } catch {
        setRealtimeConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isAuthenticated]);

  return (
    <RpgContext.Provider
      value={{
        goldBalance,
        unreadCount,
        playerLevel,
        currentStreak,
        equippedCosmetics,
        realtimeConnected,
        setGoldBalance,
        setUnreadCount,
        syncFromDashboard,
        refreshWallet,
        refreshNotifications,
        refreshEquipped,
        refreshStreak,
      }}
    >
      {children}
    </RpgContext.Provider>
  );
};

export const useRpg = (): RpgContextValue => {
  const context = useContext(RpgContext);
  if (!context) {
    throw new Error('useRpg must be used within an RpgProvider');
  }
  return context;
};
