import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../layouts/PageContainer';
import RpgProgressCard from '../components/RpgProgressCard';
import GoldBalanceCard from '../components/GoldBalanceCard';
import AttributesCard from '../components/AttributesCard';
import QuestSummaryCards from '../components/QuestSummaryCards';
import ActiveQuestsSection from '../components/ActiveQuestsSection';
import RecentActivitySection from '../components/RecentActivitySection';
import QuestFormModal from '../components/QuestFormModal';
import LevelUpModal from '../components/LevelUpModal';
import FloatingReward, { FloatingRewardItem } from '../components/FloatingReward';
import { getDashboardData } from '../services/dashboard';
import { createQuest, completeQuest } from '../services/quest';
import type {
  DashboardData,
  DashboardQuestItem,
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
    title: 'Aspiring Adventurer',
    quote: 'Every deed, no matter how humble, lays the stone of your future legend.',
  };
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & action states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

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
    } catch (err) {
      setError((err as Error).message || 'Failed to load dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Handle inline complete from dashboard active quests
  const handleCompleteQuest = async (quest: DashboardQuestItem) => {
    setCompletingId(quest.id);
    try {
      const result = await completeQuest(quest.id);
      if (!result.duplicateCompletion) {
        // Trigger floating rewards badge animation
        const rewardKey = Date.now();
        setFloatingRewards((prev) => [
          ...prev,
          {
            id: rewardKey,
            xp: result.reward.xpAwarded,
            gold: result.reward.goldAwarded,
          },
        ]);
        setTimeout(() => {
          setFloatingRewards((prev) => prev.filter((r) => r.id !== rewardKey));
        }, 1300);

        // If level up occurred, celebrate with LevelUpModal
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
      } else {
        addToast('Quest was already completed', 'info');
      }

      // Refresh dashboard in real-time
      const updated = await getDashboardData();
      setData(updated);
    } catch (err) {
      addToast((err as Error).message || 'Failed to complete quest', 'error');
    } finally {
      setCompletingId(null);
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

  return (
    <div className="min-h-screen pt-20 pb-16">
      <PageContainer className="py-6">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading Adventurer Dashboard">
            <div className="h-24 bg-rpg-surface rounded-xl border border-rpg-border" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="h-60 bg-rpg-surface rounded-xl border border-rpg-border" />
              <div className="h-60 bg-rpg-surface rounded-xl border border-rpg-border" />
              <div className="h-60 bg-rpg-surface rounded-xl border border-rpg-border" />
            </div>
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
              className="px-6 py-2.5 rounded-lg bg-rpg-gradient-gold text-rpg-bg font-semibold hover:brightness-110 shadow-rpg-gold transition-all active:scale-95"
            >
              🔄 Reconnect to Realm
            </button>
          </div>
        ) : data ? (
          <div className="space-y-6 animate-fade-in">
            {/* ── 1. Personalized Hero Header ───────────────────────────────── */}
            <header className="relative bg-gradient-to-r from-rpg-surface via-rpg-surface-2/60 to-rpg-surface border border-rpg-border rounded-xl p-6 sm:p-7 shadow-sm overflow-hidden">
              {/* Background ambient rune effect */}
              <div
                className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-950/60 text-amber-300 border border-amber-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                      {lore?.title}
                    </span>
                    <span className="text-xs text-rpg-text-faint">
                      Kingdom of Life RPG
                    </span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-4xl font-black text-rpg-text tracking-tight">
                    Welcome back, <span className="text-gold-gradient">{data.player.name}</span>
                  </h1>

                  <p className="text-xs sm:text-sm text-rpg-text-muted mt-1.5 max-w-xl leading-relaxed italic">
                    “{lore?.quote}”
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-rpg-text-muted flex-wrap font-medium">
                    <span className="text-rpg-text font-bold flex items-center gap-1">
                      <span aria-hidden="true">🎖️</span> Level {data.player.level}
                    </span>
                    <span>·</span>
                    <span className="text-amber-300 font-semibold flex items-center gap-1">
                      <span aria-hidden="true">⚔️</span> {data.quests.active} Active Quest{data.quests.active !== 1 ? 's' : ''}
                    </span>
                    <span>·</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span aria-hidden="true">🏆</span> {data.quests.completed} Fulfilled
                    </span>
                  </div>
                </div>

                {/* Quick Actions Header */}
                <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold font-display uppercase tracking-wider bg-rpg-gradient-gold text-rpg-bg hover:brightness-110 shadow-rpg-gold active:scale-95 transition-all"
                  >
                    <span aria-hidden="true">➕</span> New Quest
                  </button>
                  <Link
                    to="/quests"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-rpg-surface-2 border border-rpg-border hover:border-amber-500/40 text-rpg-text hover:text-amber-300 active:scale-95 transition-all"
                  >
                    <span aria-hidden="true">📜</span> Quest Board
                  </Link>
                  <Link
                    to="/rpg"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-rpg-surface-2 border border-rpg-border hover:border-amber-500/40 text-rpg-text hover:text-amber-300 active:scale-95 transition-all"
                  >
                    <span aria-hidden="true">✦</span> Character Sheet
                  </Link>
                </div>
              </div>
            </header>

            {/* ── 2. Top Progress & Treasury Section ──────────────────────── */}
            <section aria-label="Adventurer Progression & Treasury" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-1">
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
              <div className="lg:col-span-1">
                <GoldBalanceCard
                  goldBalance={data.player.goldBalance}
                  onViewHistory={() => navigate('/rpg')}
                />
              </div>
              <div className="lg:col-span-1">
                <AttributesCard attributes={data.attributes} />
              </div>
            </section>

            {/* ── 3. Quest Metrics Summary Cards ──────────────────────────── */}
            <section aria-label="Quest Metrics Overview">
              <QuestSummaryCards summary={data.quests} />
            </section>

            {/* ── 4. Main Operations Grid ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Active Quests & Completed */}
              <div className="lg:col-span-2 space-y-6">
                <ActiveQuestsSection
                  quests={data.activeQuests}
                  onComplete={handleCompleteQuest}
                  onOpenCreate={() => setIsCreateModalOpen(true)}
                  completingId={completingId}
                />

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
                      {data.recentlyCompletedQuests.map((q) => (
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

              {/* Right 1 Col: Recent Activity & Quick Shortcuts */}
              <div className="space-y-6">
                <RecentActivitySection activities={data.recentActivity} />

                {/* Quick Navigation Directory */}
                <nav
                  aria-label="Realm Directory Quick Navigation"
                  className="bg-rpg-surface/90 backdrop-blur-sm border border-rpg-border rounded-xl p-6 shadow-sm"
                >
                  <h3 className="font-display text-base font-bold text-rpg-text mb-3 flex items-center gap-2">
                    <span aria-hidden="true" className="text-amber-400">🧭</span> Realm Directory
                  </h3>
                  <div className="space-y-2">
                    <Link
                      to="/quests"
                      className="group flex items-center justify-between p-2.5 rounded-lg bg-rpg-surface-2/60 hover:bg-rpg-surface-2 border border-transparent hover:border-rpg-border transition-all text-xs font-semibold text-rpg-text hover:text-amber-300"
                    >
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true">📜</span> Quest Board Full View
                      </span>
                      <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                    </Link>
                    <Link
                      to="/rpg"
                      className="group flex items-center justify-between p-2.5 rounded-lg bg-rpg-surface-2/60 hover:bg-rpg-surface-2 border border-transparent hover:border-rpg-border transition-all text-xs font-semibold text-rpg-text hover:text-amber-300"
                    >
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true">🪙</span> Treasury & Gold Ledger
                      </span>
                      <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                    </Link>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="w-full group flex items-center justify-between p-2.5 rounded-lg bg-rpg-surface-2/60 hover:bg-rpg-surface-2 border border-transparent hover:border-amber-500/30 transition-all text-xs font-semibold text-amber-300 text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true">➕</span> Forge New Quest
                      </span>
                      <span className="transition-transform group-hover:scale-125" aria-hidden="true">+</span>
                    </button>
                  </div>
                </nav>
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
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg border text-sm font-semibold flex items-center gap-2 backdrop-blur-md animate-fade-in ${
              toast.type === 'success'
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
