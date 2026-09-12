import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Quest, QuestStatusType, QuestPriority, CreateQuestInput, UpdateQuestInput, RpgProfile } from '../types';
import {
  getQuests as fetchQuests,
  createQuest,
  updateQuest,
  deleteQuest,
  completeQuest,
} from '../services/quest';
import QuestCard from '../components/QuestCard';
import QuestFormModal from '../components/QuestFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import RpgProgressCard from '../components/RpgProgressCard';
import LevelUpModal from '../components/LevelUpModal';
import FloatingReward, { FloatingRewardItem } from '../components/FloatingReward';
import { getRpgProfile } from '../services/rpg';
import { useRpg } from '../context/RpgContext';

// ── Filter Configs ────────────────────────────────────────────────────────────

const STATUS_FILTERS: { value: QuestStatusType | 'ALL'; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'ABANDONED', label: 'Abandoned' },
];

const PRIORITY_FILTERS: { value: QuestPriority | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

// ── Toast ─────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;

// ── Page Component ────────────────────────────────────────────────────────────

const QuestBoardPage: React.FC = () => {
  // Quest data
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<RpgProfile | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<QuestStatusType | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<QuestPriority | 'ALL'>('ALL');

  // Instant in-memory filtered quests: zero skeleton wireframe delay when switching tabs
  const filteredQuests = useMemo(() => {
    return quests.filter((q) => {
      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ACTIVE'
          ? q.status === 'ACTIVE' || q.status === 'IN_PROGRESS'
          : q.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || q.priority === priorityFilter;
      return matchStatus && matchPriority;
    });
  }, [quests, statusFilter, priorityFilter]);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [deletingQuest, setDeletingQuest] = useState<Quest | null>(null);

  // Action loading
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  // ── Helpers ───────────────────────────────────────────────────────────────

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // ── Fetch Quests ──────────────────────────────────────────────────────────

  const loadQuests = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setIsLoading(true);
    setError(null);
    try {
      // Fetch all quests and cache them so tab switching is instant
      const data = await fetchQuests();
      setQuests(data);
    } catch (err) {
      const e = err as Error;
      setError(e.message ?? 'Failed to load quests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only show the skeleton wireframe on initial page load
    loadQuests(true);
  }, [loadQuests]);

  useEffect(() => {
    getRpgProfile().then(setProfile).catch(() => undefined);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea, or select
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingQuest(null);
        setIsFormOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Create ────────────────────────────────────────────────────────────────

  const handleCreate = () => {
    setEditingQuest(null);
    setIsFormOpen(true);
  };

  // ── Edit ──────────────────────────────────────────────────────────────────

  const handleEdit = (quest: Quest) => {
    setEditingQuest(quest);
    setIsFormOpen(true);
  };

  // ── Form Submit (create or edit) ──────────────────────────────────────────

  const handleFormSubmit = async (data: CreateQuestInput | UpdateQuestInput) => {
    setFormLoading(true);
    try {
      if (editingQuest) {
        const updated = await updateQuest(editingQuest.id, data as UpdateQuestInput);
        setQuests((prev) =>
          prev.map((q) => (q.id === updated.id ? updated : q))
        );
        addToast('Quest updated successfully', 'success');
      } else {
        const created = await createQuest(data as CreateQuestInput);
        setQuests((prev) => [created, ...prev]);
        addToast('Quest created successfully', 'success');
      }
      setIsFormOpen(false);
      setEditingQuest(null);
    } catch (err) {
      const e = err as Error;
      addToast(e.message ?? 'Operation failed', 'error');
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deletingQuest) return;
    setDeleteLoading(true);
    try {
      await deleteQuest(deletingQuest.id);
      setQuests((prev) => prev.filter((q) => q.id !== deletingQuest.id));
      addToast('Quest deleted successfully', 'success');
      setDeletingQuest(null);
    } catch (err) {
      const e = err as Error;
      addToast(e.message ?? 'Failed to delete quest', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const { setGoldBalance } = useRpg();

  // ── Complete ──────────────────────────────────────────────────────────────

  const handleComplete = async (quest: Quest) => {
    setCompletingId(quest.id);

    // Instant optimistic calculation
    const optimisticGold = quest.priority === 'HIGH' ? 50 : quest.priority === 'MEDIUM' ? 30 : 15;
    const optimisticXp = quest.priority === 'HIGH' ? 80 : quest.priority === 'MEDIUM' ? 50 : 25;
    const attrName = (quest.category || 'Strength').toLowerCase();
    const formattedAttrName = attrName.charAt(0).toUpperCase() + attrName.slice(1);
    const attrBonus = quest.priority === 'HIGH' ? 2 : 1;

    // Instant floating reward with attribute bonus
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

    // Optimistically mark quest completed on the board & update gold
    setGoldBalance((prev) => (prev !== null ? prev + optimisticGold : prev));
    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, status: 'COMPLETED' as const } : q))
    );

    try {
      const completed = await completeQuest(quest.id);
      setQuests((prev) =>
        prev.map((q) => (q.id === completed.quest.id ? completed.quest : q))
      );
      if (!completed.duplicateCompletion) {
        if (completed.progression.levelUp) {
          setLevelUpData({
            isOpen: true,
            newLevel: completed.progression.newLevel,
            xpEarned: completed.reward.xpAwarded,
            goldEarned: completed.reward.goldAwarded,
          });
        } else {
          const statText = completed.reward.attributeGained
            ? ` · +${completed.reward.attributeGained.amount} ${completed.reward.attributeGained.attribute.toUpperCase()}`
            : '';
          addToast(
            `+${completed.reward.xpAwarded} XP · +${completed.reward.goldAwarded} Gold${statText}`,
            'success'
          );
        }
        getRpgProfile().then(setProfile).catch(() => undefined);
      } else {
        addToast('Quest was already completed', 'info');
      }
    } catch (err) {
      const e = err as Error;
      addToast(e.message ?? 'Failed to complete quest', 'error');
      // Re-fetch on error to revert state
      loadQuests();
    } finally {
      setCompletingId(null);
    }
  };

  // ── 1-Click Status Change (e.g. To Do -> In Progress) ──────────────────────
  const handleStatusChange = async (quest: Quest, newStatus: Quest['status']) => {
    // Optimistic UI update
    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, status: newStatus } : q))
    );

    const statusLabels: Record<string, string> = {
      IN_PROGRESS: 'Quest started: In Progress',
      TODO: 'Quest paused: moved to To Do',
      ACTIVE: 'Quest set to Active',
    };
    addToast(statusLabels[newStatus] || `Quest status updated to ${newStatus}`, 'info');

    try {
      const updated = await updateQuest(quest.id, { status: newStatus as any });
      setQuests((prev) =>
        prev.map((q) => (q.id === updated.id ? updated : q))
      );
    } catch (err) {
      const e = err as Error;
      addToast(e.message ?? 'Failed to update quest status', 'error');
      loadQuests();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-rpg-text mb-1">
              Quest Board
            </h1>
            <p className="text-rpg-text-muted text-sm">
              Turn your real-life goals into completed quests and claim server-verified XP and Gold.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-rpg-bg bg-rpg-gradient-gold hover:brightness-105 active:scale-95 transition-all shadow-sm border border-amber-500/40"
            title="Create a new quest (Shortcut: N)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Quest</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-black/20 text-rpg-bg border border-black/10">
              N
            </kbd>
          </button>
        </div>

        {profile && <div className="mb-6"><RpgProgressCard profile={profile} compact /></div>}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Status filter */}
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  statusFilter === f.value
                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-rpg-surface text-rpg-text-muted border-rpg-border hover:border-rpg-border-2'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex gap-1.5 flex-wrap sm:ml-auto">
            {PRIORITY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setPriorityFilter(f.value)}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  priorityFilter === f.value
                    ? 'bg-purple-950/60 text-purple-300 border-purple-500/40 shadow-sm'
                    : 'bg-rpg-surface text-rpg-text-muted border-rpg-border hover:border-rpg-border-2'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading && quests.length === 0 ? (
          // Loading state (only shown on initial load if no quests are cached yet)
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-rpg-surface border border-rpg-border rounded-xl p-5 h-44"
              >
                <div className="h-4 bg-rpg-border rounded w-3/4 mb-3" />
                <div className="h-3 bg-rpg-border rounded w-1/2 mb-6" />
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-rpg-border rounded w-20" />
                  <div className="h-6 bg-rpg-border rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-16 bg-rpg-surface border border-rpg-border rounded-xl">
            <svg className="w-12 h-12 text-red-400/70 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 className="font-display text-xl font-bold text-rpg-text mb-2">
              Something went wrong
            </h2>
            <p className="text-rpg-text-muted text-sm mb-6 max-w-sm mx-auto">
              {error}
            </p>
            <button
              onClick={() => loadQuests(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-rpg-bg bg-rpg-gradient-gold hover:brightness-110 transition-all active:scale-95"
            >
              Retry
            </button>
          </div>
        ) : filteredQuests.length === 0 ? (
          // Empty state
          <div className="text-center py-16 bg-rpg-surface border border-rpg-border rounded-xl">
            <svg className="w-12 h-12 text-amber-400/50 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h2 className="font-display text-xl font-bold text-rpg-text mb-2">
              {quests.length === 0 ? 'No quests yet' : 'No matching quests'}
            </h2>
            <p className="text-rpg-text-muted text-sm mb-6 max-w-sm mx-auto">
              {quests.length === 0
                ? 'Create your first quest and begin your journey.'
                : 'No quests found for the selected filter.'}
            </p>
            {quests.length === 0 ? (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-rpg-bg bg-rpg-gradient-gold hover:brightness-105 transition-all shadow-sm border border-amber-500/40 active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create Your First Quest
              </button>
            ) : (
              <button
                onClick={() => { setStatusFilter('ALL'); setPriorityFilter('ALL'); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-rpg-accent border border-rpg-accent/30 hover:bg-rpg-accent/10 transition-all"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          // Quest grid
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onEdit={handleEdit}
                onDelete={(q) => setDeletingQuest(q)}
                onComplete={handleComplete}
                onStatusChange={handleStatusChange}
                isCompleting={completingId === quest.id}
              />
            ))}
          </div>
        )}

        {/* Quest count */}
        {!isLoading && !error && filteredQuests.length > 0 && (
          <p className="text-center text-xs text-rpg-text-faint mt-6">
            Showing {filteredQuests.length} quest{filteredQuests.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Create/Edit Modal */}
      <QuestFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingQuest(null); }}
        onSubmit={handleFormSubmit}
        quest={editingQuest}
        isLoading={formLoading}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingQuest}
        title={deletingQuest?.title ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingQuest(null)}
        isLoading={deleteLoading}
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

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-2 backdrop-blur-md animate-fade-in ${
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

export default QuestBoardPage;
