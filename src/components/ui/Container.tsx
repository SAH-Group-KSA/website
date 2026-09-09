import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "nav";
};

/**
 * Prototype `.container` — width from `--container`
 * (1180 / 980@1100 / 580@620). Do not add Tailwind width breakpoints.
 */
export function Container({
  children,
  className,
  as: Tag = "div",
}: ContainerProps) {
  return <Tag className={cn("container", className)}>{children}</Tag>;
}
