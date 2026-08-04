import { useEffect, useState } from 'react';
import { useAppReady } from '../context/AppReadyContext';

const MAX_WAIT_MS = 3000; // never block for more than 3s

/**
 * LoadingScreen
 *
 * Shows the brand logo centered on the amber background while the
 * hero video and Supabase data load. Auto-dismisses after MAX_WAIT_MS.
 * On dismiss it calls markAppReady() so the hero video can start playing.
 *
 * Mount this once in __root.tsx so it shows on every initial page load.
 */
export function LoadingScreen() {
  const { markAppReady } = useAppReady();
  // visible = overlay rendered; fading = exit transition running
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // After MAX_WAIT_MS, start the fade-out regardless
    const timer = setTimeout(() => {
      setFading(true);
    }, MAX_WAIT_MS);

    return () => clearTimeout(timer);
  }, []);

  // Once fading starts, wait for the CSS transition to finish (800ms),
  // then remove the overlay from the DOM and signal app is ready.
  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(() => {
      setVisible(false);
      markAppReady();
    }, 820);
    return () => clearTimeout(t);
  }, [fading, markAppReady]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#E8B98A', // --background amber
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.82s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      {/* Logo only */}
      <img
        src="/lattev_transparent.png"
        alt="Lattév Jouel"
        style={{
          width: 'clamp(120px, 28vw, 220px)',
          height: 'auto',
          animation: 'loadingLogoPulse 2s ease-in-out infinite',
        }}
      />

      {/* Thin progress bar at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 2,
          background: 'linear-gradient(90deg, #4F5820, #6B7326, #B8C057)',
          animation: `loadingBar ${MAX_WAIT_MS}ms linear forwards`,
        }}
      />

      <style>{`
        @keyframes loadingLogoPulse {
          0%, 100% { opacity: 0.9; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
        }
        @keyframes loadingBar {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
