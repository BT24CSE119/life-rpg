import React from 'react';
import type { DashboardQuestsSummary } from '../types';

interface QuestSummaryCardsProps {
  summary: DashboardQuestsSummary;
}

const QuestSummaryCards: React.FC<QuestSummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      label: 'Total Quests',
      value: summary.total,
      icon: '📜',
      subtext: 'Created goals',
      color: 'text-rpg-text',
      border: 'border-rpg-border',
    },
    {
      label: 'Active Quests',
      value: summary.active,
      icon: '⚔️',
      subtext: `${summary.todo} Todo · ${summary.inProgress} In Progress`,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    {
      label: 'Completed',
      value: summary.completed,
      icon: '✅',
      subtext: 'Victories claimed',
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Completion Rate',
      value: `${summary.completionPercentage}%`,
      icon: '🏆',
      subtext: `${summary.completed} of ${summary.total} quests finished`,
      color: 'text-rpg-gold',
      border: 'border-rpg-gold/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-rpg-surface border ${card.border} rounded-rpg-lg p-4 flex flex-col justify-between hover:border-rpg-gold/40 transition-all`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rpg-text-muted">
              {card.label}
            </span>
            <span className="text-lg" aria-hidden="true">
              {card.icon}
            </span>
          </div>
          <div>
            <span className={`font-display text-2xl sm:text-3xl font-bold font-mono ${card.color}`}>
              {card.value}
            </span>
            <p className="text-[11px] text-rpg-text-muted mt-1 truncate">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestSummaryCards;
