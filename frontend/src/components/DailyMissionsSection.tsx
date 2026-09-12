import React from 'react';
import type { DailyQuest, DailyQuestCompletionResult } from '../types';

interface DailyMissionsSectionProps {
  missions: DailyQuest[];
  onComplete: (mission: DailyQuest) => Promise<DailyQuestCompletionResult | void>;
  completingId?: string | null;
}

const DIFFICULTY_CONFIG = {
  TRIVIAL:   { label: 'Trivial', bg: 'bg-slate-900/60 text-slate-300 border-slate-700' },
  EASY:      { label: 'Standard', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' },
  MEDIUM:    { label: 'Focus', bg: 'bg-amber-950/60 text-amber-300 border-amber-500/30' },
  HARD:      { label: 'Demanding', bg: 'bg-orange-950/60 text-orange-300 border-orange-500/30' },
  EPIC:      { label: 'Epic', bg: 'bg-purple-950/60 text-purple-300 border-purple-500/30' },
  LEGENDARY: { label: 'Legendary', bg: 'bg-red-950/60 text-red-300 border-red-500/30' },
};

const DailyMissionsSection: React.FC<DailyMissionsSectionProps> = ({
  missions,
  onComplete,
  completingId = null,
}) => {
  const completedCount = missions.filter((m) => m.status === 'COMPLETED').length;

  return (
    <section
      aria-label="Daily missions"
      className="bg-rpg-surface/90 backdrop-blur-sm border border-rpg-border rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-rpg-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">📜</span>
            <h2 className="font-display text-xl font-bold text-rpg-text">
              Daily Missions
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30">
              {completedCount}/{missions.length} Complete
            </span>
          </div>
          <p className="text-xs text-rpg-text-muted mt-0.5">
            Refreshes every dawn. Fuel your daily streak and earn guaranteed rewards.
          </p>
        </div>
      </div>

      {missions.length === 0 ? (
        <div className="text-center py-8 text-rpg-text-muted text-sm">
          <p>No daily missions found for today.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {missions.map((mission) => {
            const isCompleted = mission.status === 'COMPLETED';
            const isCompleting = completingId === mission.id;
            const diffStyle = DIFFICULTY_CONFIG[mission.difficulty] || DIFFICULTY_CONFIG.MEDIUM;

            return (
              <div
                key={mission.id}
                className={`group relative p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30 opacity-80'
                    : 'bg-rpg-surface-2/40 border-rpg-border hover:border-amber-500/40 hover:shadow-rpg-glow'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold font-mono uppercase px-2 py-0.5 rounded border ${diffStyle.bg}`}
                      >
                        {diffStyle.label}
                      </span>
                      {isCompleted && (
                        <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                          <span aria-hidden="true">✓</span> Claimed
                        </span>
                      )}
                    </div>

                    <h3
                      className={`font-display text-base font-bold ${
                        isCompleted ? 'text-rpg-text-muted line-through' : 'text-rpg-text'
                      }`}
                    >
                      {mission.title}
                    </h3>

                    {mission.description && (
                      <p className="text-xs text-rpg-text-muted mt-0.5 leading-relaxed">
                        {mission.description}
                      </p>
                    )}
                  </div>

                  {/* Rewards & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-rpg-border/30">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                      <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                        +{mission.xpReward} XP
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300">
                        +{mission.goldReward}g
                      </span>
                    </div>

                    {!isCompleted ? (
                      <button
                        onClick={() => onComplete(mission)}
                        disabled={isCompleting}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-rpg-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCompleting ? (
                          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {isCompleting ? 'Claiming…' : 'Complete'}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 font-mono px-3 py-1">
                        Fulfilled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DailyMissionsSection;
