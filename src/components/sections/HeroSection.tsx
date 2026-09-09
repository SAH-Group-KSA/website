import { Fragment } from "react";
import type { Entity, SiteContent } from "@/content/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { HeroOrbit } from "@/components/sections/HeroOrbit";
import { HeroMediaVideo } from "@/components/sections/HeroMediaVideo";

type Props = {
  data: SiteContent["hero"];
  entities: Entity[];
  motto: string;
};

/** Server Component hero shell; orbit interactions live in `HeroOrbit`. */
export function HeroSection({ data, entities, motto }: Props) {
  const eyebrowLines = data.eyebrow.split("\n").filter(Boolean);

  return (
    <section aria-labelledby="hero-title" className="hero" id="top">
      <div aria-hidden="true" className="hero-media hero-media--video">
        <HeroMediaVideo />
      </div>
      <Container className="hero-grid">
        <div className="hero-copy reveal is-visible">
          <p className="eyebrow eyebrow-light">
            {eyebrowLines.map((line, i) => (
              <Fragment key={line}>
                {i > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </p>
          <h1 id="hero-title">
            {data.titleLines.map((line, i) => (
              <Fragment key={line}>
                {i > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
            {data.subtitle ? <span>{data.subtitle}</span> : null}
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

        <HeroOrbit
          entities={entities}
          orbitAriaLabel={data.orbitAriaLabel}
          orbitCenterAriaLabel={data.orbitCenterAriaLabel}
        />
      </Container>
      <VisuallyHidden>{motto}</VisuallyHidden>
    </section>
  );
}
