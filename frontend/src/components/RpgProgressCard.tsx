import React from 'react';
import type { RpgProfile } from '../types';

interface Props { profile: RpgProfile; compact?: boolean; }

const RpgProgressCard: React.FC<Props> = ({ profile, compact = false }) => {
  const remaining = Math.max(0, profile.nextLevelXp - profile.currentLevelXp);
  return (
    <section className={`bg-rpg-surface border border-rpg-border rounded-rpg-lg ${compact ? 'p-4' : 'p-6'}`} aria-label="Player progression">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div><p className="text-xs uppercase tracking-wider text-rpg-gold font-semibold">Adventurer progress</p><h2 className="font-display text-2xl font-bold text-rpg-text">Level {profile.level}</h2></div>
        <span className="text-rpg-gold text-2xl" aria-hidden="true">✦</span>
      </div>
      <div className="flex justify-between text-sm mb-2"><span className="text-rpg-text">{profile.currentLevelXp} / {profile.nextLevelXp} XP</span><span className="text-rpg-text-muted">{profile.progressPercent}%</span></div>
      <div className="h-3 bg-rpg-bg rounded-full overflow-hidden border border-rpg-border" role="progressbar" aria-valuenow={profile.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="XP progress">
        <div className="h-full bg-rpg-gradient-gold transition-all duration-500 motion-reduce:transition-none" style={{ width: `${profile.progressPercent}%` }} />
      </div>
      <p className="mt-3 text-sm text-rpg-text-muted">Total XP: <span className="text-rpg-text font-semibold">{profile.totalXp}</span> · {remaining} XP to next level</p>
    </section>
  );
};
export default RpgProgressCard;
