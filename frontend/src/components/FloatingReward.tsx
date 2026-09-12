import React from 'react';

export interface FloatingRewardItem {
  id: number;
  xp?: number;
  gold?: number;
  x?: number;
  y?: number;
}

interface FloatingRewardProps {
  rewards: FloatingRewardItem[];
}

const FloatingReward: React.FC<FloatingRewardProps> = ({ rewards }) => {
  if (rewards.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {rewards.map((r) => (
        <div
          key={r.id}
          className="flex flex-col items-center gap-1.5 animate-float-reward"
          style={
            r.x !== undefined && r.y !== undefined
              ? { position: 'absolute', left: `${r.x}px`, top: `${r.y}px` }
              : undefined
          }
        >
          {r.xp !== undefined && r.xp > 0 && (
            <span className="px-3.5 py-1 rounded-full text-sm font-display font-extrabold font-mono bg-purple-900/90 text-purple-300 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              ✨ +{r.xp} XP
            </span>
          )}
          {r.gold !== undefined && r.gold > 0 && (
            <span className="px-3.5 py-1 rounded-full text-sm font-display font-extrabold font-mono bg-amber-900/90 text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(245,200,66,0.5)]">
              🪙 +{r.gold} Gold
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default FloatingReward;
