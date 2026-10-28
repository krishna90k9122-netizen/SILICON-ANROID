import React, { useEffect, useRef, useState, useCallback } from 'react';
// Import the preloader video (folder name is literally "vidio").
import preloaderVideo from '../vidio/WhatsApp Video 2026-10-28 at 12.18.59 PM.mp4';

// Total preloader duration (ms) — the 1→100% counter runs for exactly this long.
const DURATION = 8000;
// Circumference of the circular progress ring (r = 42 in a 100x100 viewBox).
const RING_LEN = 2 * Math.PI * 42;

/**
 * Full-screen video preloader shown on fresh app launch.
 * Plays muted + inline while a 1→100% counter fills over DURATION (10s).
 * Once the counter hits 100 it calls `onFinished` so the parent (App)
 * swaps in the home page.
 *
 * NOTE: this component is rendered OUTSIDE <BrowserRouter>, so it must
 * NOT use router hooks like useNavigate. App.jsx handles the transition.
 */
const VideoPreloader = ({ onFinished }) => {
  const videoRef = useRef(null);
  const finishedRef = useRef(false);
  const [progress, setProgress] = useState(0);

  // Fire once: reveal the app.
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (typeof onFinished === 'function') onFinished();
  }, [onFinished]);

  // Programmatic play() helps Android WebViews that ignore the autoplay attr.
  useEffect(() => {
    const v = videoRef.current;
    if (v && typeof v.play === 'function') {
      const playPromise = v.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          /* Autoplay blocked — the timer still drives the counter to 100%. */
        });
      }
    }
  }, []);

  // Drive the 1→100% counter over DURATION, then finish.
  useEffect(() => {
    let rafId;
    let lastPct = -1;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.floor((elapsed / DURATION) * 100));

      // Only re-render when the integer percent actually changes.
      if (pct !== lastPct) {
        lastPct = pct;
        setProgress(pct);
      }

      if (pct >= 100) {
        finish();
        return; // stop the loop
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [finish]);

  // Prevent background scrolling while the splash is up.
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    // Dark stage — matches the app's desktop theme.
    <div className="fixed inset-0 z-50 bg-[#0A121E] flex items-center justify-center p-0 lg:p-6">
      {/* Phone-frame container — mirrors MainLayout's mobile-simulator on desktop.
          On real phones/Android (< lg) it stays full-screen. */}
      <div className="relative w-full h-full bg-black overflow-hidden lg:max-w-[420px] lg:h-[880px] lg:max-h-[94vh] lg:rounded-[44px] lg:border-[10px] lg:border-[#102438] lg:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]">
        <video
          ref={videoRef}
          src={preloaderVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Bottom gradient so the counter stays readable over the video */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />

        {/* Percentage HUD */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-8 pb-12">
          {/* Circular progress ring with the % number inside */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="preloaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF4D0A" />
                  <stop offset="100%" stopColor="#FF9A4D" />
                </linearGradient>
              </defs>
              {/* Track */}
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
              {/* Progress */}
              <circle
                cx="50" cy="50" r="42"
                stroke="url(#preloaderGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={RING_LEN}
                strokeDashoffset={RING_LEN - (RING_LEN * progress) / 100}
              />
            </svg>
            {/* Smaller % number centered inside the ring */}
            <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-white">
              <span className="text-xl tabular-nums leading-none">{progress}</span>
              <span className="text-[10px] ml-0.5 text-white/70 leading-none mt-0.5">%</span>
            </div>
          </div>

          {/* Label + brand */}
          <p className="mt-4 text-[9px] font-mono uppercase tracking-[0.35em] text-white/50">
            Loading
          </p>
          <p className="mt-1.5 text-xs font-extrabold tracking-wider text-white">
            DRIFTLENS-Q
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPreloader;
