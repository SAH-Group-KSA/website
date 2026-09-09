import type { SiteContent } from "@/content/types";
import { AppImage } from "@/components/ui/AppImage";
import { Container } from "@/components/ui/Container";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Section } from "@/components/ui/Section";

const accentVars = {
  impact: "var(--impact)",
  lego: "var(--lego)",
} as const;

const edgeVars = {
  impact: "var(--white)",
  lego: "var(--lego)",
} as const;

const ctaHoverVars = {
  impact: "var(--white)",
  lego: "var(--lego)",
} as const;

type Props = {
  data: SiteContent["community"];
};

export function CommunitySection({ data }: Props) {
  return (
    <Section
      aria-labelledby="community-title"
      className="community"
      id="community"
      atmosphere
    >
      <Container>
        <div className="community-layout">
          <div className="community-heading-col reveal">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2 id="community-title" className="community-main-title">
              {data.title}
            </h2>
            <p className="community-intro">{data.intro}</p>
          </div>

          <div className="community-cards">
            {data.cards.map((card, index) => (
              <article
                key={card.id}
                className="community-card reveal"
                data-delay={String(index * 80)}
                style={{
                  ["--community-accent" as string]: accentVars[card.accent],
                  ["--community-edge" as string]: edgeVars[card.accent],
                  ["--community-cta-hover" as string]: ctaHoverVars[card.accent],
                }}
              >
                <div className="community-logo">
                  <AppImage
                    src={card.logo}
                    alt={card.title}
                    width={160}
                    height={80}
                    sizes="112px"
                    unoptimized
                  />
                </div>

                <div className="community-copy">
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <div className="community-features">
                    {card.features.map((feature) => (
                      <span key={feature}>{feature}</span>
                    ))}
                  </div>
                </div>

                <LocaleLink
                  href="/community/apply"
                  className="community-cta"
                  data-whatsapp-message={card.whatsappMessage}
                >
                  {card.cta}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </LocaleLink>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
