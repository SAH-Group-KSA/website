import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  children: ReactNode;
  /** Domain class from the prototype (e.g. `faq`, `entities`, `hero`). */
  className?: string;
  tone?: "default" | "dark" | "tinted";
  /** Soft radial atmosphere behind section content. */
  atmosphere?: boolean;
  /** Gradient hairline at the bottom edge. */
  divider?: boolean;
  style?: CSSProperties;
  "aria-labelledby"?: string;
  "aria-label"?: string;
};

/**
 * Prototype section shell: `.section` + optional `.section-dark` / `.section-tinted`.
 */
export function Section({
  id,
  children,
  className,
  tone = "default",
  atmosphere = false,
  divider = false,
  style,
  "aria-labelledby": ariaLabelledBy,
  "aria-label": ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      style={style}
      className={cn(
        className,
        "section",
        tone === "dark" && "section-dark",
        tone === "tinted" && "section-tinted",
        atmosphere && "section-atmosphere",
        divider && "section-divider",
      )}
    >
      {children}
    </section>
  );
}
