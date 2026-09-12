import React, { useState, useEffect, useRef } from 'react';

interface FloatingRpgCoreProps {
  level?: number;
  streak?: number;
  activeQuestsCount?: number;
}

const FloatingRpgCore: React.FC<FloatingRpgCoreProps> = ({
  level = 1,
  streak = 0,
  activeQuestsCount = 0,
}) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pause animations when document is hidden to save CPU/battery
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.visibilityState === 'hidden');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 24; // -12 to 12 deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -24; // 12 to -12 deg
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center select-none group"
      aria-label="Floating RPG Command Artifact"
      role="img"
    >
      {/* ── Atmospheric Radial Glow ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/20 via-cyan-500/15 to-amber-400/20 blur-2xl transform scale-110 pointer-events-none transition-transform duration-700 group-hover:scale-125"
        aria-hidden="true"
      />

      {/* ── Outer Orbital Ring (Cyan / Neon Blue) ───────────────────────────── */}
      <div
        className={`absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-cyan-500/30 border-dashed pointer-events-none ${
          isPaused ? '' : 'animate-[spin_24s_linear_infinite]'
        }`}
        style={{
          boxShadow: '0 0 15px rgba(6,182,212,0.15), inset 0 0 15px rgba(6,182,212,0.1)',
        }}
        aria-hidden="true"
      >
        {/* Orbital satellite bead */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#06B6D4]" />
      </div>

      {/* ── Middle Orbital Ring (Arcane Purple, Tilted 45deg) ─────────────────── */}
      <div
        className={`absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-purple-500/40 pointer-events-none ${
          isPaused ? '' : 'animate-[spin_16s_linear_infinite_reverse]'
        }`}
        style={{
          transform: 'rotateX(60deg) rotateY(25deg)',
          boxShadow: '0 0 15px rgba(168,85,247,0.2)',
        }}
        aria-hidden="true"
      >
        <div className="absolute -bottom-1.5 left-1/3 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_12px_#A855F7]" />
      </div>

      {/* ── Inner Gold Horizon Disc ─────────────────────────────────────────── */}
      <div
        className={`absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-amber-400/30 pointer-events-none ${
          isPaused ? '' : 'animate-[spin_10s_linear_infinite]'
        }`}
        style={{
          transform: 'rotateX(75deg)',
          boxShadow: '0 0 20px rgba(245,200,66,0.25)',
        }}
        aria-hidden="true"
      />

      {/* ── 3D Floating Isometric Cube Core ─────────────────────────────────── */}
      <div
        className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 transition-transform duration-200 ease-out"
        style={{
          perspective: '800px',
          transform: `rotateY(${mouseOffset.x}deg) rotateX(${mouseOffset.y}deg)`,
        }}
      >
        <div
          className={`w-full h-full relative ${
            isPaused ? '' : 'animate-[spin_14s_linear_infinite]'
          }`}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Cube Face 1: Front */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-600/50 border border-purple-400/60 backdrop-blur-md rounded-lg flex items-center justify-center shadow-[inset_0_0_15px_rgba(168,85,247,0.4)]"
            style={{ transform: 'translateZ(40px)' }}
          >
            <span className="text-sm font-bold text-cyan-300 font-mono drop-shadow-[0_0_6px_#06B6D4]">
              LV.{level}
            </span>
          </div>

          {/* Cube Face 2: Back */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-700/40 to-indigo-900/60 border border-indigo-400/60 backdrop-blur-md rounded-lg flex items-center justify-center shadow-[inset_0_0_15px_rgba(99,102,241,0.4)]"
            style={{ transform: 'rotateY(180deg) translateZ(40px)' }}
          >
            <span className="text-base" aria-hidden="true">⚔️</span>
          </div>

          {/* Cube Face 3: Right */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-cyan-600/30 to-blue-700/50 border border-cyan-400/60 backdrop-blur-md rounded-lg flex items-center justify-center shadow-[inset_0_0_15px_rgba(6,182,212,0.4)]"
            style={{ transform: 'rotateY(90deg) translateZ(40px)' }}
          >
            <span className="text-xs font-mono font-bold text-amber-300">
              🔥{streak}d
            </span>
          </div>

          {/* Cube Face 4: Left */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-800/40 to-cyan-900/50 border border-purple-400/50 backdrop-blur-md rounded-lg flex items-center justify-center shadow-[inset_0_0_15px_rgba(168,85,247,0.3)]"
            style={{ transform: 'rotateY(-90deg) translateZ(40px)' }}
          >
            <span className="text-xs font-mono font-bold text-purple-200">
              {activeQuestsCount}Q
            </span>
          </div>

          {/* Cube Face 5: Top */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-purple-600/40 border border-amber-300/60 backdrop-blur-md rounded-lg flex items-center justify-center shadow-[inset_0_0_15px_rgba(245,200,66,0.3)]"
            style={{ transform: 'rotateX(90deg) translateZ(40px)' }}
          >
            <span className="text-sm" aria-hidden="true">💎</span>
          </div>

          {/* Cube Face 6: Bottom */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-purple-950/80 border border-purple-500/40 backdrop-blur-md rounded-lg flex items-center justify-center"
            style={{ transform: 'rotateX(-90deg) translateZ(40px)' }}
          >
            <div className="w-3 h-3 rounded-full bg-cyan-400 blur-[2px]" />
          </div>

          {/* Inner Radiant Pulsing Light Core */}
          <div
            className="absolute inset-3 rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-300 blur-sm opacity-80 animate-pulse"
            style={{ transform: 'translateZ(0)' }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ── Dynamic Status Caption Tag ──────────────────────────────────────── */}
      <div className="absolute -bottom-2 z-20 px-3 py-1 rounded-full bg-rpg-bg/90 backdrop-blur-md border border-rpg-border/80 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center gap-1.5 text-[11px] font-mono text-rpg-text">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" aria-hidden="true" />
        <span className="text-cyan-300 font-semibold">Realm Core Online</span>
      </div>
    </div>
  );
};

export default FloatingRpgCore;
