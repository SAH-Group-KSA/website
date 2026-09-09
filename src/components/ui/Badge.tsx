import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "badge" | "tag" | "chip" | "filter";

type BadgeBase = {
  children: ReactNode;
  className?: string;
  variant?: BadgeVariant;
};

type BadgeAsSpan = BadgeBase &
  HTMLAttributes<HTMLSpanElement> & {
    interactive?: false;
  };

type BadgeAsButton = BadgeBase &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Renders a `<button>` — use for filter chips. */
    interactive: true;
  };

export type BadgeProps = BadgeAsSpan | BadgeAsButton;

const variantClass: Record<BadgeVariant, string> = {
  badge: "ds-badge",
  tag: "ds-tag",
  chip: "ds-chip",
  /** Live listing filters — keep prototype appearance. */
  filter: "filter-chip",
};

/**
 * Unified badge / tag / chip.
 * `variant="filter"` maps to live `.filter-chip` (Programs + Coaches).
 */
export function Badge(props: BadgeProps) {
  const { children, className, variant = "badge", ...rest } = props;
  const classes = cn(variantClass[variant], className);

  if ("interactive" in props && props.interactive) {
    const { interactive: _i, ...buttonRest } =
      rest as ButtonHTMLAttributes<HTMLButtonElement> & { interactive: true };
    return (
      <button type="button" className={classes} {...buttonRest}>
        {children}
      </button>
    );
  }

  return (
    <span className={classes} {...(rest as HTMLAttributes<HTMLSpanElement>)}>
      {children}
    </span>
  );
}
