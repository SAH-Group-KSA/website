import { LocaleLink } from "@/components/ui/LocaleLink";
import { AppImage } from "@/components/ui/AppImage";
import type { Program } from "@/content/types";

export function ProgramCard({
  program,
  color,
  entityLabel,
  entityLogo,
  levelLabel,
  outcomeLabel,
  openLabel,
  /** Company slug when opened from a company page; omit on group home. */
  from,
}: {
  program: Program;
  color: string;
  entityLabel: string;
  entityLogo?: string;
  levelLabel: string;
  outcomeLabel: string;
  openLabel: string;
  from?: string;
}) {
  const href = from
    ? `/program/${program.id}?from=${encodeURIComponent(from)}`
    : `/program/${program.id}`;

  return (
    <article
      className="program-card"
      id={program.id}
      data-program-id={program.id}
      style={{ ["--program-color" as string]: color }}
    >
      {/* Colored top accent bar */}
      <div className="program-card-bar" aria-hidden="true" />

      <div className="program-card-inner">
        {/* Meta row: logo + level badge */}
        <div className="program-top">
          {entityLogo ? (
            <div className="program-entity-logo">
              <AppImage
                src={entityLogo}
                alt={entityLabel}
                width={96}
                height={32}
                sizes="80px"
                style={{ objectFit: "contain", objectPosition: "left center" }}
              />
            </div>
          ) : (
            <span className="program-entity">{entityLabel}</span>
          )}
          <span className="program-level">{levelLabel}</span>
        </div>

        {/* Title */}
        <h3 className="program-title">{program.title}</h3>

        {/* Summary */}
        <p className="program-summary">{program.summary}</p>

        {/* Outcome */}
        <div className="program-outcome">
          <span className="program-outcome-label">{outcomeLabel}</span>
          <p>{program.outcome}</p>
        </div>
      </div>

      {/* CTA */}
      <LocaleLink
        className="program-open"
        href={href as `/program/${string}`}
        data-program={program.id}
      >
        <span>{openLabel}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M6 3l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </LocaleLink>
    </article>
  );
}
