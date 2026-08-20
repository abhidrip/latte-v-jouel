import { useEffect, useState } from 'react';
import { useAppReady } from '../context/AppReadyContext';

const MAX_WAIT_MS = 1800; // reduced from 3000 — enough for fonts + video first frame

/**
 * LoadingScreen
 *
 * Shows the brand logo centered on the amber background while the
 * hero video and Supabase data load. Auto-dismisses after MAX_WAIT_MS.
 * On dismiss it calls markAppReady() so the hero video can start playing.
 *
 * Crucially, we kick off preloading of GSAP, Lenis, and Three.js
 * while the loading screen is visible, so they're cached and instantly
 * available the moment the overlay exits — eliminating the second jank wave.
 *
 * Mount this once in __root.tsx so it shows on every initial page load.
 */
export function LoadingScreen() {
  const { markAppReady } = useAppReady();
  // visible = overlay rendered; fading = exit transition running
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  // Kick off heavy module preloads immediately — they run in the background
  // and will be fully cached by the time the overlay exits.
  useEffect(() => {
    // Fire-and-forget: we don't await these, just warm the module cache
    import('gsap').catch(() => {});
    import('gsap/ScrollTrigger').catch(() => {});
    import('lenis').catch(() => {});
    import('three').catch(() => {});
  }, []);

  // After MAX_WAIT_MS, start the fade-out regardless
  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
    }, MAX_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);

  // Once fading starts, wait for the CSS transition to finish (700ms),
  // then remove the overlay from the DOM and signal app is ready.
  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(() => {
      setVisible(false);
      markAppReady();
    }, 720);
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
        background: '#E8B98A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.72s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      {/* Logo only */}
      <img
        src="/lattev_transparent.webp"
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
