"use client";

import { useEffect, useRef } from "react";

/** Decorative hero background video — pauses under prefers-reduced-motion. */
export function HeroMediaVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (mq.matches) {
        video.pause();
        video.removeAttribute("autoplay");
      } else if (video.paused) {
        void video.play().catch(() => {
          /* autoplay may still be blocked */
        });
      }
    };

    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <video
      ref={ref}
      className="hero-media-video"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src="/videos/leading-by-listening-faces-blurred.mp4" type="video/mp4" />
    </video>
  );
}
