"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR =
  ".reveal, .reveal-fade, .reveal-scale, .reveal-left, .reveal-right";

/**
 * Prototype reveal observer.
 *
 * Must not mutate React-owned nodes until after hydration finishes.
 * Streaming SSR can hydrate `ObserveReveals` before page segments — early
 * `classList` / style writes caused hydration mismatches on `.reveal` nodes.
 */
export function ObserveReveals() {
  useEffect(() => {
    const tracked = new WeakSet<HTMLElement>();
    const revealed = new WeakSet<HTMLElement>();
    let observer: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    let cancelled = false;
    let bootTimer = 0;
    let raf = 0;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionQuery.matches;

    const markVisible = (el: HTMLElement) => {
      revealed.add(el);
      if (!el.classList.contains("is-visible")) {
        const delay = Number(el.dataset.delay || 0);
        if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);
        el.classList.add("is-visible");
      }
    };

    const observeNewReveals = (root: ParentNode) => {
      const pending = Array.from(
        root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
      ).filter((el) => !tracked.has(el));

      if (!pending.length) return;

      pending.forEach((el) => {
        tracked.add(el);
        // Already visible from SSR (e.g. hero) — nothing to animate.
        if (el.classList.contains("is-visible")) {
          revealed.add(el);
          return;
        }
        if (reduced || !observer) {
          markVisible(el);
          return;
        }
        observer.observe(el);
      });
    };

    const restoreStripped = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el) => {
        if (revealed.has(el) && !el.classList.contains("is-visible")) {
          el.classList.add("is-visible");
        }
      });
    };

    const createObserver = () => {
      if (!reduced && !observer && "IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const el = entry.target as HTMLElement;
              markVisible(el);
              observer?.unobserve(el);
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
        );
      }
    };

    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      if (reduced) {
        observer?.disconnect();
        observer = null;
        document
          .querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
          .forEach(markVisible);
      } else {
        createObserver();
      }
    };

    const boot = () => {
      if (cancelled) return;

      createObserver();

      observeNewReveals(document);

      mo = new MutationObserver(() => {
        observeNewReveals(document);
        restoreStripped(document);
      });
      mo.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
      motionQuery.addEventListener("change", onMotionPreferenceChange);
    };

    // Two frames + short timeout: let streamed client segments finish hydrating
    // before any className / style mutations.
    raf = window.requestAnimationFrame(() => {
      raf = window.requestAnimationFrame(() => {
        bootTimer = window.setTimeout(boot, 50);
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(bootTimer);
      motionQuery.removeEventListener("change", onMotionPreferenceChange);
      mo?.disconnect();
      observer?.disconnect();
    };
  }, []);

  return null;
}
