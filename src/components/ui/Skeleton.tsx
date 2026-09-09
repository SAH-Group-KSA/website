import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  /** Preset shapes from design-system.css */
  variant?: "block" | "text" | "avatar" | "media";
  style?: CSSProperties;
  "aria-hidden"?: boolean;
};

/**
 * Shimmer placeholder — uses `.ds-skeleton*` from design-system.css.
 */
export function Skeleton({
  className,
  variant = "block",
  style,
  "aria-hidden": ariaHidden = true,
}: SkeletonProps) {
  const variantClass =
    variant === "text"
      ? "ds-skeleton-text"
      : variant === "avatar"
        ? "ds-skeleton-avatar"
        : variant === "media"
          ? "ds-skeleton-media"
          : "";

  return (
    <span
      className={cn("ds-skeleton", variantClass, className)}
      style={style}
      aria-hidden={ariaHidden}
    />
  );
}

/** Full-page listing skeleton for route `loading.tsx`. */
export function PageSkeleton({
  cards = 6,
  label = "Loading",
}: {
  cards?: number;
  label?: string;
}) {
  return (
    <div className="page-skeleton" role="status" aria-live="polite" aria-label={label}>
      <div className="page-skeleton-inner">
        <div className="page-skeleton-hero">
          <Skeleton className="ds-skeleton-text" style={{ width: "28%", height: "0.7rem" }} />
          <Skeleton className="ds-skeleton-text" style={{ width: "72%", height: "2.4rem" }} />
          <Skeleton className="ds-skeleton-text" style={{ width: "88%", height: "1rem" }} />
          <Skeleton className="ds-skeleton-text" style={{ width: "64%", height: "1rem" }} />
        </div>
        <div className="page-skeleton-grid">
          {Array.from({ length: cards }, (_, i) => (
            <div key={i} className="page-skeleton-card">
              <Skeleton variant="media" />
              <div className="page-skeleton-card-body">
                <Skeleton className="ds-skeleton-text" style={{ width: "40%" }} />
                <Skeleton className="ds-skeleton-text" style={{ width: "85%" }} />
                <Skeleton className="ds-skeleton-text" style={{ width: "70%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
