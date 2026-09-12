import React from 'react';
import type { RpgAttributes } from '../types';

interface AttributesCardProps {
  attributes: RpgAttributes;
}

const ATTRIBUTE_CONFIG: Record<
  keyof RpgAttributes,
  { label: string; icon: string; description: string; color: string; bg: string; border: string }
> = {
  strength: {
    label: 'Strength',
    icon: '⚔️',
    description: 'Physical prowess & hard tasks',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  intelligence: {
    label: 'Intelligence',
    icon: '🧠',
    description: 'Learning, deep work & knowledge',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  discipline: {
    label: 'Discipline',
    icon: '🛡️',
    description: 'Focus, willpower & resilience',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  stamina: {
    label: 'Stamina',
    icon: '⚡',
    description: 'Daily energy & vitality',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  consistency: {
    label: 'Consistency',
    icon: '🎯',
    description: 'Habit streaks & momentum',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
};

const AttributesCard: React.FC<AttributesCardProps> = ({ attributes }) => {
  const keys = Object.keys(ATTRIBUTE_CONFIG) as Array<keyof RpgAttributes>;

  return (
    <section
      className="rpg-hud-panel border border-rpg-border rounded-rpg-lg p-6 hover:border-rpg-gold/40 transition-all duration-300"
      aria-label="Character Attributes"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-rpg-gold font-bold">
            Core Character Sheet
          </p>
          <h2 className="font-display text-xl font-bold text-rpg-text mt-0.5">
            Character Attributes
          </h2>
        </div>
        <span className="text-sm font-mono text-rpg-text-muted">
          5 Core Stats
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {keys.map((key) => {
          const item = ATTRIBUTE_CONFIG[key];
          const val = attributes[key] ?? 1;

          return (
            <div
              key={key}
              className="bg-rpg-surface-2/60 border border-rpg-border rounded-rpg p-3.5 flex flex-col justify-between hover:border-rpg-border-2 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-7 h-7 rounded-rpg flex items-center justify-center text-sm border ${item.bg} ${item.border}`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className={`font-display text-xl font-black font-mono ${item.color}`}>
                  {val}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-rpg-text group-hover:text-rpg-gold transition-colors">
                  {item.label}
                </p>
                <p className="text-[10px] text-rpg-text-muted mt-0.5 line-clamp-1">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AttributesCard;
