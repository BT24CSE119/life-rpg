import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if dismissed previously within 3 days
    const dismissedAt = localStorage.getItem('rpg_pwa_dismissed');
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 3 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Check if already in standalone app mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setIsIOS(true);
      setIsVisible(true);
    }

    // Standard Chromium / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSInstructions(false);
    localStorage.setItem('rpg_pwa_dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Bottom Floating Install Bar */}
      <aside
        aria-label="Install Life RPG Application"
        className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-md mx-auto z-50 animate-slide-up"
      >
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#171b2d] via-[#121626] to-[#0e111d] border-2 border-amber-400/70 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,200,66,0.25)] flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            {/* App Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-[10px] bg-[#0d101d] flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
                  <path d="M13 19l6-6" />
                  <path d="M2 2l6 6" />
                  <path d="M20 16l2-2" />
                  <path d="M16 20l2-2" />
                </svg>
              </div>
            </div>

            <div className="min-w-0">
              <h4 className="font-display font-bold text-xs text-amber-200 truncate">
                Install Life RPG App
              </h4>
              <p className="text-[11px] text-slate-300 truncate">
                Faster quest tracking & fullscreen mode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-display font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Install
            </button>

            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-all"
              aria-label="Dismiss install banner"
            >
              ✕
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari Guide Modal */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm rounded-2xl bg-[#121626] border-2 border-amber-400/60 p-6 shadow-2xl text-white">
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
            <h3 className="font-display font-bold text-base text-amber-300 mb-3">
              Install on iOS Safari
            </h3>
            <ol className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-amber-400 bg-white/5 px-2 py-0.5 rounded">1</span>
                <span>Tap the <strong>Share</strong> button at the bottom of Safari.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-amber-400 bg-white/5 px-2 py-0.5 rounded">2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-amber-400 bg-white/5 px-2 py-0.5 rounded">3</span>
                <span>Tap <strong>"Add"</strong> in the top right corner.</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallAppBanner;
