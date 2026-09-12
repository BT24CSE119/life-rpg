import React from 'react';

interface FloatingRpgCoreProps {
  level?: number;
  streak?: number;
  activeQuestsCount?: number;
}

const FloatingRpgCore: React.FC<FloatingRpgCoreProps> = ({
  level = 1,
}) => {

  // Sketchfab 3D embed parameters:
  // autospin=0.5 (rotates automatically)
  // ui_controls=0, ui_infos=0, ui_watermark=0, ui_settings=0, ui_help=0, ui_hint=0, ui_ar=0, ui_vr=0 (hides all overlay buttons)
  const embedUrl =
    'https://sketchfab.com/models/537c93c5fcb14ffba4ffc846ea2dbd42/embed?autostart=1&autoplay=1&preload=1&transparent=1&ui_theme=dark&autospin=0.5&ui_controls=0&ui_infos=0&ui_watermark=0&ui_settings=0&ui_help=0&ui_hint=0&ui_general_controls=0&ui_ar=0&ui_vr=0';

  return (
    <div
      className="relative w-72 h-72 sm:w-80 sm:h-80 flex flex-col items-center justify-center select-none group"
      aria-label="3D Adventurer Character"
    >
      {/* ── Fantasy Ambient Radial Glow ─────────────────────────────────────────── */}
      <div
        className="absolute inset-2 rounded-full bg-gradient-to-tr from-purple-600/25 via-cyan-500/20 to-amber-400/25 blur-3xl transform scale-110 pointer-events-none transition-transform duration-700 group-hover:scale-125"
        aria-hidden="true"
      />

      {/* ── Outer Concentric Circular Orbit 1 ─────────────────────────────────── */}
      <div
        className="absolute w-80 h-80 sm:w-88 sm:h-88 rounded-full border border-cyan-500/25 border-dashed pointer-events-none animate-[spin_40s_linear_infinite]"
        style={{
          boxShadow: '0 0 25px rgba(6,182,212,0.12), inset 0 0 15px rgba(6,182,212,0.06)',
        }}
        aria-hidden="true"
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#06B6D4]" />
      </div>

      {/* ── Mid Concentric Circular Orbit 2 (Opposite direction) ────────────────── */}
      <div
        className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-purple-500/30 pointer-events-none animate-[spin_28s_linear_infinite_reverse]"
        style={{
          boxShadow: '0 0 20px rgba(168,85,247,0.18)',
        }}
        aria-hidden="true"
      >
        <div className="absolute -bottom-1.5 right-1/4 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_10px_#A855F7]" />
      </div>

      {/* ── Inner Accent Circular Orbit 3 ─────────────────────────────────────── */}
      <div
        className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-amber-400/20 pointer-events-none animate-[spin_50s_linear_infinite]"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 -right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
      </div>

      {/* ── 3D Character Circular Viewport (Full body visible) ───────────────── */}
      <div className="relative z-10 w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden border-2 border-cyan-500/30 bg-rpg-surface/85 backdrop-blur-md shadow-2xl transition-all duration-500 group-hover:border-amber-400/60 group-hover:shadow-[0_0_30px_rgba(245,200,66,0.25)] flex items-center justify-center">
        {/* Embedded 3D Character Model scaled and positioned to display the complete body while cutting off all bottom buttons */}
        <div className="w-[125%] h-[135%] -mt-3 -mb-12 flex items-center justify-center pointer-events-auto">
          <iframe
            title="The Character"
            src={embedUrl}
            className="w-full h-full border-0 rounded-full scale-75 translate-y-2"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
          />
        </div>

        {/* Level Tag Overlay */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 shadow-md pointer-events-none z-20">
          HERO · LV.{level}
        </div>
      </div>


    </div>
  );
};

export default FloatingRpgCore;
