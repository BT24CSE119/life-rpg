import React from 'react';
import type { PreviewQuest, QuestDifficulty } from '../types';
import RPGCard from './RPGCard';
import GoldBadge from './GoldBadge';

interface QuestPreviewCardProps {
  quest: PreviewQuest;
  className?: string;
  onComplete?: (id: string) => void;
}

const DIFFICULTY_CONFIG: Record<
  QuestDifficulty,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  TRIVIAL:   { label: 'Trivial',   color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', icon: '🌱' },
  EASY:      { label: 'Easy',      color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  icon: '⚔️' },
  MEDIUM:    { label: 'Medium',    color: '#F5C842', bg: 'rgba(245,200,66,0.1)',  border: 'rgba(245,200,66,0.3)',  icon: '🗡️' },
  HARD:      { label: 'Hard',      color: '#F97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  icon: '🔥' },
  EPIC:      { label: 'Epic',      color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)', icon: '⚡' },
  LEGENDARY: { label: 'Legendary', color: '#EC4899', bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.3)',  icon: '🌟' },
};

const STATUS_CONFIG = {
  ACTIVE:    { label: 'Active',    dot: '#10B981' },
  COMPLETED: { label: 'Completed', dot: '#F5C842' },
  FAILED:    { label: 'Failed',    dot: '#EF4444' },
  ABANDONED: { label: 'Abandoned', dot: '#94A3B8' },
};

const QuestPreviewCard: React.FC<QuestPreviewCardProps> = ({
  quest,
  className = '',
  onComplete,
}) => {
  const diff = DIFFICULTY_CONFIG[quest.difficulty];
  const status = STATUS_CONFIG[quest.status];

  return (
    <RPGCard
      variant="default"
      hoverable={!!onComplete}
      className={`relative overflow-hidden ${className}`}
      padding="none"
    >
      {/* Difficulty accent bar on left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-rpg-lg"
        style={{ background: diff.color }}
        aria-hidden="true"
      />

      <div className="pl-5 pr-4 py-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            {/* Category */}
            {quest.category && (
              <span className="text-[10px] uppercase tracking-widest text-rpg-text-muted font-mono block mb-1">
                {quest.category}
              </span>
            )}
            {/* Title */}
            <h4 className="font-display text-sm text-rpg-text leading-snug">{quest.title}</h4>
          </div>

          {/* Difficulty badge */}
          <span
            className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border"
            style={{ color: diff.color, background: diff.bg, borderColor: diff.border }}
          >
            <span aria-hidden="true">{diff.icon}</span>
            {diff.label}
          </span>
        </div>

        {/* Description */}
        {quest.description && (
          <p className="text-xs text-rpg-text-muted leading-relaxed mb-3 line-clamp-2">
            {quest.description}
          </p>
        )}

        {/* Bottom row — rewards + status */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-rpg-border/50">
          <div className="flex items-center gap-2">
            {/* XP Reward */}
            <span className="inline-flex items-center gap-1 text-xs text-rpg-arcane-light font-mono">
              <span aria-hidden="true">✨</span>
              +{quest.xpReward} XP
            </span>
            <GoldBadge amount={quest.goldReward} size="sm" />
          </div>

          {/* Status */}
          <span className="inline-flex items-center gap-1.5 text-xs text-rpg-text-muted">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: status.dot }}
              aria-hidden="true"
            />
            {status.label}
          </span>
        </div>
      </div>
    </RPGCard>
  );
};

export default QuestPreviewCard;
