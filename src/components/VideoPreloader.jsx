import React, { useEffect, useRef, useCallback } from 'react';
// Import the preloader video (folder name is literally "vidio").
import preloaderVideo from '../vidio/gemini_generated_video_ca5fc4ae.mp4';

// How long the splash video stays up before the home page opens (ms).
const DURATION = 8000;

/**
 * Full-screen video preloader shown on fresh app launch.
 * Plays muted + inline for DURATION (8s), then calls `onFinished` so the
 * parent (App) swaps in the home page.
 *
 * NOTE: this component is rendered OUTSIDE <BrowserRouter>, so it must
 * NOT use router hooks like useNavigate. App.jsx handles the transition.
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

  // Programmatic play() helps Android WebViews that ignore the autoplay attr.
  useEffect(() => {
    const v = videoRef.current;
    if (v && typeof v.play === 'function') {
      const playPromise = v.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          /* Autoplay blocked — the timer still ends the splash. */
        });
      }
    }
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
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default VideoPreloader;
