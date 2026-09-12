import React from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type CardVariant = 'default' | 'gold' | 'emerald' | 'arcane' | 'glass';

interface RPGCardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
  role?: string;
  'aria-label'?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default: [
    'bg-rpg-gradient-card',
    'border border-rpg-border',
    'shadow-rpg-card',
  ].join(' '),

  gold: [
    'bg-rpg-gradient-card',
    'border border-rpg-gold/30',
    'shadow-rpg-gold',
  ].join(' '),

  emerald: [
    'bg-rpg-gradient-card',
    'border border-rpg-emerald/30',
    'shadow-rpg-emerald',
  ].join(' '),

  arcane: [
    'bg-rpg-gradient-card',
    'border border-rpg-arcane/30',
    'shadow-rpg-arcane',
  ].join(' '),

  glass: [
    'glass-card',
  ].join(' '),
};

const paddingClasses = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
};

// ── Component ─────────────────────────────────────────────────────────────────

const RPGCard: React.FC<RPGCardProps> = ({
  variant = 'default',
  className = '',
  children,
  onClick,
  hoverable = false,
  padding = 'md',
  as: Tag = 'div',
  ...rest
}) => {
  const isInteractive = !!onClick || hoverable;

  return (
    <Tag
      onClick={onClick}
      className={[
        'rounded-rpg-lg overflow-hidden transition-all duration-300',
        variantClasses[variant],
        paddingClasses[padding],
        isInteractive
          ? 'cursor-pointer hover:shadow-rpg-hover hover:-translate-y-1 hover:border-opacity-60'
          : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default RPGCard;
