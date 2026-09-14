"use client";

import { useSyncExternalStore } from "react";

type ScrollUIState = {
  scrolled: boolean;
  progress: number;
  showBackToTop: boolean;
};

const SERVER_STATE: ScrollUIState = {
  scrolled: false,
  progress: 0,
  showBackToTop: false,
};

let state = SERVER_STATE;
let frame = 0;
const listeners = new Set<() => void>();

function readScrollState(): ScrollUIState {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const scrollY = window.scrollY;
  const rawProgress = max > 0 ? (scrollY / max) * 100 : 0;

  return {
    scrolled: scrollY > 28,
    // A tenth of a percent is visually lossless and avoids pixel-level churn.
    progress: Math.round(Math.max(0, Math.min(100, rawProgress)) * 10) / 10,
    showBackToTop: scrollY > 600,
  };
}

function update() {
  frame = 0;
  const next = readScrollState();
  if (
    next.scrolled === state.scrolled &&
    next.progress === state.progress &&
    next.showBackToTop === state.showBackToTop
  ) {
    return;
  }

  state = next;
  listeners.forEach((listener) => listener());
}

function scheduleUpdate() {
  if (!frame) frame = window.requestAnimationFrame(update);
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (listeners.size === 1) {
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    scheduleUpdate();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

/**
 * One shared, animation-frame-batched scroll listener for all chrome.
 * Selectors keep boolean-only consumers from rendering as progress changes.
 */
export function useScrollUI<T>(selector: (value: ScrollUIState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(SERVER_STATE),
  );
}
