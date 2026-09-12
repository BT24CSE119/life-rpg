import React from 'react';
import type { RpgProfile } from '../types';
import GoldBadge from './GoldBadge';

interface Props {
  profile: RpgProfile;
  compact?: boolean;
}

const RpgProgressCard: React.FC<Props> = ({ profile, compact = false }) => {
  const remaining = Math.max(0, profile.nextLevelXp - profile.currentLevelXp);
  const clampedPercent = Math.min(100, Math.max(0, profile.progressPercent));

  return (
    <section
      className={`rpg-hud-panel border border-rpg-border rounded-rpg-lg relative overflow-hidden transition-all duration-300 hover:border-rpg-gold/40 h-full flex flex-col justify-between ${
        compact ? 'p-4' : 'p-6'
      }`}
      aria-label="Player progression"
    >
      {/* Background ambient radial glow */}
      <div
        className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-purple-500/10 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-rpg bg-gradient-to-br from-rpg-surface-3 to-rpg-surface-2 border border-rpg-gold/40 flex items-center justify-center font-display font-black text-xl text-gold-gradient shadow-rpg-gold/20 shrink-0"
            aria-hidden="true"
          >
            {profile.level}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-rpg-gold font-bold">
              Character Progression
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-rpg-text">
              Level {profile.level} Adventurer
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GoldBadge amount={profile.goldBalance ?? 0} size={compact ? 'sm' : 'md'} />
        </div>
      </div>

      {/* XP Numbers */}
      <div className="flex justify-between items-baseline text-xs mb-2">
        <span className="font-mono font-semibold text-rpg-text">
          <span className="text-purple-400">{profile.currentLevelXp.toLocaleString()}</span> /{' '}
          {profile.nextLevelXp.toLocaleString()} XP
        </span>
        <span className="font-mono font-bold text-rpg-gold text-xs">
          {clampedPercent}%
        </span>
      </div>

      {/* Animated XP Progress Bar */}
      <div
        className="h-3.5 bg-rpg-bg/80 rounded-full overflow-hidden border border-rpg-border relative shadow-inner"
        role="progressbar"
        aria-valuenow={clampedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="XP progress to next level"
      >
        <div
          className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-rpg-gold transition-all duration-700 ease-out relative"
          style={{ width: `${clampedPercent}%` }}
        >
          {/* Subtle shimmer effect on progress */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-xs text-rpg-text-muted flex-wrap gap-2">
        <p>
          Total Earned:{' '}
          <span className="font-mono font-semibold text-rpg-text">
            {profile.totalXp.toLocaleString()} XP
          </span>
        </p>
        <p className="text-rpg-gold/90 font-medium">
          {remaining.toLocaleString()} XP to Level {profile.level + 1}
        </p>
      </div>
    </section>
  );
};

export default RpgProgressCard;
