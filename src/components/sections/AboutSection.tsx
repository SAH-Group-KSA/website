import { Fragment } from "react";
import type { SiteContent } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AboutSection({ data }: { data: SiteContent["about"] }) {
  return (
    <Section
      aria-labelledby="about-title"
      className="about"
      id="about"
      atmosphere
      divider
    >
      <Container>

        {/* ── Manifesto band ── */}
        <div className="about-manifesto reveal-scale" role="presentation">
          {data.mediaMottoLines.map((line) => (
            <div key={line} className="about-manifesto-word">
              <span>{line}</span>
            </div>
          ))}
        </div>

        {/* ── Two-column: identity left / beliefs right ── */}
        <div className="about-split reveal" data-delay="60">

          {/* Left — who we are */}
          <div className="about-identity">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 id="about-title" className="about-main-title">
              {data.titleLines?.map((line, i) => (
                <Fragment key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </Fragment>
              ))}
            </h2>
            <p className="about-intro">{data.intro}</p>
            <div className="about-vm-row">
              <article className="about-vm-item">
                <span className="about-vm-label">{data.visionTitle}</span>
                <p>{data.vision}</p>
              </article>
              <article className="about-vm-item">
                <span className="about-vm-label">{data.missionTitle}</span>
                <p>{data.mission}</p>
              </article>
            </div>
          </div>

          {/* Right — beliefs list */}
          <div className="about-beliefs-col">
            <ol className="about-beliefs-list" aria-label={data.beliefsAriaLabel ?? "Our beliefs"}>
              {data.beliefs.map((belief, index) => (
                <li key={belief.title} className="about-belief-row">
                  <span className="about-belief-n" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <b>{belief.title}</b>
                    <p>{belief.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── Founders ── */}
        <div className="founders-section reveal" data-delay="100">
          <SectionHeading
            align="center"
            titleAs="h3"
            eyebrow={data.foundersEyebrow}
            title={data.foundersTitle}
            intro={data.foundersIntro}
          />
          <div className="founders-grid">
            {data.founders.map((founder, index) => (
              <article
                key={founder.id}
                className="founder-card"
                style={{
                  transitionDelay: `${index * 60}ms`,
                }}
              >
                <div className="founder-photo">
                  <img
                    className="founder-photo-media"
                    src={founder.photo}
                    alt={founder.name}
                  />
                </div>
                <div className="founder-copy">
                  <strong>{founder.role}</strong>
                  <h4>{founder.name}</h4>
                  <p>{founder.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

      </Container>
    </Section>
  );
}
