import React, { useEffect, useState, useRef } from 'react';

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
  const [isSparkling, setIsSparkling] = useState(false);
  const prevBalanceRef = useRef(goldBalance);

  useEffect(() => {
    if (goldBalance > prevBalanceRef.current) {
      setIsSparkling(true);
      const timer = setTimeout(() => setIsSparkling(false), 1200);
      return () => clearTimeout(timer);
    }
    prevBalanceRef.current = goldBalance;
  }, [goldBalance]);

  return (
    <div
      className={`rpg-hud-panel border border-rpg-border rounded-rpg-lg p-6 relative overflow-hidden group transition-all duration-300 hover:border-rpg-gold/40 h-full flex flex-col justify-between ${className}`}
    >
      {/* Background fantasy ambient glow */}
      <div
        className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all duration-700 ${
          isSparkling ? 'bg-rpg-gold/25 scale-125' : 'bg-rpg-gold/5 group-hover:bg-rpg-gold/10'
        }`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-rpg-gold font-bold">
            Adventurer Treasury
          </p>
          <h2 className="font-display text-2xl font-bold text-rpg-text mt-0.5">
            Gold Balance
          </h2>
        </div>
        <div
          className={`w-12 h-12 rounded-rpg bg-gradient-to-br from-rpg-surface-3 to-rpg-surface-2 border border-rpg-gold/40 flex items-center justify-center text-2xl shrink-0 shadow-rpg-gold/20 transition-transform duration-300 ${
            isSparkling ? 'scale-110 rotate-6 shadow-rpg-gold' : 'group-hover:scale-105'
          }`}
          aria-hidden="true"
        >
          🪙
        </div>
      </div>

      <div className="flex items-baseline gap-3 my-3">
        <span
          className={`font-display text-4xl sm:text-5xl font-extrabold text-gold-gradient tracking-tight transition-all duration-300 ${
            isSparkling ? 'scale-105 brightness-125' : ''
          }`}
        >
          {goldBalance.toLocaleString()}
        </span>
        <span className="text-xs font-bold text-rpg-gold uppercase tracking-widest font-mono">
          Coins
        </span>
      </div>

      <p className="text-xs text-rpg-text-muted mb-5 leading-relaxed">
        Stored in your permanent server ledger. Earned through victorious quest completion.
      </p>

      {onViewHistory && (
        <button
          onClick={onViewHistory}
          className="inline-flex items-center gap-2 text-xs font-semibold text-rpg-gold hover:text-rpg-gold-light transition-colors py-1 group/btn focus:outline-none focus-visible:ring-2 focus-visible:ring-rpg-gold"
        >
          <span>📜 View Gold Ledger</span>
          <span className="transition-transform duration-200 group-hover/btn:translate-x-1" aria-hidden="true">
            →
          </span>
        </button>
      )}
    </div>
  );
};

export default GoldBalanceCard;
