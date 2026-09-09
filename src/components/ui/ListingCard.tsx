import type { ReactNode } from "react";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn } from "@/lib/utils";

type ListingKind = "coach" | "course";

type ListingCardProps = {
  kind: ListingKind;
  media: ReactNode;
  /** Overlay badge inside media (e.g. course level). */
  mediaBadge?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  className?: string;
  href?: `/${string}`;
};

/**
 * Shared media + body + footer shell for coach-card / course-card.
 * Keeps live CSS class names so appearance is unchanged.
 */
export function ListingCard({
  kind,
  media,
  mediaBadge,
  children,
  footer,
  className,
  href,
}: ListingCardProps) {
  const mediaClass = kind === "coach" ? "coach-photo" : "course-thumb";
  const bodyClass = kind === "coach" ? "coach-body" : "course-body";
  const footerClass = kind === "coach" ? "coach-footer" : "course-footer";

  const main = (
    <>
      <div className={cn(mediaClass, "media-zoom")}>
        {media}
        {mediaBadge}
      </div>
      <div className={bodyClass}>{children}</div>
    </>
  );

  return (
    <article className={cn(`${kind}-card`, className)}>
      {href ? (
        <LocaleLink href={href} className="listing-card-main-link">
          {main}
        </LocaleLink>
      ) : (
        main
      )}
      <div className={footerClass}>{footer}</div>
    </article>
  );
}
