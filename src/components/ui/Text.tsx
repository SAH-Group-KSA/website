import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TextProps = {
  children: ReactNode;
  className?: string;
};

/** Lead / intro under a heading */
export function Lead({ children, className }: TextProps) {
  return <p className={cn("lead", className)}>{children}</p>;
}
