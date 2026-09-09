import type { SiteContent } from "@/content/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

type Props = {
  data: SiteContent["need"];
};

/**
 * Compact CTA banner that routes users to the /discovery wizard.
 */
export function NeedTeaserSection({ data }: Props) {
  return (
    <Section
      className="need-banner"
      id="need"
      aria-labelledby="need-title"
      atmosphere
    >
      <Container>
        <div className="need-banner-inner reveal">
          <div className="need-banner-text">
            <p className="need-banner-eyebrow">{data.eyebrow}</p>
            <h2 id="need-title" className="need-banner-title">
              {data.title}
            </h2>
            <p className="need-banner-sub">{data.intro}</p>
          </div>

          <div className="need-banner-steps" aria-hidden="true">
            {data.stepLabels.map((label, i) => (
              <span key={i} className="need-banner-step">
                <span className="need-banner-step-n">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {label}
              </span>
            ))}
          </div>

          <Button variant="gold" href="/discovery" className="need-banner-cta">
            {data.stages.result.contactCta}
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
