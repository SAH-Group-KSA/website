"use client";

import { cn } from "@/lib/utils";
import { useScrollUI } from "@/hooks/useScrollUI";
import { motionSafeScrollBehavior } from "@/lib/motion-preferences";

export function BackToTop({ label }: { label: string }) {
  const showBackToTop = useScrollUI((state) => state.showBackToTop);

  return (
    <button
      id="back-to-top"
      type="button"
      aria-label={label}
      tabIndex={showBackToTop ? 0 : -1}
      onClick={() =>
        window.scrollTo({ top: 0, behavior: motionSafeScrollBehavior() })
      }
      className={cn("back-to-top", showBackToTop && "is-visible")}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
