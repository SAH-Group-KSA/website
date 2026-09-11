import { Fragment, type CSSProperties } from "react";
import type { Entity, EntityPageContent } from "@/content/types";
import { AppImage } from "@/components/ui/AppImage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LocaleLink } from "@/components/ui/LocaleLink";

type Props = {
  data: EntityPageContent["hero"];
  entity: Entity;
  offerings: EntityPageContent["offerings"]["items"];
};

/** Full-bleed company hero — mirrors group `.hero`, entity-accented panel. */
export function CompanyHero({ data, entity, offerings }: Props) {
  const titleId = `company-hero-title-${entity.id}`;

  return (
    <section
      aria-labelledby={titleId}
      className="hero entity-home-hero"
      id="top"
      style={{ "--entity-color": entity.color } as CSSProperties}
    >
      <div aria-hidden="true" className="hero-media" />
      <Container className="hero-grid">
        <div className="hero-copy reveal">
          {entity.logo ? (
            <div className="entity-home-hero-brand">
              <AppImage
                src={entity.logo}
                alt={entity.name}
                width={240}
                height={88}
                sizes="180px"
                priority
              />
            </div>
          ) : null}
          <p className="eyebrow eyebrow-light">{data.eyebrow}</p>
          <h1 id={titleId}>
            {data.titleLines?.map((line, i) => (
              <Fragment key={line}>
                {i > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
            <span>{data.subtitle}</span>
          </h1>
          <p className="hero-lead">{data.body}</p>
          <div className="hero-actions">
            <Button variant="gold" href={data.primaryCta.href}>
              {data.primaryCta.label}
            </Button>
            <Button variant="ghost" href={data.secondaryCta.href}>
              {data.secondaryCta.label}
            </Button>
          </div>
          <div role="group" aria-label={data.proofAriaLabel} className="hero-proof">
            {data.proof.map((item) => (
              <span key={item.label}>
                <strong>{item.value}</strong> {item.label}
              </span>
            ))}
          </div>
        </div>

        <aside
          className="entity-home-hero-panel reveal"
          data-delay="120"
          aria-label={entity.name}
        >
          <div className="entity-home-hero-panel-inner">
            <p className="entity-home-hero-specialty">{entity.specialty}</p>
            <p className="entity-home-hero-card-title">{entity.cardTitle}</p>
            <p className="entity-home-hero-tagline">{entity.tagline}</p>
            <ul className="entity-home-hero-links">
              {offerings.map((offer) => (
                <li key={offer.id}>
                  {offer.href.startsWith("#") ? (
                    <a href={offer.href}>
                      <span>{offer.title}</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  ) : (
                    <LocaleLink href={offer.href as `/${string}`}>
                      <span>{offer.title}</span>
                      <span aria-hidden="true">→</span>
                    </LocaleLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </Container>
    </section>
  );
}
