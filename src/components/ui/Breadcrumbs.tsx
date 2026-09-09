import { LocaleLink } from "@/components/ui/LocaleLink";

type Crumb = { label: string; href?: string };

type Props = {
  crumbs: Crumb[];
  className?: string;
};

/**
 * Locale-aware breadcrumb navigation strip.
 * The last crumb has no href (current page indicator).
 */
export function Breadcrumbs({ crumbs, className }: Props) {
  return (
    <nav aria-label="Breadcrumb" className={`breadcrumbs${className ? ` ${className}` : ""}`}>
      <ol className="breadcrumbs-list">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.label} className="breadcrumbs-item">
              {isLast || !crumb.href ? (
                <span aria-current={isLast ? "page" : undefined} className="breadcrumbs-current">
                  {crumb.label}
                </span>
              ) : (
                <LocaleLink href={crumb.href as `/${string}`} className="breadcrumbs-link">
                  {crumb.label}
                </LocaleLink>
              )}
              {!isLast && (
                <span className="breadcrumbs-sep" aria-hidden="true">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
