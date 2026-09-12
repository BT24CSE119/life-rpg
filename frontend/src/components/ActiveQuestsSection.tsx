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
  LOW: {
    label: 'Low Priority',
    bg: 'bg-slate-500/15',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
    icon: '🟢',
  },
  MEDIUM: {
    label: 'Medium Priority',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    icon: '🟡',
  },
  HIGH: {
    label: 'High Priority',
    bg: 'bg-red-500/15',
    text: 'text-red-300',
    border: 'border-red-500/40',
    icon: '🔴',
  },
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
    <section
      className="rpg-hud-panel border border-rpg-border rounded-rpg-lg p-6 hover:border-rpg-gold/40 transition-all duration-300"
      aria-label="Active Quests"
    >
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-rpg-gold font-bold">
            Current Bounties & Tasks
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-rpg-text mt-0.5 flex items-center gap-2">
            <span>⚔️</span> Active Quest Board
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-rpg text-xs font-semibold bg-rpg-gradient-gold text-rpg-bg hover:brightness-110 active:scale-[0.98] transition-all shadow-rpg-gold/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-rpg-gold"
          >
            ➕ Forge Quest
          </button>
          <Link
            to="/quests"
            className="text-xs text-rpg-gold hover:text-rpg-gold-light font-medium py-1.5 px-2.5 transition-colors"
          >
            Full Board →
          </Link>
        </div>
      </div>

      {quests.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-rpg-border rounded-rpg-lg px-4 bg-rpg-surface-2/30">
          <span className="text-4xl block mb-3 animate-float" aria-hidden="true">
            📜
          </span>
          <p className="font-display font-bold text-rpg-text text-base">
            No active bounties on your log
          </p>
          <p className="text-xs text-rpg-text-muted mt-1 max-w-sm mx-auto leading-relaxed">
            All current goals are fulfilled! Forge a new quest to begin gaining experience and coins.
          </p>
          <button
            onClick={onOpenCreate}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-rpg text-xs font-semibold bg-rpg-gradient-gold text-rpg-bg hover:brightness-110 active:scale-[0.98] transition-all shadow-rpg-gold"
          >
            ➕ Forge Your First Quest
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {quests.map((quest, index) => {
            const priority = PRIORITY_CONFIG[quest.priority] || PRIORITY_CONFIG.MEDIUM;
            const isCompleting = completingId === quest.id;

            return (
              <div
                key={quest.id}
                className="bg-rpg-surface-2/70 border border-rpg-border rounded-rpg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-rpg-gold/30 hover:bg-rpg-surface-2 transition-all duration-200 group animate-card-enter shadow-sm"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${priority.bg} ${priority.text} ${priority.border}`}
                    >
                      {priority.icon} {priority.label}
                    </span>
                    <span className="text-[10px] text-purple-300 font-mono font-bold bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                      ✨ +{quest.xpReward} XP
                    </span>
                    <span className="text-[10px] text-rpg-gold font-mono font-bold bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-rpg-gold/30">
                      🪙 +{quest.goldReward} Gold
                    </span>
                    {quest.dueDate && (
                      <span className="text-[11px] text-rpg-text-muted flex items-center gap-1">
                        📅 Due {formatDate(quest.dueDate)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-rpg-text text-sm sm:text-base group-hover:text-gold-gradient transition-all">
                    {quest.title}
                  </h3>
                  {quest.description && (
                    <p className="text-xs text-rpg-text-muted line-clamp-1 mt-1">
                      {quest.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onComplete(quest)}
                    disabled={isCompleting}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-display font-bold rounded-rpg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/60 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    {isCompleting ? (
                      <span className="animate-spin text-xs" aria-hidden="true">
                        ⚙️
                      </span>
                    ) : (
                      <span aria-hidden="true">⚔️</span>
                    )}
                    {isCompleting ? 'Finalizing…' : 'Complete Quest'}
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
