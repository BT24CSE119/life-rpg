import React from 'react';

interface GoldBadgeProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  animate?: boolean;
}

const sizeConfig = {
  sm:  { text: 'text-xs',   icon: 'text-sm',  padding: 'px-2 py-0.5', gap: 'gap-1'   },
  md:  { text: 'text-sm',   icon: 'text-base', padding: 'px-3 py-1',   gap: 'gap-1.5' },
  lg:  { text: 'text-base', icon: 'text-lg',  padding: 'px-4 py-1.5', gap: 'gap-2'   },
};

const GoldBadge: React.FC<GoldBadgeProps> = ({
  amount,
  size = 'md',
  showIcon = true,
  className = '',
  animate = false,
}) => {
  const cfg = sizeConfig[size];

  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-semibold font-mono',
        'bg-rpg-gold-muted/30 text-rpg-gold border border-rpg-gold/30',
        cfg.text, cfg.padding, cfg.gap,
        animate ? 'animate-glow-pulse' : '',
        className,
      ].join(' ')}
      aria-label={`${amount.toLocaleString()} Gold`}
    >
      {showIcon && <span aria-hidden="true">🪙</span>}
      <span>{amount.toLocaleString()}</span>
    </span>
  );
};

export default GoldBadge;
