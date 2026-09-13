/**
 * Mobile Haptic Feedback Utility
 * Triggers subtle vibration patterns on supported devices (Android & iOS WebKit when enabled)
 */

export const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'levelup' | 'warning' = 'light') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(30);
        break;
      case 'success':
        navigator.vibrate([20, 50, 40]);
        break;
      case 'levelup':
        navigator.vibrate([40, 60, 60, 80, 100]);
        break;
      case 'warning':
        navigator.vibrate([50, 80, 50]);
        break;
    }
  } catch {
    // Ignore devices that block vibration
  }
};
