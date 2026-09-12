import React, { useState, useEffect, useCallback } from 'react';
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
import { getRpgProfile } from '../services/rpg';

// ── Filter Configs ────────────────────────────────────────────────────────────

const STATUS_FILTERS: { value: QuestStatusType | 'ALL'; label: string; icon: string }[] = [
  { value: 'TODO', label: 'To Do', icon: '📝' },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: '⚔️' },
  { value: 'ALL',       label: 'All',         icon: '📋' },
  { value: 'ACTIVE',    label: 'Active',      icon: '⚔️' },
  { value: 'COMPLETED', label: 'Completed',   icon: '✅' },
  { value: 'FAILED',    label: 'Failed',      icon: '❌' },
  { value: 'ABANDONED', label: 'Abandoned',   icon: '🏳️' },
];

const PRIORITY_FILTERS: { value: QuestPriority | 'ALL'; label: string; icon: string }[] = [
  { value: 'ALL',    label: 'All',    icon: '🎯' },
  { value: 'HIGH',   label: 'High',   icon: '🔴' },
  { value: 'MEDIUM', label: 'Medium', icon: '🟡' },
  { value: 'LOW',    label: 'Low',    icon: '🟢' },
];

// ── Toast ─────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
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

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [deletingQuest, setDeletingQuest] = useState<Quest | null>(null);

  // Action loading
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // ── Fetch Quests ──────────────────────────────────────────────────────────

  const loadQuests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: { status?: QuestStatusType; priority?: QuestPriority } = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (priorityFilter !== 'ALL') filters.priority = priorityFilter;
      const data = await fetchQuests(filters);
      setQuests(data);
    } catch (err) {
      const e = err as Error;
      setError(e.message ?? 'Failed to load quests');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  useEffect(() => {
    getRpgProfile().then(setProfile).catch(() => undefined);
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
      throw err; // Let the form display the error too
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

  // ── Complete ──────────────────────────────────────────────────────────────

  const handleComplete = async (quest: Quest) => {
    setCompletingId(quest.id);
    try {
      const completed = await completeQuest(quest.id);
      setQuests((prev) =>
        prev.map((q) => (q.id === completed.quest.id ? completed.quest : q))
      );
      if (!completed.duplicateCompletion) {
        addToast(`+${completed.reward.xpAwarded} XP${completed.progression.levelUp ? ` — LEVEL UP! Level ${completed.progression.newLevel}` : ''}`, 'success');
        getRpgProfile().then(setProfile).catch(() => undefined);
      }
      addToast('Quest completed! 🎉', 'success');
    } catch (err) {
      const e = err as Error;
      addToast(e.message ?? 'Failed to complete quest', 'error');
    } finally {
      setCompletingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-rpg-text mb-1">
              📜 Quest Board
            </h1>
            <p className="text-rpg-text-muted text-sm">
              Turn your real-life goals into completed quests.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-rpg font-semibold text-rpg-bg bg-rpg-gradient-gold hover:brightness-110 active:scale-[0.98] transition-all shadow-rpg-gold"
          >
            ➕ New Quest
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
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-rpg-sm text-xs font-medium border transition-all ${
                  statusFilter === f.value
                    ? 'bg-rpg-gold/15 text-rpg-gold border-rpg-gold/40'
                    : 'bg-rpg-surface text-rpg-text-muted border-rpg-border hover:border-rpg-border-2'
                }`}
              >
                <span aria-hidden="true">{f.icon}</span>
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
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-rpg-sm text-xs font-medium border transition-all ${
                  priorityFilter === f.value
                    ? 'bg-rpg-arcane/15 text-rpg-arcane-light border-rpg-arcane/40'
                    : 'bg-rpg-surface text-rpg-text-muted border-rpg-border hover:border-rpg-border-2'
                }`}
              >
                <span aria-hidden="true">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          // Loading state
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-5 animate-pulse"
              >
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-16 bg-rpg-surface-3 rounded-full" />
                  <div className="h-5 w-14 bg-rpg-surface-3 rounded-full" />
                </div>
                <div className="h-5 w-3/4 bg-rpg-surface-3 rounded mb-2" />
                <div className="h-4 w-full bg-rpg-surface-3 rounded mb-1" />
                <div className="h-4 w-2/3 bg-rpg-surface-3 rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-7 w-20 bg-rpg-surface-3 rounded" />
                  <div className="h-7 w-14 bg-rpg-surface-3 rounded" />
                  <div className="h-7 w-16 bg-rpg-surface-3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-16">
            <div className="text-5xl mb-4" aria-hidden="true">💀</div>
            <h2 className="font-display text-xl font-bold text-rpg-text mb-2">
              Something went wrong
            </h2>
            <p className="text-rpg-text-muted text-sm mb-6 max-w-sm mx-auto">
              {error}
            </p>
            <button
              onClick={loadQuests}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-rpg font-semibold text-rpg-bg bg-rpg-gradient-gold hover:brightness-110 transition-all"
            >
              🔄 Retry
            </button>
          </div>
        ) : quests.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <div className="text-6xl mb-4" aria-hidden="true">📜</div>
            <h2 className="font-display text-xl font-bold text-rpg-text mb-2">
              No quests yet
            </h2>
            <p className="text-rpg-text-muted text-sm mb-6 max-w-sm mx-auto">
              Create your first quest and start your adventure.
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-rpg-lg font-semibold text-rpg-bg bg-rpg-gradient-gold hover:brightness-110 transition-all shadow-rpg-gold"
            >
              ⚔️ Create Your First Quest
            </button>
          </div>
        ) : (
          // Quest grid
          <div className="grid gap-4 sm:grid-cols-2">
            {quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onEdit={handleEdit}
                onDelete={(q) => setDeletingQuest(q)}
                onComplete={handleComplete}
                isCompleting={completingId === quest.id}
              />
            ))}
          </div>
        )}

        {/* Quest count */}
        {!isLoading && !error && quests.length > 0 && (
          <p className="text-center text-xs text-rpg-text-faint mt-6">
            Showing {quests.length} quest{quests.length !== 1 ? 's' : ''}
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

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto px-4 py-3 rounded-rpg shadow-lg border text-sm font-medium animate-fade-in ${
              toast.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/15 text-red-400 border-red-500/30'
            }`}
          >
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestBoardPage;
