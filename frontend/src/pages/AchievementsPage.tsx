import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../layouts/PageContainer';
import { getAchievements } from '../services/achievement';
import type { AchievementItem } from '../types';

const RARITY_CONFIG: Record<string, { badge: string; glow: string }> = {
  COMMON:    { badge: 'bg-slate-800 text-slate-300 border-slate-700', glow: 'border-rpg-border' },
  UNCOMMON:  { badge: 'bg-emerald-950 text-emerald-300 border-emerald-500/30', glow: 'border-emerald-500/30' },
  RARE:      { badge: 'bg-blue-950 text-blue-300 border-blue-500/30', glow: 'border-blue-500/30' },
  EPIC:      { badge: 'bg-purple-950 text-purple-300 border-purple-500/40', glow: 'border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]' },
  LEGENDARY: { badge: 'bg-amber-950 text-amber-300 border-amber-500/50', glow: 'border-amber-500/50 shadow-[0_0_20px_rgba(245,200,66,0.2)]' },
};

const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [unlockedCount, setUnlockedCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAchievements();
      setAchievements(data.achievements);
      setTotalCount(data.totalCount);
      setUnlockedCount(data.unlockedCount);
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    loadData();
  }, []);

  const categories = ['ALL', 'QUESTS', 'STREAKS', 'WEALTH', 'PROGRESSION', 'DAILY'];
  const filtered = selectedCategory === 'ALL'
    ? achievements
    : achievements.filter((a) => a.category === selectedCategory);

  const completionPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <PageContainer>
        {/* Header with Back Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-rpg-border/60">
          <div>
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-rpg-surface-2/70 hover:bg-rpg-surface-2 border border-white/5 hover:border-amber-500/30 text-xs font-semibold text-rpg-text-muted hover:text-amber-300 transition-all group active:scale-95"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                Trophies & Feats of Valor
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-rpg-text">
              Achievements Hall
            </h1>
            <p className="text-xs sm:text-sm text-rpg-text-muted mt-1 max-w-xl">
              Immortalize your productivity conquests. Unlock milestones to claim server-verified XP and Gold.
            </p>
          </div>

          {/* Completion Score */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 to-rpg-surface border border-amber-500/30 shadow-sm flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400/80 flex items-center justify-center font-display font-black text-amber-300 text-lg shadow-[0_0_12px_rgba(245,200,66,0.3)]">
              {completionPercent}%
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                Trophy Progress
              </p>
              <p className="font-display text-xl font-bold text-rpg-text">
                {unlockedCount} / {totalCount} <span className="text-xs font-mono text-rpg-text-muted">Unlocked</span>
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-rpg-surface-2/60 text-rpg-text-muted border border-transparent hover:border-rpg-border'
              }`}
            >
              {cat === 'ALL' ? 'All Honors' : cat}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-xl bg-rpg-surface border border-rpg-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ach) => {
              const rarityStyle = RARITY_CONFIG[ach.rarity] || RARITY_CONFIG.COMMON;

              return (
                <div
                  key={ach.id}
                  className={`relative p-5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                    ach.isUnlocked
                      ? `bg-rpg-surface/95 ${rarityStyle.glow} hover:border-amber-400/80 shadow-[0_0_15px_rgba(245,200,66,0.1)]`
                      : 'bg-rpg-surface/50 border-rpg-border/60 opacity-60 grayscale-[40%]'
                  }`}
                >
                  <div>
                    {/* Icon & Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-3xl select-none ${ach.isUnlocked ? 'animate-bounce' : 'opacity-60'}`} aria-hidden="true">
                        {ach.iconEmoji}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${rarityStyle.badge}`}>
                          {ach.rarity}
                        </span>
                        {ach.isUnlocked ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                            ✓ Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                            🔒 Locked
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-display text-base font-bold text-rpg-text mb-1">
                      {ach.title}
                    </h3>
                    <p className="text-xs text-rpg-text-muted leading-relaxed mb-4">
                      {ach.description}
                    </p>
                  </div>

                  {/* Progress & Reward Footer */}
                  <div className="pt-3 border-t border-rpg-border/40">
                    {!ach.isUnlocked && (
                      <div className="mb-2">
                        <div className="flex justify-between text-[11px] font-mono mb-1 text-rpg-text-muted">
                          <span>Progress</span>
                          <span>{ach.progress.current} / {ach.progress.target}</span>
                        </div>
                        <div className="h-1.5 bg-rpg-surface-2 rounded-full overflow-hidden border border-rpg-border/40">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                            style={{ width: `${ach.progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 text-xs font-mono font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="text-cyan-300">+{ach.xpReward} XP</span>
                        <span>·</span>
                        <span className="text-amber-300">+{ach.goldReward}g</span>
                      </div>

                      {ach.unlockedAt && (
                        <span className="text-[10px] font-mono text-rpg-text-faint">
                          {new Date(ach.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default AchievementsPage;
