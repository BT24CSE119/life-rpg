import React from 'react';
import type { LeaderboardEntry } from '../types';

interface GuildHeroCardProps {
  player: LeaderboardEntry;
  isCurrentUser: boolean;
  onInspect: (player: LeaderboardEntry) => void;
  onlineStatus?: 'in_room' | 'active_guild' | 'resting';
  customStatus?: string;
}

// Derive a dynamic hero class / specialty based on player's highest attribute or title
export const getHeroClassInfo = (player: LeaderboardEntry) => {
  const attrs = player.attributes || {
    strength: 10,
    intelligence: 10,
    discipline: 10,
    stamina: 10,
    consistency: 10,
  };

  const highest = Object.entries(attrs).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    ['strength', attrs.strength || 0]
  );

  switch (highest[0]) {
    case 'intelligence':
      return { name: 'Scholar', badge: 'Scholar', color: 'text-blue-400 border-blue-500/30 bg-blue-950/30' };
    case 'discipline':
      return { name: 'Guardian', badge: 'Guardian', color: 'text-purple-400 border-purple-500/30 bg-purple-950/30' };
    case 'stamina':
      return { name: 'Ranger', badge: 'Ranger', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30' };
    case 'consistency':
      return { name: 'Monk', badge: 'Monk', color: 'text-amber-400 border-amber-500/30 bg-amber-950/30' };
    case 'strength':
    default:
      return { name: 'Warrior', badge: 'Warrior', color: 'text-rose-400 border-rose-500/30 bg-rose-950/30' };
  }
};

// Procedural/contextual status line matching study room / co-working vibes
export const getHeroStatusTagline = (player: LeaderboardEntry, isCurrentUser: boolean): string => {
  if (isCurrentUser) return 'Focusing in Guild Study Room';
  if (player.currentStreak >= 7) return 'Deep in High-Focus Flow';
  if (player.currentStreak >= 3) return 'Studying in Guild Hall';
  if (player.level >= 10) return 'Forging Grand Masteries';
  return 'Conquering Daily Quests';
};

