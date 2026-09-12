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
    badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    iconBg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400',
    label: 'Quest Completed',
  },
  XP_EARNED: {
    badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
    iconBg: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400',
    label: 'XP Gained',
  },
  GOLD_EARNED: {
    badge: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    iconBg: 'bg-amber-950/40 border-amber-500/30 text-amber-400',
    label: 'Gold Reward',
  },
};

const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({ activities }) => {
  return (
    <section
      aria-label="Recent activity chronicle"
      className="bg-rpg-surface/90 backdrop-blur-sm border border-rpg-border rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-rpg-border/40">
        <div>
          <h2 className="font-display text-xl font-bold text-rpg-text flex items-center gap-2">
            <span aria-hidden="true" className="text-amber-400">📜</span> Guild Chronicle
          </h2>
          <p className="text-xs text-rpg-text-muted mt-0.5">
            Your real-time record of adventurer exploits and ledger transactions
          </p>
        </div>
        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-rpg-surface-2 text-rpg-text-muted border border-rpg-border">
          {activities.length} Entries
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-lg bg-rpg-surface-2/30 border border-dashed border-rpg-border">
          <span className="text-3xl block mb-2" aria-hidden="true">📭</span>
          <p className="font-medium text-rpg-text">No activity recorded yet</p>
          <p className="text-xs text-rpg-text-muted mt-1 max-w-sm mx-auto">
            Complete quests to earn XP, level up, and build your gold treasury. Every heroic deed will be chronicled here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5" role="list">
          {activities.map((item) => {
            const style = TYPE_STYLES[item.type] || {
              badge: 'bg-slate-900 text-slate-300 border-slate-700',
              iconBg: 'bg-slate-800 border-slate-700 text-slate-300',
              label: item.type,
            };

            return (
              <li
                key={item.id}
                className="group relative flex items-center justify-between gap-3 p-3 rounded-lg bg-rpg-surface-2/40 hover:bg-rpg-surface-2/80 border border-transparent hover:border-rpg-border transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Icon Badge */}
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center text-base shrink-0 shadow-inner ${style.iconBg}`}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-rpg-text group-hover:text-amber-200 transition-colors truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.badge}`}
                      >
                        {style.label}
                      </span>
                      {item.amount !== undefined && (
                        <span className="text-[11px] font-mono font-bold text-cyan-300">
                          +{item.amount}
                        </span>
                      )}
                      {item.balanceAfter !== undefined && (
                        <span className="text-[11px] text-amber-300 font-mono font-medium flex items-center gap-1">
                          <span aria-hidden="true">🪙</span> Treasury: {item.balanceAfter}g
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <span className="text-xs font-mono text-rpg-text-muted shrink-0 pl-2">
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
