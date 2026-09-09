"use client";

import { useEffect, useState } from "react";

type ScrollUIState = {
  scrolled: boolean;
  progress: number;
  showBackToTop: boolean;
};

export function useScrollUI() {
  const [state, setState] = useState<ScrollUIState>({
    scrolled: false,
    progress: 0,
    showBackToTop: false,
  });

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;

      setState({
        scrolled: scrollY > 28,
        progress: max > 0 ? (scrollY / max) * 100 : 0,
        showBackToTop: scrollY > 600,
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return state;
}
