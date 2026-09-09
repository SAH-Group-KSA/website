import type { CSSProperties } from "react";
import type { Entity, EntityPageContent } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Props = {
  data: EntityPageContent["profile"];
  entity: Entity;
};

/** Entity profile band — audiences, services, deliverables, outcomes. */
export function CompanyProfile({ data, entity }: Props) {
  return (
    <Section
      className="entity-home-profile"
      id="about-company"
      tone="tinted"
      aria-labelledby="company-profile-title"
      style={{ "--entity-color": entity.color } as CSSProperties}
    >
      <Container>
        <SectionHeading
          reveal
          eyebrow={data.eyebrow}
          title={data.title}
          intro={data.intro}
          id="company-profile-title"
        />

        <div className="entity-home-profile-when reveal" data-delay="60">
          <h3>{data.whenLabel}</h3>
          <p>{entity.when}</p>
        </div>

        <div className="entity-home-profile-grid reveal" data-delay="100">
          <article>
            <h3>{data.audiencesLabel}</h3>
            <ul className="entity-home-tags">
              {entity.audiences.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>{data.servicesLabel}</h3>
            <ul>
              {entity.services.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>{data.deliverablesLabel}</h3>
            <ul>
              {entity.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>{data.outcomesLabel}</h3>
            <ul>
              {entity.outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </Container>
    </Section>
  );
}