export const GuildHeroCard: React.FC<GuildHeroCardProps> = ({
  player,
  isCurrentUser,
  onInspect,
  onlineStatus = 'active_guild',
  customStatus,
}) => {
  const classInfo = getHeroClassInfo(player);
  const statusQuote = customStatus || getHeroStatusTagline(player, isCurrentUser);

  return (
    <div
      onClick={() => onInspect(player)}
      className="relative pt-3 cursor-pointer group"
    >
      {/* ── Professional Corner Crest / Ribbon protruding from top-right corner ── */}
      {isCurrentUser ? (
        <div className="absolute -top-1.5 right-4 z-20 pointer-events-none transform transition-transform duration-300 group-hover:-translate-y-1">
          <div className="relative px-3 py-0.5 rounded-t-lg rounded-b-md bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 text-black text-[10px] font-black font-mono tracking-wider uppercase shadow-[0_4px_14px_rgba(245,200,66,0.5)] border border-amber-200/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping inline-block" />
            <span>YOU · #{player.rank}</span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-amber-600" />
          </div>
        </div>
      ) : player.rank === 1 ? (
        <div className="absolute -top-1.5 right-4 z-20 pointer-events-none transform transition-transform duration-300 group-hover:-translate-y-1">
          <div className="relative px-3 py-0.5 rounded-t-lg rounded-b-md bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-black text-[10px] font-black font-mono tracking-wider shadow-[0_4px_14px_rgba(245,200,66,0.5)] border border-amber-200 flex items-center gap-1">
            <span>CHAMPION · #1</span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-amber-600" />
          </div>
        </div>
      ) : player.rank <= 3 ? (
        <div className="absolute -top-1.5 right-4 z-20 pointer-events-none transform transition-transform duration-300 group-hover:-translate-y-1">
          <div className="relative px-2.5 py-0.5 rounded-t-lg rounded-b-md bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 text-slate-900 text-[10px] font-black font-mono tracking-wider shadow-md border border-white/80 flex items-center gap-1">
            <span>ELITE · #{player.rank}</span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-400" />
          </div>
        </div>
      ) : (
        <div className="absolute -top-1.5 right-4 z-20 pointer-events-none">
          <div className="px-2 py-0.5 rounded-t-md rounded-b-sm bg-slate-800/90 text-slate-300 text-[10px] font-bold font-mono border border-slate-600/50 shadow-sm">
            #{player.rank}
          </div>
        </div>
      )}

      {/* Main Card Shell */}
      <div
        className={`relative rounded-2xl border transition-all duration-300 p-5 overflow-hidden ${
          isCurrentUser
            ? 'bg-gradient-to-b from-amber-950/40 via-[#131728] to-[#0c0e18] border-amber-400/80 shadow-[0_0_24px_rgba(245,200,66,0.22)] group-hover:border-amber-300 group-hover:shadow-[0_0_35px_rgba(245,200,66,0.35)] group-hover:-translate-y-1'
            : 'bg-[#111422]/90 group-hover:bg-[#15192b] border-white/10 group-hover:border-amber-400/50 group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] group-hover:-translate-y-1'
        }`}
      >
        {/* Subtle background glow effect for current hero */}
        {isCurrentUser && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
        )}

        {/* Top Presence & Room Badge */}
        <div className="flex items-center justify-between gap-2 mb-4 pt-1 pr-24">
          <div className="flex items-center gap-1.5 min-w-0">
            {isCurrentUser ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block -ml-3.5" />
                ACTIVE IN ROOM
              </span>
            ) : onlineStatus === 'in_room' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                ACTIVE IN ROOM
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-white/5 text-slate-300 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                IN GUILD
              </span>
            )}
          </div>
        </div>

        {/* Main Hero Header: Avatar + Level + Name + Class */}
        <div className="flex items-start gap-3.5 mb-3.5">
          {/* Avatar with Circular Level Badge */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/30 group-hover:border-amber-400/70 transition-all flex items-center justify-center text-sm font-mono font-black text-amber-300 shadow-inner">
              {player.avatarUrl ? (
                <img src={player.avatarUrl} alt={player.username} className="w-full h-full object-cover" />
              ) : (
                player.username.substring(0, 2).toUpperCase()
              )}
            </div>
            {/* Level Overlay Badge on Avatar */}
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-amber-500 text-black font-mono font-black text-[10px] border border-black shadow">
              Lv.{player.level}
            </div>
          </div>

          {/* Hero Name, Title & Class */}
          <div className="min-w-0 flex-1">
            <h3
              className={`font-display font-bold text-base leading-tight truncate ${
                isCurrentUser ? 'text-amber-200 group-hover:text-amber-100' : 'text-slate-100 group-hover:text-amber-300'
              } transition-colors`}
            >
              {player.username}
            </h3>

            <p className="text-[11px] text-amber-400/80 font-mono truncate mt-0.5">
              {player.equipped?.title || 'Novice Adventurer'}
            </p>

            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${classInfo.color}`}
              >
                {classInfo.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Status Quote Banner (Study / Co-Working activity) */}
        <div className="mb-3.5 px-3 py-2 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-amber-400/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-xs text-slate-300 italic truncate font-sans">
            "{statusQuote}"
          </p>
        </div>

        {/* Bottom Metrics: Study Hours, Streak & Total XP */}
        <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>{player.currentStreak}d Streak</span>
            </div>

            {/* Study Hours Metric */}
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 text-[11px]">
              <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{Math.max(1, Math.round(player.level * 1.5 + (player.currentStreak || 0) * 0.8))}h studied</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-300 font-semibold">
            <span className="text-amber-400 font-bold">{player.totalXp.toLocaleString()}</span>
            <span className="text-slate-500 text-[10px]">XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuildHeroCard;
