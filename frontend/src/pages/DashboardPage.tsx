import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../layouts/PageContainer';
import RpgProgressCard from '../components/RpgProgressCard';
import GoldBalanceCard from '../components/GoldBalanceCard';
import AttributesCard from '../components/AttributesCard';
import QuestSummaryCards from '../components/QuestSummaryCards';
import ActiveQuestsSection from '../components/ActiveQuestsSection';
import RecentActivitySection from '../components/RecentActivitySection';
import StreakCard from '../components/StreakCard';
import DailyMissionsSection from '../components/DailyMissionsSection';
import AchievementsPreviewCard from '../components/AchievementsPreviewCard';
import QuestFormModal from '../components/QuestFormModal';
import LevelUpModal from '../components/LevelUpModal';
import FloatingReward, { FloatingRewardItem } from '../components/FloatingReward';
import FloatingRpgCore from '../components/FloatingRpgCore';
import { useRpg } from '../context/RpgContext';
import { useAuth } from '../hooks/useAuth';
import { getDashboardData } from '../services/dashboard';
import { createQuest, completeQuest } from '../services/quest';
import { completeDailyQuest } from '../services/dailyQuest';
import type {
  DashboardData,
  DashboardQuestItem,
  DailyQuest,
  CreateQuestInput,
  UpdateQuestInput,
} from '../types';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;

