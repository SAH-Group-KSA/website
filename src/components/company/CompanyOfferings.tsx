import type { CSSProperties, ReactNode } from "react";
import type { EntityPageContent } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Props = {
  data: EntityPageContent["offerings"];
  entityColor: string;
};

function OfferingLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <LocaleLink href={href as `/${string}`} className={className}>
      {children}
    </LocaleLink>
  );
}

/** Primary entry cards into company pathways / products. */
export function CompanyOfferings({ data, entityColor }: Props) {
  return (
    <Section
      className="entity-home-offerings-section"
      id="offerings"
      aria-labelledby="company-offerings-title"
    >
      <Container>
        <SectionHeading
          align="center"
          reveal
          eyebrow={data.eyebrow}
          title={data.title}
          intro={data.intro}
          id="company-offerings-title"
        />

        <div
          className="entity-home-offerings reveal"
          data-delay="80"
          style={{ "--entity-color": entityColor } as CSSProperties}
        >
          {data.items.map((offer) => (
            <OfferingLink
              key={offer.id}
              href={offer.href}
              className="entity-home-offering"
            >
              <span className="entity-home-offering-copy">
                <h3>{offer.title}</h3>
                <p>{offer.body}</p>
              </span>
              <span className="entity-home-offering-arrow" aria-hidden="true">
                →
              </span>
            </OfferingLink>
          ))}
        </div>
      </Container>
    </Section>
  );
}
