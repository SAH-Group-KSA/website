import type { Variants } from "motion/react";
import { transition } from "./transitions";

/** Soft page enter (no transform — preserves background-attachment: fixed on heroes) */
export const pageEnter: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transition.page,
  },
};

/** Instant visible state for prefers-reduced-motion */
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 1 },
};
