import React, { useEffect, useRef } from 'react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  xpEarned?: number;
  goldEarned?: number;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  xpEarned,
  goldEarned,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    // Focus continue button when opened
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
    >
      <div
        className="relative w-full max-w-md p-8 text-center bg-gradient-to-b from-rpg-surface-2 to-rpg-surface border-2 border-rpg-gold/60 rounded-rpg-xl shadow-[0_0_50px_rgba(245,200,66,0.3)] animate-scale-in"
      >
        {/* Radiant golden sunburst/glow */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-rpg-gold/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-rpg-text-muted hover:text-rpg-text p-1 rounded-rpg focus:outline-none focus-visible:ring-2 focus-visible:ring-rpg-gold"
          aria-label="Close Level Up modal"
        >
          ✕
        </button>

        {/* Trophy / Laurel Icon */}
        <div
          className="w-24 h-24 mx-auto mb-4 rounded-full bg-rpg-gold/15 border-2 border-rpg-gold flex items-center justify-center text-5xl shadow-rpg-gold animate-levelup-glow"
          aria-hidden="true"
        >
          👑
        </div>

        {/* Level Up Announcement */}
        <p className="text-xs uppercase tracking-widest text-rpg-gold font-bold">
          Celebration of Growth
        </p>
        <h2
          id="levelup-title"
          className="font-display text-4xl sm:text-5xl font-black text-gold-gradient mt-1 mb-2 tracking-tight"
        >
          LEVEL UP!
        </h2>
        <p className="font-display text-2xl font-bold text-rpg-text mb-4">
          You Reached Level {newLevel}
        </p>

        <p className="text-sm text-rpg-text-muted italic max-w-xs mx-auto mb-6 leading-relaxed">
          “Every task completed in the mortal realm forges greater power within the adventurer.”
        </p>

        {/* Reward Summary Badge */}
        {(xpEarned !== undefined || goldEarned !== undefined) && (
          <div className="flex items-center justify-center gap-3 mb-6">
            {xpEarned !== undefined && xpEarned > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                ✨ +{xpEarned} XP
              </span>
            )}
            {goldEarned !== undefined && goldEarned > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rpg-gold/15 text-rpg-gold border border-rpg-gold/30">
                🪙 +{goldEarned} Gold
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="w-full py-3 px-6 rounded-rpg font-display font-bold text-base bg-rpg-gradient-gold text-rpg-bg hover:brightness-105 active:scale-[0.98] shadow-sm border border-amber-500/40 transition-all"
        >
          ⚔️ Continue Adventure
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;
