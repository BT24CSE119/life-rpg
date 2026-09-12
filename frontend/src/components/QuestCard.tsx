import React from 'react';
import type { Quest } from '../types';

// ── Badge Helpers ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  TODO:        { label: 'To Do',       bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30', icon: '📝' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-500/15',  text: 'text-blue-400',  border: 'border-blue-500/30',  icon: '⚔️' },
  ACTIVE:    { label: 'Active',    bg: 'bg-blue-500/15', text: 'text-blue-400',    border: 'border-blue-500/30',    icon: '⚔️' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: '✅' },
  FAILED:    { label: 'Failed',    bg: 'bg-red-500/15', text: 'text-red-400',      border: 'border-red-500/30',      icon: '❌' },
  ABANDONED: { label: 'Abandoned', bg: 'bg-gray-500/15', text: 'text-gray-400',    border: 'border-gray-500/30',     icon: '🏳️' },
} as const;

const PRIORITY_CONFIG = {
  LOW:    { label: 'Low',    bg: 'bg-slate-500/15', text: 'text-slate-400',  border: 'border-slate-500/30',  icon: '🟢' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-500/15', text: 'text-amber-400',  border: 'border-amber-500/30',  icon: '🟡' },
  HIGH:   { label: 'High',   bg: 'bg-red-500/15',   text: 'text-red-400',    border: 'border-red-500/30',    icon: '🔴' },
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
  const status = STATUS_CONFIG[quest.status];
  const priority = PRIORITY_CONFIG[quest.priority];
  const overdue = isOverdue(quest.dueDate, quest.status);
  const isComplete = quest.status === 'COMPLETED';

  return (
    <div
      className={`group relative bg-rpg-surface border rounded-rpg-lg p-5 transition-all duration-200 hover:shadow-rpg-card ${
        isComplete
          ? 'border-emerald-500/20 opacity-80'
          : overdue
            ? 'border-red-500/30'
            : 'border-rpg-border hover:border-rpg-border-2'
      }`}
    >
      {/* Top row: badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}
        >
          <span aria-hidden="true">{status.icon}</span>
          {status.label}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${priority.bg} ${priority.text} border ${priority.border}`}
        >
          <span aria-hidden="true">{priority.icon}</span>
          {priority.label}
        </span>
        {overdue && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/40">
            ⏰ Overdue
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        className={`font-display text-lg font-bold mb-1.5 ${
          isComplete ? 'text-rpg-text-muted line-through' : 'text-rpg-text'
        }`}
      >
        {quest.title}
      </h3>

      {/* Description */}
      {quest.description && (
        <p className="text-rpg-text-muted text-sm mb-3 line-clamp-2">
          {quest.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-rpg-text-faint mb-4 flex-wrap">
        {quest.dueDate && (
          <span className={`flex items-center gap-1 ${overdue ? 'text-red-400' : ''}`}>
            📅 Due: {formatDate(quest.dueDate)}
          </span>
        )}
        {quest.completedAt && (
          <span className="flex items-center gap-1 text-emerald-400">
            ✅ {formatDate(quest.completedAt)}
          </span>
        )}
        <span className="flex items-center gap-1">
          🕐 Created: {formatDate(quest.createdAt)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {!isComplete && (
          <button
            onClick={() => onComplete(quest)}
            disabled={isCompleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-rpg-sm bg-rpg-emerald/15 text-emerald-400 border border-emerald-500/30 hover:bg-rpg-emerald/25 hover:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompleting ? (
              <span className="animate-spin" aria-hidden="true">⚙️</span>
            ) : (
              <span aria-hidden="true">✓</span>
            )}
            {isCompleting ? 'Completing…' : 'Complete'}
          </button>
        )}

        <button
          onClick={() => onEdit(quest)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-rpg-sm bg-rpg-surface-2 text-rpg-text-muted border border-rpg-border hover:bg-rpg-surface-3 hover:text-rpg-text transition-all"
        >
          ✏️ Edit
        </button>

        <button
          onClick={() => onDelete(quest)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-rpg-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default QuestCard;
