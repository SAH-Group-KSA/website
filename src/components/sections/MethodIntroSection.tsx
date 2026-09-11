import type { SiteContent } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function MethodIntroSection({
  data,
}: {
  data: SiteContent["methodIntro"];
}) {
  return (
    <Section
      aria-labelledby="method-intro-title"
      className="method-intro"
      id="method-intro"
      atmosphere
      divider
    >
      <Container>
        <div className="method-intro-layout">
          <SectionHeading
            reveal
            eyebrow={data.eyebrow}
            titleLines={data.titleLines}
            id="method-intro-title"
          />

          <div className="method-intro-summary reveal" data-delay="80">
            <div className="method-intro-index-card">
              <span className="method-intro-index-badge">{data.indexTitle}</span>
              <p className="method-intro-index-body">{data.indexBody}</p>
            </div>

            <div className="method-intro-steps" aria-hidden="true">
              {data.titleLines?.map((line, index) => (
                <span key={line} className="method-intro-step">
                  <span className="method-intro-step-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="method-intro-step-label">{line}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
