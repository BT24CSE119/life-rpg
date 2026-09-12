import React from 'react';
import type { StreakInfo } from '../types';

interface StreakCardProps {
  streak?: StreakInfo | null;
}

const StreakCard: React.FC<StreakCardProps> = ({ streak }) => {
  const current = streak?.currentStreak ?? 0;
  const longest = streak?.longestStreak ?? 0;
  const motivation = streak?.motivation ?? 'Complete any quest today to spark your streak!';
  const nextMilestone = streak?.nextMilestone ?? 3;
  const calendar = streak?.weeklyCalendar ?? [];

  const getFlameColor = (days: number) => {
    if (days >= 14) return 'text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]';
    if (days >= 7) return 'text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.6)]';
    if (days >= 3) return 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,200,66,0.6)]';
    return 'text-orange-400';
  };

  return (
    <div className="bg-rpg-surface/90 backdrop-blur-sm border border-rpg-border rounded-xl p-5 shadow-sm hover:border-amber-500/30 transition-all h-full flex flex-col justify-between">
      {/* Top row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`text-3xl sm:text-4xl select-none transition-transform hover:scale-110 ${getFlameColor(current)}`}
            aria-hidden="true"
          >
            🔥
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-black text-rpg-text">
                {current}
              </span>
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-300">
                {current === 1 ? 'Day Streak' : 'Days Streak'}
              </span>
            </div>
            <p className="text-[11px] text-rpg-text-muted">
              Personal Best: <strong className="text-rpg-text">{longest} {longest === 1 ? 'day' : 'days'}</strong>
            </p>
          </div>
        </div>

        {/* Milestone badge */}
        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300">
            🎯 Next: {nextMilestone} Days
          </span>
        </div>
      </div>

      {/* Weekly Activity Tracker */}
      <div className="mb-3 pt-3 border-t border-rpg-border/40">
        <p className="text-[11px] font-mono uppercase tracking-wider text-rpg-text-faint mb-2">
          Weekly Momentum
        </p>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {calendar.map((day) => (
            <div
              key={day.date}
              className={`p-1.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                day.isActive
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,200,66,0.2)]'
                  : 'bg-rpg-surface-2/40 border-rpg-border/60 text-rpg-text-muted'
              } ${day.isToday ? 'ring-1 ring-amber-400' : ''}`}
              title={`${day.dayName} (${day.date}): ${day.isActive ? 'Active' : 'Rest'}`}
            >
              <span className="text-[10px] font-bold font-mono uppercase block">
                {day.dayName}
              </span>
              <span className="text-xs mt-0.5" aria-hidden="true">
                {day.isActive ? '🔥' : '·'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational message */}
      <p className="text-xs text-rpg-text-muted italic border-t border-rpg-border/30 pt-2.5">
        “{motivation}”
      </p>
    </div>
  );
};

export default StreakCard;
