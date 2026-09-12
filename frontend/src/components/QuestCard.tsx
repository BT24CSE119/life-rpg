import React from 'react';
import type { Quest, QuestPriority } from '../types';

// ── Reward Helpers (mirrored from backend server values) ───────────────────────

const PRIORITY_REWARDS: Record<QuestPriority, { xp: number; gold: number }> = {
  LOW:    { xp: 10, gold: 5 },
  MEDIUM: { xp: 25, gold: 15 },
  HIGH:   { xp: 50, gold: 30 },
};

// ── Badge Helpers ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  TODO:        { label: 'To Do',       bg: 'bg-slate-800/80',    text: 'text-slate-300',    border: 'border-slate-600/50',   icon: '📜' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-950/80',     text: 'text-blue-300',     border: 'border-blue-500/40',    icon: '⚔️' },
  ACTIVE:      { label: 'Active',      bg: 'bg-blue-950/80',     text: 'text-blue-300',     border: 'border-blue-500/40',    icon: '⚔️' },
  COMPLETED:   { label: 'Completed',   bg: 'bg-emerald-950/80',  text: 'text-emerald-300',  border: 'border-emerald-500/40', icon: '🏆' },
  FAILED:      { label: 'Failed',      bg: 'bg-red-950/80',      text: 'text-red-300',      border: 'border-red-500/40',     icon: '💀' },
  ABANDONED:   { label: 'Abandoned',   bg: 'bg-stone-900/80',    text: 'text-stone-400',    border: 'border-stone-600/40',   icon: '🏳️' },
} as const;

const PRIORITY_CONFIG = {
  LOW:    { label: 'Low Tier',    bg: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30', icon: '🟢', seal: 'Low' },
  MEDIUM: { label: 'Standard',    bg: 'bg-amber-950/40 text-amber-300 border-amber-500/30',       icon: '🟡', seal: 'Med' },
  HIGH:   { label: 'Epic Bounty', bg: 'bg-red-950/50 text-red-300 border-red-500/50',           icon: '🔥', seal: 'High' },
} as const;

// ── Date Helpers ──────────────────────────────────────────────────────────────

const formatDate = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isOverdue = (dueDate: string | null, status: string): boolean => {
  if (!dueDate || status === 'COMPLETED') return false;
  return new Date(dueDate) < new Date();
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface QuestCardProps {
  quest: Quest;
  onEdit: (quest: Quest) => void;
  onDelete: (quest: Quest) => void;
  onComplete: (quest: Quest) => void;
  isCompleting?: boolean;
}

const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onEdit,
  onDelete,
  onComplete,
  isCompleting = false,
}) => {
  const status = STATUS_CONFIG[quest.status] || STATUS_CONFIG.TODO;
  const priority = PRIORITY_CONFIG[quest.priority] || PRIORITY_CONFIG.MEDIUM;
  const rewards = PRIORITY_REWARDS[quest.priority] || PRIORITY_REWARDS.MEDIUM;
  const overdue = isOverdue(quest.dueDate, quest.status);
  const isComplete = quest.status === 'COMPLETED';

  return (
    <article
      aria-label={`Quest: ${quest.title}`}
      className={`group relative bg-rpg-surface/90 backdrop-blur-sm border rounded-xl p-5 transition-all duration-300 ${
        isComplete
          ? 'border-emerald-500/20 bg-emerald-950/10 opacity-80'
          : overdue
            ? 'border-red-500/40 shadow-red-950/20 shadow-lg hover:border-red-400'
            : 'border-rpg-border hover:border-rpg-amber/40 hover:shadow-rpg-glow hover:-translate-y-0.5'
      }`}
    >
      {/* Fantasy parchment background accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-purple-500/[0.03] rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Top row: Badges and Rewards */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.bg} ${status.text} border ${status.border}`}
          >
            <span aria-hidden="true">{status.icon}</span>
            {status.label}
          </span>

          {/* Priority Seal */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${priority.bg}`}
          >
            <span aria-hidden="true">{priority.icon}</span>
            {priority.label}
          </span>

          {/* Overdue Warning */}
          {overdue && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/70 text-red-300 border border-red-500/50 animate-pulse">
              ⏰ Overdue
            </span>
          )}
        </div>

        {/* Reward Chips */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300"
            title={`Awards ${rewards.xp} XP upon completion`}
          >
            <span aria-hidden="true">⚡</span>
            +{rewards.xp} XP
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300"
            title={`Awards ${rewards.gold} Gold upon completion`}
          >
            <span aria-hidden="true">🪙</span>
            +{rewards.gold} G
          </span>
        </div>
      </div>

      {/* Title */}
      <h3
        className={`font-display text-lg font-bold mb-1.5 transition-colors ${
          isComplete
            ? 'text-rpg-text-muted line-through'
            : 'text-rpg-text group-hover:text-amber-200'
        }`}
      >
        {quest.title}
      </h3>

      {/* Description */}
      {quest.description && (
        <p className="text-rpg-text-muted text-sm mb-3 line-clamp-2 leading-relaxed">
          {quest.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-rpg-text-faint mb-4 flex-wrap">
        {quest.dueDate && (
          <span className={`flex items-center gap-1 font-medium ${overdue ? 'text-red-400 font-semibold' : ''}`}>
            📅 Due: {formatDate(quest.dueDate)}
          </span>
        )}
        {quest.completedAt && (
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            ✅ Completed: {formatDate(quest.completedAt)}
          </span>
        )}
        <span className="flex items-center gap-1">
          📜 Added: {formatDate(quest.createdAt)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-rpg-border/40 flex-wrap">
        {!isComplete && (
          <button
            onClick={() => onComplete(quest)}
            disabled={isCompleting}
            aria-label={`Complete quest: ${quest.title}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-rpg-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isCompleting ? (
              <span className="animate-spin inline-block mr-1" aria-hidden="true">⏳</span>
            ) : (
              <span aria-hidden="true">⚔️</span>
            )}
            {isCompleting ? 'Fulfilling…' : 'Complete Quest'}
          </button>
        )}

        <button
          onClick={() => onEdit(quest)}
          aria-label={`Edit quest: ${quest.title}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-rpg-surface-2 text-rpg-text-muted border border-rpg-border hover:bg-rpg-surface-3 hover:text-rpg-text hover:border-rpg-border-2 transition-all active:scale-95"
        >
          <span aria-hidden="true">✏️</span> Edit
        </button>

        <button
          onClick={() => onDelete(quest)}
          aria-label={`Delete quest: ${quest.title}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-900/30 hover:border-red-500/40 transition-all active:scale-95 ml-auto"
        >
          <span aria-hidden="true">🗑️</span> Delete
        </button>
      </div>
    </article>
  );
};

export default QuestCard;
