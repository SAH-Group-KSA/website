import type { Entity } from "@/content/types";
import { AppImage } from "@/components/ui/AppImage";
import { LocaleLink } from "@/components/ui/LocaleLink";
import {
  companyPath,
  type CompanyEntityId,
} from "@/lib/companies";
import { cn } from "@/lib/utils";

function entityLogoUrl(logo: Entity["logo"]): string | undefined {
  if (!logo || typeof logo !== "string") return undefined;
  return logo.length > 0 ? logo : undefined;
}

export function EntityCard({
  entity,
  openLabel,
  className,
  delay,
}: {
  entity: Entity;
  openLabel: string;
  className?: string;
  delay?: number | string;
}) {
  const href = companyPath(entity.id as CompanyEntityId);
  const logoUrl = entityLogoUrl(entity.logo);
  const ctaLabel = `${openLabel}: ${entity.name}`;

  return (
    <LocaleLink
      href={href as `/${string}`}
      className={cn("entity-card", className)}
      data-entity-card={entity.id}
      aria-label={ctaLabel}
      data-delay={
        delay === undefined || delay === "" ? undefined : String(delay)
      }
      style={{ ["--entity-color" as string]: entity.color }}
    >
      <div className="entity-card-accent" aria-hidden="true" />

      <div className="entity-card-logo">
        {logoUrl ? (
          <AppImage
            src={logoUrl}
            alt={entity.name}
            width={120}
            height={48}
            sizes="120px"
          />
        ) : (
          <span className="entity-wordmark">{entity.name}</span>
        )}
      </div>

      <span className="entity-card-tag">{entity.specialty}</span>

      <span className="entity-card-desc">{entity.cardText}</span>

      <div className="entity-card-footer">
        <span className="entity-card-cta" aria-hidden="true">
          {openLabel}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
    </LocaleLink>
  );
}
