"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Decorative hero video. Mobile and reduced-motion users receive the static
 * CSS fallback, avoiding an unnecessary 18 MB media request.
 */
export function HeroMediaVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 861px)");
    const sync = () => {
      setShouldLoad(desktopQuery.matches && !motionQuery.matches);
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
      className="hero-media-video"
      autoPlay={shouldLoad}
      muted
      loop
      playsInline
      preload={shouldLoad ? "metadata" : "none"}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
    >
      {shouldLoad ? (
        <source
          src="/videos/leading-by-listening-faces-blurred.mp4"
          type="video/mp4"
        />
      ) : null}
    </video>
  );
}
