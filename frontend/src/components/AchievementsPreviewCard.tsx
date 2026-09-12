import React from 'react';
import { Link } from 'react-router-dom';
import type { DashboardAchievementsSummary } from '../types';

interface AchievementsPreviewCardProps {
  achievements?: DashboardAchievementsSummary | null;
}

const AchievementsPreviewCard: React.FC<AchievementsPreviewCardProps> = ({ achievements }) => {
  const total = achievements?.totalCount ?? 0;
  const unlocked = achievements?.unlockedCount ?? 0;
  const recent = achievements?.recentUnlocked ?? [];
  const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <div className="bg-rpg-surface/90 backdrop-blur-sm border border-rpg-border rounded-xl p-5 shadow-sm hover:border-amber-500/30 transition-all">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">🏆</span>
          <h3 className="font-display text-base font-bold text-rpg-text">
            Achievements Hall
          </h3>
        </div>
        <Link
          to="/achievements"
          className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1"
        >
          View All <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Progress row */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-rpg-text-muted">Unlocked Trophies</span>
          <span className="font-mono font-bold text-amber-300">
            {unlocked} / {total} ({percent}%)
          </span>
        </div>
        <div className="h-2 bg-rpg-surface-2 rounded-full overflow-hidden border border-rpg-border/60">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Recent Badges */}
      {recent.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-rpg-border/30">
          <p className="text-[11px] font-mono uppercase tracking-wider text-rpg-text-faint mb-1.5">
            Recent Honors
          </p>
          <div className="grid grid-cols-1 gap-2">
            {recent.map((ach) => (
              <div
                key={ach.id}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-rpg-surface-2/40 border border-amber-500/20 text-xs"
              >
                <span className="text-lg shrink-0" aria-hidden="true">
                  {ach.iconEmoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-rpg-text truncate">
                    {ach.title}
                  </p>
                  <p className="text-[10px] text-rpg-text-muted truncate">
                    {ach.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-3 text-xs text-rpg-text-muted border-t border-rpg-border/30">
          Complete quests and build streaks to unlock your first trophy.
        </div>
      )}
    </div>
  );
};

export default AchievementsPreviewCard;
