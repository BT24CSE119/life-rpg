import React from 'react';
import GoldBadge from './GoldBadge';

interface GoldBalanceCardProps {
  goldBalance: number;
  onViewHistory?: () => void;
  className?: string;
}

const GoldBalanceCard: React.FC<GoldBalanceCardProps> = ({
  goldBalance,
  onViewHistory,
  className = '',
}) => {
  return (
    <div
      className={`bg-rpg-surface border border-rpg-border rounded-rpg-lg p-6 relative overflow-hidden group hover:border-rpg-gold/40 transition-all ${className}`}
    >
      {/* Background fantasy ambient glow */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-rpg-gold/5 blur-2xl group-hover:bg-rpg-gold/10 transition-all pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-rpg-gold font-semibold">
            Adventurer Treasury
          </p>
          <h2 className="font-display text-2xl font-bold text-rpg-text mt-0.5">
            Gold Balance
          </h2>
        </div>
        <div className="w-12 h-12 rounded-rpg bg-rpg-gold/10 border border-rpg-gold/30 flex items-center justify-center text-2xl shrink-0 shadow-rpg-gold/20">
          🪙
        </div>
      </div>

      <div className="flex items-baseline gap-3 my-3">
        <span className="font-display text-4xl font-extrabold text-gold-gradient tracking-tight">
          {goldBalance.toLocaleString()}
        </span>
        <span className="text-sm font-semibold text-rpg-gold uppercase tracking-wider">
          Gold
        </span>
      </div>

      <p className="text-xs text-rpg-text-muted mb-5 leading-relaxed">
        Earned by completing quests and challenges. Stored in your immutable server ledger.
      </p>

      {onViewHistory && (
        <button
          onClick={onViewHistory}
          className="inline-flex items-center gap-2 text-xs font-semibold text-rpg-gold hover:text-rpg-gold-light transition-colors py-1 group/btn"
        >
          <span>📜 View Gold Ledger</span>
          <span className="transition-transform group-hover/btn:translate-x-1" aria-hidden="true">
            →
          </span>
        </button>
      )}
    </div>
  );
};

export default GoldBalanceCard;
