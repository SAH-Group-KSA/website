"use client";

import { useEffect, useRef, useState } from "react";

const HERO_VIDEO_SRC = "/videos/leading-by-listening-faces-blurred.mp4";
const HERO_POSTER = "/images/backgrounds/hero-media.webp";

/**
 * Decorative hero video. Mobile and reduced-motion users receive the static
 * CSS fallback. Desktop load is deferred until after first paint / idle so
 * Speed Index is not blocked by the media request.
 */
export function HeroMediaVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [eligible, setEligible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 861px)");
    const sync = () => {
      setEligible(desktopQuery.matches && !motionQuery.matches);
    };

    sync();
    motionQuery.addEventListener("change", sync);
    desktopQuery.addEventListener("change", sync);
    return () => {
      motionQuery.removeEventListener("change", sync);
      desktopQuery.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!eligible) {
      setShouldLoad(false);
      setReady(false);
      return;
    }

    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const arm = () => {
      if (!cancelled) setShouldLoad(true);
    };

    // Prefer idle; fall back so video still appears on busy main threads.
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(arm, { timeout: 1800 });
    } else {
      timeoutId = setTimeout(arm, 400);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [eligible]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!shouldLoad) {
      video.pause();
      return;
    }

    video.load();
    void video.play().catch(() => {
      /* autoplay may still be blocked */
    });
  }, [shouldLoad]);

  return (
    <video
      ref={ref}
      className={`hero-media-video${ready ? " is-ready" : ""}`}
      autoPlay={shouldLoad}
      muted
      loop
      playsInline
      poster={HERO_POSTER}
      preload={shouldLoad ? "metadata" : "none"}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      onLoadedData={() => setReady(true)}
      onPlaying={() => setReady(true)}
    >
      {shouldLoad ? (
        <source src={HERO_VIDEO_SRC} type="video/mp4" />
      ) : null}
    </video>
  );
}
