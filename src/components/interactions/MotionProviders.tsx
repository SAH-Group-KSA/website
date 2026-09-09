"use client";

import type { ReactNode } from "react";
import { MotionConfigProvider } from "@/motion";

/**
 * Site-wide Motion config (prefers-reduced-motion).
 * Page enter transitions live on `<main>` content only.
 */
export function MotionProviders({ children }: { children: ReactNode }) {
  return <MotionConfigProvider>{children}</MotionConfigProvider>;
}
