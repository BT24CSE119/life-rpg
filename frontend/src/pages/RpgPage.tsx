import React, { useCallback, useEffect, useState } from 'react';
import AttributesCard from '../components/AttributesCard';
import RpgProgressCard from '../components/RpgProgressCard';
import { getRpgStats, getXpHistory } from '../services/rpg';
import type { RpgStats, XpHistoryEntry } from '../types';

const RpgPage: React.FC = () => {
  const [stats, setStats] = useState<RpgStats | null>(null);
  const [history, setHistory] = useState<XpHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [statsData, historyData] = await Promise.all([getRpgStats(), getXpHistory(1, 10)]);
      setStats(statsData); setHistory(historyData.entries);
    } catch (err) { setError((err as Error).message || 'Unable to load RPG progress.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return <div className="min-h-screen pt-24 pb-16 px-4"><div className="max-w-5xl mx-auto">
    <header className="mb-8"><p className="text-rpg-gold text-sm font-semibold uppercase tracking-wider">Character sheet</p><h1 className="font-display text-3xl sm:text-4xl font-bold text-rpg-text">RPG Progression</h1><p className="text-rpg-text-muted mt-1">Complete quests to earn XP and grow your adventurer.</p></header>
    {loading ? <div className="grid gap-5 lg:grid-cols-2 animate-pulse"><div className="h-52 bg-rpg-surface rounded-rpg-lg" /><div className="h-52 bg-rpg-surface rounded-rpg-lg" /></div> : error ? <div className="text-center py-16 bg-rpg-surface border border-rpg-border rounded-rpg-lg"><h2 className="font-display text-xl text-rpg-text">Progress unavailable</h2><p className="text-rpg-text-muted my-3">{error}</p><button onClick={load} className="px-5 py-2 rounded-rpg bg-rpg-gradient-gold text-rpg-bg font-semibold">Retry</button></div> : stats && <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2"><RpgProgressCard profile={stats} /><section className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6"><h2 className="font-display text-xl font-bold text-rpg-text">Quest Record</h2><dl className="grid grid-cols-2 gap-4 mt-5"><div><dt className="text-sm text-rpg-text-muted">Completed</dt><dd className="font-display text-3xl text-rpg-gold">{stats.completedQuests}</dd></div><div><dt className="text-sm text-rpg-text-muted">Total quests</dt><dd className="font-display text-3xl text-rpg-text">{stats.totalQuests}</dd></div></dl></section></div>
      <AttributesCard attributes={stats.attributes} />
      <section className="bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6"><h2 className="font-display text-xl font-bold text-rpg-text">Recent XP</h2><p className="text-sm text-rpg-text-muted mb-4">Your server-verified reward history.</p>{history.length === 0 ? <p className="py-6 text-rpg-text-muted">No XP earned yet. Complete a quest to begin your journey.</p> : <ul className="divide-y divide-rpg-border">{history.map((entry) => <li key={entry.id} className="py-3 flex items-center justify-between gap-4"><div><p className="text-rpg-text font-medium">{entry.questTitle}</p><p className="text-xs text-rpg-text-muted">{new Date(entry.createdAt).toLocaleDateString()}</p></div><span className="text-emerald-400 font-bold">+{entry.amount} XP</span></li>)}</ul>}</section>
    </div>}
  </div></div>;
};
export default RpgPage;
