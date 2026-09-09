import { cn } from "@/lib/utils";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
};

/** Prototype `.eyebrow` / `.eyebrow-light` — no Tailwind size/color overrides. */
export function Eyebrow({ children, className, light = false }: EyebrowProps) {
  return (
    <p className={cn("eyebrow", light && "eyebrow-light", className)}>
      {children}
    </p>
  );
}
