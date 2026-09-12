import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getLeaderboard } from '../services/rpg';
import type { LeaderboardEntry } from '../types';
import PageContainer from '../layouts/PageContainer';
import { useAuth } from '../hooks/useAuth';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'level' | 'streak'>('level');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null);

  const fetchRankings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard(sortBy, 50);
      setLeaderboard(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to load realm rankings.');
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPlayer(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <PageContainer maxWidth="3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              Hall of Champions
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-rpg-text tracking-tight">
              Realm <span className="text-gold-gradient">Leaderboard</span>
            </h1>
            <p className="text-sm text-rpg-text-muted mt-1 max-w-xl">
              Honoring the most dedicated adventurers in the realm. Progress your real-life quests to claim the throne.
            </p>
          </div>

          {/* Toggle Level vs Streak */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-rpg-surface border border-rpg-border shrink-0">
            <button
              onClick={() => setSortBy('level')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sortBy === 'level'
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-rpg-text-muted hover:text-rpg-text'
              }`}
            >
              <span>⚔️</span> Level & XP
            </button>
            <button
              onClick={() => setSortBy('streak')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sortBy === 'streak'
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-rpg-text-muted hover:text-rpg-text'
              }`}
            >
              <span>🔥</span> Day Streak
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-rpg-surface rounded-2xl border border-rpg-border" />
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-rpg-surface rounded-xl border border-rpg-border" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-rpg-surface border border-rpg-border rounded-2xl p-6">
            <svg className="w-12 h-12 text-red-400/80 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 className="font-display text-xl font-bold text-rpg-text mb-1">Rankings Unavailable</h2>
            <p className="text-sm text-rpg-text-muted mb-4 max-w-sm mx-auto">{error}</p>
            <button
              onClick={fetchRankings}
              className="px-5 py-2 rounded-lg bg-rpg-gradient-gold text-rpg-bg font-semibold text-xs hover:brightness-110 active:scale-95 transition-all"
            >
              Retry
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 bg-rpg-surface border border-rpg-border rounded-2xl p-6">
            <p className="text-rpg-text font-display text-lg mb-2">No adventurers have claimed glory yet.</p>
            <p className="text-sm text-rpg-text-muted mb-6">Be the first to complete a quest and forge your legend.</p>
            <Link
              to="/quests"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rpg-gradient-gold text-rpg-bg font-semibold text-xs hover:brightness-105 active:scale-95 transition-all shadow-sm border border-amber-500/40"
            >
              Claim the Throne
            </Link>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Top 3 Podium Cards */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div
                    onClick={() => setSelectedPlayer(topThree[1])}
                    className="order-2 sm:order-1 bg-rpg-surface/80 backdrop-blur-md border border-slate-500/30 rounded-2xl p-5 text-center relative overflow-hidden shadow-lg hover:border-slate-400 transition-all cursor-pointer group hover:-translate-y-1 active:scale-[0.98]"
                    title="Click to view adventurer stats"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-500/20 text-slate-300 border border-slate-400/40 flex items-center justify-center font-bold text-sm mx-auto mb-2 font-mono">
                      #2
                    </div>
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-400/50 flex items-center justify-center mx-auto mb-2 bg-slate-800 shadow-md">
                      {topThree[1].avatarUrl ? (
                        <img src={topThree[1].avatarUrl} alt={topThree[1].username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">🥈</span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-rpg-text truncate text-base group-hover:text-amber-300 transition-colors">
                      {topThree[1].username}
                    </h3>
                    <p className="text-[11px] text-amber-400/90 font-mono font-medium mb-3 truncate">
                      {topThree[1].equipped.title}
                    </p>
                    <div className="flex items-center justify-center gap-3 text-xs">
                      <span className="font-bold text-rpg-text bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                        Lv. {topThree[1].level}
                      </span>
                      <span className="text-orange-400 font-bold bg-orange-950/30 px-2.5 py-1 rounded-lg border border-orange-500/20">
                        🔥 {topThree[1].currentStreak}d
                      </span>
                    </div>
                    <span className="inline-block mt-3 text-[10px] text-rpg-text-muted group-hover:text-amber-300 font-medium">
                      Inspect Hero Sheet →
                    </span>
                  </div>
                )}

                {/* 1st Place (Champion) */}
                {topThree[0] && (
                  <div
                    onClick={() => setSelectedPlayer(topThree[0])}
                    className="order-1 sm:order-2 bg-gradient-to-b from-amber-950/40 to-rpg-surface border-2 border-amber-500/60 rounded-2xl p-6 text-center relative overflow-hidden shadow-[0_0_30px_rgba(245,200,66,0.2)] hover:border-amber-400 transition-all sm:-translate-y-2 cursor-pointer group active:scale-[0.98]"
                    title="Click to view adventurer stats"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 flex items-center justify-center font-black text-sm mx-auto mb-2 font-mono shadow-[0_0_10px_rgba(245,200,66,0.3)]">
                      👑 1
                    </div>
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-300 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-950/50 bg-amber-900">
                      {topThree[0].avatarUrl ? (
                        <img src={topThree[0].avatarUrl} alt={topThree[0].username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🥇</span>
                      )}
                    </div>
                    <h3 className="font-display font-black text-xl text-gold-gradient truncate">
                      {topThree[0].username}
                    </h3>
                    <p className="text-xs text-amber-300 font-mono font-semibold mb-3 truncate">
                      {topThree[0].equipped.title}
                    </p>
                    <div className="flex items-center justify-center gap-3 text-xs">
                      <span className="font-bold text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-500/40 shadow-sm">
                        Level {topThree[0].level}
                      </span>
                      <span className="text-orange-400 font-bold bg-orange-950/40 px-3 py-1.5 rounded-lg border border-orange-500/30">
                        🔥 {topThree[0].currentStreak}d streak
                      </span>
                    </div>
                    <p className="text-[10px] text-rpg-text-faint font-mono mt-3">
                      {topThree[0].totalXp.toLocaleString()} Total XP
                    </p>
                    <span className="inline-block mt-2 text-[10px] text-amber-400 font-semibold group-hover:underline">
                      Inspect Hero Sheet →
                    </span>
                  </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <div
                    onClick={() => setSelectedPlayer(topThree[2])}
                    className="order-3 bg-rpg-surface/80 backdrop-blur-md border border-amber-800/40 rounded-2xl p-5 text-center relative overflow-hidden shadow-lg hover:border-amber-700 transition-all cursor-pointer group hover:-translate-y-1 active:scale-[0.98]"
                    title="Click to view adventurer stats"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-900/20 text-amber-600 border border-amber-800/40 flex items-center justify-center font-bold text-sm mx-auto mb-2 font-mono">
                      #3
                    </div>
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-700/50 flex items-center justify-center mx-auto mb-2 text-amber-500 bg-amber-950">
                      {topThree[2].avatarUrl ? (
                        <img src={topThree[2].avatarUrl} alt={topThree[2].username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">🥉</span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-rpg-text truncate text-base group-hover:text-amber-300 transition-colors">
                      {topThree[2].username}
                    </h3>
                    <p className="text-[11px] text-amber-400/90 font-mono font-medium mb-3 truncate">
                      {topThree[2].equipped.title}
                    </p>
                    <div className="flex items-center justify-center gap-3 text-xs">
                      <span className="font-bold text-rpg-text bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                        Lv. {topThree[2].level}
                      </span>
                      <span className="text-orange-400 font-bold bg-orange-950/30 px-2.5 py-1 rounded-lg border border-orange-500/20">
                        🔥 {topThree[2].currentStreak}d
                      </span>
                    </div>
                    <span className="inline-block mt-3 text-[10px] text-rpg-text-muted group-hover:text-amber-300 font-medium">
                      Inspect Hero Sheet →
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Ranks Table (List View) */}
            <div className="bg-rpg-surface border border-rpg-border rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-rpg-border bg-rpg-surface-2/60 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-rpg-text-muted">
                <div className="flex items-center gap-4">
                  <span className="w-8 text-center">Rank</span>
                  <span>Adventurer</span>
                </div>
                <div className="flex items-center gap-6 sm:gap-12">
                  <span className="hidden sm:inline">Stats</span>
                  <span className="w-16 text-right">Streak</span>
                  <span className="w-20 text-right">Level</span>
                </div>
              </div>

              <div className="divide-y divide-rpg-border/60">
                {leaderboard.map((player) => {
                  const isCurrentUser = user?.id === player.userId;

                  return (
                    <div
                      key={player.userId}
                      onClick={() => setSelectedPlayer(player)}
                      className={`px-6 py-3.5 flex items-center justify-between transition-all cursor-pointer ${
                        isCurrentUser
                          ? 'bg-amber-950/25 border-l-4 border-l-amber-400 hover:bg-amber-950/40'
                          : 'hover:bg-rpg-surface-2/60'
                      }`}
                      title="Click to view adventurer sheet"
                    >
                      {/* Left: Rank & User Profile */}
                      <div className="flex items-center gap-4 min-w-0">
                        <span
                          className={`w-8 text-center font-mono font-bold text-sm ${
                            player.rank === 1
                              ? 'text-amber-400 text-base font-black'
                              : player.rank === 2
                                ? 'text-slate-300'
                                : player.rank === 3
                                  ? 'text-amber-600'
                                  : 'text-rpg-text-muted'
                          }`}
                        >
                          #{player.rank}
                        </span>

                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-rpg-surface-3 border border-rpg-border flex items-center justify-center text-sm shrink-0">
                            {player.avatarUrl ? (
                              <img src={player.avatarUrl} alt={player.username} className="w-full h-full object-cover" />
                            ) : (
                              '⚔️'
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-display font-bold text-sm truncate ${
                                  isCurrentUser ? 'text-amber-300' : 'text-rpg-text'
                                }`}
                              >
                                {player.username}
                              </span>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  YOU
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-rpg-text-muted/80 truncate">
                              {player.equipped.title}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Stats, Streak & Level */}
                      <div className="flex items-center gap-6 sm:gap-12 shrink-0">
                        {/* Attributes Preview */}
                        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-rpg-text-muted">
                          <span title="Strength">⚔️ {player.attributes.strength}</span>
                          <span title="Intelligence">🧠 {player.attributes.intelligence}</span>
                          <span title="Discipline">🛡️ {player.attributes.discipline}</span>
                        </div>

                        {/* Streak */}
                        <div className="w-16 text-right font-mono font-semibold text-xs text-orange-400">
                          🔥 {player.currentStreak}d
                        </div>

                        {/* Level & XP */}
                        <div className="w-20 text-right">
                          <div className="font-display font-bold text-sm text-amber-300">
                            Lv. {player.level}
                          </div>
                          <p className="text-[10px] text-rpg-text-faint font-mono">
                            {player.totalXp.toLocaleString()} XP
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </PageContainer>

      {/* ── Adventurer Character Stats Modal (Matching Reference Sheet) ─────── */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="adventurer-modal-title"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-[28px] p-6 text-white border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,200,66,0.35)] animate-scale-up"
            style={{
              background: 'linear-gradient(180deg, #131728 0%, #0d101d 100%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-rpg-text-muted hover:text-white flex items-center justify-center text-sm font-bold transition-all z-10"
              aria-label="Close hero sheet"
            >
              ✕
            </button>

            {/* Top Row: Avatar with Level Badge + Name & Streak */}
            <div className="flex items-center gap-4 mb-6 pt-1">
              <div className="relative shrink-0">
                {/* Glowing Circular Mask Avatar */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 border-2 border-purple-400/60 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                  {selectedPlayer.avatarUrl ? (
                    <img src={selectedPlayer.avatarUrl} alt={selectedPlayer.username} className="w-full h-full object-cover" />
                  ) : (
                    '🧙'
                  )}
                </div>
                {/* Level Circle Badge (Lower Left of Avatar) */}
                <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-amber-500 text-black font-mono font-black text-[11px] flex items-center justify-center border-2 border-[#131728] shadow-[0_0_8px_rgba(245,200,66,0.6)]">
                  {selectedPlayer.level}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  id="adventurer-modal-title"
                  className="font-display text-xl font-bold uppercase tracking-wider text-amber-200 truncate"
                >
                  {selectedPlayer.username}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {/* Gold Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold shadow-sm">
                    <span aria-hidden="true">🪙</span>
                    {selectedPlayer.goldBalance.toLocaleString()}
                  </span>
                  {/* Day Streak */}
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-300">
                    <span aria-hidden="true">🔥</span>
                    {selectedPlayer.currentStreak} day streak
                  </span>
                </div>
              </div>
            </div>

            {/* Level & XP Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                  LEVEL {selectedPlayer.level} · XP
                </span>
                <span className="text-amber-400 font-bold">
                  {selectedPlayer.currentLevelXp.toLocaleString()} / {selectedPlayer.nextLevelXp.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden border border-white/5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500 shadow-[0_0_10px_rgba(245,200,66,0.5)]"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((selectedPlayer.currentLevelXp / (selectedPlayer.nextLevelXp || 1)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* HP Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                  HP
                </span>
                <span className="text-red-400 font-bold">
                  {80 + selectedPlayer.level * 5} / {80 + selectedPlayer.level * 5}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden border border-white/5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* 6 Stats Grid (Matching Provided Reference Image) */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* STR */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a1f36]/70 border border-white/5">
                <span className="text-lg leading-none mb-1.5" aria-hidden="true">⚔️</span>
                <span className="text-base font-bold font-mono text-red-400 leading-none">
                  {selectedPlayer.attributes.strength}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">
                  STR
                </span>
              </div>

              {/* AGI */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a1f36]/70 border border-white/5">
                <span className="text-lg leading-none mb-1.5" aria-hidden="true">🏃</span>
                <span className="text-base font-bold font-mono text-amber-300 leading-none">
                  {Math.max(5, Math.round(selectedPlayer.attributes.stamina * 1.1))}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">
                  AGI
                </span>
              </div>

              {/* INT */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a1f36]/70 border border-white/5">
                <span className="text-lg leading-none mb-1.5" aria-hidden="true">📚</span>
                <span className="text-base font-bold font-mono text-blue-400 leading-none">
                  {selectedPlayer.attributes.intelligence}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">
                  INT
                </span>
              </div>

              {/* WIS */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a1f36]/70 border border-white/5">
                <span className="text-lg leading-none mb-1.5" aria-hidden="true">🔮</span>
                <span className="text-base font-bold font-mono text-purple-400 leading-none">
                  {selectedPlayer.attributes.discipline}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">
                  WIS
                </span>
              </div>

              {/* VIT */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a1f36]/70 border border-white/5">
                <span className="text-lg leading-none mb-1.5" aria-hidden="true">❤️</span>
                <span className="text-base font-bold font-mono text-emerald-400 leading-none">
                  {selectedPlayer.attributes.stamina}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">
                  VIT
                </span>
              </div>

              {/* CHA */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a1f36]/70 border border-white/5">
                <span className="text-lg leading-none mb-1.5" aria-hidden="true">✨</span>
                <span className="text-base font-bold font-mono text-orange-400 leading-none">
                  {selectedPlayer.attributes.consistency}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">
                  CHA
                </span>
              </div>
            </div>

            {/* Equipped Title Banner Footer */}
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <span className="text-xs text-amber-400/90 font-mono font-semibold">
                Title: {selectedPlayer.equipped.title}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
