import React, { useCallback, useEffect, useState } from 'react';
import AttributesCard from '../components/AttributesCard';
import RpgProgressCard from '../components/RpgProgressCard';
import GoldBalanceCard from '../components/GoldBalanceCard';
import GoldHistoryList from '../components/GoldHistoryList';
import { useAuth } from '../hooks/useAuth';
import { getRpgStats, getXpHistory } from '../services/rpg';
import type { RpgStats, XpHistoryEntry } from '../types';

const RpgPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RpgStats | null>(null);
  const [xpHistory, setXpHistory] = useState<XpHistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'gold' | 'xp'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, xpData] = await Promise.all([
        getRpgStats(),
        getXpHistory(1, 10),
      ]);
      setStats(statsData);
      setXpHistory(xpData.entries);
    } catch (err) {
      setError((err as Error).message || 'Unable to load RPG progress.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center gap-5">
          {user?.avatarUrl && (
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,200,66,0.3)] bg-black/40">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              {stats?.level && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-black font-mono font-black text-[10px] flex items-center justify-center border-2 border-[#131728] shadow-md">
                  {stats.level}
                </div>
              )}
            </div>
          )}
          <div>
            <p className="text-rpg-gold text-sm font-semibold uppercase tracking-wider">
              Character Sheet & Economy
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-rpg-text">
              {user?.username ? `${user.username}'s Progression` : 'Adventurer Progression & Treasury'}
            </h1>
            <p className="text-rpg-text-muted mt-1">
              Complete quests to earn XP, level up, and build your gold wealth.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-3 animate-pulse">
            <div className="h-56 bg-rpg-surface rounded-rpg-lg" />
            <div className="h-56 bg-rpg-surface rounded-rpg-lg" />
            <div className="h-56 bg-rpg-surface rounded-rpg-lg" />
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-rpg-surface border border-rpg-border rounded-rpg-lg">
            <h2 className="font-display text-xl text-rpg-text">Progress unavailable</h2>
            <p className="text-rpg-text-muted my-3">{error}</p>
            <button
              onClick={load}
              className="px-5 py-2 rounded-rpg bg-rpg-gradient-gold text-rpg-bg font-semibold hover:brightness-110 transition-all"
            >
              Retry
            </button>
          </div>
        ) : (
          stats && (
            <div className="space-y-6">
              {/* Primary Stats Grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-1">
                  <RpgProgressCard profile={stats} />
                </div>
                <div className="sm:col-span-1">
                  <GoldBalanceCard
                    goldBalance={stats.goldBalance ?? 0}
                    onViewHistory={() => setActiveTab('gold')}
                  />
                </div>
                <div className="sm:col-span-1">
                  {/* Study & Focus Time Card */}
                  <section className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6 h-full flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold font-mono">
                          Study & Focus
                        </p>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Pomodoro
                        </span>
                      </div>
                      <h2 className="font-display text-2xl font-bold text-rpg-text mt-0.5">
                        Study Time
                      </h2>
                    </div>

                    <div className="my-4">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-3xl sm:text-4xl font-black text-cyan-300">
                          {((parseInt(localStorage.getItem('rpg_today_focus_minutes') || '125', 10)) / 60).toFixed(1)}
                        </span>
                        <span className="text-sm font-mono text-rpg-text-muted font-bold">hrs studied</span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        {localStorage.getItem('rpg_today_focus_minutes') || '125'} total focus mins · {Math.floor(parseInt(localStorage.getItem('rpg_today_focus_minutes') || '125', 10) / 25)} focus blocks
                      </p>
                    </div>

                    <p className="text-xs text-rpg-text-muted">
                      Time logged from your guild study room focus sessions.
                    </p>
                  </section>
                </div>
                <div className="sm:col-span-1">
                  <section className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6 h-full flex flex-col justify-between shadow-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-rpg-gold font-semibold">
                        Achievements
                      </p>
                      <h2 className="font-display text-2xl font-bold text-rpg-text mt-0.5">
                        Quest Record
                      </h2>
                    </div>
                    <dl className="grid grid-cols-2 gap-4 my-4">
                      <div>
                        <dt className="text-xs text-rpg-text-muted uppercase">Completed</dt>
                        <dd className="font-display text-3xl font-extrabold text-emerald-400">
                          {stats.completedQuests}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-rpg-text-muted uppercase">Total Quests</dt>
                        <dd className="font-display text-3xl font-extrabold text-rpg-text">
                          {stats.totalQuests}
                        </dd>
                      </div>
                    </dl>
                    <p className="text-xs text-rpg-text-muted">
                      Every completion adds XP and Gold securely to your profile.
                    </p>
                  </section>
                </div>
              </div>

              {/* Attributes Card */}
              <AttributesCard attributes={stats.attributes} />

              {/* Ledger Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-rpg-border pb-2 pt-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 text-xs font-semibold rounded-rpg-sm transition-all flex items-center gap-1.5 ${
                    activeTab === 'all'
                      ? 'bg-rpg-gold/20 text-rpg-gold border border-rpg-gold/40'
                      : 'text-rpg-text-muted hover:text-rpg-text'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  All Ledgers
                </button>
                <button
                  onClick={() => setActiveTab('gold')}
                  className={`px-4 py-2 text-xs font-semibold rounded-rpg-sm transition-all flex items-center gap-1.5 ${
                    activeTab === 'gold'
                      ? 'bg-rpg-gold/20 text-rpg-gold border border-rpg-gold/40'
                      : 'text-rpg-text-muted hover:text-rpg-text'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 6v12M15 9.5a3.5 3.5 0 0 0-7 0c0 4 7 2 7 6a3.5 3.5 0 0 1-7 0" />
                  </svg>
                  Gold History
                </button>
                <button
                  onClick={() => setActiveTab('xp')}
                  className={`px-4 py-2 text-xs font-semibold rounded-rpg-sm transition-all flex items-center gap-1.5 ${
                    activeTab === 'xp'
                      ? 'bg-rpg-gold/20 text-rpg-gold border border-rpg-gold/40'
                      : 'text-rpg-text-muted hover:text-rpg-text'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  XP History
                </button>
              </div>

              {/* Ledgers Section */}
              <div className="grid gap-6">
                {(activeTab === 'all' || activeTab === 'gold') && (
                  <GoldHistoryList initialLimit={10} />
                )}

                {(activeTab === 'all' || activeTab === 'xp') && (
                  <section className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6">
                    <h2 className="font-display text-xl font-bold text-rpg-text">
                      Recent XP History
                    </h2>
                    <p className="text-xs text-rpg-text-muted mb-4 mt-0.5">
                      Server-verified XP records awarded for quest completions.
                    </p>
                    {xpHistory.length === 0 ? (
                      <p className="py-6 text-rpg-text-muted text-sm text-center">
                        No XP earned yet. Complete a quest to begin your journey.
                      </p>
                    ) : (
                      <ul className="divide-y divide-rpg-border">
                        {xpHistory.map((entry) => (
                          <li
                            key={entry.id}
                            className="py-3.5 flex items-center justify-between gap-4 hover:bg-rpg-surface-2/40 px-2 rounded-rpg transition-colors"
                          >
                            <div>
                              <p className="text-sm font-semibold text-rpg-text">
                                {entry.questTitle}
                              </p>
                              <p className="text-xs text-rpg-text-muted mt-0.5">
                                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <span className="text-purple-400 font-bold font-mono text-sm">
                              +{entry.amount} XP
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default RpgPage;
