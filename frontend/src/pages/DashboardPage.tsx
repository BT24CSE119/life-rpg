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

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & action states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

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
        addToast(
          `+${result.reward.xpAwarded} XP · +${result.reward.goldAwarded} Gold${
            result.progression.levelUp ? ` — LEVEL UP! Level ${result.progression.newLevel} 🌟` : ''
          }`,
          'success'
        );
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

  return (
    <div className="min-h-screen pt-20 pb-16">
      <PageContainer className="py-6">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-20 bg-rpg-surface rounded-rpg-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="h-56 bg-rpg-surface rounded-rpg-lg" />
              <div className="h-56 bg-rpg-surface rounded-rpg-lg" />
              <div className="h-56 bg-rpg-surface rounded-rpg-lg" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-rpg-surface rounded-rpg-lg" />
              ))}
            </div>
            <div className="h-80 bg-rpg-surface rounded-rpg-lg" />
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-20 bg-rpg-surface border border-rpg-border rounded-rpg-lg my-8 p-6">
            <span className="text-5xl block mb-3" aria-hidden="true">
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
              className="px-6 py-2.5 rounded-rpg bg-rpg-gradient-gold text-rpg-bg font-semibold hover:brightness-110 shadow-rpg-gold transition-all"
            >
              🔄 Reconnect to Realm
            </button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* ── 1. Personalized Header ───────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-rpg-border/60 pb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-rpg-gold font-semibold">
                  Adventurer Headquarters
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-rpg-text mt-0.5">
                  Welcome back, <span className="text-gold-gradient">{data.player.name}</span>
                </h1>
                <p className="text-xs sm:text-sm text-rpg-text-muted mt-1">
                  Level {data.player.level} Adventurer ·{' '}
                  <span className="text-rpg-gold font-medium">
                    {data.quests.active} active quest{data.quests.active !== 1 ? 's' : ''}
                  </span>{' '}
                  awaiting completion.
                </p>
              </div>

              {/* Quick Actions Header */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-rpg text-xs font-semibold bg-rpg-gradient-gold text-rpg-bg hover:brightness-110 shadow-rpg-gold active:scale-[0.98] transition-all"
                >
                  ➕ New Quest
                </button>
                <Link
                  to="/quests"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-rpg text-xs font-medium bg-rpg-surface border border-rpg-border hover:border-rpg-border-2 text-rpg-text hover:text-rpg-gold transition-all"
                >
                  📜 Quest Board
                </Link>
                <Link
                  to="/rpg"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-rpg text-xs font-medium bg-rpg-surface border border-rpg-border hover:border-rpg-border-2 text-rpg-text hover:text-rpg-gold transition-all"
                >
                  ✦ Character Sheet
                </Link>
              </div>
            </div>

            {/* ── 2. Top Progress & Treasury Section ──────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
            </div>

            {/* ── 3. Quest Metrics Summary Cards ──────────────────────────── */}
            <div>
              <QuestSummaryCards summary={data.quests} />
            </div>

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
                  <section className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display text-lg font-bold text-rpg-text flex items-center gap-2">
                        <span>🏆</span> Recent Accomplishments
                      </h2>
                      <span className="text-xs text-rpg-text-muted">
                        Latest {data.recentlyCompletedQuests.length} completed
                      </span>
                    </div>
                    <ul className="divide-y divide-rpg-border">
                      {data.recentlyCompletedQuests.map((q) => (
                        <li
                          key={q.id}
                          className="py-3 flex items-center justify-between gap-3 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-rpg-text truncate">
                              {q.title}
                            </p>
                            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                              <span>✓ Completed</span>
                              {q.completedAt && (
                                <span className="text-rpg-text-muted font-normal">
                                  · {new Date(q.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-xs font-mono font-semibold">
                            <span className="text-purple-400">+{q.xpReward} XP</span>
                            <span className="text-rpg-gold">+{q.goldReward}g</span>
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

                {/* Quick Navigation Card */}
                <div className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6">
                  <h3 className="font-display text-base font-bold text-rpg-text mb-3">
                    🧭 Realm Directory
                  </h3>
                  <div className="space-y-2">
                    <Link
                      to="/quests"
                      className="flex items-center justify-between p-2.5 rounded-rpg bg-rpg-surface-2 hover:bg-rpg-surface-3 transition-colors text-xs font-medium text-rpg-text"
                    >
                      <span className="flex items-center gap-2">
                        <span>📜</span> Quest Board Full View
                      </span>
                      <span>→</span>
                    </Link>
                    <Link
                      to="/rpg"
                      className="flex items-center justify-between p-2.5 rounded-rpg bg-rpg-surface-2 hover:bg-rpg-surface-3 transition-colors text-xs font-medium text-rpg-text"
                    >
                      <span className="flex items-center gap-2">
                        <span>🪙</span> Treasury & Gold Ledger
                      </span>
                      <span>→</span>
                    </Link>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="w-full flex items-center justify-between p-2.5 rounded-rpg bg-rpg-surface-2 hover:bg-rpg-surface-3 transition-colors text-xs font-medium text-rpg-gold text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span>➕</span> Create New Goal
                      </span>
                      <span>+</span>
                    </button>
                  </div>
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

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto px-4 py-3 rounded-rpg shadow-lg border text-sm font-medium animate-fade-in ${
              toast.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : toast.type === 'info'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/15 text-red-400 border-red-500/30'
            }`}
          >
            {toast.type === 'success' ? '✅' : toast.type === 'info' ? 'ℹ️' : '❌'}{' '}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
