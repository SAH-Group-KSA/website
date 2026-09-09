"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which home-page section is currently in view.
 * Returns the active hash (e.g. `#programs`) or null.
 */
export function useActiveSection() {
  const [activeHref, setActiveHref] = useState<string | null>(null);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main section[id]"),
    );

    if (!sections.length) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveHref(`#${visible.target.id}`);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.05, 0.3, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));

    // Clear active section near the very top (hero) so Home can mark itself
    const onScroll = () => {
      if (window.scrollY < 80) setActiveHref(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return activeHref;
}