const getGreetingLore = (level: number): { title: string; quote: string } => {
  if (level >= 10) {
    return {
      title: 'Legend of the Realm',
      quote: 'The chroniclers tell tales of your triumphs across the high kingdoms.',
    };
  }
  if (level >= 5) {
    return {
      title: 'Seasoned Champion',
      quote: 'Your blade is tempered and your resolve unshakable.',
    };
  }
  return {
    title: '',
    quote: 'Every deed, no matter how humble, lays the stone of your future legend.',
  };
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { syncFromDashboard, setGoldBalance, equippedCosmetics } = useRpg();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & action states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completingDailyId, setCompletingDailyId] = useState<string | null>(null);

  // Level up & floating reward animations
  const [levelUpData, setLevelUpData] = useState<{
    isOpen: boolean;
    newLevel: number;
    xpEarned?: number;
    goldEarned?: number;
  }>({
    isOpen: false,
    newLevel: 1,
  });
  const [floatingRewards, setFloatingRewards] = useState<FloatingRewardItem[]>([]);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dashboard = await getDashboardData();
      setData(dashboard);
      syncFromDashboard(dashboard);
    } catch (err) {
      setError((err as Error).message || 'Failed to load dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [syncFromDashboard]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Keyboard shortcut: Press 'N' to open New Quest modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle inline complete from dashboard active quests
  const handleCompleteQuest = async (quest: DashboardQuestItem) => {
    setCompletingId(quest.id);

    // Instant optimistic calculation
    const optimisticGold = quest.priority === 'HIGH' ? 50 : quest.priority === 'MEDIUM' ? 30 : 15;
    const optimisticXp = quest.priority === 'HIGH' ? 80 : quest.priority === 'MEDIUM' ? 50 : 25;
    const attrName = ((quest as any).category || 'Strength').toLowerCase();
    const formattedAttrName = attrName.charAt(0).toUpperCase() + attrName.slice(1);
    const attrBonus = quest.priority === 'HIGH' ? 2 : 1;

    // Trigger instant floating reward
    const rewardKey = Date.now();
    setFloatingRewards((prev) => [
      ...prev,
      {
        id: rewardKey,
        xp: optimisticXp,
        gold: optimisticGold,
        attribute: {
          name: formattedAttrName,
          amount: attrBonus,
        },
      },
    ]);
    setTimeout(() => {
      setFloatingRewards((prev) => prev.filter((r) => r.id !== rewardKey));
    }, 1400);

    // Optimistically update gold balance in context & local dashboard data
    setGoldBalance((prev) => (prev !== null ? prev + optimisticGold : prev));
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        player: {
          ...prev.player,
          goldBalance: prev.player.goldBalance + optimisticGold,
          totalXp: prev.player.totalXp + optimisticXp,
        },
        activeQuests: prev.activeQuests.filter((q) => q.id !== quest.id),
      };
    });

    try {
      const result = await completeQuest(quest.id);
      if (!result.duplicateCompletion) {
        // If level up occurred, celebrate with LevelUpModal
        if (result.progression.levelUp) {
          setLevelUpData({
            isOpen: true,
            newLevel: result.progression.newLevel,
            xpEarned: result.reward.xpAwarded,
            goldEarned: result.reward.goldAwarded,
          });
        } else {
          const statText = result.reward.attributeGained
            ? ` · +${result.reward.attributeGained.amount} ${result.reward.attributeGained.attribute.toUpperCase()}`
            : '';
          addToast(
            `+${result.reward.xpAwarded} XP · +${result.reward.goldAwarded} Gold${statText}`,
            'success'
          );
        }
      } else {
        addToast('Quest was already completed', 'info');
      }

      // Reconcile with latest server data in background
      const updated = await getDashboardData();
      setData(updated);
      syncFromDashboard(updated);
    } catch (err) {
      addToast((err as Error).message || 'Failed to complete quest', 'error');
      // Revert/refresh on failure
      const updated = await getDashboardData().catch(() => null);
      if (updated) {
        setData(updated);
        syncFromDashboard(updated);
      }
    } finally {
      setCompletingId(null);
    }
  };

  // Handle complete daily mission
  const handleCompleteDailyQuest = async (mission: DailyQuest) => {
    setCompletingDailyId(mission.id);

    const optimisticGold = mission.goldReward || 20;
    const optimisticXp = mission.xpReward || 30;

    // Trigger instant floating rewards badge animation
    const rewardKey = Date.now();
    setFloatingRewards((prev) => [
      ...prev,
      {
        id: rewardKey,
        xp: optimisticXp,
        gold: optimisticGold,
      },
    ]);
    setTimeout(() => {
      setFloatingRewards((prev) => prev.filter((r) => r.id !== rewardKey));
    }, 1300);

    // Optimistically update gold balance in context & local dashboard data
    setGoldBalance((prev) => (prev !== null ? prev + optimisticGold : prev));
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        player: {
          ...prev.player,
          goldBalance: prev.player.goldBalance + optimisticGold,
          totalXp: prev.player.totalXp + optimisticXp,
        },
        dailyQuests: (prev.dailyQuests || []).map((m) =>
          m.id === mission.id ? { ...m, status: 'COMPLETED' as const } : m
        ),
      };
    });

    try {
      const result = await completeDailyQuest(mission.id);
      if (!result.duplicateCompletion) {
        if (result.progression.levelUp) {
          setLevelUpData({
            isOpen: true,
            newLevel: result.progression.newLevel,
            xpEarned: result.reward.xpAwarded,
            goldEarned: result.reward.goldAwarded,
          });
        } else {
          addToast(
            `+${result.reward.xpAwarded} XP · +${result.reward.goldAwarded} Gold`,
            'success'
          );
        }

        if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
          result.unlockedAchievements.forEach((ach) => {
            addToast(`🏆 Achievement Unlocked: ${ach.title}!`, 'success');
          });
        }
      } else {
        addToast('Daily mission was already completed', 'info');
      }

      // Reconcile with latest server data in background
      const updated = await getDashboardData();
      setData(updated);
      syncFromDashboard(updated);
    } catch (err) {
      addToast((err as Error).message || 'Failed to complete daily mission', 'error');
      // Revert/refresh on error
      const updated = await getDashboardData().catch(() => null);
      if (updated) {
        setData(updated);
        syncFromDashboard(updated);
      }
    } finally {
      setCompletingDailyId(null);
    }
  };

  // Handle quest creation from dashboard modal
  const handleCreateQuest = async (input: CreateQuestInput | UpdateQuestInput) => {
    setCreateLoading(true);
    try {
      await createQuest(input as CreateQuestInput);
      addToast('New quest forged successfully! ⚔️', 'success');
      setIsCreateModalOpen(false);
      const updated = await getDashboardData();
      setData(updated);
    } catch (err) {
      addToast((err as Error).message || 'Failed to create quest', 'error');
      throw err;
    } finally {
      setCreateLoading(false);
    }
  };

  const lore = data ? getGreetingLore(data.player.level) : null;
  const allEquipped = (data?.equipped && data.equipped.length > 0) ? data.equipped : equippedCosmetics;
  const equippedTitle = allEquipped.find((e) => e.category === 'TITLE')?.name;
  const equippedFrame = allEquipped.find((e) => e.category === 'AVATAR_FRAME');
  const equippedBadge = allEquipped.find((e) => e.category === 'BADGE');
  const activeEquippedDisplay = equippedFrame || equippedBadge || (equippedTitle ? { name: equippedTitle, iconEmoji: '👑' } : null);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <PageContainer maxWidth="3xl" className="py-6">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading Adventurer Dashboard">
            <div className="h-28 bg-rpg-surface rounded-xl border border-rpg-border" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="h-60 bg-rpg-surface rounded-xl border border-rpg-border" />
              <div className="h-60 bg-rpg-surface rounded-xl border border-rpg-border" />
              <div className="h-60 bg-rpg-surface rounded-xl border border-rpg-border" />
            </div>
            <div className="h-48 bg-rpg-surface rounded-xl border border-rpg-border" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-rpg-surface rounded-xl border border-rpg-border" />
              ))}
            </div>
            <div className="h-96 bg-rpg-surface rounded-xl border border-rpg-border" />
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-20 bg-rpg-surface border border-rpg-border rounded-xl my-8 p-6 shadow-xl">
            <span className="text-5xl block mb-3 animate-bounce" aria-hidden="true">
              ⚠️
            </span>
            <h2 className="font-display text-2xl font-bold text-rpg-text mb-2">
              Dashboard Offline
            </h2>
            <p className="text-sm text-rpg-text-muted mb-6 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={fetchDashboard}
              className="px-6 py-2.5 rounded-lg bg-rpg-gradient-gold text-rpg-bg font-semibold hover:brightness-105 shadow-sm border border-amber-500/40 transition-all active:scale-95"
            >
              🔄 Reconnect to Realm
            </button>
          </div>
        ) : data ? (
          <div className="space-y-6 animate-fade-in">
            {/* ── 1. Futuristic Hero Header with 3D Command Core ─────────────────── */}
            <header className={`relative glass-futuristic p-6 sm:p-8 overflow-hidden transition-all ${equippedFrame ? 'border-amber-500/60 shadow-[0_0_30px_rgba(245,200,66,0.18)]' : 'border-white/10'
              }`}>
              {/* Background ambient neon radial glows */}
              <div
                className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1 space-y-5">
                  {activeEquippedDisplay && (
                    <div className="inline-flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-sm flex items-center gap-1.5">
                        <span>{activeEquippedDisplay.iconEmoji || '👑'}</span>
                        <span>{activeEquippedDisplay.name}</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-5 sm:gap-6">
                    {user?.avatarUrl && (
                      <div className="relative shrink-0">
                        <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-[0_0_30px_rgba(245,200,66,0.35)] bg-black/50 p-0.5">
                          <img
                            src={user.avatarUrl}
                            alt={data.player.name}
                            className="w-full h-full object-cover object-center rounded-xl"
                          />
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-500 text-black font-mono font-black text-xs flex items-center justify-center border-2 border-[#131728] shadow-lg">
                          {data.player.level}
                        </div>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-rpg-text tracking-tight leading-tight flex items-baseline flex-wrap gap-x-2.5">
                        <span>Welcome back,</span>
                        <span className="text-gold-gradient">{data.player.name}</span>
                      </h1>
                      <p className="text-xs sm:text-sm text-rpg-text-muted max-w-xl leading-relaxed italic">
                        “{lore?.quote}”
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-xs text-rpg-text-muted flex-wrap font-medium">
                    <span className="text-rpg-text font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 shadow-sm">
                      <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6" />
                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                      </svg>
                      Level {data.player.level}
                    </span>
                    <span className="text-amber-300 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 shadow-sm">
                      <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      {data.quests.active} Active Quest{data.quests.active !== 1 ? 's' : ''}
                    </span>
                    <span className="text-orange-400 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-950/40 border border-orange-500/30 shadow-sm">
                      <svg className="w-3.5 h-3.5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                      </svg>
                      {data.streak?.currentStreak ?? 0}-Day Streak
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 shadow-sm">
                      <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      {data.quests.completed} Fulfilled
                    </span>
                  </div>

                  {/* Quick Actions Header */}
                  <div className="flex items-center gap-3.5 pt-2 flex-wrap">
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider bg-rpg-gradient-gold text-rpg-bg hover:brightness-105 shadow-md active:scale-95 transition-all"
                      title="Create a new quest (Shortcut: N)"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>New Quest</span>
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-black/20 text-rpg-bg border border-black/10">
                        N
                      </kbd>
                    </button>
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rpg-surface-2 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 6v12M15 9.5a3.5 3.5 0 0 0-7 0c0 4 7 2 7 6a3.5 3.5 0 0 1-7 0" />
                      </svg>
                      Guild Shop
                    </Link>
                    <Link
                      to="/inventory"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rpg-surface-2 border border-white/10 hover:border-cyan-400/40 text-rpg-text hover:text-cyan-300 active:scale-95 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      Inventory
                    </Link>
                  </div>
                </div>

                {/* ── Futuristic 3D Floating RPG Command Core ─────────────────── */}
                <div className="flex justify-center lg:justify-end shrink-0 py-2">
                  <FloatingRpgCore
                    level={data.player.level}
                    streak={data.streak?.currentStreak ?? 0}
                    activeQuestsCount={data.quests.active}
                  />
                </div>
              </div>
            </header>

            {/* ── 2. Top Progress, Treasury & Streak Section ────────────────── */}
            <section aria-label="Progression, Treasury and Streak" className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
              <div className="lg:col-span-1 h-full flex flex-col">
                <RpgProgressCard
                  profile={{
                    userId: data.player.name,
                    level: data.player.level,
                    totalXp: data.player.totalXp,
                    currentLevelXp: data.player.currentXp,
                    nextLevelXp: data.player.xpForNextLevel,
                    progressPercent: data.player.xpProgressPercentage,
                    goldBalance: data.player.goldBalance,
                    attributes: data.attributes,
                  }}
                />
              </div>
              <div className="lg:col-span-1 h-full flex flex-col">
                <GoldBalanceCard
                  goldBalance={data.player.goldBalance}
                  onViewHistory={() => navigate('/rpg')}
                />
              </div>
              <div className="lg:col-span-1 h-full flex flex-col">
                <StreakCard streak={data.streak} />
              </div>
            </section>

            {/* ── 3. Daily Missions Section ─────────────────────────────────── */}
            {data.dailyQuests && data.dailyQuests.length > 0 && (
              <DailyMissionsSection
                missions={data.dailyQuests}
                onComplete={handleCompleteDailyQuest}
                completingId={completingDailyId}
              />
            )}

            {/* ── 4. Character Attributes (Full Width Hero Grid) ─────────── */}
            <AttributesCard attributes={data.attributes} />

            {/* ── 5. Quest Metrics Summary Cards ──────────────────────────── */}
            <section aria-label="Quest Metrics Overview">
              <QuestSummaryCards summary={data.quests} />
            </section>

            {/* ── 6. Main Operations Grid (Balanced 2-Column Layout) ───────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Left Column: Active Quests, Realm Directory, and Completed Accomplishments */}
              <div className="flex flex-col gap-6">
                <ActiveQuestsSection
                  quests={data.activeQuests}
                  onComplete={handleCompleteQuest}
                  onOpenCreate={() => setIsCreateModalOpen(true)}
                  completingId={completingId}
                />

                {/* Quick Navigation Directory */}
                <nav
                  aria-label="Realm Directory Quick Navigation"
                  className="bg-rpg-surface/90 backdrop-blur-sm border border-rpg-border rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-base font-bold text-rpg-text flex items-center gap-2">
                      <span aria-hidden="true" className="text-amber-400">🧭</span> Realm Directory
                    </h3>
                    <span className="text-[10px] font-mono text-rpg-text-muted uppercase">Shortcuts</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Link
                      to="/quests"
                      className="group flex items-center justify-between p-3 rounded-lg bg-rpg-surface-2/60 hover:bg-rpg-surface-2 border border-transparent hover:border-rpg-border transition-all text-xs font-semibold text-rpg-text hover:text-amber-300"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                        Quest Board
                      </span>
                      <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                    </Link>
                    <Link
                      to="/shop"
                      className="group flex items-center justify-between p-3 rounded-lg bg-rpg-surface-2/60 hover:bg-rpg-surface-2 border border-transparent hover:border-amber-500/30 transition-all text-xs font-semibold text-amber-300"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 6v12M15 9.5a3.5 3.5 0 0 0-7 0c0 4 7 2 7 6a3.5 3.5 0 0 1-7 0" />
                        </svg>
                        Guild Shop
                      </span>
                      <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                    </Link>
                    <Link
                      to="/inventory"
                      className="group flex items-center justify-between p-3 rounded-lg bg-rpg-surface-2/60 hover:bg-rpg-surface-2 border border-transparent hover:border-rpg-border transition-all text-xs font-semibold text-rpg-text hover:text-amber-300"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        Inventory
                      </span>
                      <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                    </Link>
                    <Link
                      to="/achievements"
                      className="group flex items-center justify-between p-3 rounded-lg bg-rpg-surface-2/60 hover:bg-rpg-surface-2 border border-transparent hover:border-rpg-border transition-all text-xs font-semibold text-rpg-text hover:text-amber-300"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="6" />
                          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                        </svg>
                        Trophies
                      </span>
                      <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                    </Link>
                  </div>
                </nav>

                {/* Recently Completed Quests */}
                {data.recentlyCompletedQuests.length > 0 && (
                  <section
                    aria-label="Recently Completed Accomplishments"
                    className="bg-rpg-surface/90 backdrop-blur-sm border border-rpg-border rounded-xl p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-rpg-border/40">
                      <h2 className="font-display text-lg font-bold text-rpg-text flex items-center gap-2">
                        <span aria-hidden="true" className="text-amber-400">🏆</span> Recent Accomplishments
                      </h2>
                      <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-rpg-surface-2 text-rpg-text-muted border border-rpg-border">
                        {data.recentlyCompletedQuests.length} Completed
                      </span>
                    </div>
                    <ul className="space-y-2.5" role="list">
                      {data.recentlyCompletedQuests.slice(0, 4).map((q) => (
                        <li
                          key={q.id}
                          className="p-3 rounded-lg bg-rpg-surface-2/30 border border-emerald-500/20 hover:border-emerald-500/40 flex items-center justify-between gap-3 text-sm transition-all"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-rpg-text truncate">
                              {q.title}
                            </p>
                            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                              <span aria-hidden="true">✓</span> Fulfilled
                              {q.completedAt && (
                                <span className="text-rpg-text-muted font-normal">
                                  · {new Date(q.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-xs font-mono font-bold">
                            <span className="px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-500/30">
                              +{q.xpReward} XP
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-500/30">
                              +{q.goldReward}g
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              {/* Right Column: Achievements Hall & Guild Chronicle Activity Feed */}
              <div className="flex flex-col gap-6">
                <AchievementsPreviewCard achievements={data.achievements} />

                <div className="flex-1">
                  <RecentActivitySection activities={data.recentActivity} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </PageContainer>

      {/* Quest Creation Modal */}
      <QuestFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateQuest}
        isLoading={createLoading}
      />

      {/* Level Up Celebratory Modal */}
      <LevelUpModal
        isOpen={levelUpData.isOpen}
        onClose={() => setLevelUpData((prev) => ({ ...prev, isOpen: false }))}
        newLevel={levelUpData.newLevel}
        xpEarned={levelUpData.xpEarned}
        goldEarned={levelUpData.goldEarned}
      />

      {/* Upward Floating Reward Badges */}
      <FloatingReward rewards={floatingRewards} />

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg border text-sm font-semibold flex items-center gap-2 backdrop-blur-md animate-fade-in ${toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40'
                : toast.type === 'info'
                  ? 'bg-amber-950/90 text-amber-300 border-amber-500/40 shadow-amber-950/40'
                  : 'bg-red-950/90 text-red-300 border-red-500/40 shadow-red-950/40'
              }`}
          >
            <span aria-hidden="true">
              {toast.type === 'success' ? '✅' : toast.type === 'info' ? 'ℹ️' : '❌'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
