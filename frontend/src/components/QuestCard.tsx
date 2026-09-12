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
  TODO:        { label: 'To Do',       bg: 'bg-slate-800/80',    text: 'text-slate-300',    border: 'border-slate-600/50' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-950/80',     text: 'text-blue-300',     border: 'border-blue-500/40' },
  ACTIVE:      { label: 'Active',      bg: 'bg-blue-950/80',     text: 'text-blue-300',     border: 'border-blue-500/40' },
  COMPLETED:   { label: 'Completed',   bg: 'bg-emerald-950/80',  text: 'text-emerald-300',  border: 'border-emerald-500/40' },
  FAILED:      { label: 'Failed',      bg: 'bg-red-950/80',      text: 'text-red-300',      border: 'border-red-500/40' },
  ABANDONED:   { label: 'Abandoned',   bg: 'bg-stone-900/80',    text: 'text-stone-400',    border: 'border-stone-600/40' },
} as const;

const PRIORITY_CONFIG = {
  LOW:    { label: 'Low Tier',    bg: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30', seal: 'Low' },
  MEDIUM: { label: 'Standard',    bg: 'bg-amber-950/40 text-amber-300 border-amber-500/30',       seal: 'Med' },
  HIGH:   { label: 'Epic Bounty', bg: 'bg-red-950/50 text-red-300 border-red-500/50',           seal: 'High' },
} as const;

const CATEGORY_CONFIG: Record<string, { label: string; stat: string; bg: string; text: string; border: string }> = {
  STRENGTH:     { label: 'Strength',     stat: '+1 STR', bg: 'bg-red-950/40',     text: 'text-red-300',     border: 'border-red-500/30' },
  INTELLIGENCE: { label: 'Intelligence', stat: '+1 INT', bg: 'bg-blue-950/40',    text: 'text-blue-300',    border: 'border-blue-500/30' },
  DISCIPLINE:   { label: 'Discipline',   stat: '+1 DIS', bg: 'bg-amber-950/40',   text: 'text-amber-300',   border: 'border-amber-500/30' },
  STAMINA:      { label: 'Stamina',      stat: '+1 STA', bg: 'bg-emerald-950/40', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  CONSISTENCY:  { label: 'Consistency',  stat: '+1 CON', bg: 'bg-purple-950/40',  text: 'text-purple-300',  border: 'border-purple-500/30' },
};

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
  onStatusChange?: (quest: Quest, newStatus: Quest['status']) => void;
  isCompleting?: boolean;
}

const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onEdit,
  onDelete,
  onComplete,
  onStatusChange,
  isCompleting = false,
}) => {
  const status = STATUS_CONFIG[quest.status] || STATUS_CONFIG.TODO;
  const priority = PRIORITY_CONFIG[quest.priority] || PRIORITY_CONFIG.MEDIUM;
  const rewards = PRIORITY_REWARDS[quest.priority] || PRIORITY_REWARDS.MEDIUM;
  const categoryKey = (quest.category || 'STRENGTH').toUpperCase();
  const categoryInfo = CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG.STRENGTH;
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
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.bg} ${status.text} border ${status.border}`}
          >
            {status.label}
          </span>

          {/* Character Stat Focus Badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${categoryInfo.bg} ${categoryInfo.text} ${categoryInfo.border}`}
            title={`Focusing this quest levels up ${categoryInfo.label}`}
          >
            {categoryInfo.stat}
          </span>

          {/* Priority Seal */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priority.bg}`}
          >
            {priority.label}
          </span>

          {/* Overdue Warning */}
          {overdue && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/70 text-red-300 border border-red-500/50 animate-pulse">
              <svg className="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Overdue
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
          <span className={`flex items-center gap-1.5 font-medium ${overdue ? 'text-red-400 font-semibold' : ''}`}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Due: {formatDate(quest.dueDate)}
          </span>
        )}
        {quest.completedAt && (
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Completed: {formatDate(quest.completedAt)}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Added: {formatDate(quest.createdAt)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-rpg-border/40 flex-wrap">
        {/* Quick status transition: Start Quest (TODO -> IN_PROGRESS) */}
        {!isComplete && quest.status === 'TODO' && onStatusChange && (
          <button
            onClick={() => onStatusChange(quest, 'IN_PROGRESS')}
            aria-label={`Start quest: ${quest.title}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Quest
          </button>
        )}

        {/* Quick status transition: Pause Quest (IN_PROGRESS/ACTIVE -> TODO) */}
        {!isComplete && (quest.status === 'IN_PROGRESS' || quest.status === 'ACTIVE') && onStatusChange && (
          <button
            onClick={() => onStatusChange(quest, 'TODO')}
            aria-label={`Pause quest: ${quest.title}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-rpg-surface-2 text-rpg-text-muted hover:text-amber-300 border border-rpg-border transition-all active:scale-95"
            title="Move back to To Do"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            Pause
          </button>
        )}

        {!isComplete && (
          <button
            onClick={() => onComplete(quest)}
            disabled={isCompleting}
            aria-label={`Complete quest: ${quest.title}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-rpg-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isCompleting ? (
              <svg className="w-3.5 h-3.5 animate-spin mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {isCompleting ? 'Fulfilling…' : 'Complete Quest'}
          </button>
        )}

        <button
          onClick={() => onEdit(quest)}
          aria-label={`Edit quest: ${quest.title}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rpg-surface-2 text-rpg-text-muted border border-rpg-border hover:bg-rpg-surface-3 hover:text-rpg-text hover:border-rpg-border-2 transition-all active:scale-95"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>

        <button
          onClick={() => onDelete(quest)}
          aria-label={`Delete quest: ${quest.title}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-900/30 hover:border-red-500/40 transition-all active:scale-95 ml-auto"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Delete
        </button>
      </div>
    </article>
  );
};

export default QuestCard;
