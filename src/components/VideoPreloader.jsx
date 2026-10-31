import React, { useEffect, useRef, useCallback } from 'react';
// Import the preloader video (folder name is literally "vidio").
import preloaderVideo from '../vidio/splash-nostar.mp4';

// How long the splash video stays up before the home page opens (ms).
const DURATION = 8000;

/**
 * Full-screen video preloader shown on fresh app launch.
 * Plays for DURATION (8s), then calls `onFinished` so the parent (App)
 * swaps in the home page.
 *
 * SOUND: we start the video with sound on. Wherever the environment allows
 * audible autoplay (Android WebViews, returning visitors, etc.) sound plays
 * every time. If a strict browser blocks it, we fall back to a silent play so
 * the splash never breaks, and sound is unlocked on the FIRST interaction
 * (no visible button).
 *
 * NOTE: rendered OUTSIDE <BrowserRouter> — do NOT use router hooks here.
 */
const VideoPreloader = ({ onFinished }) => {
  const videoRef = useRef(null);
  const finishedRef = useRef(false);

  // Fire once: reveal the app.
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (typeof onFinished === 'function') onFinished();
  }, [onFinished]);

  // Start WITH sound; if audible autoplay is blocked, fall back to a muted
  // play so the splash still runs (never a black screen).
  useEffect(() => {
    const v = videoRef.current;
    if (!v || typeof v.play !== 'function') return;
    v.muted = false;
    v.volume = 1.0;
    const p = v.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        // Audible autoplay blocked → play silently instead.
        v.muted = true;
        const mp = v.play();
        if (mp && typeof mp.catch === 'function') {
          mp.catch(() => {
            /* Autoplay blocked entirely — the timer still ends the splash. */
          });
        }
      });
    }
  }, []);

  // Unlock sound on the FIRST user interaction (silent — no visible button).
  useEffect(() => {
    const unlock = () => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = false;
      v.volume = 1.0;
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    const events = ['pointerdown', 'touchstart', 'click', 'keydown'];
    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, []);

  // Reveal the home page after DURATION.
  useEffect(() => {
    const timerId = setTimeout(finish, DURATION);
    return () => clearTimeout(timerId);
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
          playsInline
          loop
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default VideoPreloader;
