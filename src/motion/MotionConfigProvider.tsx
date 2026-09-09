"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Site-wide Motion config — respects prefers-reduced-motion.
 */
export function MotionConfigProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();

  return (
    <MotionConfig reducedMotion={reduced ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}
