import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getLeaderboard } from '../services/rpg';
import type { LeaderboardEntry } from '../types';
import PageContainer from '../layouts/PageContainer';
import { useAuth } from '../hooks/useAuth';
import GuildHeroCard from '../components/GuildHeroCard';
import GuildPomodoroTimer from '../components/GuildPomodoroTimer';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'level' | 'streak'>('level');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'roster' | 'ladder'>('roster');

  const [filterType, setFilterType] = useState<'all' | 'active' | 'top_xp'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [myRoomStatus, setMyRoomStatus] = useState<string>('Studying in Guild Hall');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState('');
  const [showPomodoro, setShowPomodoro] = useState(true);


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

  // Filter and search logic for Guild Roster
  const filteredAdventurers = leaderboard.filter((player) => {
    // Search query matching
    const matchesSearch =
      !searchQuery.trim() ||
      player.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.equipped?.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter pill logic
    if (filterType === 'active') {
      // Active in room: current user or players with active streak >= 1
      return player.userId === user?.id || player.currentStreak > 0;
    }
    if (filterType === 'top_xp') {
      return player.rank <= 10;
    }
    return true;
  });

  const topThree = leaderboard.slice(0, 3);


  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <PageContainer maxWidth="3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
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
              Guild Hall & Co-working
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-rpg-text tracking-tight">
              Guild <span className="text-gold-gradient">Hero Roster</span>
            </h1>
            <p className="text-sm text-rpg-text-muted mt-1 max-w-xl">
              Co-working study room & realm rankings. Focus together with fellow adventurers and witness glory unfold.
            </p>
          </div>

          {/* View Toggle: Guild Roster vs Rank Ladder */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-rpg-surface border border-rpg-border shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-rpg-text-muted hover:text-rpg-text'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Hero Roster ({leaderboard.length})
            </button>
            <button
              onClick={() => setActiveTab('ladder')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'ladder'
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-rpg-text-muted hover:text-rpg-text'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
              Rank Ladder
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 bg-rpg-surface rounded-2xl border border-rpg-border" />
              ))}
            </div>
            {[1, 2, 3, 4].map((i) => (
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
            <p className="text-rpg-text font-display text-lg mb-2">No adventurers have joined the guild room yet.</p>
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
            {/* ── View 1: Guild Hall & Hero Roster (Yakitodo Room Style) ──── */}
            {activeTab === 'roster' ? (
              <div className="space-y-5">
                {/* Search & Status Filters Bar */}
                <div className="bg-rpg-surface/80 border border-rpg-border rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Search bar */}
                  <div className="relative flex-1">
                    <svg className="w-3.5 h-3.5 text-rpg-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search heroes by name or title..."
                      className="w-full pl-9 pr-3 py-2 bg-rpg-surface-2/60 rounded-xl border border-rpg-border text-xs text-rpg-text placeholder-rpg-text-muted focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-rpg-text-muted hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        filterType === 'all'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                          : 'bg-rpg-surface-2/60 text-rpg-text-muted hover:text-rpg-text border border-transparent'
                      }`}
                    >
                      ALL ({leaderboard.length})
                    </button>
                    <button
                      onClick={() => setFilterType('active')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        filterType === 'active'
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/50'
                          : 'bg-rpg-surface-2/60 text-rpg-text-muted hover:text-rpg-text border border-transparent'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      ACTIVE IN ROOM
                    </button>
                    <button
                      onClick={() => setFilterType('top_xp')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        filterType === 'top_xp'
                          ? 'bg-purple-950/70 text-purple-300 border border-purple-500/50'
                          : 'bg-rpg-surface-2/60 text-rpg-text-muted hover:text-rpg-text border border-transparent'
                      }`}
                    >
                      <svg className="w-3 h-3 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      TOP XP
                    </button>
                  </div>
                </div>

                {/* Toggle & Guild Pomodoro Study Timer */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                      Guild Focus & Study Session
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPomodoro((prev) => !prev)}
                    className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
                  >
                    {showPomodoro ? 'Hide Pomodoro ▴' : 'Open Pomodoro & Study Hours ▾'}
                  </button>
                </div>

                {showPomodoro && (
                  <GuildPomodoroTimer />
                )}

                {/* My Active Study Room Status Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-rpg-surface to-rpg-surface border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] font-mono text-amber-400/80 font-bold uppercase tracking-wider">
                        Your Guild Room Status
                      </p>
                      {isEditingStatus ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            maxLength={50}
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value)}
                            placeholder="What are you studying/focusing on?"
                            className="px-2.5 py-1 text-xs bg-black/40 border border-amber-400/50 rounded-lg text-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              if (tempStatus.trim()) setMyRoomStatus(tempStatus.trim());
                              setIsEditingStatus(false);
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 text-black hover:bg-amber-400"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setIsEditingStatus(false)}
                            className="px-2 py-1 text-xs text-rpg-text-muted hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-rpg-text font-medium italic">
                          "{myRoomStatus}"
                        </p>
                      )}
                    </div>
                  </div>

                  {!isEditingStatus && (
                    <button
                      onClick={() => {
                        setTempStatus(myRoomStatus);
                        setIsEditingStatus(true);
                      }}
                      className="self-start sm:self-auto text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      Edit Status
                    </button>
                  )}
                </div>


                {/* Hero Cards Grid */}
                {filteredAdventurers.length === 0 ? (
                  <div className="text-center py-12 bg-rpg-surface/60 border border-rpg-border rounded-2xl p-6">
                    <p className="text-rpg-text text-sm mb-1">No adventurers match your filter.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                      }}
                      className="text-xs text-amber-400 hover:underline font-mono mt-2"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAdventurers.map((player) => {
                      const isCurr = player.userId === user?.id;
                      return (
                        <GuildHeroCard
                          key={player.userId}
                          player={player}
                          isCurrentUser={isCurr}
                          onInspect={setSelectedPlayer}
                          onlineStatus={isCurr || player.currentStreak > 0 ? 'in_room' : 'active_guild'}
                          customStatus={isCurr ? myRoomStatus : undefined}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* ── View 2: Traditional Leaderboard / Rank Ladder ──── */
              <div className="space-y-6">
                {/* Toggle Level vs Streak */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-rpg-surface/80 border border-rpg-border">
                  <span className="text-xs font-mono text-rpg-text-muted">Sort Rankings By:</span>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-rpg-surface-2 border border-rpg-border">
                    <button
                      onClick={() => setSortBy('level')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        sortBy === 'level'
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'text-rpg-text-muted hover:text-rpg-text'
                      }`}
                    >
                      Level & XP
                    </button>
                    <button
                      onClick={() => setSortBy('streak')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        sortBy === 'streak'
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'text-rpg-text-muted hover:text-rpg-text'
                      }`}
                    >
                      Day Streak
                    </button>
                  </div>
                </div>

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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold shadow-sm">
                    <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 6v12M15 9.5a3.5 3.5 0 0 0-7 0c0 4 7 2 7 6a3.5 3.5 0 0 1-7 0" />
                    </svg>
                    {selectedPlayer.goldBalance.toLocaleString()}
                  </span>
                  {/* Day Streak */}
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300">
                    <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    {selectedPlayer.currentStreak} day streak
                  </span>
                  {/* Study Time */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold shadow-sm">
                    <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {Math.max(1, Math.round(selectedPlayer.level * 1.5 + (selectedPlayer.currentStreak || 0) * 0.8))}h studied
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

            {/* 6 Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* STR */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a1f36]/70 border border-white/5">
                <span className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-wider mb-1">
                  POWER
                </span>
                <span className="text-base font-bold font-mono text-red-400 leading-none">
                  {selectedPlayer.attributes.strength}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">
                  STR
                </span>
              </div>

              {/* AGI */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a1f36]/70 border border-white/5">
                <span className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider mb-1">
                  SPEED
                </span>
                <span className="text-base font-bold font-mono text-amber-300 leading-none">
                  {Math.max(5, Math.round(selectedPlayer.attributes.stamina * 1.1))}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">
                  AGI
                </span>
              </div>

              {/* INT */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a1f36]/70 border border-white/5">
                <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider mb-1">
                  MIND
                </span>
                <span className="text-base font-bold font-mono text-blue-400 leading-none">
                  {selectedPlayer.attributes.intelligence}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">
                  INT
                </span>
              </div>

              {/* WIS */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a1f36]/70 border border-white/5">
                <span className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider mb-1">
                  FOCUS
                </span>
                <span className="text-base font-bold font-mono text-purple-400 leading-none">
                  {selectedPlayer.attributes.discipline}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">
                  WIS
                </span>
              </div>

              {/* VIT */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a1f36]/70 border border-white/5">
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1">
                  VITAL
                </span>
                <span className="text-base font-bold font-mono text-emerald-400 leading-none">
                  {selectedPlayer.attributes.stamina}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">
                  VIT
                </span>
              </div>

              {/* CHA */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1a1f36]/70 border border-white/5">
                <span className="text-[11px] font-mono text-orange-400 font-bold uppercase tracking-wider mb-1">
                  FLOW
                </span>
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
