import { Fragment } from "react";
import type { SiteContent } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImpactMetrics } from "@/components/sections/ImpactMetrics";

type Props = { data: SiteContent["impact"] };

/** Server Component shell; counters animate in `ImpactMetrics`. */
export function ImpactSection({ data }: Props) {
  return (
    <Section
      aria-labelledby="impact-title"
      className="measurement"
      tone="dark"
      id="impact"
    >
      <Container className="measurement-grid">
        <SectionHeading
          reveal
          tone="dark"
          eyebrow={data.eyebrow}
          title={data.title}
          id="impact-title"
          intro={data.subtitle}
        >
          {data.chain.length > 0 ? (
            <div
              aria-label={data.chainAriaLabel ?? "Impact measurement chain"}
              className="measurement-chain"
            >
              {data.chain.map((item, index) => (
                <Fragment key={item}>
                  {index > 0 ? (
                    <i aria-hidden="true" className="measurement-chain-arrow">
                      →
                    </i>
                  ) : null}
                  <span>{item}</span>
                </Fragment>
              ))}
            </div>
          ) : null}
        </SectionHeading>
        <ImpactMetrics
          metricsEyebrow={data.metricsEyebrow}
          note={data.note}
          metrics={data.metrics}
        />
      </Container>
    </Section>
  );
}
