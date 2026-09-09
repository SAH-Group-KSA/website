/**
 * Motion transitions — mirrored from design-tokens.css §7.
 * Keep durations/easings in sync with CSS vars.
 */

export const ease = [0.2, 0.8, 0.2, 1] as const;
export const easeOut = [0, 0, 0.3, 1] as const;
export const easeSpring = [0.22, 1, 0.36, 1] as const;

/** Seconds — matches --duration-* tokens */
export const duration = {
  instant: 0.1,
  fast: 0.15,
  base: 0.25,
  slow: 0.35,
  panel: 0.45,
  reveal: 0.75,
  modalIn: 0.38,
  modalOut: 0.28,
  page: 0.4,
  counter: 1.2,
} as const;

export const transition = {
  instant: { duration: duration.instant, ease },
  fast: { duration: duration.fast, ease },
  base: { duration: duration.base, ease },
  slow: { duration: duration.slow, ease: easeSpring },
  panel: { duration: duration.panel, ease: easeSpring },
  reveal: { duration: duration.reveal, ease },
  page: { duration: duration.page, ease: easeOut },
} as const;

/** Stagger defaults for lists / card grids */
export const stagger = {
  fast: 0.05,
  base: 0.08,
  slow: 0.12,
} as const;
