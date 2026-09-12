import React, { useEffect, useRef } from 'react';

interface XPProgressBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  showLabel?: boolean;
  showValues?: boolean;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm:  'h-1.5',
  md:  'h-2.5',
  lg:  'h-4',
};

const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  maxXP,
  level,
  showLabel = true,
  showValues = true,
  animate = true,
  size = 'md',
  className = '',
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const percentage = Math.min(100, Math.max(0, (currentXP / maxXP) * 100));

  useEffect(() => {
    if (animate && barRef.current) {
      // Trigger CSS animation via custom property
      barRef.current.style.setProperty('--xp-width', `${percentage}%`);
      barRef.current.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (barRef.current) {
            barRef.current.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            barRef.current.style.width = `${percentage}%`;
          }
        });
      });
    }
  }, [percentage, animate]);

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || showValues) && (
        <div className="flex items-center justify-between mb-2">
          {showLabel && (
            <span className="text-xs font-mono text-rpg-text-muted uppercase tracking-widest">
              Level {level} · XP
            </span>
          )}
          {showValues && (
            <span className="text-xs font-mono text-rpg-gold">
              {currentXP.toLocaleString()} / {maxXP.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={`
          relative w-full ${sizeClasses[size]} rounded-full
          bg-rpg-surface-3 shadow-rpg-inner overflow-hidden
        `}
        role="progressbar"
        aria-valuenow={currentXP}
        aria-valuemin={0}
        aria-valuemax={maxXP}
        aria-label={`XP Progress: ${currentXP} of ${maxXP}`}
      >
        {/* Fill */}
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{
            width: animate ? '0%' : `${percentage}%`,
            background: 'linear-gradient(90deg, #C9A030 0%, #F5C842 60%, #FFDD70 100%)',
            boxShadow: '0 0 12px rgba(245,200,66,0.5)',
          }}
        />

        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2.5s linear infinite',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Percentage */}
      {size === 'lg' && (
        <div className="mt-1 text-right">
          <span className="text-xs text-rpg-text-faint font-mono">
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default XPProgressBar;
