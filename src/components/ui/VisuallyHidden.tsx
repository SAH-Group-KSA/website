import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type VisuallyHiddenProps = {
  children: ReactNode;
  as?: "span" | "div" | "p" | "label";
  className?: string;
  htmlFor?: string;
  id?: string;
};

/** Prototype `.visually-hidden` (not Tailwind `sr-only`). */
export function VisuallyHidden({
  children,
  as: Tag = "span",
  className,
  htmlFor,
  id,
}: VisuallyHiddenProps) {
  const classes = cn("visually-hidden", className);

  if (Tag === "label") {
    return (
      <label className={classes} htmlFor={htmlFor} id={id}>
        {children}
      </label>
    );
  }

  return (
    <Tag className={classes} id={id}>
      {children}
    </Tag>
  );
}
