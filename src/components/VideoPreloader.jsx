import React, { useEffect, useRef, useCallback, useState } from 'react';
// Import the preloader video (folder name is literally "vidio").
import preloaderVideo from '../vidio/splash-nostar.mp4';

// How long the splash video stays up before the home page opens (ms).
const DURATION = 8000;

/**
 * Full-screen video preloader shown on fresh app launch.
 * Plays for DURATION (8s), then calls `onFinished` so the parent (App)
 * swaps in the home page.
 *
 * SOUND: browsers block AUDIBLE autoplay until the user interacts, so the
 * video starts muted (guaranteed to play) and sound is unlocked on the first
 * tap anywhere (or via the small "Tap for sound" button). On Android WebViews
 * that allow audible autoplay, the first tap also just works.
 *
 * NOTE: rendered OUTSIDE <BrowserRouter> — do NOT use router hooks here.
 */
const VideoPreloader = ({ onFinished }) => {
  const videoRef = useRef(null);
  const finishedRef = useRef(false);
  const [muted, setMuted] = useState(true);
  const [soundUnlocked, setSoundUnlocked] = useState(false);

  // Fire once: reveal the app.
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (typeof onFinished === 'function') onFinished();
  }, [onFinished]);

  // Turn sound on (safe to call after a user gesture).
  const enableSound = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1.0;
    setMuted(false);
    setSoundUnlocked(true);
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, []);

  // Reliable muted autoplay so the splash always runs.
  useEffect(() => {
    const v = videoRef.current;
    if (v && typeof v.play === 'function') {
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          /* Autoplay blocked — the timer still ends the splash. */
        });
      }
    }
  }, []);

  // Unlock sound on the FIRST user interaction (browser autoplay policy).
  useEffect(() => {
    const unlock = () => enableSound();
    const events = ['pointerdown', 'touchstart', 'click', 'keydown'];
    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, [enableSound]);

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
          muted={muted}
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* "Tap for sound" affordance — hidden once sound is unlocked. */}
        {!soundUnlocked && (
          <button
            type="button"
            onClick={enableSound}
            aria-label="Enable sound"
            className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur-md px-3 py-2 text-white/90 text-xs font-semibold border border-white/15 active:scale-95 transition-transform"
          >
            <span aria-hidden="true">🔇</span>
            <span>Tap for sound</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoPreloader;
