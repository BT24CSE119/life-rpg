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
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Show 4 items when collapsed, or all entries in a self-contained scrollable box when expanded
  const displayedActivities = isExpanded ? activities : activities.slice(0, 4);

  const renderItem = (item: DashboardActivityItem) => {
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
          <div
            className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-bold shrink-0 shadow-inner ${style.iconBg}`}
            aria-hidden="true"
          >
            {item.type === 'GOLD_EARNED' ? (
              <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 6v12M15 9.5a3.5 3.5 0 00-7 0c0 4 7 2 7 6a3.5 3.5 0 01-7 0" />
              </svg>
            ) : item.type === 'XP_EARNED' ? (
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-rpg-text group-hover:text-amber-200 transition-colors truncate">
              {item.title}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.badge}`}>
                {style.label}
              </span>
              {item.amount !== undefined && (
                <span className="text-[11px] font-mono font-bold text-cyan-300">
                  +{item.amount}
                </span>
              )}
              {item.balanceAfter !== undefined && (
                <span className="text-[11px] text-amber-300 font-mono font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  Treasury: {item.balanceAfter}g
                </span>
              )}
            </div>
          </div>
        </div>

        <span className="text-xs font-mono text-rpg-text-muted shrink-0 pl-2">
          {formatTimeAgo(item.timestamp)}
        </span>
      </li>
    );
  };

  return (
    <section
      aria-label="Recent activity chronicle"
      className="bg-rpg-surface/90 backdrop-blur-sm border border-rpg-border rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all"
    >
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-rpg-border/40 gap-2 flex-wrap">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-rpg-text flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
              Guild Chronicle
            </h2>
            <p className="text-xs text-rpg-text-muted mt-0.5">
              Real-time ledger of completed bounties & rewards
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-rpg-surface-2 text-rpg-text-muted border border-rpg-border">
              {activities.length} Entries
            </span>
            {activities.length > 4 && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 hover:underline"
              >
                {isExpanded ? 'Show Less ↑' : `View All (${activities.length}) ↓`}
              </button>
            )}
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-lg bg-rpg-surface-2/30 border border-dashed border-rpg-border">
            <p className="font-medium text-rpg-text text-sm">No activity recorded yet</p>
            <p className="text-xs text-rpg-text-muted mt-1 max-w-sm mx-auto">
              Complete quests to earn XP, level up, and build your gold treasury.
            </p>
          </div>
        ) : (
          <ul
            className={`space-y-2.5 overflow-y-auto pr-1 transition-all ${
              isExpanded ? 'max-h-[380px]' : 'max-h-[360px]'
            }`}
            role="list"
          >
            {displayedActivities.map(renderItem)}
          </ul>
        )}
      </div>

      {activities.length > 4 && (
        <div className="mt-4 pt-3 border-t border-rpg-border/30 text-center">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs font-semibold text-rpg-text-muted hover:text-amber-300 transition-colors inline-flex items-center gap-1.5"
          >
            <span>{isExpanded ? `Viewing all ${activities.length} entries` : `Showing 4 of ${activities.length} ledger events`}</span>
            <span className="text-amber-400 font-bold underline">
              · {isExpanded ? 'Collapse' : 'Show All Here'}
            </span>
          </button>
        </div>
      )}
    </section>
  );
};

export default RecentActivitySection;
