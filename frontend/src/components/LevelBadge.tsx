import React from 'react';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'gold' | 'arcane' | 'emerald';
}

const sizeConfig = {
  sm:  { outer: 'w-8 h-8',   text: 'text-xs',  label: 'text-[8px]'  },
  md:  { outer: 'w-12 h-12', text: 'text-sm',  label: 'text-[9px]'  },
  lg:  { outer: 'w-16 h-16', text: 'text-xl',  label: 'text-[10px]' },
  xl:  { outer: 'w-24 h-24', text: 'text-3xl', label: 'text-xs'     },
};

const variantConfig = {
  gold: {
    ring:   'border-rpg-gold/60',
    shadow: 'shadow-rpg-gold',
    text:   'text-rpg-gold',
    bg:     'bg-rpg-gold-muted/20',
    label:  'text-rpg-gold/70',
  },
  arcane: {
    ring:   'border-rpg-arcane/60',
    shadow: 'shadow-rpg-arcane',
    text:   'text-rpg-arcane-light',
    bg:     'bg-rpg-arcane/10',
    label:  'text-rpg-arcane-light/70',
  },
  emerald: {
    ring:   'border-rpg-emerald/60',
    shadow: 'shadow-rpg-emerald',
    text:   'text-rpg-emerald',
    bg:     'bg-rpg-emerald/10',
    label:  'text-rpg-emerald/70',
  },
};

const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 'md',
  variant = 'gold',
  className = '',
}) => {
  const cfg = sizeConfig[size];
  const v = variantConfig[variant];

  return (
    <div
      className={[
        'relative flex flex-col items-center justify-center rounded-full',
        'border-2 font-display font-bold',
        cfg.outer, v.ring, v.shadow, v.bg,
        className,
      ].join(' ')}
      aria-label={`Level ${level}`}
    >
      <span className={`${cfg.text} ${v.text} leading-none`}>{level}</span>
      {size !== 'sm' && (
        <span className={`${cfg.label} ${v.label} uppercase tracking-widest leading-none mt-0.5`}>
          LVL
        </span>
      )}
    </div>
  );
};

export default LevelBadge;
