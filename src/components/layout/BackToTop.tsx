"use client";

import { cn } from "@/lib/utils";
import { useScrollUI } from "@/hooks/useScrollUI";

export function BackToTop({ label }: { label: string }) {
  const { showBackToTop } = useScrollUI();

  return (
    <button
      id="back-to-top"
      type="button"
      aria-label={label}
      tabIndex={showBackToTop ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn("back-to-top", showBackToTop && "is-visible")}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
