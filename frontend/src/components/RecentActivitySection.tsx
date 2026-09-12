import React from 'react';
import type { DashboardActivityItem } from '../types';

interface RecentActivitySectionProps {
  activities: DashboardActivityItem[];
}

const formatTimeAgo = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TYPE_STYLES = {
  QUEST_COMPLETED: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    label: 'Quest Completed',
  },
  XP_EARNED: {
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    label: 'XP Gained',
  },
  GOLD_EARNED: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    label: 'Gold Reward',
  },
};

const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({ activities }) => {
  return (
    <section className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-rpg-text flex items-center gap-2">
            <span>📜</span> Recent Activity
          </h2>
          <p className="text-xs text-rpg-text-muted mt-0.5">
            Your real-time adventurer event ledger
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-rpg-text-muted text-sm">
          <p className="font-medium text-rpg-text">No activity recorded yet</p>
          <p className="text-xs text-rpg-text-muted mt-1">
            Completed quests and reward transactions will appear here in chronological order.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-rpg-border">
          {activities.map((item) => {
            const style = TYPE_STYLES[item.type] || {
              badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
              label: item.type,
            };

            return (
              <li
                key={item.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-rpg-surface-2/30 px-2 rounded-rpg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-rpg bg-rpg-surface-2 border border-rpg-border flex items-center justify-center text-sm shrink-0"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-rpg-text truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full border ${style.badge}`}
                      >
                        {style.label}
                      </span>
                      {item.balanceAfter !== undefined && (
                        <span className="text-[10px] text-rpg-gold font-mono">
                          Balance: {item.balanceAfter}g
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-rpg-text-muted shrink-0">
                  {formatTimeAgo(item.timestamp)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default RecentActivitySection;
