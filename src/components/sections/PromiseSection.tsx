import type { SiteContent } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { LocaleLink } from "@/components/ui/LocaleLink";

type Props = {
  data: SiteContent["promise"];
};

export function PromiseSection({ data }: Props) {
  return (
    <Section className="promise" id="promise" atmosphere divider>
      <Container className="split-layout">
        <SectionHeading
          reveal
          eyebrow={data.eyebrow}
          titleLines={data.titleLines}
          intro={data.intro}
        >
          {data.cta.href.startsWith("/") ? (
              <LocaleLink href={data.cta.href as `/${string}`} className="text-link">
                {data.cta.label}{" "}
                <span className="cta-arrow-ltr" aria-hidden="true">
                  →
                </span>
              </LocaleLink>
            ) : (
              <TextLink href={data.cta.href}>
                {data.cta.label}{" "}
                <span className="cta-arrow-ltr" aria-hidden="true">
                  →
                </span>
              </TextLink>
            )}
        </SectionHeading>
        <div className="question-cluster reveal" data-delay="120">
          {data.steps.map((step, index) => (
            <article key={step.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <strong>{step.highlight}</strong>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
