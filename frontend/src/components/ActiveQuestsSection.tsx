import React from 'react';
import { Link } from 'react-router-dom';
import type { DashboardQuestItem } from '../types';

interface ActiveQuestsSectionProps {
  quests: DashboardQuestItem[];
  onComplete: (quest: DashboardQuestItem) => void;
  onOpenCreate: () => void;
  completingId?: string | null;
}

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  HIGH: { label: 'High', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
};

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ActiveQuestsSection: React.FC<ActiveQuestsSectionProps> = ({
  quests,
  onComplete,
  onOpenCreate,
  completingId,
}) => {
  return (
    <section className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6">
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-bold text-rpg-text flex items-center gap-2">
            <span>⚔️</span> Active Quest Log
          </h2>
          <p className="text-xs text-rpg-text-muted mt-0.5">
            Your top ongoing tasks and real-life adventures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-rpg text-xs font-semibold bg-rpg-gradient-gold text-rpg-bg hover:brightness-110 active:scale-[0.98] transition-all shadow-rpg-gold/30"
          >
            ➕ New Quest
          </button>
          <Link
            to="/quests"
            className="text-xs text-rpg-gold hover:text-rpg-gold-light font-medium py-1 px-2"
          >
            View All →
          </Link>
        </div>
      </div>

      {quests.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-rpg-border rounded-rpg-lg px-4">
          <span className="text-4xl block mb-2" aria-hidden="true">
            📜
          </span>
          <p className="font-semibold text-rpg-text text-sm">No active quests in your log</p>
          <p className="text-xs text-rpg-text-muted mt-1 max-w-sm mx-auto">
            You're currently caught up! Create a new quest to start earning XP and Gold rewards.
          </p>
          <button
            onClick={onOpenCreate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-rpg text-xs font-semibold bg-rpg-surface-2 border border-rpg-gold/40 text-rpg-gold hover:bg-rpg-gold/10 transition-all"
          >
            ➕ Create Your First Quest
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {quests.map((quest) => {
            const priority = PRIORITY_CONFIG[quest.priority] || PRIORITY_CONFIG.MEDIUM;
            const isCompleting = completingId === quest.id;

            return (
              <div
                key={quest.id}
                className="bg-rpg-surface-2/60 border border-rpg-border rounded-rpg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-rpg-border-2 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${priority.bg} ${priority.text} ${priority.border}`}
                    >
                      {priority.label}
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      +{quest.xpReward} XP
                    </span>
                    <span className="text-[10px] text-rpg-gold font-mono font-bold bg-rpg-gold/10 px-2 py-0.5 rounded-full border border-rpg-gold/20">
                      🪙 +{quest.goldReward} Gold
                    </span>
                    {quest.dueDate && (
                      <span className="text-[11px] text-rpg-text-muted">
                        📅 Due {formatDate(quest.dueDate)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-rpg-text text-sm truncate">
                    {quest.title}
                  </h3>
                  {quest.description && (
                    <p className="text-xs text-rpg-text-muted line-clamp-1 mt-0.5">
                      {quest.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onComplete(quest)}
                    disabled={isCompleting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-rpg-sm bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompleting ? (
                      <span className="animate-spin text-xs" aria-hidden="true">
                        ⚙️
                      </span>
                    ) : (
                      <span aria-hidden="true">✓</span>
                    )}
                    {isCompleting ? 'Completing…' : 'Complete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ActiveQuestsSection;
