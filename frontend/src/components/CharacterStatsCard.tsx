import React from 'react';
import type { PreviewCharacter } from '../types';
import RPGCard from './RPGCard';
import XPProgressBar from './XPProgressBar';
import LevelBadge from './LevelBadge';
import GoldBadge from './GoldBadge';

interface CharacterStatsCardProps {
  character: PreviewCharacter;
  isPreview?: boolean;
  className?: string;
}

const STAT_CONFIG = [
  { key: 'strength',     label: 'STR', icon: '⚔️',  color: '#EF4444', desc: 'Strength'     },
  { key: 'agility',      label: 'AGI', icon: '🏃',  color: '#F5C842', desc: 'Agility'      },
  { key: 'intelligence', label: 'INT', icon: '📚',  color: '#60A5FA', desc: 'Intelligence'  },
  { key: 'wisdom',       label: 'WIS', icon: '🔮',  color: '#A78BFA', desc: 'Wisdom'        },
  { key: 'vitality',     label: 'VIT', icon: '❤️',  color: '#10B981', desc: 'Vitality'      },
  { key: 'charisma',     label: 'CHA', icon: '✨',  color: '#F97316', desc: 'Charisma'      },
] as const;

const CharacterStatsCard: React.FC<CharacterStatsCardProps> = ({
  character,
  isPreview = false,
  className = '',
}) => {
  const hpPercent = Math.round((character.hp / character.maxHp) * 100);

  return (
    <RPGCard variant="gold" className={`overflow-visible ${className}`}>
      {isPreview && (
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="text-xs uppercase tracking-widest text-rpg-gold/60 font-mono">
            ⚠ Preview Data — Static UI Demo
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {/* Avatar placeholder */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full bg-rpg-gradient-arcane flex items-center justify-center text-3xl shadow-rpg-arcane border-2 border-rpg-gold/40">
            🧙
          </div>
          <LevelBadge
            level={character.level}
            size="sm"
            className="absolute -bottom-1 -right-1"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-rpg-text truncate">{character.name}</h3>
          <div className="flex items-center gap-3 mt-1">
            <GoldBadge amount={character.gold} size="sm" />
            <span className="text-xs text-rpg-text-muted font-mono">
              🔥 {character.currentStreak} day streak
            </span>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-5">
        <XPProgressBar
          currentXP={character.xp}
          maxXP={character.xpToNextLevel}
          level={character.level}
          size="md"
          animate
        />
      </div>

      {/* HP Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-rpg-text-muted uppercase tracking-widest">HP</span>
          <span className="text-xs font-mono text-rpg-danger-light">
            {character.hp} / {character.maxHp}
          </span>
        </div>
        <div
          className="h-2 w-full rounded-full bg-rpg-surface-3 shadow-rpg-inner overflow-hidden"
          role="progressbar"
          aria-valuenow={character.hp}
          aria-valuemin={0}
          aria-valuemax={character.maxHp}
          aria-label={`HP: ${character.hp} of ${character.maxHp}`}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${hpPercent}%`,
              background: 'linear-gradient(90deg, #991B1B 0%, #EF4444 100%)',
              boxShadow: '0 0 8px rgba(239,68,68,0.5)',
            }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        {STAT_CONFIG.map(({ key, label, icon, color, desc }) => (
          <div
            key={key}
            className="flex flex-col items-center p-2 rounded-rpg bg-rpg-surface-3/50 border border-rpg-border/50"
            title={desc}
          >
            <span className="text-lg leading-none mb-1" aria-hidden="true">{icon}</span>
            <span
              className="text-base font-bold font-mono leading-none"
              style={{ color }}
            >
              {character.stats[key]}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-rpg-text-faint mt-0.5">
              {label}
            </span>
          </div>
        ))}
      </div>
    </RPGCard>
  );
};

export default CharacterStatsCard;
