import React, { useState, useEffect } from 'react';

interface GuildPomodoroTimerProps {
  onSessionComplete?: (minutes: number) => void;
}

export const GuildPomodoroTimer: React.FC<GuildPomodoroTimerProps> = ({ onSessionComplete }) => {
  // Preset study durations in minutes
  const MODES = [
    { label: '25m Focus', minutes: 25, type: 'focus' },
    { label: '50m Deep Focus', minutes: 50, type: 'focus' },
    { label: '5m Short Break', minutes: 5, type: 'break' },
    { label: '15m Long Break', minutes: 15, type: 'break' },
  ];

  const [selectedMode, setSelectedMode] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [todayFocusMinutes, setTodayFocusMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('rpg_today_focus_minutes');
    return saved ? parseInt(saved, 10) : 125;
  });

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      const minutesCompleted = MODES[selectedMode].minutes;
      if (MODES[selectedMode].type === 'focus') {
        const updated = todayFocusMinutes + minutesCompleted;
        setTodayFocusMinutes(updated);
        localStorage.setItem('rpg_today_focus_minutes', updated.toString());
        onSessionComplete?.(minutesCompleted);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, selectedMode, todayFocusMinutes, onSessionComplete]);

  const handleSelectMode = (index: number) => {
    setIsRunning(false);
    setSelectedMode(index);
    setTimeLeft(MODES[index].minutes * 60);
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODES[selectedMode].minutes * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalHours = (todayFocusMinutes / 60).toFixed(1);
  const totalSessions = Math.floor(todayFocusMinutes / 25);

  const currentMode = MODES[selectedMode];
  const progressPercent = ((currentMode.minutes * 60 - timeLeft) / (currentMode.minutes * 60)) * 100;

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#131728] via-[#101322] to-[#0a0c16] border border-amber-500/30 p-5 shadow-lg overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

      {/* Header with Mode & Study Hours Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h3 className="font-display font-bold text-base text-amber-200">
              Guild Focus Timer
            </h3>
            {isRunning && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-950/70 text-emerald-400 border border-emerald-500/50 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                ACTIVE SESSION
              </span>
            )}
          </div>
          <p className="text-xs text-rpg-text-muted mt-0.5">
            Synchronized co-working session. Maintain deep focus alongside guild members.
          </p>
        </div>

        {/* Study Hours Today Widget */}
        <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 shrink-0 self-start sm:self-auto">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Study Time Today
            </span>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-lg font-black text-amber-300">{totalHours} hrs</span>
              <span className="text-[11px] text-slate-400 font-medium">({todayFocusMinutes} mins · {totalSessions} sessions)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Mode Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 mb-4 relative z-10">
        {MODES.map((mode, idx) => (
          <button
            key={mode.label}
            onClick={() => handleSelectMode(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
              selectedMode === idx
                ? 'bg-amber-500 text-slate-950 shadow-md border border-amber-300'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Main Countdown Display & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-black/50 border border-white/5 relative z-10">
        <div className="flex items-center gap-5">
          {/* Big Digital Countdown */}
          <div className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-gold-gradient select-none">
            {formattedTime}
          </div>

          <div className="hidden sm:block border-l border-white/10 pl-4">
            <span className="text-[11px] font-mono font-bold text-amber-400 block uppercase">
              {currentMode.type === 'focus' ? 'Active Work Interval' : 'Scheduled Rest Interval'}
            </span>
            <span className="text-xs text-slate-400">
              {isRunning ? 'Focus block in progress' : 'Ready to start'}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={toggleTimer}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-display font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
              isRunning
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-300'
            }`}
          >
            {isRunning ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Start Focus
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
            title="Reset timer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Progress Bar under countdown */}
      <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden mt-3 relative z-10">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default GuildPomodoroTimer;
