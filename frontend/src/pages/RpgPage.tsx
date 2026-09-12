import React, { useCallback, useEffect, useState } from 'react';
import AttributesCard from '../components/AttributesCard';
import RpgProgressCard from '../components/RpgProgressCard';
import GoldBalanceCard from '../components/GoldBalanceCard';
import GoldHistoryList from '../components/GoldHistoryList';
import { getRpgStats, getXpHistory } from '../services/rpg';
import type { RpgStats, XpHistoryEntry } from '../types';

const RpgPage: React.FC = () => {
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
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <p className="text-rpg-gold text-sm font-semibold uppercase tracking-wider">
            Character Sheet & Economy
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-rpg-text">
            Adventurer Progression & Treasury
          </h1>
          <p className="text-rpg-text-muted mt-1">
            Complete quests to earn XP, level up, and build your gold wealth.
          </p>
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
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <RpgProgressCard profile={stats} />
                </div>
                <div className="lg:col-span-1">
                  <GoldBalanceCard
                    goldBalance={stats.goldBalance ?? 0}
                    onViewHistory={() => setActiveTab('gold')}
                  />
                </div>
                <div className="lg:col-span-1">
                  <section className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6 h-full flex flex-col justify-between">
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
                  className={`px-4 py-2 text-xs font-semibold rounded-rpg-sm transition-all ${
                    activeTab === 'all'
                      ? 'bg-rpg-gold/20 text-rpg-gold border border-rpg-gold/40'
                      : 'text-rpg-text-muted hover:text-rpg-text'
                  }`}
                >
                  📜 All Ledgers
                </button>
                <button
                  onClick={() => setActiveTab('gold')}
                  className={`px-4 py-2 text-xs font-semibold rounded-rpg-sm transition-all ${
                    activeTab === 'gold'
                      ? 'bg-rpg-gold/20 text-rpg-gold border border-rpg-gold/40'
                      : 'text-rpg-text-muted hover:text-rpg-text'
                  }`}
                >
                  🪙 Gold History
                </button>
                <button
                  onClick={() => setActiveTab('xp')}
                  className={`px-4 py-2 text-xs font-semibold rounded-rpg-sm transition-all ${
                    activeTab === 'xp'
                      ? 'bg-rpg-gold/20 text-rpg-gold border border-rpg-gold/40'
                      : 'text-rpg-text-muted hover:text-rpg-text'
                  }`}
                >
                  ✨ XP History
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
