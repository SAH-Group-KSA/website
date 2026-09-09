"use client";

import type { ReactNode } from "react";
import { PageTransition } from "@/motion";

/** Soft enter animation for route content inside `<main>`. */
export function MainTransition({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
