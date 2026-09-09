import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type GridProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">;

/**
 * Layout grid wrapper — pass the prototype grid class via `className`
 * (e.g. `entity-grid`, `partner-logo-grid`, `founders-grid`).
 */
export function Grid<T extends ElementType = "div">({
  as,
  className,
  children,
  ...rest
}: GridProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag className={cn(className)} {...rest}>
      {children}
    </Tag>
  );
}
